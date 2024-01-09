use std::collections::HashMap;

use crate::challenge::RegisterChallenge;
use crate::State;
use api_core::auth::user::CheckedUserAuthContext;
use api_core::auth::user::UserAuth;
use api_core::auth::user::UserAuthContext;
use api_core::auth::user::UserAuthGuard;
use api_core::auth::IsGuardMet;
use api_core::errors::challenge::ChallengeError;
use api_core::errors::ApiResult;
use api_core::errors::AssertionError;
use api_core::errors::ValidationError;
use api_core::types::response::ResponseData;
use api_core::types::EmptyResponse;
use api_core::types::JsonApiResponse;
use api_core::utils::challenge::Challenge;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::passkey::VerifyChallengeResult;
use api_core::utils::passkey::WebauthnConfig;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::ActionKind;
use api_wire_types::UserChallengeVerifyRequest;
use chrono::Utc;
use crypto::sha256;
use db::models::auth_event::AuthEvent;
use db::models::auth_event::NewAuthEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::webauthn_credential::WebauthnCredential;
use db::TxnPgConn;
use newtypes::AuthEventKind;
use newtypes::ContactInfoKind;
use newtypes::DataLifetimeSource;
use newtypes::DataRequest;
use newtypes::Fingerprints;
use newtypes::InsightEventId;
use newtypes::PiiString;
use newtypes::TenantId;
use newtypes::ValidateArgs;
use newtypes::WebauthnCredentialId;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

use super::RegisterChallengeData;

#[api_v2_operation(
    tags(Challenge, Hosted),
    description = "Verify the previously sent challenge and attach the new form of contact info to the vault"
)]
#[actix::post("/hosted/user/challenge/verify")]
pub async fn post(
    request: Json<UserChallengeVerifyRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
    insights: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::ExplicitAuth.and(UserAuthGuard::Auth))?;
    if !user_auth.data.is_from_api {
        return ValidationError("Can only update auth methods using auth issued via API").into();
    }
    let tenant = user_auth
        .tenant()
        .ok_or(ValidationError("Need tenant ID to verify challenge"))?;
    let UserChallengeVerifyRequest {
        challenge_token,
        challenge_response: c_response,
    } = request.into_inner();
    let webauthn = WebauthnConfig::new(&state.config);
    let RegisterChallenge {
        data,
        action_kind,
        is_register_challenge,
    } = Challenge::unseal(&state.challenge_sealing_key, &challenge_token)?.data;
    if !is_register_challenge {
        return ValidationError("Invalid challenge token").into();
    }

    // Verify the challenge response and determine which action to perform
    let action = match data {
        RegisterChallengeData::Sms {
            h_code,
            phone_number: p,
        } => {
            if h_code != sha256(c_response.as_bytes()).to_vec() {
                return Err(ChallengeError::IncorrectPin.into());
            };
            Action::replace_ci(&state, &user_auth, ContactInfoKind::Phone, p, &tenant.id).await?
        }
        RegisterChallengeData::Email { h_code, email } => {
            if h_code != sha256(c_response.as_bytes()).to_vec() {
                return Err(ChallengeError::IncorrectPin.into());
            };
            Action::replace_ci(&state, &user_auth, ContactInfoKind::Email, email, &tenant.id).await?
        }
        RegisterChallengeData::Passkey { reg_state } => {
            let credential = webauthn.verify_challenge(reg_state, c_response)?;
            Action::RegisterWebauthnCred(credential)
        }
    };

    // Perform the action - register the email/phone/passkey
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ie = CreateInsightEvent::from(insights).insert_with_conn(conn)?;
            let (event_kind, passkey_cred_id) =
                action.register(conn, action_kind, &user_auth, ie.id.clone())?;

            let auth_event = user_auth
                .auth_events
                .first()
                .ok_or(AssertionError("No auth events found for user"))?;
            let existing_auth_event = AuthEvent::get(conn, &auth_event.id)?;
            NewAuthEvent {
                vault_id: user_auth.user_vault_id().clone(),
                scoped_vault_id: user_auth.scoped_user_id(),
                insight_event_id: Some(ie.id),
                kind: event_kind,
                webauthn_credential_id: passkey_cred_id,
                created_at: Utc::now(),
                // Use same scope as any of the auth events on this auth token
                scope: existing_auth_event.scope,
            }
            .create(conn.conn())?;

            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}

enum Action {
    ReplaceContactInfo {
        kind: AuthEventKind,
        data: DataRequest<Fingerprints>,
    },
    RegisterWebauthnCred(VerifyChallengeResult),
}

impl Action {
    /// Shorthand for creating a ReplaceContactInfo variant
    async fn replace_ci(
        state: &State,
        user_auth: &CheckedUserAuthContext,
        ci_kind: ContactInfoKind,
        value: PiiString,
        tenant_id: &TenantId,
    ) -> ApiResult<Self> {
        let args = ValidateArgs::for_bifrost(user_auth.user.is_live);
        let data = HashMap::from_iter([(ci_kind.into(), value)]);
        let data = DataRequest::clean_and_validate_str(data, args)?;
        let data = data.build_fingerprints(&state.enclave_client, tenant_id).await?;
        Ok(Self::ReplaceContactInfo {
            kind: AuthEventKind::from(ci_kind),
            data,
        })
    }

    fn register(
        self,
        conn: &mut TxnPgConn,
        action_kind: ActionKind,
        user_auth: &CheckedUserAuthContext,
        ie_id: InsightEventId,
    ) -> ApiResult<(AuthEventKind, Option<WebauthnCredentialId>)> {
        let sv_id = user_auth
            .scoped_user_id()
            .ok_or(ValidationError("Cannot update contact info without scoped vault"))?;
        let vw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv_id)?;
        let (event_kind, passkey_cred_id) = match self {
            Self::ReplaceContactInfo { kind, data } => {
                if action_kind != ActionKind::Replace {
                    // We should build support for this in the future
                    return ValidationError("Can only replace email and phone number for now").into();
                }
                vw.replace_verified_ci(conn, data, DataLifetimeSource::Hosted)?;
                (kind, None)
            }
            Self::RegisterWebauthnCred(res) => {
                match action_kind {
                    ActionKind::Replace => {
                        WebauthnCredential::deactivate(conn, user_auth.user_vault_id())?;
                    }
                    ActionKind::AddPrimary => {
                        let existing = WebauthnCredential::list(conn, user_auth.user_vault_id())?;
                        if !existing.is_empty() {
                            return ValidationError("Cannot add primary passkey when one already exists.")
                                .into();
                        }
                    }
                }
                let cred = res.save_credential(conn, user_auth, ie_id)?;
                (AuthEventKind::Passkey, Some(cred.id))
            }
        };
        Ok((event_kind, passkey_cred_id))
    }
}
