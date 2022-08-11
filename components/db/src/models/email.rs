use chrono::{DateTime, Utc};
use diesel::Queryable;
use newtypes::{DataPriority, EmailId, FingerprintId, SealedVaultBytes, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = email)]
pub struct Email {
    pub id: EmailId,
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_data: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}
