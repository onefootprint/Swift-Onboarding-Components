use std::collections::HashMap;

use db::models::ob_configurations::ObConfiguration;
use db::models::user_data::{NewUserData, UserData};
use db::models::user_vaults::UserVault;
use db::DbPool;
use db::{errors::DbError, PgConnection};
use newtypes::{DataKind, PiiString, SealedVaultBytes, UserDataId};
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

    pub fn bulk_update(
        &self,
        conn: &mut PgConnection,
        new_user_datas: Vec<NewUserData>,
    ) -> Result<Vec<UserData>, db::DbError> {
        // TODO what happens if we make a new address with only one field updated?
        // https://linear.app/footprint/issue/FP-814/replace-entire-old-data-group-when-updating-in-post-userdata
        let ud_to_deactivate: Vec<UserDataId> = new_user_datas
            .iter()
            .flat_map(|NewUserData { data_kind, .. }| self.get_data(*data_kind).first().map(|x| x.id.clone()))
            .collect();

        db::user_data::bulk_deactivate(conn, ud_to_deactivate)?;
        let results = UserData::bulk_insert(conn, new_user_datas)?;
        Ok(results)
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
        .filter(|x| ob_config.must_collect_data_kinds.contains(x))
        .collect()
    }
}
