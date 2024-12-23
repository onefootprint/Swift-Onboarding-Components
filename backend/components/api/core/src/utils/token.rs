use super::session::AuthSession;
use super::vault_wrapper::Any;
use super::vault_wrapper::TenantVw;
use crate::auth::session::user::AssociatedAuthEvent;
use crate::auth::session::user::TokenCreationPurpose;
use crate::auth::session::user::UserSessionBuilder;
use crate::errors::onboarding::OnboardingError;
use crate::FpResult;
use api_errors::BadRequest;
use api_errors::BadRequestInto;
use api_wire_types::TokenOperationKind;
use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::workflow::Workflow;
use db::models::workflow_request::WorkflowRequest;
use db::models::workflow_request_junction::WorkflowRequestJunction;
use db::TxnPgConn;
use newtypes::AuthMethodKind;
use newtypes::DataIdentifier as DI;
use newtypes::IdentityDataKind as IDK;
use newtypes::PublishablePlaybookKey;
use newtypes::ScopedVaultId;
use newtypes::SessionAuthToken;
use newtypes::UserAuthScope;
use newtypes::VaultKind;

pub struct CreateTokenArgs<'a> {
    pub vw: &'a TenantVw<Any>,
    pub sb_id: Option<ScopedVaultId>,
    pub kind: TokenOperationKind,
    pub key: Option<PublishablePlaybookKey>,
    pub wf: Option<&'a Workflow>,
    pub scopes: Vec<UserAuthScope>,
    pub auth_events: Vec<AssociatedAuthEvent>,
    pub limit_auth_methods: Option<Vec<AuthMethodKind>>,
    pub allow_reonboard: bool,
}

pub struct CreateTokenResult {
    pub token: SessionAuthToken,
    pub session: AuthSession,
    /// For Inherit tokens, the WorkflowRequest being inherited
    pub wfr: Option<WorkflowRequest>,
}

pub fn create_token(
    conn: &mut TxnPgConn,
    session_key: &ScopedSealingKey,
    args: CreateTokenArgs,
    duration: Duration,
) -> FpResult<CreateTokenResult> {
    let CreateTokenArgs {
        vw,
        mut sb_id,
        kind,
        key,
        wf,
        scopes,
        auth_events,
        limit_auth_methods,
        allow_reonboard,
    } = args;
    let su = &vw.scoped_vault;

    if su.kind != VaultKind::Person {
        return BadRequestInto("Cannot create a token for a non-person vault");
    }
    let vw_dis = vw.populated_dis();
    if !vw_dis.contains(&DI::Id(IDK::PhoneNumber)) && !vw_dis.contains(&DI::Id(IDK::Email)) {
        return BadRequestInto("Cannot create a token for a vault with no contact info. Must have one of id.phone_number or id.email");
    }

    if key.is_some() && !kind.allow_obc_key() {
        return BadRequestInto("Cannot provide playbook key for this token kind");
    }
    if limit_auth_methods.is_some() && !kind.allow_limit_auth_methods() {
        return BadRequestInto("Cannot provide limit_auth_methods for this token kind");
    }

    // Determine arguments for the auth token based on the requested operation

    let (purpose, obc_id, wfr) = match kind {
        TokenOperationKind::User => (TokenCreationPurpose::ApiUser, None, None),
        TokenOperationKind::Inherit => {
            // Inherit the WorkflowRequest
            let wfr = WorkflowRequest::get_active(conn, &su.id)?
                .ok_or(BadRequest("No outstanding info is requested from this user"))?;

            let wfr_junctions = WorkflowRequestJunction::list(conn, &wfr.id)?;
            sb_id = wfr_junctions
                .into_iter()
                .find(|j| j.kind == VaultKind::Business)
                .map(|sb| sb.scoped_vault_id);

            // Do we want to replace the obc.id on the auth token?
            let obc_id = wfr.ob_configuration_id.clone();
            (TokenCreationPurpose::ApiInherit, Some(obc_id), Some(wfr))
        }
        TokenOperationKind::Reonboard => {
            let (_, obc) = Workflow::latest_reonboardable(conn, &su.id, true)?.ok_or(BadRequest(
                "Cannot reonboard user - user has no complete onboardings.",
            ))?;
            (TokenCreationPurpose::ApiReonboard, Some(obc.id), None)
        }
        TokenOperationKind::Onboard => {
            let obc = if let Some(wf) = wf {
                let (_, obc) = ObConfiguration::get(conn, &wf.ob_configuration_id)?;
                obc
            } else {
                let key = key.ok_or(BadRequest("key must be provided for a token of kind onboard"))?;
                let (_, obc, _) = Playbook::get_latest_version(conn, (&key, &su.tenant_id, su.is_live))?;
                obc
            };
            if !obc.kind.can_onboard() {
                return Err(OnboardingError::CannotOnboardOntoPlaybook(obc.kind).into());
            }
            (TokenCreationPurpose::ApiOnboard, Some(obc.id), None)
        }
        TokenOperationKind::UpdateAuthMethods => (
            TokenCreationPurpose::ApiUpdateAuthMethods { limit_auth_methods },
            None,
            None,
        ),
    };

    let mut session = UserSessionBuilder::new(su.vault_id.clone(), vec![purpose])
        .add_scopes(scopes)
        .add_auth_events(auth_events);
    session.su_id = Some(su.id.clone());
    session.sb_id = sb_id;
    session.obc_id = obc_id;
    session.wf_id = wf.map(|wf| wf.id.clone());
    session.wfr_id = wfr.as_ref().map(|wfr| wfr.id.clone());
    session.metadata.allow_reonboard = allow_reonboard;
    let session = session.finish()?;
    let (token, session) = AuthSession::create_sync(conn, session_key, session, duration)?;
    let result = CreateTokenResult { token, session, wfr };
    Ok(result)
}
