use crate::*;
use alpaca::types::account::AccountType;
use alpaca::types::account::Agreement;
use alpaca::types::account::AssetClass;
use alpaca::types::account::Disclosures;
use alpaca::types::account::TrustedContact;
use newtypes::FpId;
use newtypes::PiiJsonValue;
use newtypes::PiiString;

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

#[derive(Debug, Clone, Apiv2Response, Serialize, macros::JsonResponder)]
pub struct AlpacaCreateAccountResponse {
    /// alpaca response HTTP status code
    pub status_code: u16,

    /// response from alpaca
    pub alpaca_response: PiiJsonValue,
}
