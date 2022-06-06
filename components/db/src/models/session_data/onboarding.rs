use newtypes::{D2pSessionStatus, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(FromSqlRow, AsExpression, serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct OnboardingSessionData {
    pub user_vault_id: UserVaultId,
    pub kind: OnboardingSessionKind,
}

impl OnboardingSessionData {
    pub fn replace(&self, kind: OnboardingSessionKind) -> OnboardingSessionData {
        Self {
            user_vault_id: self.user_vault_id.clone(),
            kind,
        }
    }
}

impl From<D2pSessionStatus> for OnboardingSessionKind {
    fn from(status: D2pSessionStatus) -> Self {
        Self::D2pSession(D2pSessionData { status })
    }
}

#[derive(FromSqlRow, AsExpression, serde::Serialize, serde::Deserialize, Debug, Clone)]
pub enum OnboardingSessionKind {
    Normal,
    D2pSession(D2pSessionData),
}

#[derive(Default, FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
pub struct D2pSessionData {
    pub status: D2pSessionStatus,
}
