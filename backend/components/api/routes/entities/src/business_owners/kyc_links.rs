use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::config::LinkKind;
use api_core::decision::biz_risk::KybBoFeatures;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::kyb_utils::generate_secondary_bo_links;
use api_core::utils::kyb_utils::send_missing_secondary_bo_links;
use api_core::web::Json;
use api_core::State;
use api_errors::BadRequestInto;
use api_wire_types::CreateKycLinksRequest;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;


#[api_v2_operation(
    description = "Create (and optionally send) KYC links for beneficial owners awaiting KYC. Cannot be used for beneficials that have already completed KYC.",
    tags(EntityDetails, Private)
)]
#[post("/entities/{fp_id}/business_owners/kyc_links")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
    request: Json<CreateKycLinksRequest>,
) -> ApiListResponse<api_wire_types::PrivateBusinessOwnerKycLink> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let CreateKycLinksRequest { send_to_bo_ids } = request.into_inner();

    let (sb, biz_wf) = state
        .db_query(move |conn| {
            let sb = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            // Eventually we could make this API workflow-specific, but for now we just get the active wf
            let biz_wf = Workflow::get_active(conn, &sb.id)?;
            Ok((sb, biz_wf))
        })
        .await?;

    if !sb.kind.is_business() {
        return BadRequestInto("Can only create KYC links for business scoped vaults");
    }

    let (KybBoFeatures { bos }, bvw, _) = KybBoFeatures::build(&state, &biz_wf.id).await?;
    let tokens = generate_secondary_bo_links(&state, None, &biz_wf, &bos).await?;

    let links_to_send = (tokens.iter())
        .filter(|(bo, _)| send_to_bo_ids.contains(&bo.id))
        .cloned()
        .collect_vec();
    send_missing_secondary_bo_links(&state, &bvw, &bos, links_to_send, auth.tenant()).await?;

    let results = tokens
        .into_iter()
        .map(|(bo, token)| {
            let url = (state.config.service_config).generate_link(LinkKind::VerifyBusinessOwner, &token);
            (&bo.1, &auth, url, token)
        })
        .map(api_wire_types::PrivateBusinessOwnerKycLink::from_db)
        .collect();

    Ok(results)
}
