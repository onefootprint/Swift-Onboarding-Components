use paperclip::v2::schema::TypedData;
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::str::FromStr;

#[derive(Debug, Clone, DeserializeFromStr, SerializeDisplay, DieselNewType, Default, JsonSchema)]
#[serde(transparent)]
pub struct OrgMemberEmail(pub String);

impl FromStr for OrgMemberEmail {
    type Err = crate::Error;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self(s.to_owned().to_lowercase()))
    }
}

impl std::fmt::Display for OrgMemberEmail {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl TypedData for OrgMemberEmail {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }
}
