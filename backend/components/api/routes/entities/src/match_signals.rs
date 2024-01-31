use crate::{
    auth::{
        tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard, TenantSessionAuth},
        Either,
    },
    types::{response::ResponseData, JsonApiResponse},
    State,
};
use api_core::{decision::field_validations::create_field_validation_results, utils::fp_id_path::FpIdPath};
use api_wire_types::GetFieldValidationResponse;
use db::{
    models::{
        risk_signal::{IncludeHidden, RiskSignal},
        scoped_vault::ScopedVault,
    },
    DbResult,
};
use newtypes::SignalScope;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "Lists the match signals for a footprint user.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/match_signals")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<GetFieldValidationResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let reason_codes = state
        .db_pool
        .db_query(move |conn| -> DbResult<Vec<_>> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            RiskSignal::latest_by_risk_signal_group_kinds(conn, &sv.id, IncludeHidden(false))
        })
        .await??
        .into_iter()
        .map(|(_, rs)| rs.reason_code)
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
        business_name: field_validations_map.get(&SignalScope::BusinessName).cloned(),
        business_phone_number: field_validations_map
            .get(&SignalScope::BusinessPhoneNumber)
            .cloned(),
        business_tin: field_validations_map.get(&SignalScope::BusinessTin).cloned(),
        business_address: field_validations_map.get(&SignalScope::BusinessAddress).cloned(),
        business_beneficial_owners: field_validations_map.get(&SignalScope::BeneficialOwners).cloned(),
        business_dba: field_validations_map.get(&SignalScope::BusinessDba).cloned(),
    };

    ResponseData::ok(response).json()
}
