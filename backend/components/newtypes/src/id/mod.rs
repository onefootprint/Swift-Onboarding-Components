mod alias;
mod basic;
mod data_lifetime;
mod prefix;
mod scoped_vault_version_number;
mod tenant_utils;
pub use self::alias::*;
pub use self::basic::*;
pub use self::data_lifetime::*;
pub use self::scoped_vault_version_number::*;
pub use self::tenant_utils::*;

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
            derive_more::AsRef,
            derive_more::AsMut,
            serde::Serialize,
            serde::Deserialize,
            Default,
            derive_more::Deref,
            diesel::expression::AsExpression,
            diesel::deserialize::FromSqlRow,
        )]
        #[serde(transparent)]
        #[diesel(sql_type = diesel::sql_types::Text)]
        pub struct $name(pub(in crate::id) $type);

        impl<DB> diesel::serialize::ToSql<diesel::sql_types::Text, DB> for $name
        where
            DB: diesel::backend::Backend,
            $type: diesel::serialize::ToSql<diesel::sql_types::Text, DB>,
        {
            fn to_sql<'b>(
                &'b self,
                out: &mut diesel::serialize::Output<'b, '_, DB>,
            ) -> diesel::serialize::Result {
                self.0.to_sql(out)
            }
        }

        impl<DB> diesel::deserialize::FromSql<diesel::sql_types::Text, DB> for $name
        where
            DB: diesel::backend::Backend,
            $type: diesel::deserialize::FromSql<diesel::sql_types::Text, DB>,
        {
            fn from_sql(bytes: DB::RawValue<'_>) -> diesel::deserialize::Result<Self> {
                Ok(Self::from(<$type>::from_sql(bytes)?))
            }
        }

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
    use super::*;
    use diesel::prelude::*;
    use std::str::FromStr;
    use uuid::Uuid;

    #[test]
    fn test_id_string() {
        define_newtype_id!(TestId, String, "TestId");

        let x = TestId::from_str("some_test_id").unwrap();
        assert_eq!(x.to_string(), "some_test_id".to_string());
    }

    #[test]
    fn test_id_uuid() {
        define_newtype_id!(TestUuid, Uuid, "TestUuid");

        let x = TestUuid::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap();
        assert_eq!(x.to_string(), "a5971b52-1b44-4c3a-a83f-a96796f8774d".to_string());
    }

    #[test]
    fn test_prefix() {
        define_newtype_id!(TestId, String, "TestId");
        impl_verified_prefix_for_nt_id!(TestId, "abcd_ab_");

        let _ = TestId::parse_with_prefix("abcd_ab_asdajsdhj1h313j1jsdsdf").expect("failed to parse id");
        let _ = TestId::parse_with_prefix("abcd_ab_12abADdas3ssF").expect("failed to parse id");
        let _ = TestId::parse_with_prefix("abcd_ab_as12123abcd_ab").expect_err("failed to fail id");
        let _ = TestId::parse_with_prefix("abcd_ab_a2112@@$$dfdf").expect_err("failed to fail id");
        let _ = TestId::parse_with_prefix("abcd_ab_a2112@@$$dfdf").expect_err("failed to fail id");
        let _ = TestId::parse_with_prefix("abcd_ab_").expect_err("failed to fail id");
    }

    #[test]
    fn test_refs() {
        define_newtype_id!(TestId, String, "TestId");

        table! {
            gadget {
                id -> Text,
                val -> Text,
            }
        }

        #[derive(Debug, Hash, PartialEq, Eq, Clone, Insertable)]
        #[diesel(table_name = gadget)]
        struct NewGadget<'a> {
            pub id: &'a TestId,
            pub val: &'a str,
        }

        // Just check that it compiles.
    }
}
