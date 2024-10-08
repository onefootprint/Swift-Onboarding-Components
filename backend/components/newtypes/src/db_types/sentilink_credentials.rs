use super::SealedVaultBytes;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use serde::Deserialize;
use serde::Serialize;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, AsJsonb)]
pub struct SentilinkTenantVendorControlCredentials {
    pub account: SealedVaultBytes,
    pub token: SealedVaultBytes,
}
