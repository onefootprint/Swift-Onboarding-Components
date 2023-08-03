mod state;
mod state_machine;
pub mod states;

use newtypes::IncodeConfigurationId;
pub use state_machine::*;

use crate::config::Config;

#[cfg(test)]
mod images;
#[cfg(test)]
mod test;

// TEMP: will get this into State + TVC properly
pub fn get_config_id(config: &Config, is_selfie: bool, is_sandbox: bool) -> IncodeConfigurationId {
    let id = if is_selfie {
        config.incode.selfie_flow_id(is_sandbox)
    } else {
        config.incode.document_flow_id(is_sandbox)
    };

    IncodeConfigurationId::from(id.leak_to_string())
}
