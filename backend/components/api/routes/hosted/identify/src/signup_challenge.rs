use crate::identify::create_identified_token;
use crate::utils::initiate_challenge;
use crate::utils::InitiateChallengeArgs;
use crate::GetIdentifyChallengeArgs;
use crate::IdentifyChallengeContext;
use crate::State;
use api_core::auth::ob_config::ObConfigAuth;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::errors::user::UserError;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::headers::IsComponentsSdk;
use api_core::utils::headers::SandboxId;
use api_core::utils::identify::get_user_auth_methods;
use api_core::utils::identify::UserAuthMethodsContext;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::VaultContext;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_errors::BadRequestInto;
use api_wire_types::IdentifyChallengeResponse;
use api_wire_types::IdentifyId;
use api_wire_types::SignupChallengeData;
use api_wire_types::SignupChallengeRequest;
use itertools::chain;
use itertools::Itertools;
use newtypes::email::Email;
use newtypes::DataLifetimeSource;
use newtypes::DataRequest;
use newtypes::IdentityDataKind as IDK;
use newtypes::PhoneNumber;
use newtypes::ValidateArgs;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};


#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Sends a challenge to a phone number or email and returns an HTTP 200. When the \
    challenge is completed through the identify/verify endpoint, the client can begin onboarding the user."
)]
#[actix::post("/hosted/identify/signup_challenge")]
pub async fn post(
    request: Json<SignupChallengeRequest>,
    state: web::Data<State>,
    ob_context: ObConfigAuth,
    // When provided, creates a sandbox user with the given suffix
    sandbox_id: SandboxId,
    is_components_sdk: IsComponentsSdk,
    insight_headers: InsightHeaders,
    root_span: RootSpan,
) -> ApiResponse<IdentifyChallengeResponse> {
    let SignupChallengeRequest {
        phone_number: phone,
        email,
        scope,
        challenge_kind,
    } = request.into_inner();
    let sandbox_id = sandbox_id.0;

    let is_fixture = phone.as_ref().is_some_and(|p| p.value.is_fixture_phone_number())
        || email.as_ref().is_some_and(|e| e.value.is_fixture());
    if ob_context.playbook().is_live && is_fixture {
        return Err(UserError::FixtureCIInLive.into());
    }

    let identifiers = vec![
        email.as_ref().map(|e| IdentifyId::Email(e.value.clone())),
        phone.as_ref().map(|e| IdentifyId::PhoneNumber(e.value.clone())),
    ]
    .into_iter()
    .flatten()
    .collect_vec();
    let args = GetIdentifyChallengeArgs {
        user_auth: None,
        identifiers: identifiers.clone(),
        sandbox_id: sandbox_id.clone(),
        obc: Some(ob_context.clone()),
        root_span: root_span.clone(),
    };
    let ctx = crate::get_identify_challenge_context(&state, args).await?;
    let duplicate_of_id = ctx.as_ref().map(|ctx| ctx.ctx.vw.vault.id.clone());
    // TODO: one day, don't allow duplicate unverified vaults either
    if let Some(ctx) = ctx {
        let IdentifyChallengeContext {
            ctx,
            can_initiate_signup_challenge,
            sv,
            ..
        } = ctx;
        let UserAuthMethodsContext { vw, .. } = ctx;
        if !can_initiate_signup_challenge {
            // There's already a duplicate vault. Create the auth token that allows sending a
            // login challenge
            let (token, _, _) =
                create_identified_token(&state, vw.vault.id.clone(), scope, sv, Some(ob_context.clone()))
                    .await?;
            return Err(ErrorWithCode::ExistingVault(token).into());
        }
    }

    // Create the new vault
    let ctx = make_vault_context(
        &state,
        &ob_context,
        email.clone(),
        phone.clone(),
        sandbox_id.clone(),
        is_components_sdk.0,
    )
    .await?;
    let (uv, sv, root_span) = state
        .db_transaction(move |conn| {
            let (uv, sv, _) = VaultWrapper::create_unverified(conn, ctx, &root_span, duplicate_of_id)?;
            Ok((uv.into_inner(), sv, root_span))
        })
        .await?;
    let ctx = get_user_auth_methods(&state, sv.id.clone().into(), None).await?;
    let (token, session, _) =
        create_identified_token(&state, uv.id.clone(), scope, Some(sv), Some(ob_context.clone())).await?;
    let tenant = Some(ob_context.tenant());
    let args = InitiateChallengeArgs {
        challenge_kind,
        tenant,
        token,
        session,
        insight_headers,
    };
    let response = initiate_challenge(&state, ctx, args).await?;
    // Since these errors return an HTTP 200, log something special on the root span if there's an error
    match response.error {
        Some(_) => root_span.record("meta", "error"),
        None => root_span.record("meta", "no_error"),
    };

    Ok(response)
}

async fn make_vault_context(
    state: &State,
    ob_pk_auth: &ObConfigAuth,
    email: Option<SignupChallengeData<Email>>,
    phone: Option<SignupChallengeData<PhoneNumber>>,
    sandbox_id: Option<newtypes::SandboxId>,
    is_components_sdk: bool,
) -> FpResult<VaultContext> {
    if ob_pk_auth.playbook().is_live != sandbox_id.is_none() {
        return BadRequestInto("Sandbox ID must be provided if and only if using a sandbox playbook");
    }

    let sources = chain(
        email.as_ref().map(|e| (IDK::Email.into(), e.is_bootstrap)),
        phone.as_ref().map(|p| (IDK::PhoneNumber.into(), p.is_bootstrap)),
    )
    .map(|(di, is_bootstrap)| {
        let source = if is_components_sdk {
            DataLifetimeSource::LikelyComponentsSdk
        } else if is_bootstrap {
            DataLifetimeSource::LikelyBootstrap
        } else {
            DataLifetimeSource::LikelyHosted
        };
        (di, source)
    })
    .collect();

    let data = chain(
        email.map(|e| (IDK::Email.into(), e.value.email)),
        phone.map(|p| (IDK::PhoneNumber.into(), p.value.e164())),
    )
    .collect();
    let args = ValidateArgs::for_bifrost(ob_pk_auth.playbook().is_live);
    let data = DataRequest::clean_and_validate_str(data, args)?;
    let data = FingerprintedDataRequest::build_for_new_user(state, data, &ob_pk_auth.tenant().id).await?;

    let keypair = state.enclave_client.generate_sealed_keypair().await?;

    Ok(VaultContext {
        data,
        keypair,
        sandbox_id,
        playbook: ob_pk_auth.playbook().clone(),
        obc: ob_pk_auth.ob_config().clone(),
        sources,
    })
}
