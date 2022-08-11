use chrono::{DateTime, Utc};
use diesel::Queryable;
use newtypes::{Fingerprint as FingerprintData, FingerprintId, UserVaultId};
use serde::{Deserialize, Serialize};

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
