use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{AnnotationId, ScopedUserId, TenantUserId};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = annotation)]
pub struct Annotation {
    pub id: AnnotationId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub scoped_user_id: ScopedUserId,
    // When set, indicates that an admin user at the tenant created this annotation
    pub tenant_user_id: Option<TenantUserId>,
    pub note: String,
    pub is_pinned: bool,
}
