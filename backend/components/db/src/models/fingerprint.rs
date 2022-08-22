use crate::schema::fingerprint;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{PgConnection, Queryable};
use newtypes::{DataAttribute, Fingerprint as FingerprintData, FingerprintId, UserVaultId};
use serde::{Deserialize, Serialize};

use crate::DbError;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = fingerprint)]
pub struct Fingerprint {
    pub id: FingerprintId,
    pub user_vault_id: UserVaultId,
    pub sh_data: FingerprintData,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub data_attribute: DataAttribute,
    pub is_unique: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = fingerprint)]
pub struct NewFingerprint {
    pub user_vault_id: UserVaultId,
    pub sh_data: FingerprintData,
    pub data_attribute: DataAttribute,
    pub is_unique: bool,
}

pub type IsUnique = bool;

impl Fingerprint {
    pub(crate) fn deactivate(
        conn: &mut PgConnection,
        ids: &[FingerprintId],
        attributes: &[DataAttribute],
    ) -> Result<Vec<Fingerprint>, DbError> {
        let deleted = diesel::update(fingerprint::table)
            .filter(
                fingerprint::id
                    .eq_any(ids)
                    .and(fingerprint::data_attribute.eq_any(attributes)),
            )
            .set(fingerprint::deactivated_at.eq(Utc::now()))
            .get_results(conn)?;
        Ok(deleted)
    }

    pub fn bulk_create(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
        fingerprints: Vec<(DataAttribute, FingerprintData, IsUnique)>,
    ) -> Result<Vec<FingerprintId>, DbError> {
        let new_rows: Vec<NewFingerprint> = fingerprints
            .into_iter()
            .map(|(data_attribute, sh_data, is_unique)| NewFingerprint {
                user_vault_id: user_vault_id.clone(),
                sh_data,
                data_attribute,
                is_unique,
            })
            .collect();
        let new_rows = diesel::insert_into(fingerprint::table)
            .values(new_rows)
            .get_results::<Fingerprint>(conn)?
            .into_iter()
            .map(|x| x.id)
            .collect();
        Ok(new_rows)
    }
}
