use crate::identify::create_identified_token;
use crate::session::requirements::get_requirements;
use crate::State;
use api_core::auth::ob_config::ObConfigAuthTrait;
use api_core::auth::user::IdentifyAuthContext;
use api_core::errors::business::BusinessError;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_errors::BadRequestInto;
use api_wire_types::IdentifyRequirementKind;
use api_wire_types::IdentifyVerifyResponse;
use db::models::business_owner::BusinessOwner;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::BoId;
use newtypes::IdentifyScope;
use newtypes::VaultId;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Verifies that all identify requirements have been met."
)]
#[actix::post("/hosted/identify/session/verify")]
pub async fn post(
    state: web::Data<State>,
    root_span: RootSpan,
    identify: IdentifyAuthContext,
) -> ApiResponse<IdentifyVerifyResponse> {
    let requirements = get_requirements(&state, identify.clone(), root_span).await?;
    if !requirements.is_empty() {
        let unmet_reqs = requirements
            .iter()
            .map(IdentifyRequirementKind::from)
            .collect_vec();
        return BadRequestInto!("Identify requirements are not met: {}", Csv(unmet_reqs));
    }

    // Create an auth token with the new scopes and context
    let scope = identify.scope;
    let uv_id = identify.placeholder_uv_id.clone();
    let bo_id = identify.business_info().map(|i| i.bo_id);
    let (auth_token, _, _) = create_identified_token(
        &state,
        identify.placeholder_uv_id.clone(),
        Some(identify.su.clone()),
        identify.scope,
        identify.auth_events.clone(),
        Some(identify),
    )
    .await?;

    if matches!(scope, IdentifyScope::Onboarding) {
        if let Some(bo_id) = bo_id {
            state
                .db_transaction(move |conn| register_business_owner(conn, &uv_id, &bo_id))
                .await?;
        }
    }

    Ok(IdentifyVerifyResponse { auth_token })
}

/// After logging into a vault in the context of multi-KYC KYB, save the authed vault as a business
/// owner of the provided business.
fn register_business_owner(conn: &mut TxnPgConn, uv_id: &VaultId, bo_id: &BoId) -> FpResult<()> {
    // If we verified with a BoSessionAuth, update the corresponding BO
    let bo = BusinessOwner::lock(conn, bo_id)?.into_inner();
    if let Some(existing_uv_id) = bo.user_vault_id.as_ref() {
        // If uv on the BO, make sure it is the same UV that was located in identify flow
        if existing_uv_id != uv_id {
            return Err(BusinessError::BoAlreadyHasVault.into());
        }
    } else {
        // If no uv_id on the BO, add it
        bo.add_user_vault_id(conn, uv_id)?;
    }
    Ok(())
}
