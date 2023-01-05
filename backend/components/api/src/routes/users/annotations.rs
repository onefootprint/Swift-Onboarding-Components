use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantPermission;
use crate::auth::tenant::TenantUserAuthContext;
use crate::auth::Either;
use crate::errors::tenant::TenantError;
use crate::errors::ApiError;
use crate::types::EmptyResponse;

use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;

use crate::utils::db2api::DbToApi;
use crate::utils::validate_request::ValidateRequest;
use crate::State;

use actix_web::web::Json;
use api_wire_types::{AnnotationFilters, CreateAnnotationRequest, UpdateAnnotationRequest};
use db::models::annotation::Annotation;
use db::models::annotation::AnnotationInfo;
use db::models::scoped_user::ScopedUser;
use db::models::user_timeline::UserTimeline;
use db::DbError;
use newtypes::AnnotationId;
use newtypes::FootprintUserId;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, post, web};

type AnnotationsListResponse = Vec<api_wire_types::Annotation>;

#[api_v2_operation(description = "Gets the annotations for a user.", tags(Users, PublicApi))]
#[get("/users/{footprint_user_id}/annotations")]
pub async fn get(
    state: web::Data<State>,
    fp_user_id: web::Path<FootprintUserId>,
    query: web::Query<AnnotationFilters>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<AnnotationsListResponse> {
    // TODO paginate?
    let auth = auth.check_permissions(TenantPermission::Users)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let footprint_user_id = fp_user_id.into_inner();

    let annotations = state
        .db_pool
        .db_query(move |conn| Annotation::list(conn, footprint_user_id, tenant_id, is_live, query.is_pinned))
        .await??;
    let annotations = annotations
        .into_iter()
        .map(api_wire_types::Annotation::from_db)
        .collect();
    ResponseData::ok(annotations).json()
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct UpdateAnnotationPath {
    footprint_user_id: FootprintUserId,
    annotation_id: AnnotationId,
}

#[api_v2_operation(description = "Updates an existing annotation.", tags(Users, PublicApi))]
#[patch("/users/{footprint_user_id}/annotations/{annotation_id}")]
async fn patch(
    state: web::Data<State>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
    path: web::Path<UpdateAnnotationPath>,
    request: web::Json<UpdateAnnotationRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_permissions(TenantPermission::Users)?;
    let tenant = auth.tenant();
    let is_live = auth.is_live()?;
    let UpdateAnnotationPath {
        footprint_user_id,
        annotation_id,
    } = path.into_inner();

    let UpdateAnnotationRequest { is_pinned } = request.into_inner();
    let tenant_id = tenant.id.clone();
    let _result = state
        .db_pool
        .db_query(move |conn| {
            Annotation::update(
                conn,
                annotation_id,
                tenant_id,
                footprint_user_id,
                is_live,
                is_pinned,
            )
        })
        .await??;

    EmptyResponse::ok().json()
}

impl ValidateRequest for CreateAnnotationRequest {
    fn validate(&self) -> Result<(), ApiError> {
        if self.note.is_empty() {
            return Err(ApiError::from(TenantError::ValidationError(
                "note cannot be empty".to_owned(),
            )));
        }
        Ok(())
    }
}

#[api_v2_operation(
    description = "Creates a new freeform annotation.",
    tags(Annotation, PublicApi)
)]
#[post("/users/{footprint_user_id}/annotations")]
pub fn post(
    state: web::Data<State>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
    footprint_user_id: web::Path<FootprintUserId>,
    request: Json<CreateAnnotationRequest>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::Annotation>>, ApiError> {
    let auth = auth.check_permissions(TenantPermission::Users)?;
    request.validate()?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();
    let auth_actor = auth.actor();

    let CreateAnnotationRequest { note, is_pinned } = request.into_inner();

    let footprint_user_id = footprint_user_id.into_inner();

    // TODO: should possibly make this route handler dumber and move these DB operations into a helper function, ie MakeAnnotation::call(note,is_pinned,footprint_user_id,auth_actor)
    //   we can call this from tests, from future spots where we want to create annotations (eg: decision engine)
    let annotation: AnnotationInfo = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;

            let annotation: AnnotationInfo =
                Annotation::create(conn, note, is_pinned, scoped_user.id.clone(), auth_actor)?;

            UserTimeline::create(
                conn,
                newtypes::AnnotationInfo {
                    annotation_id: annotation.0.id.clone(),
                },
                scoped_user.user_vault_id,
                Some(scoped_user.id),
            )?;

            Ok(annotation)
        })
        .await?;

    let result = api_wire_types::Annotation::from_db(annotation);
    ResponseData::ok(result).json()
}
