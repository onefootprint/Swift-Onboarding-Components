use std::collections::HashSet;

use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ClientTokenRequest {
    /// List of data identifiers to which this token will have access. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    pub fields: HashSet<DataIdentifier>,
}

export_schema!(ClientTokenRequest);

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ClientTokenResponse {
    /// The short-lived token that gives temporary access to perform operations for this user
    pub token: SessionAuthToken,
}

export_schema!(ClientTokenResponse);
