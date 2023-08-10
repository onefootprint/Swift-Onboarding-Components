use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::types::JsonApiResponse;
use crate::types::ResponseData;
use crate::State;
use api_core::errors::ApiResult;
use api_core::utils::db2api::DbToApi;
use db::models::manual_review::ManualReview;
use db::models::scoped_vault::ScopedVault;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "View details of a most recent onboarding status of user",
    tags(Users, PublicApi)
)]
#[get("/users/{fp_id}")]
pub async fn detail(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<api_wire_types::User> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let (sv, mrs) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let mrs = ManualReview::get_active_for_sv(conn, &sv.id)?;
            Ok((sv, mrs))
        })
        .await??;

    let result = api_wire_types::User::from_db((sv, mrs));
    ResponseData::ok(result).json()
}
