use std::collections::HashMap;

use crate::{schema::user_basic_info, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{PgConnection, Queryable};
use newtypes::{
    DataKind, Fingerprint as FingerprintData, FingerprintId, NewSealedData, SealedVaultBytes,
    UserBasicInfoId, UserVaultId,
};
use serde::{Deserialize, Serialize};

use super::fingerprint::Fingerprint;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = user_basic_info)]
pub struct UserBasicInfo {
    pub id: UserBasicInfoId,
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_first_name: Option<SealedVaultBytes>,
    pub e_last_name: Option<SealedVaultBytes>,
    pub e_dob: Option<SealedVaultBytes>,
    pub e_ssn9: Option<SealedVaultBytes>,
    pub e_ssn4: Option<SealedVaultBytes>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewUserBasicInfoReq {
    pub fingerprints: Vec<FingerprintData>,
    pub e_first_name: Option<SealedVaultBytes>,
    pub e_last_name: Option<SealedVaultBytes>,
    pub e_dob: Option<SealedVaultBytes>,
    pub e_ssn9: Option<SealedVaultBytes>,
    pub e_ssn4: Option<SealedVaultBytes>,
}

impl NewUserBasicInfoReq {
    pub fn build(new_data: &HashMap<DataKind, NewSealedData>, old_data: Option<&UserBasicInfo>) -> Self {
        let get_field = |data_kind, default: Option<Option<SealedVaultBytes>>| {
            new_data
                .get(&data_kind)
                .map(|x| x.e_data.clone())
                .or_else(|| default.flatten())
        };
        let fingerprints = new_data
            .iter()
            .filter(|(k, _)| UserBasicInfo::contains(k))
            .filter_map(|(_, v)| v.sh_data.clone())
            .collect();
        Self {
            fingerprints,
            e_first_name: get_field(DataKind::FirstName, old_data.map(|d| d.e_first_name.clone())),
            e_last_name: get_field(DataKind::LastName, old_data.map(|d| d.e_last_name.clone())),
            e_dob: get_field(DataKind::Dob, old_data.map(|d| d.e_dob.clone())),
            e_ssn9: get_field(DataKind::Ssn9, old_data.map(|d| d.e_ssn9.clone())),
            e_ssn4: get_field(DataKind::Ssn4, old_data.map(|d| d.e_ssn4.clone())),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_basic_info)]
struct NewUserBasicInfo {
    user_vault_id: UserVaultId,
    fingerprint_ids: Vec<FingerprintId>,
    e_first_name: Option<SealedVaultBytes>,
    e_last_name: Option<SealedVaultBytes>,
    e_dob: Option<SealedVaultBytes>,
    e_ssn9: Option<SealedVaultBytes>,
    e_ssn4: Option<SealedVaultBytes>,
}

impl From<(NewUserBasicInfoReq, UserVaultId, Vec<FingerprintId>)> for NewUserBasicInfo {
    fn from(s: (NewUserBasicInfoReq, UserVaultId, Vec<FingerprintId>)) -> Self {
        let NewUserBasicInfoReq {
            e_first_name,
            e_last_name,
            e_dob,
            e_ssn9,
            e_ssn4,
            ..
        } = s.0;
        Self {
            user_vault_id: s.1,
            fingerprint_ids: s.2,
            e_first_name,
            e_last_name,
            e_dob,
            e_ssn9,
            e_ssn4,
        }
    }
}

impl UserBasicInfo {
    pub fn get(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> Result<Option<Self>, DbError> {
        let result = user_basic_info::table
            .filter(user_basic_info::user_vault_id.eq(user_vault_id))
            .filter(user_basic_info::deactivated_at.is_null())
            .first(conn)
            .optional()?;
        Ok(result)
    }

    pub fn contains(data_kind: &DataKind) -> bool {
        matches!(
            data_kind,
            DataKind::FirstName | DataKind::LastName | DataKind::Dob | DataKind::Ssn9 | DataKind::Ssn4
        )
    }

    pub fn deactivate(&self, conn: &mut PgConnection) -> Result<(), DbError> {
        Fingerprint::deactivate(conn, &self.fingerprint_ids)?;
        diesel::update(user_basic_info::table)
            .filter(user_basic_info::id.eq(&self.id))
            .set(user_basic_info::deactivated_at.eq(Utc::now()))
            .execute(conn)?;
        Ok(())
    }

    pub fn create(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        new_data: NewUserBasicInfoReq,
    ) -> Result<Self, DbError> {
        let fingerprint_ids = Fingerprint::bulk_create(conn, new_data.fingerprints.clone(), &user_vault_id)?;
        let new_row = NewUserBasicInfo::from((new_data, user_vault_id, fingerprint_ids));
        let result = diesel::insert_into(user_basic_info::table)
            .values(&new_row)
            .get_result::<Self>(conn)?;
        Ok(result)
    }
}
