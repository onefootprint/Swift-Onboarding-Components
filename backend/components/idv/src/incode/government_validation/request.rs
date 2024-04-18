use newtypes::vendor_credentials::IncodeCredentialsWithToken;

pub struct IncodeGovernmentValidationRequest {
    pub config: GovernmentValidationConfigByCountry,
    pub credentials: IncodeCredentialsWithToken,
}

pub enum GovernmentValidationConfigByCountry {
    Mexico(MXRequestConfig),
}

/// Government Validation for Incode works (i think) by hitting the gov't API and/or scraping a cached version of the gov't website (at least for MX)
/// There are a few parameters incode exposes to control whether we only scrape or try hitting the gov't API then falling back to scraping
/// Their docs are really unclear on what combinations work together and what the behavior is https://developer.incode.com/reference/processgovernmentvalidation
#[derive(Debug, Clone)]
pub enum MXRequestConfig {
    /// If this is true and there's some connection or infrastructure error with the INE service, validation by scraping will start
    FallbackEnabled,
    /// If this is true, then direct connection to INE service won't be attempted and the scraping approach will be used instead
    ScrapingOnly,
}

#[derive(Debug, Clone, serde::Serialize, Default)]
pub struct GovernmentValidationRequestQueryParams {
    #[serde(rename = "scrapingV3")]
    #[serde(skip_serializing_if = "Option::is_none")]
    scraping_only: Option<bool>,
    #[serde(rename = "fallbackEnabled")]
    #[serde(skip_serializing_if = "Option::is_none")]
    fall_back_enabled: Option<bool>,
}

impl From<GovernmentValidationConfigByCountry> for GovernmentValidationRequestQueryParams {
    fn from(config: GovernmentValidationConfigByCountry) -> GovernmentValidationRequestQueryParams {
        match config {
            GovernmentValidationConfigByCountry::Mexico(mx_config) => match mx_config {
                MXRequestConfig::FallbackEnabled => GovernmentValidationRequestQueryParams {
                    fall_back_enabled: Some(true),
                    ..Default::default()
                },
                MXRequestConfig::ScrapingOnly => GovernmentValidationRequestQueryParams {
                    scraping_only: Some(true),
                    ..Default::default()
                },
            },
        }
    }
}
