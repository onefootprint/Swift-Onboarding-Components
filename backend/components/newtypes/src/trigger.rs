use paperclip::actix::Apiv2Schema;

use serde::Deserialize;
use serde_with::SerializeDisplay;
use strum_macros::{Display, EnumDiscriminants};

use crate::{DocumentRequestConfig, ObConfigurationId};

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema, EnumDiscriminants)]
#[strum_discriminants(
    name(TriggerKind),
    vis(pub),
    derive(Display, SerializeDisplay, Apiv2Schema),
    strum(serialize_all = "snake_case")
)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum TriggerInfo {
    /// Allow editing data, re-verify data, and then re-trigger decision engine
    /// TODO deprecate this one
    RedoKyc,
    /// Onboard the user onto the requested playbook.
    /// Allows editing data, re-verifies data, and then re-triggers decision engine
    Onboard {
        playbook_id: ObConfigurationId,
    },
    Document {
        configs: Vec<DocumentRequestConfig>,
    },
    /// Upload a new document and re-run the decision engine
    /// DEPRECATED
    IdDocument {
        collect_selfie: bool,
    },
    /// DEPRECATED
    ProofOfSsn,
    /// DEPRECATED
    ProofOfAddress,
}
