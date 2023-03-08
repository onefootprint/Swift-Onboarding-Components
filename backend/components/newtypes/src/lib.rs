#[macro_use]
extern crate diesel_derive_newtype;

#[macro_use]
extern crate lazy_static;

mod id;
pub use self::id::*;
pub use self::phone_number::*;

pub mod idv;
pub use idv::*;

pub mod docv;
pub use docv::*;

pub mod decision;

pub mod fields;
pub use fields::*;

pub mod db_types;
pub use db_types::*;

pub mod data_identifier;
pub use data_identifier::*;

pub mod handoff_metadata;
pub use handoff_metadata::*;

mod b64;
pub use b64::Base64Data;
pub use serde;
use serde::ser::SerializeMap;

mod auth_token;
pub use self::auth_token::*;

pub mod fingerprint;
pub use self::fingerprint::*;

pub mod map_container;
pub mod secret_api_key;

pub mod reason_code;
pub use reason_code::*;

pub mod locked;
pub use locked::*;

pub mod status_code;
pub use status_code::*;

pub use uuid::Uuid;

pub mod proxy_token;
pub use self::proxy_token::*;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Invalid email address")]
    InvalidEmail,
    #[error("{0}")]
    PhoneNumber(#[from] fields::phone_number::Error),
    #[error("Invalid sandbox suffix. Suffix must be non-empty, alphanumeric string")]
    InvalidSandboxSuffix,
    #[error("Serde error")]
    SerdeError,
    #[error("Error deserializing")]
    DeserializeError,
    #[error("{0}")]
    ProxyTokenError(#[from] ProxyTokenError),
    #[error("Expected identifier with prefix: {0}")]
    IdPrefixError(&'static str),
    #[error("{0}")]
    ParsingError(#[from] data_identifier::Error),
    #[error("{0}")]
    ValidationError(#[from] DataValidationError),
    #[error("{0}")]
    Custom(String),
    #[error("{0}")]
    VdKindConversionError(#[from] VdKindConversionError),
}

impl Error {
    /// Shorthand to create a key-value map of errors
    pub fn new_validation_error<'a, T>(errors: T) -> Self
    where
        T: IntoIterator<Item = (IdentityDataKind, &'a str)>,
    {
        // TODO can i rm this now?
        let errors = errors
            .into_iter()
            .map(|(idk, e)| (idk, Error::Custom(e.to_string())))
            .collect();
        DataValidationError::FieldValidationError(errors).into()
    }
}

use std::collections::HashMap;
use strum::Display;

#[derive(Debug, Display)]
pub enum DataValidationError {
    /// There are additional IDKs provided that aren't part of any CDO
    ExtraFieldError(Vec<IdentityDataKind>),
    /// One or more IDKs weren't able to be verified
    FieldValidationError(HashMap<IdentityDataKind, Error>),
}

#[derive(Debug, Clone)]
pub enum ErrorMessage {
    String(String),
    Map(HashMap<String, String>),
}

impl serde::Serialize for ErrorMessage {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            Self::String(s) => serializer.serialize_str(s),
            Self::Map(m) => {
                let mut ser = serializer.serialize_map(Some(m.len()))?;
                for (k, v) in m {
                    ser.serialize_entry(k, v)?;
                }
                ser.end()
            }
        }
    }
}

impl DataValidationError {
    pub fn json_message(&self) -> ErrorMessage {
        let err = match self {
            Self::ExtraFieldError(x) => x
                .iter()
                .map(|idk| {
                    let err_str = format!("Cannot vault without other {} data", idk.parent());
                    (DataIdentifier::from(*idk).to_string(), err_str)
                })
                .collect(),
            Self::FieldValidationError(x) => x
                .iter()
                .map(|(k, v)| (DataIdentifier::from(*k).to_string(), v.to_string()))
                .collect(),
        };
        ErrorMessage::Map(err)
    }
}

impl std::error::Error for DataValidationError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        None
    }
}

pub type NtResult<T> = Result<T, Error>;

#[derive(Debug, Clone, thiserror::Error)]
pub enum EnumDotNotationError {
    #[error("Cannot parse: {0}")]
    CannotParse(String),
    #[error("Cannot parse prefix: {0}")]
    CannotParsePrefix(String),
    #[error("Cannot parse suffix: {0}")]
    CannotParseSuffix(String),
}

#[macro_use]
pub mod util {
    // Derive to_sql using the type's as_ref() method and from_sql with the type's from_str method
    macro_rules! impl_enum_str_diesel {
        ($type:ty) => {
            impl<DB> diesel::serialize::ToSql<Text, DB> for $type
            where
                DB: diesel::backend::Backend,
                str: diesel::serialize::ToSql<Text, DB>,
            {
                fn to_sql<'b>(
                    &'b self,
                    out: &mut diesel::serialize::Output<'b, '_, DB>,
                ) -> diesel::serialize::Result {
                    self.as_ref().to_sql(out)
                }
            }

            impl diesel::deserialize::FromSql<Text, diesel::pg::Pg> for $type {
                fn from_sql(value: diesel::pg::PgValue<'_>) -> diesel::deserialize::Result<Self> {
                    use std::str::FromStr;
                    let str = String::from_sql(value)?;
                    Ok(Self::from_str(&str)?)
                }
            }
        };
    }

    // Derive to_sql using the type's to_string() method and from_sql with the type's from_str method
    macro_rules! impl_enum_string_diesel {
        ($type:ty) => {
            impl diesel::serialize::ToSql<Text, diesel::pg::Pg> for $type {
                fn to_sql<'b>(
                    &'b self,
                    out: &mut diesel::serialize::Output<'b, '_, diesel::pg::Pg>,
                ) -> diesel::serialize::Result {
                    <String as diesel::serialize::ToSql<Text, diesel::pg::Pg>>::to_sql(
                        &self.to_string(),
                        &mut out.reborrow(),
                    )
                }
            }

            impl diesel::deserialize::FromSql<Text, diesel::pg::Pg> for $type {
                fn from_sql(value: diesel::pg::PgValue<'_>) -> diesel::deserialize::Result<Self> {
                    let str = String::from_sql(value)?;
                    Ok(Self::from_str(&str)?)
                }
            }
        };
    }

    #[allow(clippy::extra_unused_lifetimes)]
    #[cfg(test)]
    mod tests {
        use super::impl_enum_str_diesel;
        use diesel::prelude::*;
        use diesel::{connection::SimpleConnection, sql_types::Text, AsExpression, FromSqlRow, RunQueryDsl};
        use strum_macros::{AsRefStr, EnumIter, EnumString};

        #[derive(Debug, Clone, PartialEq, Eq, AsExpression, FromSqlRow, EnumString, AsRefStr, EnumIter)]
        #[strum(serialize_all = "PascalCase")]
        #[diesel(sql_type = Text)]
        pub enum MyEnum {
            Case1,
            SpecialCase2,
            #[allow(non_camel_case_types)]
            case_3,
        }

        // test derive
        impl_enum_str_diesel!(MyEnum);

        diesel::table! {
            use diesel::sql_types::*;
            test_table {
                id -> Integer,
                custom_enum -> Text,
            }
        }

        #[derive(diesel::Insertable, diesel::Queryable, diesel::Identifiable, Debug, PartialEq)]
        #[diesel(table_name = test_table)]
        struct HasCustomTypes {
            id: i32,
            custom_enum: MyEnum,
        }

        #[test]
        fn test_enum_str() {
            let data = vec![
                HasCustomTypes {
                    id: 2,
                    custom_enum: MyEnum::Case1,
                },
                HasCustomTypes {
                    id: 3,
                    custom_enum: MyEnum::SpecialCase2,
                },
                HasCustomTypes {
                    id: 4,
                    custom_enum: MyEnum::case_3,
                },
            ];
            let db_url = std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgresql://localhost/footprint_db".to_string());

            let mut connection = PgConnection::establish(&db_url).expect("failed to connect to db");
            connection.begin_test_transaction().unwrap();

            connection
                .batch_execute(
                    r#"
                DROP TABLE IF EXISTS test_table;
                CREATE TABLE IF NOT EXISTS test_table (
                    id SERIAL PRIMARY KEY,
                    custom_enum Text NOT NULL
                );
                INSERT INTO test_table VALUES (1, 'SpecialCase2');

            "#,
                )
                .unwrap();

            let inserted = diesel::insert_into(test_table::table)
                .values(&data)
                .get_results(&mut connection)
                .unwrap();
            assert_eq!(data, inserted);

            let first_row: HasCustomTypes = test_table::table
                .filter(test_table::id.eq(1))
                .get_result(&mut connection)
                .unwrap();

            assert_eq!(first_row.custom_enum, MyEnum::SpecialCase2);
        }
    }
    pub(crate) use impl_enum_str_diesel;
    pub(crate) use impl_enum_string_diesel;
}

/// The email address of the TenantUser that is used in integration tests.
/// This tenant user has is_firm_employee set, which is slightly dangerous. So, we use
/// this hardcoded email address to also gate permissions in some places.
/// DO NOT CHANGE THIS UNLESS YOU KNOW WHAT YOU ARE DOING.
pub static INTEGRATION_TEST_USER_EMAIL: &str = "integrationtests@onefootprint.com";
