use crate::{Base64Data, PiiBytes};

use super::super::api_schema_helper::string_api_data_type_alias;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};

use serde::{Deserialize, Serialize};
use std::{
    convert::Infallible,
    fmt::{Debug, Display},
    str::{FromStr, Utf8Error},
};

/// Represents a string that hides PII
#[derive(Clone, Deserialize, Serialize, Default, PartialEq, Eq, Hash, AsExpression, FromSqlRow)]
#[diesel(sql_type = Text)]
#[serde(transparent)]
pub struct PiiString(pub(super) String);

string_api_data_type_alias!(PiiString);

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
        let s = String::from_sql(value)?;
        Ok(PiiString::new(s))
    }
}

impl PiiString {
    /// try to decode a pii string that is base64
    pub fn try_decode_base64(&self) -> Result<PiiBytes, base64::DecodeError> {
        Ok(PiiBytes::new(Base64Data::from_str_standard(self.leak())?.0))
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    // TODO maybe PiiString Eq should be implemented as a safe_compare
    pub fn safe_compare(&self, other: &PiiString) -> bool {
        crypto::sha256(self.leak().as_bytes()) == crypto::sha256(other.leak().as_bytes())
    }

    pub fn map(self, f: fn(String) -> String) -> PiiString {
        f(self.leak_to_string()).into()
    }
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
    type Err = Infallible;

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

    pub fn parse_into<T>(&self) -> Result<T, <T as FromStr>::Err>
    where
        T: FromStr,
    {
        T::from_str(self.leak())
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

/// Like PiiString, but scrubs the serde::Serialize implementation
#[derive(Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash, derive_more::Deref)]
#[serde(transparent)]
pub struct ScrubbedPiiString(
    #[serde(serialize_with = "scrubbed_str")]
    #[deref]
    PiiString,
);

fn scrubbed_str<S>(_v: &PiiString, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str("<SCRUBBED>")
}

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
