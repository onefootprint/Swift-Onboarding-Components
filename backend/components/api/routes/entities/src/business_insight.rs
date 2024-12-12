use crate::auth::tenant::TenantSessionAuth;
use crate::types::ApiResponse;
use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::CanDecrypt;
use api_core::decision::business_insights::BusinessInsights;
use api_core::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::utils::vault_wrapper::VwArgs;
use api_core::FpResult;
use api_errors::BadRequest;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VReqIdentifier;
use idv::middesk::response::business::BusinessResponse;
use newtypes::vendor_api_struct::MiddeskBusinessUpdateWebhook;
use newtypes::vendor_api_struct::MiddeskGetBusiness;
use newtypes::BusinessDataKind as BDK;
use newtypes::ScopedVaultId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Retrieve business insights for a given fp_bid.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_bid}/business_insights")]
pub async fn get_business_insights(
    state: web::Data<State>,
    request: FpIdPath,
    auth: TenantSessionAuth,
) -> ApiResponse<BusinessInsights> {
    let auth = auth.check_guard(CanDecrypt::new(BDK::api_examples()))?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();
    let (sv, vw) = state
        .db_query(move |conn| {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;
            Ok((sv, vw))
        })
        .await?;

    let business_response = get_business_response(&state, sv.id, vw).await?;
    Ok(BusinessInsights::from(business_response))
}

#[tracing::instrument(skip(state))]
async fn get_business_response(
    state: &State,
    sv_id: ScopedVaultId,
    vw: VaultWrapper<Any>,
) -> FpResult<BusinessResponse> {
    let webhook_biz_response = load_response_for_vendor_api(
        state,
        VReqIdentifier::LatestForSv(sv_id.clone()),
        &vw.vault.e_private_key,
        MiddeskBusinessUpdateWebhook,
    )
    .await?
    .ok()
    .and_then(|(r, _)| r.business_response().cloned());

    let business_response = match webhook_biz_response {
        Some(response) => Some(response),
        None => load_response_for_vendor_api(
            state,
            VReqIdentifier::LatestForSv(sv_id),
            &vw.vault.e_private_key,
            MiddeskGetBusiness,
        )
        .await?
        .ok()
        .map(|(r, _)| r),
    };

    business_response.ok_or(BadRequest("no KYB response found"))
}
