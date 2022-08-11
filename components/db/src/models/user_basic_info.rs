use chrono::{DateTime, Utc};
use diesel::Queryable;
use newtypes::{FingerprintId, SealedVaultBytes, UserBasicInfoId, UserVaultId};
use serde::{Deserialize, Serialize};

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
