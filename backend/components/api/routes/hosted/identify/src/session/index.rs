use crate::identify::create_identified_token;
use api_core::auth::ob_config::ObConfigAuth;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::session::user::TokenCreationPurpose;
use api_core::errors::challenge::ChallengeError;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::headers::IsBootstrapHeader;
use api_core::utils::headers::IsComponentsSdk;
use api_core::utils::headers::SandboxId;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::VaultContext;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::State;
use api_errors::BadRequestInto;
use api_wire_types::IdentifySessionRequest;
use api_wire_types::IdentifySessionResponse;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::DataLifetimeSource;
use newtypes::IdentifyScope;
use newtypes::ObConfigurationKind;
use newtypes::ValidateArgs;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;

#[api_v2_operation(tags(Identify, Hosted), description = "Creates an identify session token.")]
#[actix::post("/hosted/identify/session")]
pub async fn post(
    request: Json<IdentifySessionRequest>,
    state: web::Data<State>,
    ob_context: ObConfigAuth,
    sandbox_id: SandboxId,
    root_span: RootSpan,
    is_bootstrap: IsBootstrapHeader,
    is_components_sdk: IsComponentsSdk,
) -> ApiResponse<IdentifySessionResponse> {
    let IdentifySessionRequest { data, scope } = request.into_inner();
    let sandbox_id = sandbox_id.0;

    let obc = ob_context.ob_config();
    match scope {
        IdentifyScope::Auth if obc.kind != ObConfigurationKind::Auth => {
            // Playbook can be None in update_auth_methods flow
            return Err(ChallengeError::InvalidPlaybook(scope).into());
        }
        IdentifyScope::Onboarding if obc.kind == ObConfigurationKind::Auth => {
            // Playbook can be None for user-specific sessions with playbook specified in SDK
            return Err(ChallengeError::InvalidPlaybook(scope).into());
        }
        IdentifyScope::My1fp => {
            return BadRequestInto("My1fp scope is not supported for hosted identify sessions");
        }
        _ => (),
    }
    let is_live = ob_context.playbook().is_live;
    if is_live != sandbox_id.is_none() {
        return BadRequestInto("Sandbox ID must be provided if and only if using a sandbox playbook");
    }

    let args = ValidateArgs::for_bifrost(is_live);
    let PatchDataRequest { updates, .. } = PatchDataRequest::clean_and_validate(data, args)?;
    let data = FingerprintedDataRequest::build_for_new_user(&state, updates, &ob_context.tenant().id).await?;

    let keypair = state.enclave_client.generate_sealed_keypair().await?;

    let source = if is_components_sdk.0 {
        DataLifetimeSource::LikelyComponentsSdk
    } else if *is_bootstrap {
        DataLifetimeSource::LikelyBootstrap
    } else {
        DataLifetimeSource::LikelyHosted
    };
    let ctx = VaultContext {
        data,
        keypair,
        sandbox_id,
        playbook: ob_context.playbook().clone(),
        obc: ob_context.ob_config().clone(),
        sources: source.into(),
    };

    let (uv, su) = state
        .db_transaction(move |conn| {
            let (uv, su, _) = VaultWrapper::create_unverified(conn, ctx, &root_span, None)?;
            Ok((uv.into_inner(), su.into_inner()))
        })
        .await?;
    let purpose = TokenCreationPurpose::IdentifySession;
    let context = NewUserSessionContext {
        su_id: Some(su.id),
        identify_scope: Some(scope),
        ..ob_context.ob_config_auth_context()
    };
    let (token, _, _) = create_identified_token(&state, &uv.id, context, scope, purpose, vec![]).await?;
    let response = IdentifySessionResponse { token };
    Ok(response)
}
