use std::collections::HashMap;

use db::models::ob_configurations::ObConfiguration;
use db::models::user_data::{GroupDataUpdateRequest, NewUserDataBatch, UserData, UserDataUpdate};
use db::models::user_vaults::UserVault;
use db::DbPool;
use db::{errors::DbError, PgConnection};
use newtypes::{
    DataKind, DataPatchRequest, DataPriority, Fingerprinter, PiiString, SealedVaultBytes, UserDataId,
    UserVaultId,
};
use paperclip::actix::web;

use crate::errors::ApiError;
use crate::State;

pub struct UserVaultWrapper {
    _user_vault: UserVault,
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

    pub async fn bulk_update(
        &self,
        state: &web::Data<State>,
        user_vault_id: UserVaultId,
        update_request: &Vec<DataPatchRequest>,
    ) -> Result<(), ApiError> {
        let mut all_db_updates: Vec<GroupDataUpdateRequest> = vec![];
        let mut ud_to_deactivate: Vec<UserDataId> = vec![];
        // for every group we need to update (ex: address)
        // iterate through every individual piece of data in that group (city, state)
        // and build an update struct with the encrypted and/or sh data
        for data_group_update in update_request {
            let DataPatchRequest { data, group_kind } = data_group_update;

            let mut db_updates_for_group: Vec<UserDataUpdate> = vec![];
            let mut priority = DataPriority::Primary;
            for (data_kind, val) in data {
                let db_update_for_data = self.build_update_struct(state, data_kind.to_owned(), val).await?;
                db_updates_for_group.push(db_update_for_data);

                // this priority stuff is kind of wonky with the groups... i think we should
                // have the user specify priority for stuff instead of inferring it
                let (decided_priority, id_to_deactivate) = self.decide_priority(data_kind);
                if decided_priority == DataPriority::Secondary {
                    priority = decided_priority;
                }
                if let Some(id) = id_to_deactivate {
                    ud_to_deactivate.push(id);
                }
            }
            all_db_updates.push(GroupDataUpdateRequest {
                user_vault_id: user_vault_id.clone(),
                data_group_priority: priority,
                data_group_kind: group_kind.to_owned(),
                data: db_updates_for_group,
            })
        }

        let all_db_updates = NewUserDataBatch(all_db_updates);

        // deactive old info + bulk insert
        state
            .db_pool
            .db_transaction(move |conn| -> Result<(), DbError> {
                db::user_data::bulk_deactivate(conn, ud_to_deactivate)?;
                all_db_updates.bulk_insert(conn)?;
                Ok(())
            })
            .await?;

        Ok(())
    }

    fn decide_priority(&self, data_kind: &DataKind) -> (DataPriority, Option<UserDataId>) {
        match self.get_data(data_kind.to_owned()) {
            Some(existing_data) => {
                // There's an existing piece of data with this kind
                if data_kind.allow_multiple() {
                    // Multiple pieces of data are allowed for this kind. We assume there's already
                    // a primary, so we make this a secondary piece of data
                    (DataPriority::Secondary, None)
                } else {
                    // We're only allowed to have one piece of data with this kind. Deactivate the
                    // last piece of data
                    (DataPriority::Primary, Some(existing_data.id.clone()))
                }
            }
            None => (DataPriority::Primary, None),
        }
    }

    /// Builds an individual update struct for the db, with the sh_data
    /// if the type supports it and the e_data
    async fn build_update_struct(
        &self,
        state: &web::Data<State>,
        data_kind: DataKind,
        val: &PiiString,
    ) -> Result<UserDataUpdate, ApiError> {
        let sh_data = if data_kind.allows_fingerprint() {
            Some(state.compute_fingerprint(data_kind, val).await?)
        } else {
            None
        };
        let e_data = self._user_vault.public_key.seal_pii(val)?;
        Ok(UserDataUpdate {
            data_kind,
            e_data,
            sh_data,
            is_verified: false,
        })
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
