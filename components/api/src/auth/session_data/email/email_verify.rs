use newtypes::{Fingerprint, UserVaultId};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifySession {
    pub uv_id: UserVaultId,
    pub sh_email: Fingerprint,
}
