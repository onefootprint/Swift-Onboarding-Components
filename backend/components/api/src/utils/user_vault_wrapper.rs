use crypto::aead::ScopedSealingKey;
use db::models::fingerprint::IsUnique;
use db::models::identity_data::IdentityData;
use db::models::identity_document::IdentityDocument;
use db::models::kv_data::{KeyValueData, NewKeyValueDataArgs};
use db::models::onboarding::Onboarding;
use db::models::scoped_user::ScopedUser;
use db::models::user_timeline::UserTimeline;
use db::models::verification_request::VerificationRequest;
use db::TxnPgConnection;
use enclave_proxy::DataTransform;

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
    CollectedDataOption, DataAttribute, DataCollectedInfo, DataPriority, EmailId, Fingerprint,
    IdentityDocumentId, KvDataKey, OnboardingId, PiiString, SealedVaultBytes, SealedVaultDataKey, TenantId,
    UserVaultId, ValidatedPhoneNumber,
};

use crate::errors::{ApiError, ApiResult};
use crate::s3::S3Error;
use crate::types::identity_data_request::IdentityDataUpdate;
use crate::State;

use super::identity_data_builder::IdentityDataBuilder;
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
    pub identity_data: Option<IdentityData>,
    pub phone_number: Option<PhoneNumber>,
    pub email: Option<Email>,
    // It's very possible we will collect multiple documents for a single UserVault. Retries, different ID types, different country etc
    pub identity_documents: Vec<IdentityDocument>,
    is_locked: bool,
    // Represents whether we have fetched the appropriate data
    is_hydrated: PhantomData<()>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct DecryptRequest {
    pub reason: String,
}

impl UserVaultWrapper {
    fn build_internal(
        conn: &mut PgConnection,
        user_vault: UserVault,
        is_locked: bool,
    ) -> Result<Self, DbError> {
        let identity_data = IdentityData::get_active(conn, &user_vault.id)?;
        let phone_number = PhoneNumber::get_primary(conn, &user_vault.id)?;
        let email = Email::get_primary(conn, &user_vault.id)?;
        let identity_documents = IdentityDocument::get_for_user_vault_id(conn, &user_vault.id)?;

        Ok(Self {
            identity_data,
            user_vault,
            phone_number,
            email,
            identity_documents,
            is_locked,
            is_hydrated: PhantomData,
        })
    }

    // In order to minimize database queries, we would like to be able to bulk fetch
    // various data elements for a set of Users.
    fn multi_build_internal(
        conn: &mut PgConnection,
        user_vaults: Vec<UserVault>,
        is_locked: bool,
    ) -> Result<Vec<Self>, DbError> {
        let uv_ids: Vec<UserVaultId> = user_vaults.iter().map(|uv| uv.id.clone()).collect();

        // For each data source, fetch data _for all users_ in the `user_vaults` list in a single DB transaction.
        // We then build a HashMap of UserVaultId -> Data object in order to build our final
        // UserVaultWrapper for each User
        let mut identity_data: HashMap<UserVaultId, IdentityData> =
            IdentityData::bulk_get_active(conn, &uv_ids)?
                .into_iter()
                .map(|id| (id.user_vault_id.clone(), id))
                .collect();
        let mut phone_number: HashMap<UserVaultId, PhoneNumber> =
            PhoneNumber::bulk_get_primary(conn, &uv_ids)?
                .into_iter()
                .map(|phone| (phone.user_vault_id.clone(), phone))
                .collect();
        let mut email: HashMap<UserVaultId, Email> = Email::bulk_get_primary(conn, &uv_ids)?
            .into_iter()
            .map(|email| (email.user_vault_id.clone(), email))
            .collect();

        // Fetch all the identity documents for the user vault ids
        let mut identity_document_map = IdentityDocument::multi_get_for_user_vault_ids(conn, &uv_ids)?;

        // Map over our UserVaults, assembling the UserVaultWrappers from the data we fetched above
        Ok(user_vaults
            .into_iter()
            .map(move |uv| {
                let uv_id = uv.id.clone();
                Self {
                    identity_data: identity_data.remove(&uv_id),
                    user_vault: uv,
                    phone_number: phone_number.remove(&uv_id),
                    email: email.remove(&uv_id),
                    identity_documents: identity_document_map.remove(&uv_id).unwrap_or_default(),
                    is_locked,
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
        let email = request
            .email_id
            .map(|id| Email::get(conn, &id, &user_vault.id))
            .transpose()?
            .map(|(email, _)| email);
        let phone_number = request
            .phone_number_id
            .map(|id| PhoneNumber::get(conn, &id, &user_vault.id))
            .transpose()?;
        let identity_data = request
            .identity_data_id
            .map(|id| IdentityData::get(conn, &id, &user_vault.id))
            .transpose()?;

        let identity_document = request
            .identity_document_id
            .map(|id| IdentityDocument::get(conn, &id))
            .transpose()?;

        Ok(Self {
            identity_data,
            user_vault,
            phone_number,
            email,
            identity_documents: vec![identity_document].into_iter().flatten().collect(),
            is_locked: false,
            is_hydrated: PhantomData,
        })
    }

    pub fn build(conn: &mut PgConnection, user_vault: UserVault) -> Result<Self, DbError> {
        Self::build_internal(conn, user_vault, false)
    }

    pub fn lock(conn: &mut TxnPgConnection, id: &UserVaultId) -> Result<Self, DbError> {
        let user_vault = UserVault::lock(conn, id)?;
        let uvw = Self::build_internal(conn, user_vault, true)?;
        Ok(uvw)
    }

    pub fn get(conn: &mut PgConnection, id: &UserVaultId) -> Result<Self, DbError> {
        let user_vault = UserVault::get(conn, id)?;
        let uvw = Self::build_internal(conn, user_vault, false)?;
        Ok(uvw)
    }

    pub fn multi_get(conn: &mut PgConnection, ids: Vec<&UserVaultId>) -> Result<Vec<Self>, DbError> {
        let user_vaults = UserVault::multi_get(conn, ids)?;
        let uvw = Self::multi_build_internal(conn, user_vaults, false)?;
        Ok(uvw)
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
        let email = email.to_piistring();
        let e_data = self.user_vault.public_key.seal_pii(&email)?;
        let priority = if self.email.is_some() {
            DataPriority::Secondary
        } else {
            DataPriority::Primary
        };
        let user_vault_id = self.user_vault.id.clone();
        let email =
            db::models::email::Email::create(conn, user_vault_id, e_data, fingerprint, false, priority)?;
        let email_id = email.id.clone();

        if priority == DataPriority::Primary {
            self.email = Some(email);
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
        scope: &'static str,
    ) -> ApiResult<Vec<ScopedSealingKey>> {
        let decrypted_results = state
            .enclave_client
            .decrypt_sealed_vault_data_key(&keys, &self.user_vault.e_private_key, scope)
            .await?;

        Ok(decrypted_results)
    }

    pub async fn get_decrypted_primary_phone(&self, state: &State) -> Result<ValidatedPhoneNumber, ApiError> {
        let number = self
            .phone_number
            .as_ref()
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
}

impl HasDataAttributeFields for UserVaultWrapper {
    fn get_e_field(&self, data_attribute: DataAttribute) -> Option<&SealedVaultBytes> {
        let id = self.identity_data.as_ref();
        let email = self.email.as_ref();
        let phone = self.phone_number.as_ref();
        match data_attribute {
            // identity
            DataAttribute::FirstName => id?.get_e_field(data_attribute),
            DataAttribute::LastName => id?.get_e_field(data_attribute),
            DataAttribute::Dob => id?.get_e_field(data_attribute),
            DataAttribute::Ssn9 => id?.get_e_field(data_attribute),
            DataAttribute::AddressLine1 => id?.get_e_field(data_attribute),
            DataAttribute::AddressLine2 => id?.get_e_field(data_attribute),
            DataAttribute::City => id?.get_e_field(data_attribute),
            DataAttribute::State => id?.get_e_field(data_attribute),
            DataAttribute::Zip => id?.get_e_field(data_attribute),
            DataAttribute::Country => id?.get_e_field(data_attribute),
            DataAttribute::Ssn4 => id?.get_e_field(data_attribute),
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
        fingerprints: Vec<(DataAttribute, Fingerprint, IsUnique)>,
        onboarding_id: Option<OnboardingId>,
    ) -> Result<(), ApiError> {
        self.assert_is_locked(conn)?;
        let mut builder = IdentityDataBuilder::new(
            self.user_vault.is_portable,
            self.user_vault.id.clone(),
            self.identity_data.clone(),
            self.user_vault.public_key.clone(),
            fingerprints,
        );

        let IdentityDataUpdate {
            name,
            dob,
            ssn,
            address,
        } = update;

        if let Some(name) = name {
            builder.add_full_name(name)?;
        }

        if let Some(dob) = dob {
            builder.add_dob(dob)?;
        }

        if let Some(ssn) = ssn {
            builder.add_ssn(ssn)?;
        }

        if let Some(address) = address {
            builder.add_full_address_or_zip(address)?;
        }

        let (new_identity_data, collected_data) = builder.finish(conn)?;
        // finally create our new fingerprint
        let identity_data = IdentityData::create(conn, new_identity_data)?;

        if !collected_data.is_empty() {
            // Create a timeline event that shows all the new data that was added
            UserTimeline::create(
                conn,
                DataCollectedInfo {
                    attributes: collected_data,
                },
                self.user_vault.id.clone(),
                onboarding_id,
            )?;
        }
        self.identity_data = Some(identity_data);

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
