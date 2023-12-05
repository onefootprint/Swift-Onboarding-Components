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
pub use decision::*;

pub mod scoped_vault_cursor;
pub use scoped_vault_cursor::*;

pub mod country_codes;
pub use country_codes::*;

pub mod fields;
pub use fields::*;

pub mod db_types;
pub use db_types::*;

pub mod data_identifier;
pub use data_identifier::*;

pub mod handoff_metadata;
pub use handoff_metadata::*;

mod us_states;
pub use us_states::*;

mod b64;
pub use b64::Base64Data;
pub use b64::Base64EncodedString;
pub use serde;
use serde::ser::SerializeMap;

mod auth_token;
pub use self::auth_token::*;

pub mod map_container;
pub mod secret_api_key;

pub mod reason_code;
pub use reason_code::*;

pub mod locked;
pub use locked::*;

pub mod status_code;
pub use status_code::*;

pub mod vendor;
pub use vendor::*;

pub use uuid::Uuid;

pub mod proxy_token;
pub use self::proxy_token::*;

pub mod filter_function;
pub use self::filter_function::*;

pub mod onboarding_requirement;
pub use onboarding_requirement::*;

pub mod integrity_signing_key;
pub use integrity_signing_key::*;

pub mod fingerprinter;
pub use self::fingerprinter::Fingerprinter;

mod trigger;
pub use trigger::*;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Invalid email address")]
    InvalidEmail,
    #[error("{0}")]
    PhoneNumber(#[from] fields::phone_number::Error),
    #[error("Invalid sandbox suffix. Suffix must be non-empty, alphanumeric string")]
    InvalidSandboxSuffix,
    #[error("Serde error {0}")]
    SerdeError(#[from] serde_json::Error),
    #[error("Error deserializing")]
    DeserializeError,
    #[error("{0}")]
    ProxyTokenError(#[from] ProxyTokenError),
    #[error("Expected identifier with prefix: {0}")]
    IdPrefixError(&'static str),
    #[error("Invalid FpId prefix")]
    InvalidFpIdPrefix,
    #[error("{0}")]
    ParsingError(#[from] data_identifier::ValidationError),
    #[error("{0}")]
    ValidationError(#[from] DataValidationError),
    #[error("{0}")]
    Custom(String),
    #[error("Cannot add to this type of vault")]
    IncompatibleDataIdentifier,
    #[error("{0}")]
    EnumDotNotationError(#[from] EnumDotNotationError),
    #[error("Invalid hex string")]
    InvalidHex(#[from] crypto::hex::FromHexError),
    #[error("Invalid filter function: {0}")]
    FilterFunctionParsingError(#[from] crate::filter_function::FilterFunctionParsingError),
    #[error("{0}")]
    ParseIntError(#[from] std::num::ParseIntError),
}

use std::collections::HashMap;
use strum::Display;

#[derive(Debug, Display)]
pub enum DataValidationError {
    /// There are additional data identifiers provided that aren't part of any CDO
    ExtraFieldError(Vec<DataIdentifier>),
    /// One or more data identifiers weren't able to be verified
    FieldValidationError(HashMap<DataIdentifier, Error>),
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
                .filter_map(|di| di.parent().map(|cd| (di, cd)))
                .map(|(di, cd)| (di.to_string(), format!("Cannot vault without other {} data", cd)))
                .collect(),
            Self::FieldValidationError(x) => x.iter().map(|(k, v)| (k.to_string(), v.to_string())).collect(),
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

#[derive(Debug, Clone, thiserror::Error, PartialEq)]
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
                    let str = String::from_sql(value)?;
                    Ok(<Self as std::str::FromStr>::from_str(&str).map_err(|_| {
                        format!(
                            "Variant = {} not found for Type = {}",
                            &str,
                            std::any::type_name::<$type>()
                        )
                    })?)
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
                    Ok(<Self as std::str::FromStr>::from_str(&str).map_err(|_| {
                        format!(
                            "Variant = {} not found for Type = {}",
                            &str,
                            std::any::type_name::<$type>()
                        )
                    })?)
                }
            }
        };
    }

    pub(crate) use impl_enum_str_diesel;
    pub(crate) use impl_enum_string_diesel;
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
}
