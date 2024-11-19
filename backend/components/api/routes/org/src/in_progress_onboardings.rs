use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::Any;
use api_core::telemetry::RootSpan;
use api_core::types::ApiListResponse;
use api_core::State;
use api_wire_types::InProgressOnboardingTenant;
use db::models::tenant_user::TenantUser;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::email::Email;
use newtypes::DataIdentifier;
use newtypes::IdentityDataKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use std::str::FromStr;

#[derive(Deserialize, Apiv2Schema)]
pub struct InProgressOnboardingsRequest {
    is_live: bool,
    #[serde(default)]
    #[openapi(optional)]
    omit_demo_tenants: bool,
}

#[api_v2_operation(
    tags(Members, Private),
    description = "Returns the list of in-progress KYC/KYB onboardings for the email associated with the logged-in dashboard user."
)]
#[get("/org/member/in_progress_onboardings")]
async fn get(
    state: web::Data<State>,
    request: web::Query<InProgressOnboardingsRequest>,
    auth: TenantSessionAuth,
    root_span: RootSpan,
) -> ApiListResponse<api_wire_types::InProgressOnboarding> {
    let auth = auth.check_guard(Any)?;
    let tu_id = auth.actor().tenant_user_id()?.clone();
    let InProgressOnboardingsRequest {
        is_live,
        omit_demo_tenants,
    } = request.into_inner();
    let tenant_user = state.db_query(move |conn| TenantUser::get(conn, &tu_id)).await?;

    // Fingerprint the authenticated dashboard user's email in the same way we fingerprint data for
    // users going through onboarding
    let email = Email::from_str(&tenant_user.email.to_string())?.to_piistring();
    let fp = DataIdentifier::Id(IdentityDataKind::Email).get_fingerprint_payload(&email, None);
    let sh_datas = state
        .enclave_client
        .batch_fingerprint(fp)
        .await?
        .into_iter()
        .map(|(_, fp)| fp)
        .collect_vec();

    let workflows = state
        .db_query(move |conn| Workflow::get_in_progress(conn, &sh_datas, is_live))
        .await?;

    root_span.record("meta", workflows.len());
    let response = workflows
        .into_iter()
        .filter(|(_, _, tenant)| !tenant.is_demo_tenant || !omit_demo_tenants)
        .map(|(wf, sv, tenant)| api_wire_types::InProgressOnboarding {
            fp_id: sv.fp_id,
            tenant: InProgressOnboardingTenant {
                name: tenant.name,
                website_url: tenant.website_url,
            },
            status: wf.status,
            timestamp: wf.created_at,
        })
        .sorted_by_key(|ob| ob.timestamp)
        .rev()
        .collect();
    Ok(response)
}
