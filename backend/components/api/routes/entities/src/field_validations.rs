use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;

use crate::errors::ApiResult;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;

use crate::State;

use api_core::decision::field_validations::create_field_validation_results;
use api_wire_types::GetFieldValidationResponse;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::risk_signal::RiskSignal;
use newtypes::FpId;

use newtypes::SignalScope;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "Lists the match signals for a footprint user.",
    tags(Entities, Preview)
)]
#[get("/entities/{fp_id}/match_signals")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FpId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<GetFieldValidationResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let reason_codes = state
        .db_pool
        .db_query(move |conn| -> ApiResult<Vec<RiskSignal>> {
            let latest_onboarding_decision =
                OnboardingDecision::latest_footprint_actor_decision(conn, &fp_id, &tenant_id, is_live)?;

            match latest_onboarding_decision {
                Some(obd) => Ok(RiskSignal::list_tenant_visible_by_onboarding_decision_id(
                    conn, &obd.id,
                )?),
                None => Ok(vec![]),
            }
        })
        .await??
        .into_iter()
        .map(|rs| rs.reason_code)
        .collect();

    let field_validations_map = create_field_validation_results(reason_codes);
    let response: GetFieldValidationResponse = GetFieldValidationResponse {
        name: field_validations_map.get(&SignalScope::Name).cloned(),
        address: field_validations_map.get(&SignalScope::Address).cloned(),
        email: field_validations_map.get(&SignalScope::Email).cloned(),
        phone: field_validations_map.get(&SignalScope::PhoneNumber).cloned(),
        dob: field_validations_map.get(&SignalScope::Dob).cloned(),
        ssn: field_validations_map.get(&SignalScope::Ssn).cloned(),
        document: field_validations_map.get(&SignalScope::Document).cloned(),
    };

    ResponseData::ok(response).json()
}
