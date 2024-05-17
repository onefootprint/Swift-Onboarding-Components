use std::collections::HashMap;

use crate::{challenge::RegisterChallenge, State};
use api_core::{
    auth::{
        user::{CheckedUserAuthContext, UserAuth, UserAuthContext, UserAuthScope},
        IsGuardMet,
    },
    errors::{error_with_code::ErrorWithCode, ApiResult, AssertionError, ValidationError},
    types::{response::ResponseData, EmptyResponse, JsonApiResponse},
    utils::{
        challenge::Challenge,
        headers::InsightHeaders,
        passkey::{VerifyChallengeResult, WebauthnConfig},
        vault_wrapper::{Any, FingerprintedDataRequest, VaultWrapper},
    },
};
use api_wire_types::UserChallengeVerifyRequest;
use chrono::Utc;
use crypto::sha256;
use db::{
    models::{
        auth_event::{AuthEvent, NewAuthEventArgs},
        contact_info::ContactInfo,
        insight_event::CreateInsightEvent,
        webauthn_credential::WebauthnCredential,
    },
    TxnPgConn,
};
use itertools::Itertools;
use newtypes::{
    ActionKind, AuthEventKind, ContactInfoKind, DataLifetimeSource, DataRequest, InsightEventId, PiiString,
    ScopedVaultId, TenantId, ValidateArgs, WebauthnCredentialId,
};
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
    let user_auth = user_auth
        .check_guard(UserAuthScope::ExplicitAuth.and(UserAuthScope::Auth.or(UserAuthScope::SignUp)))?;
    let sv_id = user_auth
        .scoped_user_id()
        .ok_or(ValidationError("Cannot update contact info without scoped vault"))?;
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
    if action_kind == ActionKind::Replace && !user_auth.data.is_from_api() {
        return ValidationError("Can only replace auth methods using auth issued via API").into();
    }
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
                return Err(ErrorWithCode::IncorrectPin.into());
            };
            Action::replace_ci(&state, &user_auth, ContactInfoKind::Phone, p, &tenant.id).await?
        }
        RegisterChallengeData::Email { h_code, email } => {
            if h_code != sha256(c_response.as_bytes()).to_vec() {
                return Err(ErrorWithCode::IncorrectPin.into());
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
                action.register(conn, &sv_id, action_kind, &user_auth, ie.id.clone())?;

            let auth_event = user_auth
                .auth_events
                .first()
                .ok_or(AssertionError("No auth events found for user"))?;
            let existing_auth_event = AuthEvent::get(conn, &auth_event.id)?;
            let vault_id = user_auth.user_vault_id().clone();
            let args = NewAuthEventArgs {
                vault_id: vault_id.clone(),
                scoped_vault_id: Some(sv_id.clone()),
                insight_event_id: Some(ie.id),
                kind: event_kind,
                webauthn_credential_id: passkey_cred_id,
                created_at: Utc::now(),
                // Use same scope as any of the auth events on this auth token
                scope: existing_auth_event.scope,
                new_auth_method_action: Some(action_kind),
            };
            AuthEvent::save(args, conn)?;

            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}

enum Action {
    ReplaceContactInfo {
        kind: AuthEventKind,
        data: FingerprintedDataRequest,
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
        let data = FingerprintedDataRequest::build(state, data, tenant_id).await?;
        Ok(Self::ReplaceContactInfo {
            kind: AuthEventKind::from(ci_kind),
            data,
        })
    }

    fn register(
        self,
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        action_kind: ActionKind,
        user_auth: &CheckedUserAuthContext,
        ie_id: InsightEventId,
    ) -> ApiResult<(AuthEventKind, Option<WebauthnCredentialId>)> {
        // TODO: eventually, let's make this a Vw util that is used to add login methods and use
        // this in identify/verify.
        // Then, send an email to the user's last verified CI any time their login methods change
        let vw = VaultWrapper::<Any>::lock_for_onboarding(conn, sv_id)?;
        let vault_id = user_auth.user_vault_id();
        let (event_kind, passkey_cred_id) = match self {
            Self::ReplaceContactInfo { kind, data } => {
                match action_kind {
                    ActionKind::Replace => {} // Existing data will be deactivated below
                    ActionKind::AddPrimary => {
                        // Make sure there isn't already a verified CI at any tenant.
                        // This will have a weird side effect where if the current tenant can't see
                        // a phone number that was added by another tenant, there will be no way
                        // to add a phone number to the current tenant
                        let dis = data.keys().cloned().collect_vec();
                        let existing_ci = ContactInfo::list(conn, vault_id, dis)?;
                        if existing_ci.iter().any(|ci| ci.is_otp_verified) {
                            return ValidationError("Cannot add primary contact info when it already exists")
                                .into();
                        }
                    }
                }
                vw.replace_verified_ci(conn, data, DataLifetimeSource::LikelyHosted)?;
                (kind, None)
            }
            Self::RegisterWebauthnCred(res) => {
                match action_kind {
                    ActionKind::Replace => {
                        WebauthnCredential::deactivate(conn, vault_id)?;
                    }
                    ActionKind::AddPrimary => {
                        let existing = WebauthnCredential::list(conn, vault_id)?;
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
