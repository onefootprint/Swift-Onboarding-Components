use crypto::aead::SealingKey;
use db::models::data_lifetime::DataLifetime;
use db::models::identity_document::IdentityDocument;
use db::models::kv_data::{KeyValueData, NewKeyValueDataArgs};
use db::models::onboarding::Onboarding;
use db::models::scoped_user::ScopedUser;
use db::models::user_timeline::UserTimeline;
use db::models::user_vault_data::UserVaultData;
use db::models::verification_request::VerificationRequest;
use db::HasLifetime;
use db::TxnPgConnection;
use enclave_proxy::DataTransform;
use std::convert::Into;

use db::models::email::Email;
use newtypes::email::Email as NewtypeEmail;
use paperclip::actix::Apiv2Schema;

use std::collections::{HashMap, HashSet};
use std::marker::PhantomData;

use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::PhoneNumber;

use db::models::user_vault::UserVault;
use db::{errors::DbError, PgConnection};
use itertools::Itertools;
use newtypes::{
    CollectedDataOption, DataAttribute, DataCollectedInfo, DataLifetimeId, DataLifetimeSeqno, DataPriority,
    EmailId, Fingerprint, IdentityDocumentId, KvDataKey, OnboardingId, PiiString, ScopedUserId,
    SealedVaultBytes, SealedVaultDataKey, TenantId, UvdKind, ValidatedPhoneNumber,
};

use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::s3::S3Error;
use crate::types::identity_data_request::IdentityDataUpdate;
use crate::State;

use super::uvd_builder::UvdBuilder;
use db::HasDataAttributeFields;

/// UserVaultWrapper represents the current "state" of the UserVault - the most up to date and complete information we have
/// about a particular user.
///
/// In other words, the UserVault is a major dividing line in Footprint's product.
///    1. the API routes and backend logic determine `OnboardingRequirements` that the frontend knows how to collect.
///    2. The information collected is stashed in various tables (see the impls below for the actual locations)
///    3. The decision engine and verification logic _only knows about what's in the UserVault_
///         * it is the information we send to vendors (a UVW gets "serialized" in a `VerificationRequest` in the decision engine)
///         * it is the source of truth to know what we datums we have collected from a User
#[derive(Debug, Clone)]
pub struct UserVaultWrapper {
    pub user_vault: UserVault,
    // TODO wrap these in another struct that separates committed vs speculative data
    data: Vec<UserVaultData>,
    phone_numbers: Vec<PhoneNumber>,
    emails: Vec<Email>,
    // It's very possible we will collect multiple documents for a single UserVault. Retries, different ID types, different country etc
    identity_documents: Vec<IdentityDocument>,

    // A map of all of the DataLifetimes for data on this table
    lifetimes: HashMap<DataLifetimeId, DataLifetime>,
    // The seqno used to reconstruct the UVW. If None, constructed with the latest view of the world.
    _seqno: Option<DataLifetimeSeqno>,
    // When set, the UVW was constructed for a specific tenant's view of the world.
    // A tenant is able to see its own uncommitted data on the user vault.
    scoped_user_id: Option<ScopedUserId>,
    // If true, the UVW was constructed inside of a transaction holding a lock on the UserVault
    is_locked: bool,
    // Represents whether we have fetched the appropriate data
    is_hydrated: PhantomData<()>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct DecryptRequest {
    pub reason: String,
}

impl UserVaultWrapper {
    fn build_single(
        conn: &mut PgConnection,
        user_vault: UserVault,
        scoped_user_id: Option<&ScopedUserId>,
        is_locked: bool,
        seqno: Option<DataLifetimeSeqno>,
    ) -> Result<Self, DbError> {
        // TODO unit tests
        // TODO apply speculative lifetimes ON TOP (ie overwrite committed data) of committed ones
        let active_lifetimes = if let Some(seqno) = seqno {
            // We are reconstructing the UVW as it appeared at a given seqno
            DataLifetime::get_active_at(conn, &user_vault.id, seqno, scoped_user_id)?
        } else {
            // We are constructing the UVW as it appears right now
            DataLifetime::get_active(conn, &user_vault.id, scoped_user_id)?
        };
        let active_lifetime_ids: Vec<_> = active_lifetimes.keys().cloned().collect();

        // Fetch all the data related to the active lifetimes
        // Split into committed + uncommitted data
        let data = UserVaultData::get_for(conn, &active_lifetime_ids)?;
        let phone_numbers = PhoneNumber::get_for(conn, &active_lifetime_ids)?;
        let emails = Email::get_for(conn, &active_lifetime_ids)?;

        // TODO migrate this to DataLifetimes
        let identity_documents = IdentityDocument::get_for_user_vault_id(conn, &user_vault.id)?;

        Ok(Self {
            user_vault,
            data,
            phone_numbers,
            emails,
            identity_documents,
            lifetimes: active_lifetimes,
            _seqno: seqno,
            scoped_user_id: scoped_user_id.cloned(),
            is_locked,
            is_hydrated: PhantomData,
        })
    }

    // In order to minimize database queries, we would like to be able to bulk fetch
    // various data elements for a set of Users.
    pub fn multi_get_for_tenant(
        conn: &mut PgConnection,
        users: Vec<(ScopedUser, UserVault)>,
        tenant_id: &TenantId,
    ) -> Result<Vec<Self>, DbError> {
        let uv_ids: Vec<_> = users.iter().map(|su| &su.1.id).collect();
        let mut uv_id_to_active_lifetimes =
            DataLifetime::get_bulk_active_for_tenant(conn, uv_ids.clone(), tenant_id)?;
        let active_lifetime_list: Vec<_> = uv_id_to_active_lifetimes
            .values()
            .flat_map(|x| x.values())
            .collect();

        // For each data source, fetch data _for all users_ in the `user_vaults` list.
        // We then build a HashMap of UserVaultId -> Data object in order to build our final
        // UserVaultWrapper for each User
        let mut uvds = UserVaultData::bulk_get(conn, &active_lifetime_list)?;
        let mut phone_numbers = PhoneNumber::bulk_get(conn, &active_lifetime_list)?;
        let mut emails = Email::bulk_get(conn, &active_lifetime_list)?;

        // Fetch all the identity documents for the user vault ids
        let mut identity_document_map = IdentityDocument::multi_get_for_user_vault_ids(conn, uv_ids)?;

        // Map over our UserVaults, assembling the UserVaultWrappers from the data we fetched above
        Ok(users
            .into_iter()
            .map(move |(su, uv)| {
                let uv_id = uv.id.clone();
                Self {
                    scoped_user_id: Some(su.id),
                    user_vault: uv,
                    data: uvds.remove(&uv_id).unwrap_or_default(),
                    phone_numbers: phone_numbers.remove(&uv_id).unwrap_or_default(),
                    emails: emails.remove(&uv_id).unwrap_or_default(),
                    identity_documents: identity_document_map.remove(&uv_id).unwrap_or_default(),
                    lifetimes: uv_id_to_active_lifetimes.remove(&uv_id).unwrap_or_default(),
                    is_locked: false,
                    _seqno: None,
                    is_hydrated: PhantomData,
                }
            })
            .collect())
    }

    // Allows reconstructing a UserVaultWrapper at the time a VerificationRequest was made
    pub fn from_verification_request(
        conn: &mut PgConnection,
        request: VerificationRequest,
    ) -> Result<Self, DbError> {
        let (_, scoped_user, _, _) = Onboarding::get(conn, &request.onboarding_id)?;
        let user_vault = UserVault::get(conn, &scoped_user.user_vault_id)?;
        Self::build_single(
            conn,
            user_vault,
            Some(&scoped_user.id),
            false,
            Some(request.uvw_snapshot_seqno),
        )
    }

    /// Builds a UVW that only sees committed data.
    pub fn get_committed(conn: &mut PgConnection, user_vault: UserVault) -> Result<Self, DbError> {
        Self::build_single(conn, user_vault, None, false, None)
    }

    /// Builds a UVW that sees committed data AND speculative data for the tenant.
    /// This should be used during onboarding operations in order to allow the tenant to see
    /// uncommitted data that has been added by previous operations
    pub fn get_for_tenant(conn: &mut PgConnection, scoped_user_id: &ScopedUserId) -> Result<Self, DbError> {
        let user_vault = UserVault::get(conn, scoped_user_id)?;
        Self::build_single(conn, user_vault, Some(scoped_user_id), false, None)
    }

    /// Builds a locked UVW that sees committed data AND speculative data for the tenant.
    /// This should be used during onboarding operations in order to allow the tenant to see
    /// uncommitted data that has been added by previous operations
    pub fn lock_for_tenant(
        conn: &mut TxnPgConnection,
        scoped_user_id: &ScopedUserId,
    ) -> Result<Self, DbError> {
        let user_vault = UserVault::lock(conn, scoped_user_id)?;
        Self::build_single(conn, user_vault, Some(scoped_user_id), true, None)
    }

    pub fn assert_is_locked(&self, _conn: &mut TxnPgConnection) -> Result<(), ApiError> {
        // Accept _conn to make sure we pass in a TxnPgConnection, not PgConnection
        if !self.is_locked {
            Err(ApiError::UserNotLocked)
        } else {
            Ok(())
        }
    }
}

impl UserVaultWrapper {
    pub fn add_email(
        &mut self,
        conn: &mut TxnPgConnection,
        email: NewtypeEmail,
        fingerprint: Fingerprint,
    ) -> ApiResult<EmailId> {
        self.assert_is_locked(conn)?;
        let scoped_user_id = self
            .scoped_user_id
            .clone()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        let email = email.to_piistring();
        let e_data = self.user_vault.public_key.seal_pii(&email)?;
        let priority = if !self.emails.is_empty() {
            DataPriority::Secondary
        } else {
            DataPriority::Primary
        };
        let user_vault_id = self.user_vault.id.clone();
        let email = db::models::email::Email::create(
            conn,
            user_vault_id,
            e_data,
            fingerprint,
            priority,
            scoped_user_id,
        )?;
        let email_id = email.id.clone();

        if priority == DataPriority::Primary {
            self.emails = vec![email];
        }
        Ok(email_id)
    }

    pub async fn decrypt(
        &self,
        state: &State,
        data: Vec<&SealedVaultBytes>,
    ) -> Result<Vec<PiiString>, ApiError> {
        let decrypted_results = state
            .enclave_client
            .decrypt_bytes_batch(data, &self.user_vault.e_private_key, DataTransform::Identity)
            .await?;
        Ok(decrypted_results)
    }

    pub async fn decrypt_data_keys(
        &self,
        state: &State,
        keys: Vec<SealedVaultDataKey>,
    ) -> ApiResult<Vec<SealingKey>> {
        let decrypted_results = state
            .enclave_client
            .decrypt_sealed_vault_data_key(&keys, &self.user_vault.e_private_key)
            .await?;

        Ok(decrypted_results)
    }

    pub async fn get_decrypted_primary_phone(&self, state: &State) -> Result<ValidatedPhoneNumber, ApiError> {
        let number = self
            .phone_numbers()
            .iter()
            .next()
            .ok_or(ApiError::NoPhoneNumberForVault)?;

        let decrypt_response = self
            .decrypt(state, vec![&number.e_e164, &number.e_country])
            .await?;
        let e164 = decrypt_response.get(0).ok_or(ApiError::NotImplemented)?.clone();
        let country = decrypt_response.get(1).ok_or(ApiError::NotImplemented)?.clone();

        let validated_phone_number = ValidatedPhoneNumber::__build_from_vault(e164, country)?;
        Ok(validated_phone_number)
    }

    pub fn missing_fields(&self, ob_config: &ObConfiguration) -> Vec<CollectedDataOption> {
        ob_config
            .must_collect_data
            .iter()
            .filter(|cdo| {
                cdo.attributes()
                    .iter()
                    .filter(|d| d.is_required())
                    .any(|d| !self.has_field(*d))
            })
            .cloned()
            .collect()
    }

    pub fn phone_numbers(&self) -> &[PhoneNumber] {
        // TODO proxy between committed/uncommitted
        &self.phone_numbers
    }

    pub fn emails(&self) -> &[Email] {
        // TODO proxy between committed/uncommitted
        &self.emails
    }

    pub fn identity_documents(&self) -> &[IdentityDocument] {
        // TODO proxy between committed/uncommitted
        &self.identity_documents
    }
}

impl HasDataAttributeFields for UserVaultWrapper {
    fn get_e_field(&self, data_attribute: DataAttribute) -> Option<&SealedVaultBytes> {
        let email = self.emails().iter().next();
        let phone = self.phone_numbers().iter().next();
        match data_attribute {
            // identity
            DataAttribute::FirstName
            | DataAttribute::LastName
            | DataAttribute::Dob
            | DataAttribute::Ssn9
            | DataAttribute::AddressLine1
            | DataAttribute::AddressLine2
            | DataAttribute::City
            | DataAttribute::State
            | DataAttribute::Zip
            | DataAttribute::Country
            | DataAttribute::Ssn4 => self
                .data
                .iter()
                .find(|d| Into::<DataAttribute>::into(d.kind) == data_attribute)
                .map(|d| &d.e_data),
            // email
            DataAttribute::Email => email?.get_e_field(data_attribute),
            // phone
            DataAttribute::PhoneNumber => phone?.get_e_field(data_attribute),
            // We need to handle identity document separately since users can have multiple identity documents (for now, there's an open item https://linear.app/footprint/issue/FP-1968/de-chonk-the-identitydocument-dataattribute)
            DataAttribute::IdentityDocument => None,
        }
    }
}

impl UserVaultWrapper {
    pub fn update_identity_data(
        &mut self,
        conn: &mut TxnPgConnection,
        update: IdentityDataUpdate,
        fingerprints: Vec<(UvdKind, Fingerprint)>,
        onboarding_id: OnboardingId,
    ) -> Result<(), ApiError> {
        self.assert_is_locked(conn)?;
        let builder = UvdBuilder::build(update, self.user_vault.public_key.clone())?;
        let scoped_user_id = self
            .scoped_user_id
            .clone()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        let collected_data = builder.save(conn, self.user_vault.id.clone(), scoped_user_id, fingerprints)?;
        if !collected_data.is_empty() {
            // Create a timeline event that shows all the new data that was added
            UserTimeline::create(
                conn,
                DataCollectedInfo {
                    attributes: collected_data,
                },
                self.user_vault.id.clone(),
                Some(onboarding_id),
            )?;
        }

        Ok(())
    }
}

impl UserVaultWrapper {
    pub fn update_custom_data(
        &self,
        conn: &mut TxnPgConnection,
        tenant_id: TenantId,
        update: HashMap<KvDataKey, PiiString>,
    ) -> ApiResult<()> {
        self.assert_is_locked(conn)?;

        let update = update
            .into_iter()
            .map(|(data_key, pii)| {
                let e_data = self.user_vault.public_key.seal_pii(&pii)?;
                Ok(NewKeyValueDataArgs { data_key, e_data })
            })
            .collect::<Result<Vec<_>, ApiError>>()?;

        KeyValueData::update_or_insert(conn, self.user_vault.id.clone(), tenant_id, update)?;
        Ok(())
    }
}

impl UserVaultWrapper {
    /// if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    /// don't allow the tenant to know if data is set without having permission for the the value
    pub fn ensure_scope_allows_access(
        &self,
        conn: &mut PgConnection,
        scoped_user: &ScopedUser,
        fields: HashSet<DataAttribute>,
    ) -> ApiResult<()> {
        // tenant's can do what they wish with NON-portable vaults they own
        if !self.user_vault.is_portable {
            return Ok(());
        }

        let ob_configs = ObConfiguration::list_authorized_for_user(conn, scoped_user.id.clone())?;
        let can_access_attributes: HashSet<_> = ob_configs
            .into_iter()
            .flat_map(|x| x.can_access_fields())
            .collect();
        if !can_access_attributes.is_superset(&fields) {
            return Err(crate::auth::AuthError::ObConfigMissingDecryptPermission.into());
        }

        Ok(())
    }

    /// We don't allow a tenant to know if data is in the Vault without having an authorized OBConfig that wanted to collect those fields
    pub fn data_fields_tenant_requested_to_collect(
        &self,
        // Ideally we'd take a scoped user and calculate this here,
        // but /users does some bulk fetching and this makes it easier
        ob_configs: Vec<ObConfiguration>,
    ) -> Vec<DataAttribute> {
        // As of 2022-11, ob<>scoped user is 1-1
        let intent_to_collect_attributes: HashSet<DataAttribute> = ob_configs
            .into_iter()
            .flat_map(|x| x.intent_to_collect_fields())
            .collect();
        let fields_present_in_vault: HashSet<DataAttribute> =
            HashSet::from_iter(self.get_populated_fields().into_iter());

        (intent_to_collect_attributes.intersection(&fields_present_in_vault))
            .into_iter()
            .cloned()
            .collect::<Vec<_>>()
    }
    /// Retrieve the fields that the tenant has requested/gotten authorized access to collect
    ///
    /// Note: This is not checking `READ` permissions of data, e.g. fields that the tenant can actually decrypt.
    ///    For that, use `ensure_scope_allows_access`. This is just for displaying what data the tenant _collected_.
    ///    This is what we display in /users, and it would be a little weird to collect, but then not display the info we collected anywhere.
    pub fn get_accessible_populated_fields(
        &self,
        ob_configs: Vec<ObConfiguration>,
    ) -> (Vec<DataAttribute>, Vec<String>) {
        let accessible_fields: HashSet<DataAttribute> = HashSet::from_iter(
            self.data_fields_tenant_requested_to_collect(ob_configs)
                .into_iter(),
        );
        let document_types = if accessible_fields.contains(&DataAttribute::IdentityDocument) {
            self.get_identity_document_types()
        } else {
            vec![]
        };
        let data_attributes: Vec<DataAttribute> =
            HashSet::from_iter(self.get_populated_fields().iter().cloned())
                .intersection(&accessible_fields)
                .into_iter()
                .cloned()
                .collect::<Vec<_>>();

        (data_attributes, document_types)
    }
}

pub struct IdentityDocumentImages {
    pub identity_document_id: IdentityDocumentId,
    pub document_type: String,
    pub document_country: String,
    pub front_image: SealedVaultBytes,
    // not all documents have backs
    pub back_image: Option<SealedVaultBytes>,
    pub e_data_key: SealedVaultDataKey,
}

/// Impl for helpers related to fetching documents
impl UserVaultWrapper {
    async fn internal_fetch_image(
        state: &State,
        identity_document: IdentityDocument,
    ) -> Result<IdentityDocumentImages, ApiError> {
        // require at least front to be non-None
        let (Some(front_path), back_path) = (identity_document.front_image_s3_url, identity_document.back_image_s3_url) else {
            // TODO is this really the right error?
            return Err(ApiError::S3Error(S3Error::InvalidS3Url))
        };

        let front = state
            .s3_client
            .get_object_from_s3_url(front_path.as_str())
            .await?;
        let mut back: Option<actix_web::web::Bytes> = None;
        if let Some(b) = back_path {
            back = Some(state.s3_client.get_object_from_s3_url(b.as_str()).await?);
        }

        Ok(IdentityDocumentImages {
            identity_document_id: identity_document.id,
            document_type: identity_document.document_type,
            document_country: identity_document.country_code,
            front_image: SealedVaultBytes(front.to_vec()),
            back_image: back.map(|b| SealedVaultBytes(b.to_vec())),
            e_data_key: identity_document.e_data_key,
        })
    }

    /// Given a document_type, fetch from S3
    /// ALERT ALERT : this function assumes you have already check if the requester
    /// can access the image!
    pub async fn get_encrypted_images_from_s3(
        &self,
        state: &State,
        document_type: String,
    ) -> Vec<Result<IdentityDocumentImages, ApiError>> {
        let futures = self
            .identity_documents
            .clone()
            .into_iter()
            .filter(|i| i.document_type == document_type)
            .map(|doc| Self::internal_fetch_image(state, doc));

        futures::future::join_all(futures).await
    }

    pub fn get_identity_document_types(&self) -> Vec<String> {
        self.identity_documents
            .iter()
            .map(|i| i.document_type.clone())
            .collect::<Vec<String>>()
            .into_iter()
            .unique()
            .collect::<Vec<String>>()
    }
}

impl UserVaultWrapper {
    /// Marks all speculative data
    /// speculative data and make it portable after it is verified by an approved onboarding
    pub fn commit_data_for_tenant(&self, conn: &mut TxnPgConnection) -> ApiResult<DataLifetimeSeqno> {
        // TODO how do we enforce this UVW was created inside the same `conn` we have here?
        self.assert_is_locked(conn)?;
        let scoped_user_id = self
            .scoped_user_id
            .as_ref()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        // Get the lifetimes of uncommitted data added by this scoped user. These are the lifetimes
        // that we will update toe be commit
        // TODO we probably check that the lifetimes here are for models loaded onto the UVW
        // Make lifetime_id -> Box<dyn HasLifetime> map, then use the Box to deactivate old things with this kind
        let lifetime_ids = self
            .lifetimes
            .values()
            .filter(|lifetime| {
                lifetime.committed_at.is_none() && lifetime.scoped_user_id == self.scoped_user_id
            })
            .map(|lifetime| lifetime.id.clone())
            .collect();

        // Mark all speculative lifetimes as committed. This could commit data across any number
        // of tables.
        let seqno = DataLifetime::get_next_seqno(conn)?;
        let committed_lifetimes =
            DataLifetime::bulk_commit_for_tenant(conn, lifetime_ids, scoped_user_id.clone(), seqno)?;

        // TODO archive all old data that is replaced by new committed data at seqno
        // should we do this in a follow-up PR?
        // Look at which lifetimes were committed and archive old data that had that lifetime

        // TODO set this seqno on the old data
        Ok(seqno)
    }
}
