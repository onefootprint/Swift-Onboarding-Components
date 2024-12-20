use crate::session::requirements::get_requirements;
use crate::State;
use api_core::auth::session::user::AssociatedAuthEventKind;
use api_core::auth::user::allowed_user_scopes;
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
    let uv_id = identify.user_session.user.id.clone();
    let bo_id = identify.user_session.bo_id.clone();
    let is_explicit_auth =
        (identify.auth_events.iter()).any(|(_, k)| k == &AssociatedAuthEventKind::Explicit);
    let ae_kinds = identify.auth_events.iter().map(|(ae, _)| ae.kind).collect_vec();
    let scope = identify.scope;
    let scopes = allowed_user_scopes(ae_kinds, scope.into(), is_explicit_auth);
    let session = (identify.user_session).update(Default::default(), scopes, scope.into(), None)?;
    let session_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_transaction(move |conn| {
            let (token, _) = identify.create_derived(conn, &session_key, session, Some(scope.token_ttl()))?;
            if matches!(scope, IdentifyScope::Onboarding) {
                if let Some(bo_id) = bo_id {
                    register_business_owner(conn, &uv_id, &bo_id)?;
                }
            }
            Ok(token)
        })
        .await?;

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
