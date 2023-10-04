mod state;
mod state_machine;
pub mod states;

use newtypes::{IncodeConfigurationId, TenantId};
pub use state_machine::*;

use crate::State;

#[cfg(test)]
mod images;
#[cfg(test)]
mod test;

// TEMP: will get this into State + TVC properly
pub fn get_config_id(
    state: &State,
    is_selfie: bool,
    is_sandbox: bool,
    tenant_id: &TenantId,
) -> IncodeConfigurationId {
    let use_demo_creds_in_livemode =
        state
            .feature_flag_client
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
