use std::collections::HashMap;

use crate::{schema::annotation, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{AnnotationId, FootprintUserId, ScopedUserId, TenantId, TenantUserId};

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

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = annotation)]
struct NewAnnotation {
    timestamp: DateTime<Utc>,
    scoped_user_id: ScopedUserId,
    tenant_user_id: Option<TenantUserId>,
    note: String,
    is_pinned: bool,
}

impl Annotation {
    pub fn create(
        conn: &mut PgConnection,
        note: String,
        is_pinned: bool,
        scoped_user_id: ScopedUserId,
        tenant_user_id: Option<TenantUserId>,
    ) -> DbResult<Self> {
        let new = NewAnnotation {
            timestamp: Utc::now(),
            scoped_user_id,
            tenant_user_id,
            note,
            is_pinned,
        };
        let result = diesel::insert_into(annotation::table)
            .values(new)
            .get_result(conn)?;
        Ok(result)
    }

    pub fn get_bulk(
        conn: &mut PgConnection,
        ids: Vec<&AnnotationId>,
    ) -> DbResult<HashMap<AnnotationId, Self>> {
        let results = annotation::table
            .filter(annotation::id.eq_any(ids))
            .get_results::<Self>(conn)?
            .into_iter()
            .map(|a| (a.id.clone(), a))
            .collect();

        Ok(results)
    }

    pub fn list(
        conn: &mut PgConnection,
        fp_user_id: FootprintUserId,
        tenant_id: TenantId,
        is_live: bool,
        is_pinned: Option<bool>,
    ) -> DbResult<Vec<Self>> {
        use crate::schema::scoped_user;
        let mut query = annotation::table
            .inner_join(scoped_user::table)
            .filter(scoped_user::fp_user_id.eq(fp_user_id))
            .filter(scoped_user::tenant_id.eq(tenant_id))
            .filter(scoped_user::is_live.eq(is_live))
            .select(annotation::all_columns)
            .into_boxed();
        if let Some(is_pinned) = is_pinned {
            query = query.filter(annotation::is_pinned.eq(is_pinned));
        }
        let results = query.get_results::<Self>(conn)?;

        Ok(results)
    }
}
