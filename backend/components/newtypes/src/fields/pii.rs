use crate::Base64Data;

use super::api_schema_helper::string_api_data_type_alias;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::{
    fmt::{Debug, Display},
    str::{FromStr, Utf8Error},
};

/// Represents a string that hides PII
#[derive(
    Clone, Deserialize, Serialize, Default, PartialEq, Eq, Hash, JsonSchema, AsExpression, FromSqlRow,
)]
#[diesel(sql_type = Text)]
#[serde(transparent)]
pub struct PiiString(String);

impl diesel::serialize::ToSql<Text, diesel::pg::Pg> for PiiString {
    fn to_sql<'b>(
        &'b self,
        out: &mut diesel::serialize::Output<'b, '_, diesel::pg::Pg>,
    ) -> diesel::serialize::Result {
        <String as diesel::serialize::ToSql<Text, diesel::pg::Pg>>::to_sql(
            &self.leak_to_string(),
            &mut out.reborrow(),
        )
    }
}

impl diesel::deserialize::FromSql<Text, diesel::pg::Pg> for PiiString {
    fn from_sql(value: diesel::pg::PgValue<'_>) -> diesel::deserialize::Result<Self> {
        let str = String::from_sql(value)?;
        Ok(Self::from_str(&str)?)
    }
}

impl PiiString {
    /// try to decode a pii string that is base64
    pub fn try_decode_base64(&self) -> Result<PiiBytes, base64::DecodeError> {
        Ok(PiiBytes(Base64Data::from_str_standard(self.leak())?.0))
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn safe_compare(&self, other: &PiiString) -> bool {
        crypto::sha256(self.leak().as_bytes()) == crypto::sha256(other.leak().as_bytes())
    }
}

/// Represents a Vec<u8> that hides PII
#[derive(Clone, Deserialize, Serialize, Default, PartialEq, Eq, Hash, JsonSchema)]
#[serde(transparent)]
pub struct PiiBytes(Vec<u8>);

impl PiiBytes {
    pub fn new(data: Vec<u8>) -> Self {
        Self(data)
    }

    pub fn into_leak_base64(self) -> Base64Data {
        Base64Data(self.0)
    }

    pub fn into_leak(self) -> Vec<u8> {
        self.0
    }

    pub fn leak_slice(&self) -> &[u8] {
        &self.0
    }

    pub fn into_leak_base64_pii(self) -> PiiString {
        PiiString::from(self.into_leak_base64().to_string_standard().0)
    }
}

/// Like PiiString, but scrubs the serde::Serialize implementation
#[derive(Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash, derive_more::Deref)]
#[serde(transparent)]
pub struct ScrubbedPiiString(
    #[serde(serialize_with = "scrubbed_str")]
    #[deref]
    PiiString,
);

impl ScrubbedPiiString {
    pub fn new(s: PiiString) -> Self {
        Self(s)
    }
}

impl<T> From<T> for ScrubbedPiiString
where
    T: Display,
{
    fn from(pii: T) -> Self {
        Self(format!("{}", pii).into())
    }
}

impl From<PiiString> for ScrubbedPiiString {
    fn from(pii: PiiString) -> Self {
        Self(pii)
    }
}

impl From<ScrubbedPiiString> for PiiString {
    fn from(value: ScrubbedPiiString) -> Self {
        value.0
    }
}

fn scrubbed_str<S>(_v: &PiiString, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str("<SCRUBBED>")
}

pub fn scrub_value<S>(_v: &Option<serde_json::Value>, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str("<SCRUBBED>")
}

pub fn scrub_pii_value<S>(_v: &Option<PiiJsonValue>, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str("<SCRUBBED>")
}

impl<T> From<T> for PiiString
where
    T: Display,
{
    fn from(pii: T) -> Self {
        Self(format!("{}", pii))
    }
}

impl FromStr for PiiString {
    type Err = crate::Error;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self(s.to_owned()))
    }
}

impl PiiString {
    pub fn new(pii: String) -> Self {
        Self(pii)
    }

    pub fn leak(&self) -> &str {
        &self.0
    }

    pub fn leak_to_string(&self) -> String {
        self.0.clone()
    }

    /// compare PII to string
    pub fn equals(&self, s: &str) -> bool {
        self.0 == s
    }

    pub fn clean_for_fingerprint(&self) -> PiiString {
        PiiString(self.0.trim().to_lowercase())
    }

    pub fn deserialize<T>(&self) -> serde_json::error::Result<T>
    where
        T: serde::de::DeserializeOwned,
    {
        let result = serde_json::de::from_str(self.leak())?;
        Ok(result)
    }
}

impl TryFrom<PiiBytes> for PiiString {
    type Error = Utf8Error;

    fn try_from(value: PiiBytes) -> Result<Self, Self::Error> {
        Ok(PiiString::new(std::str::from_utf8(&value.0)?.to_string()))
    }
}

impl Debug for PiiString {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted>")
    }
}

impl Debug for PiiBytes {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted bytes>")
    }
}

impl Debug for ScrubbedPiiString {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl From<PiiString> for reqwest::Body {
    fn from(v: PiiString) -> Self {
        Self::from(v.0)
    }
}

string_api_data_type_alias!(PiiString);

/// Represents a struct that hides PII contained in JsonValues (usually from vendor responses)
#[derive(Clone, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(transparent)]
pub struct PiiJsonValue(serde_json::Value);

impl PiiJsonValue {
    pub fn new(value: serde_json::Value) -> Self {
        Self(value)
    }

    pub fn leak(&self) -> &serde_json::Value {
        &self.0
    }

    pub fn into_leak(self) -> serde_json::Value {
        self.0
    }

    // this will error if value has non-string keys
    pub fn leak_to_vec(&self) -> Result<Vec<u8>, serde_json::Error> {
        serde_json::to_vec(self.leak())
    }
}

impl paperclip::v2::schema::TypedData for PiiJsonValue {}

impl From<serde_json::Value> for PiiJsonValue {
    fn from(value: serde_json::Value) -> Self {
        Self(value)
    }
}

impl Debug for PiiJsonValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted json value>")
    }
}

// used in the decrypt path
impl TryFrom<Vec<u8>> for PiiJsonValue {
    type Error = serde_json::Error;

    fn try_from(vec: Vec<u8>) -> Result<Self, Self::Error> {
        serde_json::from_slice(vec.as_slice()).map(Self::new)
    }
}

impl TryFrom<PiiBytes> for PiiJsonValue {
    type Error = serde_json::Error;

    fn try_from(value: PiiBytes) -> Result<Self, Self::Error> {
        Self::try_from(value.into_leak())
    }
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct ScrubbedPiiJsonValue(serde_json::Value);
impl ScrubbedPiiJsonValue {
    pub fn scrub<T: serde::Serialize>(s: T) -> Result<Self, serde_json::Error> {
        let val = serde_json::to_value(s)?;
        Ok(Self(val))
    }
    pub fn inner(self) -> serde_json::Value {
        self.0
    }
}

impl From<ScrubbedPiiJsonValue> for serde_json::Value {
    fn from(v: ScrubbedPiiJsonValue) -> Self {
        v.0
    }
}

impl From<serde_json::Value> for ScrubbedPiiJsonValue {
    fn from(v: serde_json::Value) -> Self {
        Self(v)
    }
}

impl From<ScrubbedPiiJsonValue> for PiiJsonValue {
    fn from(s: ScrubbedPiiJsonValue) -> Self {
        Self(s.0)
    }
}

impl Debug for ScrubbedPiiJsonValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted json value>")
    }
}

#[macro_use]
pub mod macros {
    #[macro_export]
    /// quickly define pii
    macro_rules! pii {
        ($lit:expr) => {
            PiiString::from($lit)
        };
    }

    #[macro_export]
    /// quickly format pii
    macro_rules! format_pii {
        ($f: tt, $($valn:expr),*) => {
            PiiString::from(format!($f, $($valn.leak(),)*))
        };
    }

    #[cfg(test)]
    mod tests {
        use super::super::PiiString;

        #[test]
        fn test_pii_macros() {
            assert_eq!(pii!("hi").leak(), "hi");

            let hello = pii!("hello");
            let world = pii!("world");
            let hello2 = format_pii!("world {}", hello);
            assert_eq!(hello2.leak(), "world hello");
            let hello_world = format_pii!("message = {},{}", hello, world);
            assert_eq!(hello_world.leak(), "message = hello,world");
        }
    }

    pub use format_pii;
    pub use pii;
}
