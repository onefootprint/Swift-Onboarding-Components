use crate::{
    AccessEventId,
    AuditEventId,
    BoLinkId,
    BusinessOwnerKind,
    FingerprintId,
    FpId,
    NtResult,
    ObConfigurationKey,
    PartnerTenantId,
    RuleId,
    ScopedVaultId,
    TenantId,
    VaultId,
    VaultKind,
};
use rand::distributions::{
    Alphanumeric,
    DistString,
};

fn generate_random_id(prefix: &str, length: usize) -> String {
    format!(
        "{}_{}",
        prefix,
        crypto::random::gen_random_alphanumeric_code(length)
    )
}

impl ObConfigurationKey {
    const LENGTH: usize = 22;
    /// prefixed on LIVE keys
    pub const LIVE_PREFIX: &'static str = "pb_live";
    /// prefix on sandbox keys
    pub const SANDBOX_PREFIX: &'static str = "pb_test";

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

impl PartnerTenantId {
    pub fn is_integration_test_tenant(&self) -> bool {
        self.0.starts_with("_private_it_porg_")
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
    const PREFIXES: &'static [&'static str] = &["fp_bid_test_", "fp_id_test_", "fp_bid_", "fp_id_"];

    pub fn generate(kind: VaultKind, is_live: bool) -> Self {
        let prefix = match (kind, is_live) {
            (VaultKind::Person, true) => "fp_id",
            (VaultKind::Person, false) => "fp_id_test",
            (VaultKind::Business, true) => "fp_bid",
            (VaultKind::Business, false) => "fp_bid_test",
        };
        Self(generate_random_id(prefix, Self::LENGTH))
    }

    pub fn parse_with_prefix(s: &str) -> NtResult<Self> {
        let s: String = s.into();
        let Some(unique_part) = Self::PREFIXES.iter().filter_map(|p| s.strip_prefix(p)).next() else {
            return Err(crate::Error::InvalidFpIdPrefix);
        };

        if !unique_part.chars().all(char::is_alphanumeric) || unique_part.is_empty() {
            return Err(crate::Error::InvalidFpIdPrefix);
        }
        Ok(Self::from(s))
    }
}

impl BoLinkId {
    const LENGTH: usize = 22;
    const PREFIX: &'static str = "bo_link";

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

impl AuditEventId {
    const LENGTH: usize = 22;

    pub fn generate() -> Self {
        Self(generate_random_id("ae", Self::LENGTH))
    }

    pub fn into_correlated_access_event_id(self) -> AccessEventId {
        AccessEventId::from(self.0)
    }
}

impl RuleId {
    const LENGTH: usize = 22;

    pub fn generate() -> Self {
        format!(
            "rule_{}",
            Alphanumeric.sample_string(&mut rand::thread_rng(), Self::LENGTH)
        )
        .into()
    }
}

impl FingerprintId {
    const LENGTH: usize = 22;

    pub fn generate() -> Self {
        Self(generate_random_id("fprint", Self::LENGTH))
    }
}

#[cfg(test)]
mod test {
    use crate::{
        FpId,
        VaultKind,
    };
    use test_case::test_case;

    #[test_case(VaultKind::Person, true, "fp_id")]
    #[test_case(VaultKind::Person, false, "fp_id_test")]
    #[test_case(VaultKind::Business, true, "fp_bid")]
    #[test_case(VaultKind::Business, false, "fp_bid_test")]
    fn test_fp_id(kind: VaultKind, is_live: bool, expected_prefix: &str) {
        let fp_id = FpId::generate(kind, is_live);
        assert!(fp_id.starts_with(expected_prefix));
        FpId::parse_with_prefix(&format!("{}", fp_id)).unwrap();
    }
}
