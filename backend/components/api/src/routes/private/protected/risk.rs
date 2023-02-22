use crate::auth::protected_custodian::ProtectedCustodianAuthContext;
use crate::decision::risk::OnboardingRulesDecisionOutput;
use crate::decision::vendor;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::user_vault_wrapper::{UserVaultWrapper, UvwArgs};
use crate::{decision, State};
use db::models::onboarding::Onboarding;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use newtypes::{DecisionStatus, FootprintUserId, TenantId, VerificationRequestId, VerificationResultId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct MakeVendorCallsRequest {
    pub tenant_id: TenantId,
    pub fp_user_id: FootprintUserId,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct MakeVendorCallsResponse {
    request_ids: Vec<VerificationRequestId>,
    response_ids: Vec<VerificationResultId>,
    decision_output: DecisionOutput,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
struct DecisionOutput {
    pub decision_status: DecisionStatus,
    pub create_manual_review: bool,
    pub rules_triggered: String,
    pub rules_not_triggered: String,
}

impl From<OnboardingRulesDecisionOutput> for DecisionOutput {
    fn from(d: OnboardingRulesDecisionOutput) -> Self {
        let OnboardingRulesDecisionOutput {
            decision_status,
            create_manual_review,
            rules_triggered,
            rules_not_triggered,
        } = d;

        Self {
            decision_status,
            create_manual_review,
            rules_triggered: crate::decision::rule::rules_to_string(&rules_triggered),
            rules_not_triggered: crate::decision::rule::rules_to_string(&rules_not_triggered),
        }
    }
}

#[api_v2_operation(
    description = "Creates new VerificationRequest's, re-pings all vendors, and writes VerificationResults for the passed in fp_user_id",
    tags(Private)
)]
#[post("/private/protected/risk/make_vendor_calls")]
async fn make_vendor_calls(
    state: web::Data<State>,
    _: ProtectedCustodianAuthContext,
    request: Json<MakeVendorCallsRequest>,
) -> actix_web::Result<Json<ResponseData<MakeVendorCallsResponse>>, ApiError> {
    let MakeVendorCallsRequest {
        tenant_id,
        fp_user_id,
    } = request.into_inner();

    let requests = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedUser::get(conn, (&fp_user_id, &tenant_id, true))?;
            let uv = UserVault::get(conn, &scoped_user.id)?;
            let (ob, _, _, _) = Onboarding::get(conn, (&scoped_user.id, &uv.id))?;

            let uvw = UserVaultWrapper::build(conn, UvwArgs::Tenant(&scoped_user.id))?;

            let requests = vendor::build_verification_requests_and_checkpoint(conn, &uvw, &ob.id)?;

            Ok(requests)
        })
        .await?;

    let vendor_results = decision::engine::make_vendor_requests(
        &state.db_pool,
        &state.enclave_client,
        state.config.service_config.is_production(),
        requests,
        &state.feature_flag_client,
        &state.idology_client,
        &state.socure_production_client,
        &state.twilio_client.client,
    )
    .await?;

    let (rules_output, _) =
        crate::decision::engine::calculate_decision(vendor_results.clone(), &state.feature_flag_client)?;

    let (request_ids, response_ids): (Vec<VerificationRequestId>, Vec<VerificationResultId>) = vendor_results
        .into_iter()
        .map(|r| (r.verification_request_id, r.verification_result_id))
        .unzip();

    Ok(Json(ResponseData::ok(MakeVendorCallsResponse {
        request_ids,
        response_ids,
        decision_output: rules_output.into(),
    })))
}
