use std::collections::HashMap;

use crate::{
    models::scoped_user::ScopedUser,
    schema::{annotation, scoped_user},
    DbError, DbResult, TxnPgConnection,
};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{AnnotationId, FootprintUserId, ScopedUserId, TenantId, TenantUserId};

use super::tenant_user::TenantUser;

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

pub type AnnotationInfo = (Annotation, Option<TenantUser>);

#[derive(AsChangeset)]
#[diesel(table_name = annotation)]
struct AnnotationUpdate {
    is_pinned: Option<bool>,
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

    pub fn update(
        conn: &mut PgConnection,
        id: AnnotationId,
        tenant_id: TenantId,
        footprint_user_id: FootprintUserId,
        is_live: bool,
        is_pinned: Option<bool>,
    ) -> DbResult<Self> {
        let update = AnnotationUpdate { is_pinned };

        let su_ids = scoped_user::table
            .filter(scoped_user::fp_user_id.eq(footprint_user_id))
            .filter(scoped_user::tenant_id.eq(tenant_id))
            .filter(scoped_user::is_live.eq(is_live))
            .select(scoped_user::id);
        let result = diesel::update(annotation::table)
            .filter(annotation::id.eq(id))
            .filter(annotation::scoped_user_id.eq_any(su_ids))
            .set(update)
            .get_result::<Self>(conn)?;

        Ok(result)
    }

    pub fn get_bulk(
        conn: &mut PgConnection,
        ids: Vec<&AnnotationId>,
    ) -> DbResult<HashMap<AnnotationId, AnnotationInfo>> {
        use crate::schema::tenant_user;
        let results = annotation::table
            .filter(annotation::id.eq_any(ids))
            .left_join(tenant_user::table)
            .get_results::<AnnotationInfo>(conn)?
            .into_iter()
            .map(|a| (a.0.id.clone(), a))
            .collect();

        Ok(results)
    }

    pub fn list(
        conn: &mut PgConnection,
        fp_user_id: FootprintUserId,
        tenant_id: TenantId,
        is_live: bool,
        is_pinned: Option<bool>,
    ) -> DbResult<Vec<AnnotationInfo>> {
        use crate::schema::{scoped_user, tenant_user};
        let mut query = annotation::table
            .inner_join(scoped_user::table)
            .left_join(tenant_user::table)
            .filter(scoped_user::fp_user_id.eq(fp_user_id))
            .filter(scoped_user::tenant_id.eq(tenant_id))
            .filter(scoped_user::is_live.eq(is_live))
            .into_boxed();
        if let Some(is_pinned) = is_pinned {
            query = query.filter(annotation::is_pinned.eq(is_pinned));
        }
        let results = query
            .get_results::<(Self, ScopedUser, Option<TenantUser>)>(conn)?
            .into_iter()
            // It's really difficult to box a query in diesel with a left_join and a select(),
            // so we fetch all three tables even though we don't need the scoped user
            .map(|(annotation, _, tu)| (annotation, tu))
            .collect();

        Ok(results)
    }
}
