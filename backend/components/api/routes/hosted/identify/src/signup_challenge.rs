use crate::identify::create_identified_token;
use crate::{
    ChallengeData,
    ChallengeState,
    GetIdentifyChallengeArgs,
    IdentifyChallengeContext,
    State,
};
use api_core::auth::ob_config::ObConfigAuth;
use api_core::errors::challenge::ChallengeError;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::errors::user::UserError;
use api_core::errors::{
    ApiError,
    ApiResult,
    ValidationError,
};
use api_core::telemetry::RootSpan;
use api_core::types::response::ResponseData;
use api_core::types::JsonApiResponse;
use api_core::utils::challenge::Challenge;
use api_core::utils::email::send_email_challenge_non_blocking;
use api_core::utils::headers::{
    IsComponentsSdk,
    SandboxId,
};
use api_core::utils::identify::UserChallengeContext;
use api_core::utils::sms::rx_background_error;
use api_core::utils::vault_wrapper::{
    FingerprintedDataRequest,
    VaultContext,
    VaultWrapper,
};
use api_wire_types::{
    IdentifyId,
    SignupChallengeData,
    SignupChallengeRequest,
    SignupChallengeResponse,
    UserChallengeData,
};
use itertools::{
    chain,
    Itertools,
};
use newtypes::email::Email;
use newtypes::{
    ChallengeKind,
    DataLifetimeSource,
    DataRequest,
    IdentifyScope,
    IdentityDataKind as IDK,
    PhoneNumber,
    ValidateArgs,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
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
    root_span: RootSpan,
) -> JsonApiResponse<SignupChallengeResponse> {
    let SignupChallengeRequest {
        phone_number: phone,
        email,
        scope,
    } = request.into_inner();
    let sandbox_id = sandbox_id.0;
    let scope = if let Some(scope) = scope {
        tracing::info!("Scope provided");
        scope
    } else {
        // TODO should deprecate this branch when all client SDKs are updated to use /hosted/identify/lite
        tracing::info!(tenant_id=%ob_context.ob_config().tenant_id, "Scope not provided");
        IdentifyScope::Onboarding
    };

    let is_fixture = phone.as_ref().is_some_and(|p| p.value.is_fixture_phone_number())
        || email.as_ref().is_some_and(|e| e.value.is_fixture());
    if ob_context.ob_config().is_live && is_fixture {
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
        let UserChallengeContext { vw, .. } = ctx;
        if !can_initiate_signup_challenge {
            // There's already a duplicate vault. Create the auth token that allows sending a
            // login challenge
            let (token, _) =
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
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (uv, sv, _) = VaultWrapper::create_unverified(conn, ctx, &root_span, duplicate_of_id)?;
            Ok((uv.into_inner(), sv, root_span))
        })
        .await?;
    let (token, _) =
        create_identified_token(&state, uv.id.clone(), scope, Some(sv), Some(ob_context.clone())).await?;

    let (rx, challenge_data) = if !ob_context.ob_config().is_no_phone_flow {
        // Expect a phone number and initiate an SMS challenge
        let phone = phone
            .ok_or(ValidationError(
                "Phone number required to initiate sign up challenge",
            ))?
            .value;
        let tenant = ob_context.tenant();
        let (rx, challenge_state_data, time_before_retry_s) = state
            .sms_client
            .send_challenge_non_blocking(&state, Some(tenant), phone, uv.id, sandbox_id)
            .await?;

        let challenge_data = ChallengeData::Sms(challenge_state_data);
        let data = ChallengeState { data: challenge_data };
        let challenge_token = Challenge::new(data).seal(&state.challenge_sealing_key)?;
        let data = UserChallengeData {
            token,
            challenge_kind: ChallengeKind::Sms,
            challenge_token,
            biometric_challenge_json: None,
            time_before_retry_s: time_before_retry_s.num_seconds(),
        };
        (Some(rx), data)
    } else {
        // If obc is no-phone flow, only initiate email challenge
        let email = email
            .ok_or(ValidationError(
                "Email must be provided for no-phone signup challenges",
            ))?
            .value;
        let obc = ob_context.ob_config();
        let tenant = ob_context.tenant();

        if !obc.is_no_phone_flow {
            return Err(ApiError::from(ChallengeError::ChallengeKindNotAllowed(
                "email".to_string(),
            )));
        };

        let challenge_data = send_email_challenge_non_blocking(&state, &email, uv.id, tenant, sandbox_id)?;
        let challenge_data = ChallengeData::Email(challenge_data);

        let data = ChallengeState { data: challenge_data };
        let challenge_token = Challenge::new(data).seal(&state.challenge_sealing_key)?;

        let data = UserChallengeData {
            token,
            challenge_kind: ChallengeKind::Email,
            challenge_token,
            biometric_challenge_json: None,
            time_before_retry_s: state.config.time_s_between_challenges,
        };
        (None, data)
    };

    let err = if let Some(rx) = rx {
        rx_background_error(rx, 3).await.err()
    } else {
        None
    };
    // Since these errors return an HTTP 200, log something special on the root span if there's an error
    match err {
        Some(_) => root_span.record("meta", "error"),
        None => root_span.record("meta", "no_error"),
    };

    let response = SignupChallengeResponse {
        challenge_data,
        error: err.map(|e| e.to_string()),
    };
    ResponseData::ok(response).json()
}

async fn make_vault_context(
    state: &State,
    ob_pk_auth: &ObConfigAuth,
    email: Option<SignupChallengeData<Email>>,
    phone: Option<SignupChallengeData<PhoneNumber>>,
    sandbox_id: Option<newtypes::SandboxId>,
    is_components_sdk: bool,
) -> ApiResult<VaultContext> {
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
    let args = ValidateArgs::for_bifrost(ob_pk_auth.ob_config().is_live);
    let data = DataRequest::clean_and_validate_str(data, args)?;
    let data = FingerprintedDataRequest::build_for_new_user(state, data, &ob_pk_auth.tenant().id).await?;

    let keypair = state.enclave_client.generate_sealed_keypair().await?;

    Ok(VaultContext {
        data,
        keypair,
        sandbox_id,
        obc: ob_pk_auth.ob_config().clone(),
        sources,
    })
}
