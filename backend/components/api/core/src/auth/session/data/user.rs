use newtypes::ContactInfoId;
use newtypes::VaultId;
use newtypes::WebauthnCredentialId;
use newtypes::WorkflowId;

use crate::auth::user::UserAuthScope;

use super::AuthSessionData;

/// A user-specific auth session. Permissions for the session are defined by the set of scopes.
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct UserSession {
    pub user_vault_id: VaultId,
    pub scopes: Vec<UserAuthScope>,
    /// the auth method that was used
    #[serde(default)]
    pub auth_factors: Vec<AuthFactor>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub enum AuthFactor {
    Passkey(WebauthnCredentialId),
    Email,
    Sms,
}

impl UserSession {
    pub fn make(
        user_vault_id: VaultId,
        scopes: Vec<UserAuthScope>,
        auth_factors: Vec<AuthFactor>,
    ) -> AuthSessionData {
        AuthSessionData::User(Self {
            user_vault_id,
            scopes,
            auth_factors,
        })
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
