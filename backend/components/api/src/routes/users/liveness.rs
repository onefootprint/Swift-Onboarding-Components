use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::WorkOsAuthContext;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::models::webauthn_credential::WebauthnCredential;
use newtypes::FootprintUserId;
use newtypes::TenantPermission;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(
    description = "Allows a tenant to view a customer's registered webauthn credentials.",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}/liveness")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FootprintUserId>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ResponseData<Vec<api_wire_types::LivenessEvent>>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::Users])?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let footprint_user_id = request.into_inner();

    let creds = state
        .db_pool
        .db_query(move |conn| {
            WebauthnCredential::get_for_scoped_user(conn, &tenant_id, &footprint_user_id, is_live)
        })
        .await??;

    let response = creds
        .into_iter()
        .map(api_wire_types::LivenessEvent::from_db)
        .collect::<Vec<_>>();
    Ok(Json(ResponseData::ok(response)))
}
