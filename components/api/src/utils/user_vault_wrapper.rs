use std::collections::HashMap;

use db::models::user_data::UserData;
use db::models::user_vaults::UserVault;
use db::DbPool;
use db::{errors::DbError, PgConnection};
use newtypes::{DataKind, SealedVaultBytes};
use paperclip::actix::web;

use crate::errors::ApiError;
use crate::State;

pub struct UserVaultWrapper {
    _user_vault: UserVault,
    user_data: HashMap<DataKind, Vec<UserData>>,
}

impl UserVaultWrapper {
    pub async fn from(pool: &DbPool, user_vault: UserVault) -> Result<UserVaultWrapper, DbError> {
        let result: UserVaultWrapper = pool
            .db_query(move |conn| Self::from_conn(conn, user_vault))
            .await??;
        Ok(result)
    }

    pub fn from_conn(conn: &mut PgConnection, user_vault: UserVault) -> Result<UserVaultWrapper, DbError> {
        Ok(Self {
            user_data: db::user_data::list(conn, user_vault.id.clone())?,
            _user_vault: user_vault,
        })
    }

    pub fn get_data(&self, data_kind: DataKind) -> Option<&UserData> {
        // TODO handle multiple values for the same field
        self.user_data.get(&data_kind)?.get(0)
    }

    pub fn get_e_field(&self, data_kind: DataKind) -> Option<&SealedVaultBytes> {
        // TODO handle multiple values for the same field
        Some(&self.get_data(data_kind)?.e_data)
    }

    pub async fn get_decrypted_field(
        &self,
        state: &web::Data<State>,
        data_kind: DataKind,
    ) -> Result<Option<String>, ApiError> {
        // TODO standardize this to use one decrypt util
        let e_data = if let Some(e_field) = self.get_e_field(data_kind) {
            e_field
        } else {
            return Ok(None);
        };

        let decrypted_data = crate::enclave::decrypt_bytes(
            state,
            e_data,
            &self._user_vault.e_private_key,
            enclave_proxy::DataTransform::Identity,
        )
        .await?;

        Ok(Some(decrypted_data))
    }

    pub fn missing_fields(&self) -> Vec<DataKind> {
        vec![
            DataKind::FirstName,
            DataKind::LastName,
            DataKind::Dob,
            DataKind::Ssn,
            DataKind::StreetAddress,
            DataKind::City,
            DataKind::State,
            DataKind::Zip,
            DataKind::Country,
            DataKind::Email,
            DataKind::PhoneNumber,
        ]
        .into_iter()
        .filter(|data_kind| self.get_e_field(*data_kind).is_none())
        .collect()
    }
}
