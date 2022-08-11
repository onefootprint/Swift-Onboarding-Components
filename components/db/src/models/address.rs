use chrono::{DateTime, Utc};
use diesel::Queryable;
use newtypes::{AddressId, FingerprintId, SealedVaultBytes, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = address)]
pub struct Address {
    pub id: AddressId,
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_line1: Option<SealedVaultBytes>,
    pub e_line2: Option<SealedVaultBytes>,
    pub e_city: Option<SealedVaultBytes>,
    pub e_state: Option<SealedVaultBytes>,
    pub e_zip: Option<SealedVaultBytes>,
    pub e_country: Option<SealedVaultBytes>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}
