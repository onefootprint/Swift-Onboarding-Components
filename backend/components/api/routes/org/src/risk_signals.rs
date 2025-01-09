use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyAuth;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::Either;
use api_core::types::ApiListResponse;
use api_core::ApiResponse;
use api_wire_types::PublicRiskSignalDescription;
use newtypes::footprint_reason_code_spec::load_reason_code_specs;
use newtypes::FootprintReasonCode;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use strum::IntoEnumIterator;

#[api_v2_operation(description = "List all Footprint Risk Signals", tags(Org, Preview))]
#[get("/org/risk_signals")]
pub fn get(
    auth: Either<TenantSessionAuth, TenantApiKeyAuth>,
) -> ApiListResponse<api_wire_types::PublicRiskSignalDescription> {
    let _auth = auth.check_guard(TenantGuard::Read)?;

    let response = FootprintReasonCode::iter()
        .filter(|frc| !frc.to_be_deprecated())
        .filter(|frc| !frc.in_preview())
        .filter(|frc| !matches!(frc, FootprintReasonCode::Other(_)))
        .map(|frc| PublicRiskSignalDescription {
            reason_code: frc.clone(),
            note: frc.note(),
            description: frc.description(),
            severity: frc.severity(),
            scopes: frc.scopes(),
        })
        .collect();

    Ok(response)
}


#[api_v2_operation(description = "List all Footprint Risk Signals", tags(Org, Private))]
#[get("/org/risk_signals_spec")]
pub fn get_spec(
    auth: Either<TenantSessionAuth, TenantApiKeyAuth>,
) -> ApiResponse<api_wire_types::PublicRiskSignalSpecDescription> {
    let _auth = auth.check_guard(TenantGuard::Read)?;

    let response = load_reason_code_specs()?.into();


    Ok(response)
}
