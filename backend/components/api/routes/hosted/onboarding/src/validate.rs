use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::types::response::ResponseData;
use crate::State;
use api_core::{
    auth::{
        session::{user::ValidateUserToken, AuthSessionData},
        user::{UserAuthContext, UserWfAuthContext},
        Any,
    },
    errors::{ApiResult, AssertionError},
    types::JsonApiResponse,
    utils::{
        requirements::{
            get_data_collection_progress, get_requirements_for_person_and_maybe_business,
            DecryptUncheckedResultForReqs, GetRequirementsArgs,
        },
        session::AuthSession,
        vault_wrapper::{VaultWrapper, VwArgs},
    },
};
use api_wire_types::hosted::validate::HostedValidateResponse;
use chrono::Duration;
use db::models::auth_event::AuthEvent;
use itertools::Itertools;
use newtypes::{output::Csv, DataIdentifierDiscriminant, ObConfigurationKind};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Finish onboarding the user. Returns the validation token that can be exchanged for a permanent Footprint user token."
)]
#[actix::post("/hosted/onboarding/validate")]
pub async fn post(
    state: web::Data<State>,
    // We should build some better consolidation for accepting these two auths
    user_auth: UserAuthContext,
    user_wf_auth: Option<UserWfAuthContext>,
) -> JsonApiResponse<HostedValidateResponse> {
    let (wf, sv_id, user_auth) = if let Some(user_wf_auth) = user_wf_auth {
        // Token from onboarding
        let user_wf_auth = user_wf_auth.check_guard(UserAuthGuard::SignUp)?;

        // Verify there are no unmet requirements
        let args = GetRequirementsArgs::from(&user_wf_auth)?;
        let reqs = get_requirements_for_person_and_maybe_business(&state, args).await?;
        let unmet_reqs = reqs.into_iter().filter(|r| !r.is_met()).collect_vec();
        if !unmet_reqs.is_empty() {
            let unmet_reqs = unmet_reqs.into_iter().map(|x| x.into()).collect_vec();
            return Err(OnboardingError::UnmetRequirements(unmet_reqs.into()).into());
        }

        let wf = user_wf_auth.workflow().clone();
        let sv_id = user_wf_auth.scoped_user.id.clone();
        (Some(wf), sv_id, user_wf_auth.data.user_session)
    } else {
        // Token from auth
        let user_auth = user_auth.check_guard(UserAuthGuard::Auth)?;
        let ob_config = user_auth
            .ob_config()
            .ok_or(OnboardingError::ObConfigKindNotAuth)?;
        if ob_config.kind != ObConfigurationKind::Auth {
            return Err(OnboardingError::ObConfigKindNotAuth.into());
        }
        let sv_id = user_auth
            .scoped_user_id()
            .ok_or(AssertionError("No scoped user associated with auth session"))?;
        // Primitive requirement checking for auth playbooks, which don't have many requirements
        let sv_id2 = sv_id.clone();
        let vw = state
            .db_pool
            .db_query(move |conn| VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv_id2)))
            .await??;
        let args = DecryptUncheckedResultForReqs::for_auth();
        let progress = get_data_collection_progress(&vw, ob_config, DataIdentifierDiscriminant::Id, &args);
        if !progress.missing_attributes.is_empty() {
            return Err(OnboardingError::MissingAttributes(Csv(progress.missing_attributes)).into());
        }
        (None, sv_id, user_auth.data)
    };
    let session_key = state.session_sealing_key.clone();
    let validation_token = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            if user_auth.auth_event_ids.is_empty() {
                return Err(AssertionError("No auth events found for user").into());
            }
            // Validate as much as possible in this API instead of in the tenant-facing API.
            // If this fails, the user may be able to retry and get a new validation token.
            // But once the tenant has the validation token, they cannot do anything if it fails
            let auth_events = AuthEvent::get_bulk(conn, &user_auth.auth_event_ids)?;
            if !auth_events.iter().any(|ae| ae.scoped_vault_id.is_some()) {
                return Err(AssertionError("Auth event must have scoped vault").into());
            }
            if auth_events
                .iter()
                .filter_map(|ae| ae.scoped_vault_id.as_ref())
                .any(|ae_sv_id| ae_sv_id != &sv_id)
            {
                return Err(AssertionError("Auth event has different user").into());
            }
            if wf.as_ref().is_some_and(|wf| wf.scoped_vault_id != sv_id) {
                return Err(AssertionError("Workflow has different user").into());
            }
            let data = AuthSessionData::ValidateUserToken(ValidateUserToken {
                sv_id,
                auth_event_ids: user_auth.auth_event_ids,
                wf_id: wf.map(|wf| wf.id),
            });
            let (validation_token, _) =
                AuthSession::create_sync(conn, &session_key, data, Duration::minutes(15))?;
            Ok(validation_token)
        })
        .await??;

    ResponseData::ok(HostedValidateResponse { validation_token }).json()
}
