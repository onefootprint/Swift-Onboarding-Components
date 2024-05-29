use crate::*;
use alpaca::types::account::{
    AccountType,
    Agreement,
    AssetClass,
    Disclosures,
    TrustedContact,
};
use newtypes::{
    FpId,
    PiiJsonValue,
    PiiString,
};

#[derive(Debug, Clone, Apiv2Schema, Deserialize)]
pub struct AlpacaCreateAccountRequest {
    /// API Key to use with alpaca
    pub api_key: PiiString,

    /// API Secret to use with alpaca
    pub api_secret: PiiString,

    /// Alpaca Hostname to use (i.e. sandbox or production, like:
    /// `broker-api.sandbox.alpaca.markets`)
    pub hostname: String,

    pub enabled_assets: Option<Vec<AssetClass>>,
    pub disclosures: Option<Disclosures>,
    pub agreements: Option<Vec<Agreement>>,
    pub trusted_contact: Option<TrustedContact>,
    pub account_type: Option<AccountType>,
}

#[derive(Debug, Clone, Apiv2Schema, Deserialize)]
pub struct DeprecatedAlpacaCreateAccountRequest {
    /// the footprint user id on behalf of which to send the request
    pub fp_user_id: FpId,

    /// API Key to use with alpaca
    pub api_key: PiiString,

    /// API Secret to use with alpaca
    pub api_secret: PiiString,

    /// Alpaca Hostname to use (i.e. sandbox or production, like:
    /// `broker-api.sandbox.alpaca.markets`)
    pub hostname: String,

    pub enabled_assets: Option<Vec<AssetClass>>,
    pub disclosures: Option<Disclosures>,
    pub agreements: Option<Vec<Agreement>>,
    pub trusted_contact: Option<TrustedContact>,
    pub account_type: Option<AccountType>,
}

#[derive(Debug, Clone, Apiv2Schema, Serialize)]
pub struct AlpacaCreateAccountResponse {
    /// alpaca response HTTP status code
    pub status_code: u16,

    /// response from alpaca
    pub alpaca_response: PiiJsonValue,
}
