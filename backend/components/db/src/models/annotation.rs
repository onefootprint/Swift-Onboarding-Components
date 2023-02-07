use std::collections::HashMap;

use crate::PgConn;
use crate::{
    actor,
    actor::SaturatedActor,
    models::scoped_user::ScopedUser,
    schema::{annotation, scoped_user},
    DbError, DbResult,
};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{AnnotationId, DbActor, FootprintUserId, ScopedUserId, TenantId};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Queryable, Serialize, Deserialize)]
#[diesel(table_name = annotation)]
pub struct Annotation {
    pub id: AnnotationId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub scoped_user_id: ScopedUserId,
    pub note: String,
    pub is_pinned: bool,
    pub actor: DbActor,
}

#[derive(Debug, Clone, Insertable, Serialize, Deserialize)]
#[diesel(table_name = annotation)]
struct NewAnnotation {
    timestamp: DateTime<Utc>,
    scoped_user_id: ScopedUserId,
    note: String,
    is_pinned: bool,
    actor: DbActor,
}

pub type AnnotationInfo = (Annotation, SaturatedActor);

#[derive(AsChangeset)]
#[diesel(table_name = annotation)]
struct AnnotationUpdate {
    is_pinned: Option<bool>,
}

impl Annotation {
    #[tracing::instrument(skip_all)]
    pub fn create<T>(
        conn: &mut PgConn,
        note: String,
        is_pinned: bool,
        scoped_user_id: ScopedUserId,
        actor: T,
    ) -> DbResult<AnnotationInfo>
    where
        T: Into<DbActor>,
    {
        let new = NewAnnotation {
            timestamp: Utc::now(),
            scoped_user_id,
            note,
            is_pinned,
            actor: actor.into(),
        };

        let annotation: Annotation = diesel::insert_into(annotation::table)
            .values(new)
            .get_result::<Annotation>(conn)?;

        let annotation_info: AnnotationInfo = actor::saturate_actors::<Annotation>(conn, vec![annotation])?
            .first()
            .ok_or(DbError::RelatedObjectNotFound)?
            .clone();

        Ok(annotation_info)
    }

    #[tracing::instrument(skip_all)]
    pub fn update(
        conn: &mut PgConn,
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

    #[tracing::instrument(skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<&AnnotationId>,
    ) -> DbResult<HashMap<AnnotationId, AnnotationInfo>> {
        let annotations = annotation::table
            .filter(annotation::id.eq_any(ids))
            .get_results::<Annotation>(conn)?;

        let annotations_with_actors = actor::saturate_actors(conn, annotations)?;

        let annotation_map: HashMap<AnnotationId, AnnotationInfo> = annotations_with_actors
            .into_iter()
            .map(|z| (z.0.id.clone(), z))
            .collect();

        Ok(annotation_map)
    }

    #[tracing::instrument(skip_all)]
    pub fn list(
        conn: &mut PgConn,
        fp_user_id: FootprintUserId,
        tenant_id: TenantId,
        is_live: bool,
        is_pinned: Option<bool>,
    ) -> DbResult<Vec<AnnotationInfo>> {
        let mut query = annotation::table
            .inner_join(scoped_user::table)
            .filter(scoped_user::fp_user_id.eq(fp_user_id))
            .filter(scoped_user::tenant_id.eq(tenant_id))
            .filter(scoped_user::is_live.eq(is_live))
            .into_boxed();
        if let Some(is_pinned) = is_pinned {
            query = query.filter(annotation::is_pinned.eq(is_pinned));
        }

        let results: Vec<(Annotation, ScopedUser)> = query.get_results::<(Self, ScopedUser)>(conn)?;
        let annotations = results.into_iter().map(|t| t.0).collect();
        let annotations_with_actors = actor::saturate_actors(conn, annotations)?;
        Ok(annotations_with_actors)
    }
}
