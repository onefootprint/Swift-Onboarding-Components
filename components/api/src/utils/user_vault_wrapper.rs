use std::collections::HashMap;

use db::models::ob_configurations::ObConfiguration;
use db::models::user_data::UserData;
use db::models::user_vaults::UserVault;
use db::DbPool;
use db::{errors::DbError, PgConnection};
use newtypes::{DataKind, PiiString, SealedVaultBytes};
use paperclip::actix::web;

use crate::errors::ApiError;
use crate::State;

pub struct UserVaultWrapper {
    user_vault: UserVault,
    user_data: HashMap<DataKind, Vec<UserData>>,
}

impl UserVaultWrapper {
    pub async fn from(pool: &DbPool, user_vault: UserVault) -> Result<UserVaultWrapper, DbError> {
        pool.db_transaction(move |conn| -> Result<UserVaultWrapper, DbError> {
            Self::from_conn(conn, user_vault)
        })
        .await
    }

    pub fn from_conn(conn: &mut PgConnection, user_vault: UserVault) -> Result<UserVaultWrapper, DbError> {
        Ok(Self {
            user_data: db::user_data::list(conn, user_vault.id.clone())?,
            user_vault,
        })
    }

    pub fn get_data(&self, data_kind: DataKind) -> Vec<&UserData> {
        self.user_data
            .get(&data_kind)
            .map(|x| x.iter().collect())
            .unwrap_or_default()
    }

    pub fn get_e_field(&self, data_kind: DataKind) -> Option<&SealedVaultBytes> {
        // TODO handle multiple values for the same field
        Some(&self.get_data(data_kind).get(0)?.e_data)
    }

    pub async fn get_decrypted_field(
        &self,
        state: &web::Data<State>,
        data_kind: DataKind,
    ) -> Result<Option<PiiString>, ApiError> {
        // TODO standardize this to use one decrypt util
        let e_data = if let Some(e_field) = self.get_e_field(data_kind) {
            e_field
        } else {
            return Ok(None);
        };

        let decrypted_data = crate::enclave::decrypt_bytes(
            state,
            e_data,
            &self.user_vault.e_private_key,
            enclave_proxy::DataTransform::Identity,
        )
        .await?;

        Ok(Some(decrypted_data))
    }

    pub fn missing_fields(&self, ob_config: &ObConfiguration) -> Vec<DataKind> {
        ob_config
            .must_collect_data_kinds
            .iter()
            .cloned()
            .filter(|data_kind| self.get_e_field(*data_kind).is_none())
            .collect()
    }
}
