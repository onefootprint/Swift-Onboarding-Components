use crate::auth::{
    tenant::{SecretTenantAuthContext, TenantSessionAuth},
    Either,
};

use api_core::{
    auth::tenant::{CheckTenantGuard, TenantGuard},
    types::{JsonApiResponse, ResponseData},
};
use api_wire_types::PublicRiskSignalDescription;

use newtypes::FootprintReasonCode;
use paperclip::actix::{api_v2_operation, get};
use strum::IntoEnumIterator;

#[api_v2_operation(description = "List all Footprint Risk Signals", tags(Preview))]
#[get("/org/risk_signals")]
pub async fn get(
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<Vec<api_wire_types::PublicRiskSignalDescription>> {
    let _auth = auth.check_guard(TenantGuard::Read)?;

    let response = FootprintReasonCode::iter()
        .filter(|frc| !frc.to_be_deprecated())
        .map(|frc| PublicRiskSignalDescription {
            reason_code: frc.clone(),
            note: frc.note(),
            description: frc.description(),
            severity: frc.severity(),
            scopes: frc.scopes(),
        })
        .collect();

    ResponseData::ok(response).json()
}
