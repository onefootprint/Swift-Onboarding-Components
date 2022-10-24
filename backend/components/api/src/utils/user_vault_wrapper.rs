use db::models::fingerprint::IsUnique;
use db::models::identity_data::{HasIdentityDataFields, IdentityData};
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
use newtypes::{
    CollectedDataOption, DataAttribute, DataCollectedInfo, DataPriority, EmailId, Fingerprint, KvDataKey,
    PiiString, SealedVaultBytes, TenantId, UserVaultId, ValidatedPhoneNumber,
};

use crate::errors::{ApiError, ApiResult};
use crate::types::identity_data_request::IdentityDataUpdate;
use crate::State;

use super::identity_data_builder::IdentityDataBuilder;

pub struct UserVaultWrapper {
    pub user_vault: UserVault,
    pub identity_data: Option<IdentityData>,
    pub phone_number: Option<PhoneNumber>,
    pub email: Option<Email>,
    is_locked: bool,
    phantom: PhantomData<()>,
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

        Ok(Self {
            identity_data,
            user_vault,
            phone_number,
            email,
            is_locked,
            phantom: PhantomData,
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
                    is_locked,
                    phantom: PhantomData,
                }
            })
            .collect())
    }

    // Allows reconstructing a UserVaultWrapper at the time a VerificationRequest was made
    pub fn from_verification_request(
        conn: &mut PgConnection,
        request: VerificationRequest,
    ) -> Result<Self, DbError> {
        let (_, scoped_user) = Onboarding::get(conn, &request.onboarding_id)?;
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
        Ok(Self {
            identity_data,
            user_vault,
            phone_number,
            email,
            is_locked: false,
            phantom: PhantomData,
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

impl HasIdentityDataFields for UserVaultWrapper {
    fn get_e_field(&self, data_attribute: DataAttribute) -> Option<&SealedVaultBytes> {
        let id = self.identity_data.as_ref();
        match data_attribute {
            DataAttribute::Email => self.email.as_ref().map(|e| &e.e_data),
            DataAttribute::PhoneNumber => self.phone_number.as_ref().map(|p| &p.e_e164),
            kind => id?.get_e_field(kind),
        }
    }
}

impl UserVaultWrapper {
    pub fn update_identity_data(
        &mut self,
        conn: &mut TxnPgConnection,
        update: IdentityDataUpdate,
        fingerprints: Vec<(DataAttribute, Fingerprint, IsUnique)>,
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
                // TODO include ob_id if data is added during onboarding
                None,
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
            .flat_map(|x| x.can_access_data)
            .flat_map(|x| x.attributes())
            .collect();
        if !can_access_attributes.is_superset(&fields) {
            return Err(crate::auth::AuthError::ObConfigMissingDecryptPermission.into());
        }

        Ok(())
    }
}
