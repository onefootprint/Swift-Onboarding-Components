use crate::identify::create_identified_token;
use crate::identify::serialize_auth_methods;
use crate::GetIdentifyChallengeArgs;
use crate::IdentifyChallengeContext;
use crate::IdentifyLookupId;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::user::IdentifyAuthContext;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::identify::UserAuthMethodsContext;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_core::State;
use api_wire_types::IdentifiedUser;
use api_wire_types::IdentifyId;
use api_wire_types::IdentifyRequirement;
use api_wire_types::IdentifyRequirementsResponse;
use itertools::chain;
use itertools::Itertools;
use newtypes::AuthMethodKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::IdentityDataKind::Email;
use newtypes::IdentityDataKind::PhoneNumber;
use newtypes::ObConfigurationKind;
use newtypes::PreviewApi::SmsLinkAuthentication;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Returns the list of requirements for an identify session."
)]
#[actix::get("/hosted/identify/session/requirements")]
pub async fn get(
    state: web::Data<State>,
    identify: IdentifyAuthContext,
    root_span: RootSpan,
) -> ApiResponse<IdentifyRequirementsResponse> {
    let requirements = get_requirements(&state, identify, root_span).await?;

    let response = IdentifyRequirementsResponse { requirements };
    Ok(response)
}

pub(super) async fn get_requirements(
    state: &State,
    identify: IdentifyAuthContext,
    root_span: RootSpan,
) -> FpResult<Vec<IdentifyRequirement>> {
    let su_id = identify.scoped_user.id.clone();
    // The VW in the identify session is purely a placeholder for vault data in the event that we end up
    // making a new user.
    let placeholder_vw = state
        .db_query(move |conn| VaultWrapper::<Person>::build_for_tenant(conn, &su_id))
        .await?;

    let phone = placeholder_vw.decrypt_unchecked_parse(state, PhoneNumber).await?;
    let email = placeholder_vw.decrypt_unchecked_parse(state, Email).await?;

    let identifiers = chain!(phone.map(IdentifyId::PhoneNumber), email.map(IdentifyId::Email)).collect_vec();

    // Every time requirements are fetched, double check if we've already located
    // a user and can short-circuit to a login challenge instead.
    let args = GetIdentifyChallengeArgs {
        identifier: IdentifyLookupId::Pii(identifiers),
        kba_dis: &[],
        sandbox_id: placeholder_vw.vault.sandbox_id.clone(),
        playbook: Some(identify.playbook.clone()),
        root_span,
    };
    let ctx = crate::get_identify_challenge_context(state, args).await?;
    if let Some(ctx) = ctx {
        if ctx.ctx.vw.vault.id != placeholder_vw.vault.id {
            // We've located an existing user other than the one created in this identify session.
            // Short-circuit and return a login requirement
            return login_challenge_requirements(state, ctx, identify).await;
        }
    }

    // Otherwise, we haven't yet found a matching vault, so we need to collect email and phone and then
    // challenge them
    let mut requirements = vec![];
    let obc = identify.obc.clone();
    let required_auth_methods = obc.required_auth_methods.unwrap_or(vec![AuthMethodKind::Phone]);

    let possible_auth_cdos = vec![CDO::Email, CDO::PhoneNumber];
    for cdo in possible_auth_cdos {
        // Document playbooks never collect email or phone, but we need them for the identify flow
        let playbook_requires =
            obc.must_collect_data.contains(&cdo) || obc.kind == ObConfigurationKind::Document;
        let is_populated = cdo
            .required_data_identifiers()
            .iter()
            .all(|di| placeholder_vw.has_field(di));
        if playbook_requires && !is_populated {
            requirements.push(IdentifyRequirement::CollectData { cdo });
        }
    }

    let tenant_supports_sms_link = identify.tenant.can_access_preview(&SmsLinkAuthentication);
    // If no auth methods are required, we default to phone
    let aes = &identify.auth_events;
    let challenge_reqs = required_auth_methods
        .into_iter()
        .sorted_by_key(challenge_priority)
        .filter(|am| {
            !aes.iter()
                .any(|(ae, _)| AuthMethodKind::try_from(ae.kind).is_ok_and(|x| x == *am))
        })
        .map(|am| IdentifyRequirement::Challenge {
            auth_method: am,
            challenge_kinds: am.supported_challenge_kinds(tenant_supports_sms_link),
        });
    requirements.extend(challenge_reqs);
    Ok(requirements)
}

async fn login_challenge_requirements(
    state: &State,
    ctx: IdentifyChallengeContext,
    identify: IdentifyAuthContext,
) -> FpResult<Vec<IdentifyRequirement>> {
    let IdentifyChallengeContext {
        ctx,
        tenant: _,
        sv,
        can_initiate_signup_challenge,
        matching_fps,
    } = ctx;
    let UserAuthMethodsContext {
        is_vault_unverified,
        auth_methods: ams,
        vw,
    } = ctx;

    let scope = identify.scope;
    let purpose = scope.into();
    let context = NewUserSessionContext {
        su_id: sv.map(|sv| sv.id),
        ..identify.ob_config_auth_context()
    };
    let (token, _, token_scopes) =
        create_identified_token(state, &vw.vault.id, context, scope, purpose, vec![]).await?;
    let scrubbed_phone = ams.iter().find_map(|am| am.phone()).map(|p| p.scrubbed());

    let (has_syncable_passkey, available_challenge_kinds, auth_methods) =
        serialize_auth_methods(ams, Some(&identify.tenant));

    let user = IdentifiedUser {
        token,
        token_scopes,
        available_challenge_kinds,
        auth_methods,
        has_syncable_passkey,
        is_unverified: is_vault_unverified,
        can_initiate_signup_challenge,
        scrubbed_phone,
        scrubbed_email: None,
        matching_fps,
    };
    Ok(vec![IdentifyRequirement::Login { user }])
}

fn challenge_priority(auth_method: &AuthMethodKind) -> u8 {
    match auth_method {
        AuthMethodKind::Phone => 0,
        AuthMethodKind::Email => 1,
        AuthMethodKind::Passkey => 2,
    }
}
