use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::WorkOsAuthContext;
use crate::auth::Either;

use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;

use crate::utils::db2api::DbToApi;
use crate::State;

use db::models::risk_signal::RiskSignal;
use newtypes::FootprintUserId;
use newtypes::TenantPermission;

use paperclip::actix::{api_v2_operation, get, web};

type RiskSignalsResponse = Vec<api_wire_types::RiskSignal>;

#[api_v2_operation(
    description = "Lists the risk signals for a footprint user.",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}/risk_signals")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FootprintUserId>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<RiskSignalsResponse> {
    let auth = auth.check_permissions(vec![TenantPermission::Users])?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let footprint_user_id = request.into_inner();

    let signals = state
        .db_pool
        .db_query(move |conn| RiskSignal::list(conn, &footprint_user_id, &tenant_id, is_live))
        .await??;
    let signals = signals
        .into_iter()
        .map(<api_wire_types::RiskSignal as DbToApi<RiskSignal>>::from_db)
        .collect();

    ResponseData::ok(signals).json()
}

impl DbToApi<RiskSignal> for api_wire_types::RiskSignal {
    fn from_db(target: RiskSignal) -> Self {
        let RiskSignal {
            id,
            onboarding_decision_id,
            reason_code,
            created_at,
            deactivated_at,
            ..
        } = target;
        Self {
            id,
            onboarding_decision_id,
            reason_code,
            note: reason_code.note(),
            // TODO better serialization of severity
            severity: reason_code.severity(),
            scopes: reason_code.scopes(),
            timestamp: created_at,
            deactivated_at,
        }
    }
}
