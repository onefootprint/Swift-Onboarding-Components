use crate::{
    BoLinkId, BusinessOwnerKind, FpId, ObConfigurationKey, ScopedVaultId, TenantId, VaultId, VaultKind,
};

fn generate_random_id(prefix: &str, length: usize) -> String {
    format!(
        "{}_{}",
        prefix,
        crypto::random::gen_random_alphanumeric_code(length)
    )
}

impl ObConfigurationKey {
    /// prefixed on LIVE keys
    pub const LIVE_PREFIX: &'static str = "ob_live";

    /// prefix on sandbox keys
    pub const SANDBOX_PREFIX: &'static str = "ob_test";

    const LENGTH: usize = 22;

    /// generate a random new secret api key
    pub fn generate(is_live: bool) -> Self {
        let prefix = if is_live {
            Self::LIVE_PREFIX
        } else {
            Self::SANDBOX_PREFIX
        };

        Self(generate_random_id(prefix, Self::LENGTH))
    }
}

impl TenantId {
    pub fn is_integration_test_tenant(&self) -> bool {
        self.0.starts_with("_private_it_org_")
    }
}

impl ScopedVaultId {
    const LENGTH: usize = 22;

    pub fn generate(kind: VaultKind) -> Self {
        let prefix = match kind {
            VaultKind::Person => "su",
            VaultKind::Business => "sb",
        };
        Self(generate_random_id(prefix, Self::LENGTH))
    }
}

impl VaultId {
    const LENGTH: usize = 22;

    pub fn generate(kind: VaultKind) -> Self {
        let prefix = match kind {
            VaultKind::Person => "uv",
            VaultKind::Business => "bv",
        };
        Self(generate_random_id(prefix, Self::LENGTH))
    }
}

impl FpId {
    const LENGTH: usize = 22;

    pub fn generate(kind: VaultKind) -> Self {
        let prefix = match kind {
            VaultKind::Person => "fp_id",
            VaultKind::Business => "fp_bid",
        };
        Self(generate_random_id(prefix, Self::LENGTH))
    }
}

impl BoLinkId {
    const LENGTH: usize = 22;
    const PREFIX: &str = "bo_link";

    pub fn generate(kind: BusinessOwnerKind) -> Self {
        match kind {
            // All primary BOs will have a fixed link ID
            BusinessOwnerKind::Primary => Self(format!("{}_primary", Self::PREFIX)),
            // All secondary BOs have a randomly-generated link ID.
            // Could theoretically just use the index of the BO to link, but that gives us less
            // protection against accidentally changing the BOs
            BusinessOwnerKind::Secondary => Self(generate_random_id(Self::PREFIX, Self::LENGTH)),
        }
    }
}
