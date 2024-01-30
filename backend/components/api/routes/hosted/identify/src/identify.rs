use std::str::FromStr;

use crate::{UserChallengeContext, VaultIdentifier};

use api_core::{
    auth::{ob_config::ObConfigAuth, user::UserAuthContext, Any},
    errors::challenge::ChallengeError,
    telemetry::RootSpan,
    types::{JsonApiResponse, ResponseData},
    utils::headers::SandboxId,
    State,
};
use api_wire_types::{IdentifyRequest, IdentifyResponse};
use newtypes::{email::Email, DataIdentifier, IdentityDataKind as IDK, PhoneNumber};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Tries to identify an existing user by either phone number or email. If the user \
    is found, returns available challenge kinds."
)]
#[actix::post("/hosted/identify")]
pub async fn post(
    request: Json<IdentifyRequest>,
    state: web::Data<State>,
    ob_context: Option<ObConfigAuth>,
    // When provided, identifies only sandbox users with the suffix
    sandbox_id: SandboxId,
    // When provided, is used to identify the currently authed user. Will generate a challenge
    // for the authed user
    user_auth: Option<UserAuthContext>,
    root_span: RootSpan,
) -> JsonApiResponse<IdentifyResponse> {
    let IdentifyRequest { identifier } = request.into_inner();
    let is_token_provided = user_auth.is_some();

    // Require one of user_auth or identifier
    let identifier = match (user_auth, identifier) {
        (Some(user_auth), None) => {
            let user_auth = user_auth.check_guard(Any)?;
            VaultIdentifier::AuthenticatedId(user_auth)
        }
        (None, Some(id)) => VaultIdentifier::IdentifyId(id, sandbox_id.0),
        (None, None) | (Some(_), Some(_)) => return Err(ChallengeError::OnlyOneIdentifier.into()),
    };

    // Look up existing user vault by identifier
    let Some((ctx, _)) =
        crate::get_identify_challenge_context(&state, identifier, ob_context, root_span).await?
    else {
        // The user vault doesn't exist. Just return that the user wasn't found
        return ResponseData::ok(IdentifyResponse::default()).json();
    };

    let (scrubbed_phone, scrubbed_email) = if is_token_provided {
        // When we are identifying a user via auth token, provide the scrubbed phone and email
        let dis = vec![
            DataIdentifier::Id(IDK::PhoneNumber),
            DataIdentifier::Id(IDK::Email),
        ];
        let values = ctx.vw.decrypt_unchecked(&state.enclave_client, &dis).await?;
        let phone = values.get_di(IDK::PhoneNumber).ok();
        let scrubbed_phone = phone
            .and_then(|p| PhoneNumber::parse(p).ok())
            .map(|p| p.scrubbed());
        let email = values.get_di(IDK::Email).ok();
        let scrubbed_email = email
            .and_then(|p| Email::from_str(p.leak()).ok())
            .map(|email| email.scrubbed());
        (scrubbed_phone, scrubbed_email)
    } else {
        (None, None)
    };

    let UserChallengeContext {
        webauthn_creds,
        available_challenge_kinds,
        is_vault_unverified,
        auth_methods,
        ..
    } = ctx;

    let auth_methods = auth_methods
        .into_iter()
        .map(|m| api_wire_types::IdentifyAuthMethod {
            kind: m.kind,
            is_verified: m.is_verified,
        })
        .collect();

    let has_syncable_pass_key = webauthn_creds.iter().any(|cred| cred.backup_state);
    let response = IdentifyResponse {
        is_unverified: is_vault_unverified,
        user_found: true,
        auth_methods,
        available_challenge_kinds: Some(available_challenge_kinds),
        has_syncable_pass_key,
        scrubbed_phone,
        scrubbed_email,
    };
    ResponseData::ok(response).json()
}
