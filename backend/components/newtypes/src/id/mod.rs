mod alias;
mod basic;
mod data_lifetime;
mod prefix;
mod tenant_utils;
pub use self::{alias::*, basic::*, data_lifetime::*, tenant_utils::*};

/// This macro generates an Id type that wraps a string
macro_rules! define_newtype_id {
    ($name: ident, $type: ty, $doc: literal) => {
        #[doc = $doc]
        #[derive(
            Debug,
            Clone,
            Hash,
            PartialEq,
            Eq,
            Ord,
            PartialOrd,
            derive_more::Display,
            derive_more::From,
            derive_more::Into,
            derive_more::FromStr,
            serde::Serialize,
            serde::Deserialize,
            Default,
            DieselNewType,
            schemars::JsonSchema,
            derive_more::Deref,
        )]
        #[serde(transparent)]
        pub struct $name(pub(in crate::id) $type);

        impl paperclip::v2::schema::TypedData for $name {
            fn data_type() -> paperclip::v2::models::DataType {
                paperclip::v2::models::DataType::String
            }

            fn format() -> Option<paperclip::v2::models::DataTypeFormat> {
                None
            }
        }

        impl $name {
            pub fn test_data(v: $type) -> Self {
                Self(v)
            }

            #[allow(unused)]
            #[cfg(test)]
            pub(crate) fn escape_hatch(v: $type) -> Self {
                Self(v)
            }
        }
    };
}

use define_newtype_id;

/// A trait that enables an id to verify its prefix
pub trait PrefixId: From<String> {
    const PREFIX: &'static str;

    fn parse_with_prefix<S: Into<String>>(s: S) -> Result<Self, crate::Error> {
        let s: String = s.into();
        let Some(unique_part) = s.strip_prefix(Self::PREFIX) else {
            return Err(crate::Error::IdPrefixError(Self::PREFIX));
        };

        if !unique_part.chars().all(char::is_alphanumeric) || unique_part.is_empty() {
            return Err(crate::Error::IdPrefixError(Self::PREFIX));
        }
        Ok(Self::from(s))
    }
}
/// This macro implements a way to verify the prefix of an id
#[allow(unused)]
macro_rules! impl_verified_prefix_for_nt_id {
    ($name: ident, $prefix: literal) => {
        impl PrefixId for $name {
            const PREFIX: &'static str = $prefix;
        }
    };
}

#[allow(unused)]
use impl_verified_prefix_for_nt_id;

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;
    use uuid::Uuid;

    #[test]
    fn test_id_string() {
        define_newtype_id!(TestId, String, "");

        let x = TestId::from_str("some_test_id").unwrap();
        assert_eq!(x.to_string(), "some_test_id".to_string());
    }

    #[test]
    fn test_id_uuid() {
        define_newtype_id!(TestUuid, Uuid, "");

        let x = TestUuid::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap();
        assert_eq!(x.to_string(), "a5971b52-1b44-4c3a-a83f-a96796f8774d".to_string());
    }

    #[test]
    fn test_prefix() {
        define_newtype_id!(TestId, String, "");
        impl_verified_prefix_for_nt_id!(TestId, "abcd_ab_");

        let _ = TestId::parse_with_prefix("abcd_ab_asdajsdhj1h313j1jsdsdf").expect("failed to parse id");
        let _ = TestId::parse_with_prefix("abcd_ab_12abADdas3ssF").expect("failed to parse id");
        let _ = TestId::parse_with_prefix("abcd_ab_as12123abcd_ab").expect_err("failed to fail id");
        let _ = TestId::parse_with_prefix("abcd_ab_a2112@@$$dfdf").expect_err("failed to fail id");
        let _ = TestId::parse_with_prefix("abcd_ab_a2112@@$$dfdf").expect_err("failed to fail id");
        let _ = TestId::parse_with_prefix("abcd_ab_").expect_err("failed to fail id");
    }
}
