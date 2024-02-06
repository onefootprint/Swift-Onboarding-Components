use crate::{ChallengeData, ChallengeState, GetIdentifyChallengeArgs, State};
use api_core::{
    auth::ob_config::ObConfigAuth,
    errors::{challenge::ChallengeError, ApiError, ApiResult, AssertionError, ValidationError},
    telemetry::RootSpan,
    types::{response::ResponseData, JsonApiResponse},
    utils::{
        challenge::Challenge,
        email::send_email_challenge_non_blocking,
        headers::SandboxId,
        sms::rx_background_error,
        vault_wrapper::{InitialVaultData, VaultContext, VaultWrapper},
    },
};
use api_wire_types::{IdentifyId, SignupChallengeRequest, SignupChallengeResponse, UserChallengeData};
use itertools::Itertools;
use newtypes::{
    fingerprinter::GlobalFingerprintKind, ChallengeKind, DataIdentifier, Fingerprinter,
    IdentityDataKind as IDK,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

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
    root_span: RootSpan,
) -> JsonApiResponse<SignupChallengeResponse> {
    let SignupChallengeRequest { phone_number, email } = request.into_inner();
    let sandbox_id = sandbox_id.0;

    let identifiers = vec![
        email.as_ref().map(|e| IdentifyId::Email(e.clone())),
        phone_number.as_ref().map(|e| IdentifyId::PhoneNumber(e.clone())),
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
    // TODO: one day, don't allow duplicate unverified vaults either
    /*
    TODO enforce this once the client can handle this error
    if ctx.as_ref().is_some_and(|ctx| !ctx.can_initiate_signup_challenge) {
        return Err(ErrorWithCode::ExistingVault.into());
    }
    */
    let duplicate_of_id = ctx.map(|ctx| ctx.ctx.vw.vault.id);

    // Create the new vault
    let ctx = make_vault_context(&state, &ob_context, identifiers, sandbox_id.clone()).await?;
    let (uv, root_span) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (uv, _, _) = VaultWrapper::create_unverified(conn, ctx, &root_span, duplicate_of_id)?;
            Ok((uv.into_inner(), root_span))
        })
        .await?;

    let (rx, challenge_data) = if !ob_context.ob_config().is_no_phone_flow {
        // Expect a phone number and initiate an SMS challenge
        let phone_number = phone_number.ok_or(ValidationError(
            "Phone number required to initiate sign up challenge",
        ))?;
        let tenant = ob_context.tenant();
        let (rx, challenge_state_data, time_before_retry_s) = state
            .sms_client
            .send_challenge_non_blocking(&state, Some(tenant), &phone_number, uv.id, sandbox_id)
            .await?;

        let challenge_data = ChallengeData::Sms(challenge_state_data);
        let data = ChallengeState { data: challenge_data };
        let challenge_token = Challenge::new(data).seal(&state.challenge_sealing_key)?;
        let data = UserChallengeData {
            challenge_kind: ChallengeKind::Sms,
            challenge_token,
            scrubbed_phone_number: Some(phone_number.scrubbed()),
            biometric_challenge_json: None,
            time_before_retry_s: time_before_retry_s.num_seconds(),
        };
        (Some(rx), data)
    } else {
        // If obc is no-phone flow, only initiate email challenge
        let email = email.ok_or(ValidationError(
            "Email must be provided for no-phone signup challenges",
        ))?;
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
            challenge_kind: ChallengeKind::Email,
            challenge_token,
            scrubbed_phone_number: None,
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
    initial_data: Vec<IdentifyId>,
    sandbox_id: Option<newtypes::SandboxId>,
) -> ApiResult<VaultContext> {
    let keypair = state.enclave_client.generate_sealed_keypair().await?;
    let initial_data = initial_data
        .into_iter()
        .map(|id| match id {
            IdentifyId::Email(e) => (IDK::Email.into(), e.email),
            IdentifyId::PhoneNumber(e) => (IDK::PhoneNumber.into(), e.e164()),
        })
        .collect::<Vec<(DataIdentifier, _)>>();

    let global_sh_data = initial_data
        .iter()
        .map(|(di, v)| -> ApiResult<_> { Ok((di.clone(), GlobalFingerprintKind::try_from(di)?, v)) })
        .collect::<ApiResult<Vec<_>>>()?;
    let global_sh = state.enclave_client.compute_fingerprints(global_sh_data).await?;

    let tenant_sh_data = initial_data
        .iter()
        .map(|(di, v)| (di.clone(), (di, &ob_pk_auth.tenant().id), v))
        .collect_vec();
    // If we are in identify for a specific tenant, also compute tenant-scoped FP
    let tenant_sh = state.enclave_client.compute_fingerprints(tenant_sh_data).await?;

    let data = initial_data
        .into_iter()
        .map(|(di, value)| -> ApiResult<_> {
            Ok(InitialVaultData {
                global_sh: global_sh
                    .iter()
                    .filter_map(|(x, fp)| (x == &di).then_some(fp.clone()))
                    .next()
                    .ok_or(AssertionError("No global fingerprint"))?,
                tenant_sh: tenant_sh
                    .iter()
                    .filter_map(|(x, fp)| (x == &di).then_some(fp.clone()))
                    .next(),
                di,
                value,
            })
        })
        .collect::<ApiResult<Vec<_>>>()?;
    Ok(VaultContext {
        data,
        keypair,
        sandbox_id,
        obc: ob_pk_auth.ob_config().clone(),
    })
}
