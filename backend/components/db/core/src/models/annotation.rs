use super::user_timeline::UserTimeline;
use crate::actor;
use crate::actor::SaturatedActor;
use crate::models::scoped_vault::ScopedVault;
use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::annotation;
use db_schema::schema::scoped_vault;
use db_schema::schema::user_timeline;
use diesel::dsl::not;
use diesel::prelude::*;
use newtypes::AnnotationId;
use newtypes::DbActor;
use newtypes::DbUserTimelineEvent;
use newtypes::FpId;
use newtypes::OnboardingDecisionId;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Serialize, Deserialize)]
#[diesel(table_name = annotation)]
pub struct Annotation {
    pub id: AnnotationId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub note: String,
    pub is_pinned: bool,
    pub actor: DbActor,
}

#[derive(Debug, Clone, Insertable, Serialize, Deserialize)]
#[diesel(table_name = annotation)]
struct NewAnnotation {
    timestamp: DateTime<Utc>,
    scoped_vault_id: ScopedVaultId,
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
    #[tracing::instrument("Annotation::create", skip_all)]
    pub fn create<T>(
        conn: &mut PgConn,
        note: String,
        is_pinned: bool,
        scoped_vault_id: ScopedVaultId,
        actor: T,
    ) -> DbResult<AnnotationInfo>
    where
        T: Into<DbActor>,
    {
        let new = NewAnnotation {
            timestamp: Utc::now(),
            scoped_vault_id,
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

    #[tracing::instrument("Annotation::update", skip_all)]
    pub fn update(
        conn: &mut PgConn,
        id: AnnotationId,
        tenant_id: TenantId,
        fp_id: FpId,
        is_live: bool,
        is_pinned: Option<bool>,
    ) -> DbResult<Self> {
        let update = AnnotationUpdate { is_pinned };

        let su_ids = scoped_vault::table
            .filter(scoped_vault::fp_id.eq(fp_id))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .select(scoped_vault::id);
        let result = diesel::update(annotation::table)
            .filter(annotation::id.eq(id))
            .filter(annotation::scoped_vault_id.eq_any(su_ids))
            .set(update)
            .get_result::<Self>(conn)?;

        Ok(result)
    }

    #[tracing::instrument("Annotation::get_bulk", skip_all)]
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

    #[tracing::instrument("Annotation::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        fp_id: FpId,
        tenant_id: TenantId,
        is_live: bool,
        is_pinned: Option<bool>,
    ) -> DbResult<Vec<AnnotationInfo>> {
        let mut query = annotation::table
            .inner_join(scoped_vault::table)
            .filter(scoped_vault::fp_id.eq(fp_id))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .into_boxed();
        if let Some(is_pinned) = is_pinned {
            query = query.filter(annotation::is_pinned.eq(is_pinned));
        }

        let results: Vec<(Annotation, ScopedVault)> = query.get_results::<(Self, ScopedVault)>(conn)?;
        let annotations = results.into_iter().map(|t| t.0).collect();
        let annotations_with_actors = actor::saturate_actors(conn, annotations)?;
        Ok(annotations_with_actors)
    }

    #[tracing::instrument("Annotation::get_for_obd", skip_all)]
    pub fn get_for_obd(conn: &mut PgConn, obd_id: &OnboardingDecisionId) -> DbResult<Option<Self>> {
        // Right now, the only thing linking annotations and OBD's is user_timeline
        let ut: Option<UserTimeline> = user_timeline::table
            .filter(
                user_timeline::event
                    .retrieve_by_path_as_text(vec!["data", "id"])
                    .eq(obd_id),
            )
            .filter(not(user_timeline::event
                .retrieve_by_path_as_text(vec!["data", "annotation_id"])
                .is_null()))
            .order_by(user_timeline::timestamp.desc())
            .get_result(conn)
            .optional()?;

        let res = if let Some(ut) = ut {
            match ut.event {
                DbUserTimelineEvent::OnboardingDecision(o) => {
                    if let Some(annotation_id) = o.annotation_id {
                        annotation::table
                            .filter(annotation::id.eq(annotation_id))
                            .get_result::<Annotation>(conn)
                            .optional()?
                    } else {
                        // technically impossible given above sql query
                        None
                    }
                }
                _ => None,
            }
        } else {
            None
        };

        Ok(res)
    }
}
