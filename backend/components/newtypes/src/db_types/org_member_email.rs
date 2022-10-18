use schemars::JsonSchema;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, DieselNewType, Default, JsonSchema)]
#[serde(transparent)]
pub struct OrgMemberEmail(pub String);

impl From<String> for OrgMemberEmail {
    fn from(s: String) -> Self {
        Self(s.to_lowercase())
    }
}
