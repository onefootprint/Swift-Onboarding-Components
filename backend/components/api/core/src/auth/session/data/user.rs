use newtypes::ContactInfoId;
use newtypes::OnboardingId;
use newtypes::VaultId;
use newtypes::WorkflowId;

use crate::auth::user::UserAuthScope;

use super::AuthSessionData;

/// A user-specific auth session. Permissions for the session are defined by the set of scopes.
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct UserSession {
    pub user_vault_id: VaultId,
    pub scopes: Vec<UserAuthScope>,
    // TODO Eventually might want to store auth methods to know if a token is generated from SMS, biometric, or via tenant trigger
}

impl UserSession {
    pub fn make(user_vault_id: VaultId, scopes: Vec<UserAuthScope>) -> AuthSessionData {
        AuthSessionData::User(Self {
            user_vault_id,
            scopes,
        })
    }
}

/// Short-lived token that represents the completion of an onboarding
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ValidateUserToken {
    pub ob_id: OnboardingId,
    pub wf_id: Option<WorkflowId>,
}

/// Longer-lived session that is sent out in emails to verify ownership
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifySession {
    // May contain old primary keys to Email rows (legacy) or primary keys to ContactInfo rows (modern)
    pub email_id: ContactInfoId,
}
