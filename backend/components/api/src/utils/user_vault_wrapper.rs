use db::models::fingerprint::IsUnique;
use db::models::identity_data::{HasIdentityDataFields, IdentityData};
use enclave_proxy::DataTransform;

use db::models::email::Email;
use newtypes::email::Email as NewtypeEmail;
use paperclip::actix::Apiv2Schema;

use std::marker::PhantomData;

use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::PhoneNumber;

use db::assert_in_transaction;
use db::models::user_vault::UserVault;
use db::{errors::DbError, PgConnection};
use newtypes::{
    DataAttribute, DataPriority, EmailId, Fingerprint, PiiString, SealedVaultBytes, UserVaultId,
    ValidatedPhoneNumber,
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
        let identity_data = IdentityData::get(conn, &user_vault.id)?;
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

    pub fn build(conn: &mut PgConnection, user_vault: UserVault) -> Result<Self, DbError> {
        Self::build_internal(conn, user_vault, false)
    }

    pub fn lock(conn: &mut PgConnection, id: &UserVaultId) -> Result<Self, DbError> {
        let user_vault = UserVault::lock(conn, id)?;
        let uvw = Self::build_internal(conn, user_vault, true)?;
        Ok(uvw)
    }

    pub fn get(conn: &mut PgConnection, id: &UserVaultId) -> Result<Self, DbError> {
        let user_vault = UserVault::get(conn, id)?;
        let uvw = Self::build_internal(conn, user_vault, false)?;
        Ok(uvw)
    }

    pub fn assert_is_locked(&self, conn: &mut PgConnection) -> Result<(), ApiError> {
        assert_in_transaction(conn)?;
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
        conn: &mut PgConnection,
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
        let decrypted_results = crate::enclave::decrypt_bytes_batch(
            state,
            data,
            &self.user_vault.e_private_key,
            DataTransform::Identity,
        )
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

    pub fn missing_fields(&self, ob_config: &ObConfiguration) -> Vec<DataAttribute> {
        ob_config
            .must_collect_data_kinds
            .iter()
            .cloned()
            .filter(|data_attribute| data_attribute.is_required())
            .filter(|data_attribute| !self.has_field(*data_attribute))
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
        conn: &mut PgConnection,
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

        let new_identity_data = builder.finish(conn)?;

        // finally create our new fingerprint
        let identity_data = IdentityData::create(conn, new_identity_data)?;
        self.identity_data = Some(identity_data);

        Ok(())
    }
}
