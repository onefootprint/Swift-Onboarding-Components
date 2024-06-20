use crate::ScopedVaultId;
use crate::TenantApiKeyId;
use crate::TenantUserId;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb, Eq, PartialEq, Hash)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum DbActor {
    User { id: ScopedVaultId },
    TenantUser { id: TenantUserId },
    TenantApiKey { id: TenantApiKeyId },
    Footprint,
    FirmEmployee { id: TenantUserId },
}
