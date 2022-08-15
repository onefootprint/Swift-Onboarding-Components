use std::collections::HashMap;

use crate::{schema::user_profile, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{PgConnection, Queryable};
use newtypes::{
    DataKind, Fingerprint as FingerprintData, FingerprintId, NewSealedData, SealedVaultBytes, UserProfileId,
    UserVaultId,
};
use serde::{Deserialize, Serialize};

use super::fingerprint::Fingerprint;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = user_profile)]
pub struct UserProfile {
    pub id: UserProfileId,
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
pub struct NewUserProfileReq {
    pub fingerprints: Vec<FingerprintData>,
    pub e_first_name: Option<SealedVaultBytes>,
    pub e_last_name: Option<SealedVaultBytes>,
    pub e_dob: Option<SealedVaultBytes>,
    pub e_ssn9: Option<SealedVaultBytes>,
    pub e_ssn4: Option<SealedVaultBytes>,
}

impl NewUserProfileReq {
    pub fn build(new_data: &HashMap<DataKind, NewSealedData>, old_data: Option<&UserProfile>) -> Self {
        let get_field = |data_kind, default: Option<Option<SealedVaultBytes>>| {
            new_data
                .get(&data_kind)
                .map(|x| x.e_data.clone())
                .or_else(|| default.flatten())
        };
        let fingerprints = new_data
            .iter()
            .filter(|(k, _)| UserProfile::contains(k))
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
#[diesel(table_name = user_profile)]
struct NewUserProfile {
    user_vault_id: UserVaultId,
    fingerprint_ids: Vec<FingerprintId>,
    e_first_name: Option<SealedVaultBytes>,
    e_last_name: Option<SealedVaultBytes>,
    e_dob: Option<SealedVaultBytes>,
    e_ssn9: Option<SealedVaultBytes>,
    e_ssn4: Option<SealedVaultBytes>,
}

impl From<(NewUserProfileReq, UserVaultId, Vec<FingerprintId>)> for NewUserProfile {
    fn from(s: (NewUserProfileReq, UserVaultId, Vec<FingerprintId>)) -> Self {
        let NewUserProfileReq {
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

impl UserProfile {
    pub fn get(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> Result<Option<Self>, DbError> {
        let result = user_profile::table
            .filter(user_profile::user_vault_id.eq(user_vault_id))
            .filter(user_profile::deactivated_at.is_null())
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
        diesel::update(user_profile::table)
            .filter(user_profile::id.eq(&self.id))
            .set(user_profile::deactivated_at.eq(Utc::now()))
            .execute(conn)?;
        Ok(())
    }

    pub fn create(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        new_data: NewUserProfileReq,
    ) -> Result<Self, DbError> {
        let fingerprint_ids = Fingerprint::bulk_create(conn, new_data.fingerprints.clone(), &user_vault_id)?;
        let new_row = NewUserProfile::from((new_data, user_vault_id, fingerprint_ids));
        let result = diesel::insert_into(user_profile::table)
            .values(&new_row)
            .get_result::<Self>(conn)?;
        Ok(result)
    }

    pub fn data_items(self) -> Vec<(DataKind, SealedVaultBytes)> {
        vec![
            self.e_first_name.map(|x| (DataKind::FirstName, x)),
            self.e_last_name.map(|x| (DataKind::LastName, x)),
            self.e_dob.map(|x| (DataKind::Dob, x)),
            self.e_ssn9.map(|x| (DataKind::Ssn9, x)),
            self.e_ssn4.map(|x| (DataKind::Ssn4, x)),
        ]
        .into_iter()
        .flatten()
        .collect()
    }
}
