use crate::*;
use newtypes::{
    FpId,
    PiiJsonValue,
    PiiString,
};

#[derive(Debug, Clone, Apiv2Schema, Deserialize)]
pub struct AlpacaCipRequest {
    /// API Key to use with alpaca
    pub api_key: PiiString,

    /// API Secret to use with alpaca
    pub api_secret: PiiString,

    /// The default approver name/email to use for automatically approved users. This will be
    /// overwritten if done by a manual reviewer
    pub default_approver: PiiString,

    /// Alpaca Hostname to use (i.e. sandbox or production, like:
    /// `broker-api.sandbox.alpaca.markets`)
    pub hostname: String,

    /// The associated user's alpaca account id
    pub account_id: String,
}

#[derive(Debug, Clone, Apiv2Schema, Deserialize)]
pub struct DeprecatedAlpacaCipRequest {
    /// the footprint user id on behalf of which to send the request
    pub fp_user_id: FpId,

    /// API Key to use with alpaca
    pub api_key: PiiString,

    /// API Secret to use with alpaca
    pub api_secret: PiiString,

    /// The default approver name/email to use for automatically approved users. This will be
    /// overwritten if done by a manual reviewer
    pub default_approver: PiiString,

    /// Alpaca Hostname to use (i.e. sandbox or production, like:
    /// `broker-api.sandbox.alpaca.markets`)
    pub hostname: String,

    /// The associated user's alpaca account id
    pub account_id: String,
}

#[derive(Debug, Clone, Apiv2Schema, Serialize)]
pub struct AlpacaCipResponse {
    /// Alpaca response HTTP status code
    pub status_code: u16,

    /// Response body from Alpaca
    pub alpaca_response: PiiJsonValue,
}
