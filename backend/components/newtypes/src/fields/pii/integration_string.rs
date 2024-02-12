use std::fmt::Display;

use crate::{api_schema_helper::string_api_data_type_alias, PiiString};
use serde::{Deserialize, Serialize, Serializer};


#[derive(Clone, Default, PartialEq, Eq, Hash, Deserialize)]
pub struct AlpacaPiiString(PiiString);
impl AlpacaPiiString {
    // Alpaca has a lot of rules around what format they accept
    // https://docs.alpaca.markets/docs/data-validations
    fn clean_and_leak(&self) -> String {
        // no trailing/leading spaces
        let original = self.0.leak().trim();

        // no non-ascii
        deunicode::deunicode(original)
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
        let original = self.clean_and_leak();

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
    #[test_case("é à", "e a")] // non ascii
    fn test_serialize(original: &str, expected_alpaca: &str) {
        let p = PiiString::from(original);
        let a: AlpacaPiiString = p.clone().into();

        let serialized_p = serde_json::to_value(p).unwrap();
        let serialized_a = serde_json::to_value(a).unwrap();

        // normal PiiString passes this through
        assert_eq!(serialized_p, Value::String(original.into()));
        // alpaca does
        assert_eq!(serialized_a, Value::String(expected_alpaca.into()));
    }
}
