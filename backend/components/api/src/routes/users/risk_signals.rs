use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::WorkOsAuthContext;
use crate::auth::Either;

use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;

use crate::State;

use api_wire_types::RiskSeverity;
use api_wire_types::RiskSignal;

use chrono::Utc;

use newtypes::FootprintUserId;
use newtypes::OnboardingDecisionId;

use newtypes::RiskSignalId;
use newtypes::TenantPermission;

use newtypes::Vendor;
use paperclip::actix::{api_v2_operation, get, web};

type RiskSignalsResponse = Vec<RiskSignal>;

#[api_v2_operation(
    description = "Lists the risk signals for a footprint user.",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}/risk_signals")]
pub async fn get(
    _state: web::Data<State>,
    _request: web::Path<FootprintUserId>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<RiskSignalsResponse> {
    let _auth = auth.check_permissions(vec![TenantPermission::Users])?;
    // let tenant_id = auth.tenant().id.clone();
    // let is_live = auth.is_live()?;
    // let footprint_user_id = request.into_inner();

    //TODO: stub render real data
    let _sig = RiskSignal {
        id: RiskSignalId::test_data("rs1".into()),
        decision_id: OnboardingDecisionId::test_data("d1".into()),
        reason_code: "ssn.deceased".into(),
        note: "Lorem ipsum".into(),
        severity: RiskSeverity::High,
        vendors: vec![Vendor::Idology],
        timestamp: Utc::now(),
    };
    let timeline_events = vec![];

    ResponseData::ok(timeline_events).json()
}
