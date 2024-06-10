use crate::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use crate::types::{
    JsonApiResponse,
    ResponseData,
};
use crate::State;
use api_core::errors::ApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use db::models::manual_review::ManualReview;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow_request::WorkflowRequest;
use newtypes::PreviewApi;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

#[api_v2_operation(
    description = "View basic details for a user. See the APIs under `/users/{fp_bid}/vault` for information on reading vault data.",
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
