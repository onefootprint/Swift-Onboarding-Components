use db::models::fingerprint::IsUnique;
use db::models::identity_data::{HasIdentityDataFields, IdentityData};
use db::models::scoped_user::ScopedUser;
use enclave_proxy::DataTransform;

use db::models::email::Email;
use newtypes::email::Email as NewtypeEmail;
use paperclip::actix::Apiv2Schema;

use std::marker::PhantomData;

use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::PhoneNumber;

use db::models::user_vault::UserVault;
use db::DbPool;
use db::{errors::DbError, PgConnection};
use newtypes::{
    DataKind, DataPriority, EmailId, Fingerprint, Fingerprinter, FootprintUserId, PiiString,
    SealedVaultBytes, TenantId, UserVaultId, ValidatedPhoneNumber,
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
    phantom: PhantomData<()>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct DecryptRequest {
    pub reason: String,
}

impl UserVaultWrapper {
    pub async fn from(pool: &DbPool, user_vault: UserVault) -> Result<Self, DbError> {
        pool.db_transaction(move |conn| -> Result<UserVaultWrapper, DbError> {
            Self::from_conn(conn, user_vault)
        })
        .await
    }

    pub fn from_conn(conn: &mut PgConnection, user_vault: UserVault) -> Result<Self, DbError> {
        let identity_data = IdentityData::get(conn, &user_vault.id)?;
        let phone_number = PhoneNumber::get_primary(conn, &user_vault.id)?;
        let email = Email::get_primary(conn, &user_vault.id)?;

        Ok(Self {
            identity_data,
            user_vault,
            phone_number,
            email,
            phantom: PhantomData,
        })
    }

    pub fn from_id(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> Result<Self, DbError> {
        let user_vault = UserVault::get(conn, user_vault_id)?;
        let uvw = Self::from_conn(conn, user_vault)?;
        Ok(uvw)
    }

    pub fn from_fp_user_id(
        conn: &mut PgConnection,
        fp_user_id: &FootprintUserId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> Result<(Self, ScopedUser), DbError> {
        let (user_vault, scoped_user) = UserVault::get_for_tenant(conn, tenant_id, fp_user_id, is_live)?;
        let uvw = Self::from_conn(conn, user_vault)?;
        Ok((uvw, scoped_user))
    }

    pub async fn add_email(&mut self, state: &State, email: NewtypeEmail) -> ApiResult<EmailId> {
        let email = email.to_piistring();
        let e_data = self.user_vault.public_key.seal_pii(&email)?;
        let fingerprint = state
            .compute_fingerprint(DataKind::Email, email.clean_for_fingerprint())
            .await?;
        let priority = if self.email.is_some() {
            DataPriority::Secondary
        } else {
            DataPriority::Primary
        };

        let user_vault_id = self.user_vault.id.clone();

        let email = state
            .db_pool
            .db_transaction(move |conn| {
                db::models::email::Email::create(conn, user_vault_id, e_data, fingerprint, false, priority)
            })
            .await?;

        if self.email.is_none() {
            self.email = Some(email.clone());
        }

        Ok(email.id)
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

    pub fn missing_fields(&self, ob_config: &ObConfiguration) -> Vec<DataKind> {
        ob_config
            .must_collect_data_kinds
            .iter()
            .cloned()
            .filter(|data_kind| data_kind.is_required())
            .filter(|data_kind| !self.has_field(*data_kind))
            .collect()
    }
}

impl HasIdentityDataFields for UserVaultWrapper {
    fn get_e_field(&self, data_kind: DataKind) -> Option<&SealedVaultBytes> {
        let id = self.identity_data.as_ref();
        match data_kind {
            DataKind::Email => self.email.as_ref().map(|e| &e.e_data),
            DataKind::PhoneNumber => self.phone_number.as_ref().map(|p| &p.e_e164),
            DataKind::PhoneCountry => self.phone_number.as_ref().map(|p| &p.e_country),
            kind => id?.get_e_field(kind),
        }
    }
}

impl UserVaultWrapper {
    pub fn update_identity_data(
        &mut self,
        conn: &mut PgConnection,
        update: IdentityDataUpdate,
        fingerprints: Vec<(DataKind, Fingerprint, IsUnique)>,
    ) -> Result<(), ApiError> {
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
