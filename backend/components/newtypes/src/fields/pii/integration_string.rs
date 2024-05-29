use crate::api_schema_helper::string_api_data_type_alias;
use crate::PiiString;
use serde::ser::Error;
use serde::{
    Deserialize,
    Serialize,
    Serializer,
};
use std::fmt::Display;
use std::str::Utf8Error;

#[derive(Clone, Default, PartialEq, Eq, Hash, Deserialize)]
pub struct AlpacaPiiString(PiiString);
impl AlpacaPiiString {
    // Alpaca has a lot of rules around what format they accept
    // https://docs.alpaca.markets/docs/data-validations
    fn clean_and_leak(&self) -> Result<String, Utf8Error> {
        // no trailing/leading spaces
        let original = self.0.leak().trim();

        // no non-ascii and convert tabs to spaces
        let buf: Vec<u8> = deunicode::deunicode(original)
            .as_bytes()
            .iter()
            // convert tabs to spaces
            .map(|c| if *c == 9 { 32 } else { *c })
            .collect();

        // Ascii is valid UTF8, which we know we have from calling deunicode, so this shouldn't fail
        Ok(core::str::from_utf8(&buf)?.to_string())
    }

    pub fn into_inner(self) -> PiiString {
        self.0
    }
}

string_api_data_type_alias!(AlpacaPiiString);

// Custom implementation for alpaca so we can standardize with the validations
impl Serialize for AlpacaPiiString {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let original = self
            .clean_and_leak()
            .map_err(|e| Error::custom(format!("clean_and_leak failed with {}", e)))?;

        serializer.serialize_str(&original)
    }
}

impl std::fmt::Debug for AlpacaPiiString {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl From<PiiString> for AlpacaPiiString {
    fn from(value: PiiString) -> Self {
        Self(value)
    }
}

impl<T> From<T> for AlpacaPiiString
where
    T: Display,
{
    fn from(pii: T) -> Self {
        Self(PiiString::from(format!("{}", pii)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;
    use test_case::test_case;

    #[test_case(" hi there ", "hi there")] // trailing and leading spaces removed
    #[test_case(" é\t à", "e  a")] // non ascii with tabs
    fn test_serialize(original: &str, expected_alpaca: &str) {
        let p = PiiString::from(original);
        let a: AlpacaPiiString = p.clone().into();

        let serialized_p = serde_json::to_value(p).unwrap();
        let serialized_a = serde_json::to_value(a).unwrap();

        // normal PiiString passes this through
        assert_eq!(serialized_p, Value::String(original.into()));
        // alpaca has formats applied
        assert_eq!(serialized_a, Value::String(expected_alpaca.into()));
    }
}
