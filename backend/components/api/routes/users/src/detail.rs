use crate::{
    auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard},
    types::{JsonApiResponse, ResponseData},
    State,
};
use api_core::{
    errors::ApiResult,
    utils::{db2api::DbToApi, fp_id_path::FpIdPath},
};
use db::models::{manual_review::ManualReview, scoped_vault::ScopedVault, workflow_request::WorkflowRequest};
use newtypes::PreviewApi;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "View details of a most recent onboarding status of user",
    tags(Users, PublicApi)
)]
#[get("/users/{fp_id:fp_[_A-Za-z0-9]*}")]
pub async fn detail(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<api_wire_types::User> {
    // Low confidence in this being the right future-proof API, so let's gate it
    let show_requires_additional_info = auth.can_access_preview(&PreviewApi::CreateUserToken);

    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let (sv, mrs, wfr) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let mrs = ManualReview::get_active(conn, &sv.id)?;
            let wfr = if show_requires_additional_info {
                WorkflowRequest::get_active(conn, &sv.id)?
            } else {
                None
            };
            Ok((sv, mrs, wfr))
        })
        .await?;

    let result = api_wire_types::User::from_db((sv, mrs, wfr));
    ResponseData::ok(result).json()
}
