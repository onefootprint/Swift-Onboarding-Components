use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::errors::tenant::TenantError;
use crate::types::ModernApiResult;
use crate::utils::db2api::DbToApi;
use crate::FpError;
use crate::State;
use actix_web::web::Json;
use api_core::types::JsonApiListResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::FpResult;
use api_wire_types::AnnotationFilters;
use api_wire_types::UpdateAnnotationRequest;
use db::models::annotation::Annotation;
use db::models::annotation::AnnotationInfo;
use db::models::scoped_vault::ScopedVault;
use db::models::user_timeline::UserTimeline;
use db::DbError;
use newtypes::AnnotationId;
use newtypes::CreateAnnotationRequest;
use newtypes::FpId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::patch;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::Apiv2Schema;

#[api_v2_operation(
    description = "Gets the annotations for a user.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/annotations")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    query: web::Query<AnnotationFilters>,
    auth: TenantSessionAuth,
) -> JsonApiListResponse<api_wire_types::Annotation> {
    // TODO paginate?
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let annotations = state
        .db_pool
        .db_query(move |conn| Annotation::list(conn, fp_id, tenant_id, is_live, query.is_pinned))
        .await?;
    let annotations = annotations
        .into_iter()
        .map(api_wire_types::Annotation::from_db)
        .collect();
    Ok(annotations)
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct UpdateAnnotationPath {
    fp_id: FpId,
    annotation_id: AnnotationId,
}

#[api_v2_operation(
    description = "Updates an existing annotation.",
    tags(EntityDetails, Entities, Private)
)]
#[patch("/entities/{fp_id}/annotations/{annotation_id}")]
async fn patch(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<UpdateAnnotationPath>,
    request: web::Json<UpdateAnnotationRequest>,
) -> ModernApiResult<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let tenant = auth.tenant();
    let is_live = auth.is_live()?;
    let UpdateAnnotationPath { fp_id, annotation_id } = path.into_inner();

    let UpdateAnnotationRequest { is_pinned } = request.into_inner();
    let tenant_id = tenant.id.clone();
    let _result = state
        .db_pool
        .db_query(move |conn| Annotation::update(conn, annotation_id, tenant_id, fp_id, is_live, is_pinned))
        .await?;

    Ok(api_wire_types::Empty)
}

pub trait ValidateRequest {
    fn validate(&self) -> FpResult<()>;
}

impl ValidateRequest for CreateAnnotationRequest {
    fn validate(&self) -> FpResult<()> {
        if self.note.is_empty() {
            return Err(FpError::from(TenantError::ValidationError(
                "note cannot be empty".to_owned(),
            )));
        }
        Ok(())
    }
}

#[api_v2_operation(
    description = "Creates a new freeform annotation.",
    tags(EntityDetails, Entities, Private)
)]
#[post("/entities/{fp_id}/annotations")]
pub fn post(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    fp_id: FpIdPath,
    request: Json<CreateAnnotationRequest>,
) -> ModernApiResult<api_wire_types::Annotation> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    request.validate()?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();
    let auth_actor = auth.actor();

    let CreateAnnotationRequest { note, is_pinned } = request.into_inner();

    let fp_id = fp_id.into_inner();

    // TODO: should possibly make this route handler dumber and move these DB operations into a helper
    // function, ie MakeAnnotation::call(note,is_pinned,fp_id,auth_actor)   we can call this from
    // tests, from future spots where we want to create annotations (eg: decision engine)
    let annotation: AnnotationInfo = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;

            let annotation: AnnotationInfo =
                Annotation::create(conn, note, is_pinned, scoped_user.id.clone(), auth_actor)?;

            let info = newtypes::AnnotationInfo {
                annotation_id: annotation.0.id.clone(),
            };
            UserTimeline::create(conn, info, scoped_user.vault_id, scoped_user.id)?;

            Ok(annotation)
        })
        .await?;

    let result = api_wire_types::Annotation::from_db(annotation);
    Ok(result)
}
