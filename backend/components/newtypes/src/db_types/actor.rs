use crate::{
    ScopedVaultId,
    TenantApiKeyId,
    TenantUserId,
};
use diesel::{
    AsExpression,
    FromSqlRow,
};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};

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
