use crate::schema::fingerprint;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{PgConnection, Queryable};
use newtypes::{Fingerprint as FingerprintData, FingerprintId, UserVaultId};
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
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = fingerprint)]
pub struct NewFingerprint {
    pub user_vault_id: UserVaultId,
    pub sh_data: FingerprintData,
}

impl Fingerprint {
    pub(crate) fn deactivate(conn: &mut PgConnection, ids: &[FingerprintId]) -> Result<(), DbError> {
        diesel::update(fingerprint::table)
            .filter(fingerprint::id.eq_any(ids))
            .set(fingerprint::deactivated_at.eq(Utc::now()))
            .execute(conn)?;
        Ok(())
    }

    pub(crate) fn bulk_create(
        conn: &mut PgConnection,
        sh_datas: Vec<FingerprintData>,
        user_vault_id: &UserVaultId,
    ) -> Result<Vec<FingerprintId>, DbError> {
        let new_rows: Vec<NewFingerprint> = sh_datas
            .into_iter()
            .map(|d| NewFingerprint {
                user_vault_id: user_vault_id.clone(),
                sh_data: d,
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
