use newtypes::ContactInfoId;
use newtypes::ObConfigurationId;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use newtypes::WebauthnCredentialId;
use newtypes::WorkflowId;

use crate::auth::user::UserAuthScope;
use crate::errors::user::UserError;
use crate::errors::ApiResult;

use super::AuthSessionData;

/// A user-specific auth session. Permissions for the session are defined by the set of scopes.
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
// WARNING: changing this could break existing user auth sessions
pub struct UserSession {
    pub user_vault_id: VaultId,
    /// The tenant-scoped user for the auth session. Only null for my1fp
    pub su_id: Option<ScopedVaultId>,
    /// The scoped business for the auth session, if any
    pub sb_id: Option<ScopedVaultId>,
    /// The obc that we'll use to make a new onboarding workflow, if any
    pub obc_id: Option<ObConfigurationId>,
    /// The workflow for the auth session, if any
    pub wf_id: Option<WorkflowId>,
    /// Permissions that this auth token is given
    pub scopes: Vec<UserAuthScope>,
    /// the auth method that was used
    pub auth_factors: Vec<AuthFactor>,
    /// When true, the auth token was initially issued as an unauthed, identified token
    #[serde(default)]
    pub is_from_api: bool,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub enum AuthFactor {
    Passkey(WebauthnCredentialId),
    Email,
    Sms,
}

#[derive(Default)]
pub struct UserSessionArgs {
    pub su_id: Option<ScopedVaultId>,
    pub sb_id: Option<ScopedVaultId>,
    pub obc_id: Option<ObConfigurationId>,
    pub wf_id: Option<WorkflowId>,
    pub is_from_api: bool,
}

impl UserSession {
    pub fn make(
        user_vault_id: VaultId,
        args: UserSessionArgs,
        scopes: Vec<UserAuthScope>,
        auth_factors: Vec<AuthFactor>,
    ) -> ApiResult<AuthSessionData> {
        if scopes.iter().any(|s| matches!(s, UserAuthScope::SignUp)) && args.su_id.is_none() {
            return Err(UserError::InvalidAuthSession(
                "Cannot create session with SignUp scope without su_id".into(),
            )
            .into());
        }
        let UserSessionArgs {
            su_id,
            sb_id,
            obc_id,
            wf_id,
            is_from_api,
        } = args;
        let session = AuthSessionData::User(Self {
            user_vault_id,
            su_id,
            sb_id,
            obc_id,
            wf_id,
            scopes,
            auth_factors,
            is_from_api,
        });
        Ok(session)
    }
}

/// Short-lived token that represents the completion of an onboarding
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ValidateUserToken {
    pub wf_id: WorkflowId,
}

/// Longer-lived session that is sent out in emails to verify ownership
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifySession {
    // May contain old primary keys to Email rows (legacy) or primary keys to ContactInfo rows (modern)
    pub email_id: ContactInfoId,
}
