use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::Deserialize;
use serde_with::SerializeDisplay;
use strum_macros::{Display, EnumDiscriminants};

#[derive(Debug, Clone, Copy, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema, EnumDiscriminants)]
#[strum_discriminants(
    name(TriggerKind),
    vis(pub),
    derive(Display, SerializeDisplay, Apiv2Schema, JsonSchema),
    strum(serialize_all = "snake_case")
)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum TriggerInfo {
    /// Allow editing data, re-verify data, and then re-trigger decision engine
    RedoKyc,
    /// Upload a new document and re-run the decision engine
    IdDocument {
        collect_selfie: bool,
    },
    RedoKyb,
    // TODO in the future, support BusinessOwnerLink, FinishKyc?, EditData?
}
