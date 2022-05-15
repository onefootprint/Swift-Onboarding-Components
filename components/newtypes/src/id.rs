pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

/// This macro generates an Id type that wraps a string
macro_rules! define_newtype_id {
    ($name: ident, $doc: literal) => {
        #[doc = $doc]
        #[derive(
            DieselNewType,
            Debug,
            Clone,
            Hash,
            PartialEq,
            Eq,
            Display,
            From,
            Into,
            FromStr,
            Serialize,
            Deserialize,
            Default,
            Apiv2Schema,
        )]
        #[serde(transparent)]
        pub struct $name(String);
    };
}

// define our raw ids here
define_newtype_id!(TenantId, "Identifier for a Tenant");
define_newtype_id!(TenantPublicKey, "A publishable api key for a tenant");
define_newtype_id!(UserVaultId, "Identifier for a User Vault");
define_newtype_id!(OnboardingId, "Identifier for an Onboarding");
define_newtype_id!(FootprintUserId, "Identifier for a an onboarding");

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;

    #[test]
    fn test_id() {
        define_newtype_id!(TestId, "");

        let x = TestId::from_str("some_test_id").unwrap();
        assert_eq!(x.to_string(), "some_test_id".to_string());
    }
}
