use crate::auth::tenant::TenantSessionAuth;
use crate::types::ApiResponse;
use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::CanDecrypt;
use api_core::decision::business_insights::BusinessInsights;
use api_core::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use api_core::errors::ValidationError;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::utils::vault_wrapper::VwArgs;
use api_core::FpResult;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VReqIdentifier;
use newtypes::vendor_api_struct::MiddeskBusinessUpdateWebhook;
use newtypes::vendor_api_struct::MiddeskGetBusiness;
use newtypes::BusinessDataKind as BDK;
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
    let auth = auth.check_guard(CanDecrypt::new(BDK::non_bo_variants()))?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let (sv, vw) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;
            Ok((sv, vw))
        })
        .await?;

    let webhook_biz_response = load_response_for_vendor_api(
        &state,
        VReqIdentifier::LatestForSv(sv.id.clone()),
        &vw.vault.e_private_key,
        MiddeskBusinessUpdateWebhook,
    )
    .await?
    .ok()
    .and_then(|(r, _)| r.business_response().cloned());

    let biz_response = load_response_for_vendor_api(
        &state,
        VReqIdentifier::LatestForSv(sv.id.clone()),
        &vw.vault.e_private_key,
        MiddeskGetBusiness,
    )
    .await?
    .ok()
    .map(|(r, _)| r);

    let business_response = webhook_biz_response
        .or(biz_response)
        .ok_or(ValidationError("no vendor response found for middesk"))?;


    Ok(BusinessInsights::from(business_response))
}
