use chrono::{DateTime, Utc};
use diesel::Queryable;
use newtypes::{DataPriority, FingerprintId, PhoneNumberId, SealedVaultBytes, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = phone_number)]
pub struct PhoneNumber {
    pub id: PhoneNumberId,
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_e164: SealedVaultBytes,
    pub e_country: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}
