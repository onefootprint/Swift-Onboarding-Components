use crate::*;

#[derive(Debug, Clone, Apiv2Schema, JsonSchema, Deserialize)]
pub struct AlpacaCipRequest {
    /// the footprint user id on behalf of which to send the request
    pub fp_user_id: FpId,

    /// API Key to use with alpaca
    pub api_key: PiiString,

    /// API Secret to use with alpaca
    pub api_secret: PiiString,

    /// The default approver name/email to use for automatically approved users
    /// This will be overwritten if done by a manual reviewer
    pub default_approver: PiiString,

    /// Alpaca Hostname to use (i.e. sandbox or production like: )
    /// for example: `broker-api.sandbox.alpaca.markets`
    pub hostname: String,

    /// The associated user's alpaca account id
    pub account_id: String,
}

export_schema!(AlpacaCipRequest);

#[derive(Debug, Clone, Apiv2Schema, JsonSchema, Serialize)]
pub struct AlpacaCipResponse {
    /// alpaca response HTTP status code
    pub status_code: u16,

    /// response from alpaca
    #[schemars(with = "serde_json::Value")]
    pub alpaca_response: PiiJsonValue,
}

export_schema!(AlpacaCipResponse);
