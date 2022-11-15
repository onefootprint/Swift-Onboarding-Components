use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::WorkOsAuthContext;
use crate::auth::Either;

use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;

use crate::utils::db2api::DbToApi;
use crate::State;

use api_wire_types::AnnotationFilters;
use db::models::annotation::Annotation;
use newtypes::FootprintUserId;
use newtypes::TenantPermission;
use paperclip::actix::{api_v2_operation, get, web};

type AnnotationsListResponse = Vec<api_wire_types::Annotation>;

#[api_v2_operation(description = "Gets the annotations for a user.", tags(Users, PublicApi))]
#[get("/users/{footprint_user_id}/annotations")]
pub async fn get(
    state: web::Data<State>,
    fp_user_id: web::Path<FootprintUserId>,
    query: web::Query<AnnotationFilters>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<AnnotationsListResponse> {
    // TODO paginate?
    let auth = auth.check_permissions(vec![TenantPermission::Users])?;
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
