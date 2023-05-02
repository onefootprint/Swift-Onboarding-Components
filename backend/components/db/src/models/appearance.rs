use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{AppearanceId, TenantId};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = appearance)]
/// Represents a tenant's custom appearance for the footprint flow. There may one day be multiple
/// appearances used by different ob configurations. It's generally a json blob defined by the
/// frontend
pub struct Appearance {
    pub id: AppearanceId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub data: serde_json::Value,
}

// We don't yet have codepaths to add appearances - we will just do it manually in the DB
