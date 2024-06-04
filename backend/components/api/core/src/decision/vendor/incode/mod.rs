pub mod common;
pub mod curp_validation;
pub mod incode_watchlist;
mod state;
mod state_machine;
pub mod states;

use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiResult;
use crate::State;
use db::models::ob_configuration::ObConfiguration;
use newtypes::output::Csv;
use newtypes::{
    IdDocKind,
    IncodeConfigurationId,
    Iso3166TwoDigitCountryCode,
    TenantId,
};
pub use state_machine::*;


// TEMP: will get this into State + TVC properly
pub fn get_config_id(
    state: &State,
    is_selfie: bool,
    is_sandbox: bool,
    tenant_id: &TenantId,
    override_id: Option<IncodeConfigurationId>,
) -> IncodeConfigurationId {
    if let Some(id) = override_id {
        id
    } else {
        let use_demo_creds_in_livemode =
            state
                .ff_client
                .flag(feature_flag::BoolFlag::UseIncodeDemoCredentialsInLivemode(
                    tenant_id,
                ));
        let use_demo_credentials = is_sandbox || use_demo_creds_in_livemode;

        let id = if is_selfie {
            state.config.incode.selfie_flow_id(use_demo_credentials)
        } else {
            state.config.incode.document_flow_id(use_demo_credentials)
        };

        IncodeConfigurationId::from(id.leak_to_string())
    }
}

// TODO: better home for this?
pub fn validate_doc_type_is_allowed(
    obc: &ObConfiguration,
    document_type: IdDocKind,
    residential_country: Option<Iso3166TwoDigitCountryCode>,
    country_code: Iso3166TwoDigitCountryCode,
) -> ApiResult<()> {
    let document_to_country_mapping = obc.supported_country_mapping_for_document(residential_country);
    let Some(allowed_doc_types) = document_to_country_mapping.get(&country_code) else {
        // this country is not in our available countries
        return Err(
            OnboardingError::UnsupportedDocumentCountryForDocumentType(Csv::from(
                document_to_country_mapping.keys().cloned().collect::<Vec<_>>(),
            ))
            .into(),
        );
    };

    // Validate that we support this doc type for the given country
    if !allowed_doc_types.contains(&document_type) {
        Err(OnboardingError::UnsupportedDocumentType(Csv::from(allowed_doc_types.clone())).into())
    } else {
        Ok(())
    }
}
