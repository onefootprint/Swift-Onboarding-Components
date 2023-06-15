mod state;
mod state_machine;
pub mod states;

use idv::incode::client::{INCODE_SANDBOX_DOCUMENT_FLOW_ID, INCODE_SANDBOX_SELFIE_FLOW_ID};
use newtypes::IncodeConfigurationId;
pub use state_machine::*;

#[cfg(test)]
mod images;
#[cfg(test)]
mod test;

// TEMP: will get this into State + TVC properly
pub fn get_config_id(is_selfie: bool) -> IncodeConfigurationId {
    let id = if is_selfie {
        INCODE_SANDBOX_SELFIE_FLOW_ID
    } else {
        INCODE_SANDBOX_DOCUMENT_FLOW_ID
    };

    IncodeConfigurationId::from(id.to_string())
}
