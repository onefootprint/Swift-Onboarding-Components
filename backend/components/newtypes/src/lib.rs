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

pub mod fields;
pub use fields::*;

pub mod db_types;
pub use db_types::*;

pub mod data_identifier;
pub use data_identifier::*;

mod b64;
pub use b64::Base64Data;
pub use serde;

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

#[derive(Debug, Clone, thiserror::Error)]
pub enum Error {
    #[error("invalid length ssn")]
    InvalidSsn,
    #[error("invalid email address")]
    InvalidEmail,
    #[error("dob error: {0}")]
    DobError(#[from] DobError),
    #[error("address error: {0}")]
    AddressError(#[from] AddressError),
    #[error("phone error: {0}")]
    PhoneError(#[from] PhoneError),
    #[error("Serde error")]
    SerdeError,
    #[error("Error deserializing")]
    DeserializeError,
    #[error("{0}")]
    ProxyTokenError(#[from] ProxyTokenError),
}

pub type NtResult<T> = Result<T, Error>;

#[derive(Debug, Clone, thiserror::Error)]
pub enum PhoneError {
    #[error("invalid phone number")]
    InvalidPhoneNumber,
    #[error("Invalid sandbox suffix. Suffix must be non-empty, alphanumeric string")]
    InvalidSandboxSuffix,
}

#[derive(Debug, Clone, thiserror::Error)]
pub enum DobError {
    #[error("Nonexistant date for dob %Y-%m-%d: {0}")]
    NonexistantDate(String),
    #[error("Invalid day for dob")]
    InvalidDay,
    #[error("Invalid month for dob")]
    InvalidMonth,
    #[error("Invalid year for dob")]
    InvalidYear,
    #[error("Cannot parse DOB")]
    InvalidDob,
}

#[derive(Debug, Clone, thiserror::Error)]
pub enum AddressError {
    #[error("invalid zip code, zip code must be alphanumeric: {0}")]
    InvalidZip(String),
    #[error("invalid country code: {0}, country code must be 2-digit ISO 3166-1 Alpha 2")]
    InvalidCountry(String),
    #[error("invalid state code: {0}, state code must be 2-digit U.S. State")]
    InvalidState(String),
    #[error("invalid address provided: {0}, address must not contain special characters other than #")]
    InvalidAddressCharacters(String),
    #[error("invalid characters provided: {0}, city and/or state must not contain special characters")]
    InvalidCharacters(String),
}

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
