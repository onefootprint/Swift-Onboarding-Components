use newtypes::ExternalId;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Apiv2Schema, serde::Deserialize)]
pub struct UpdateEntityRequest {
    /// Optionally, the new external ID for the entity. Can only be composed of alphanumeric
    /// characters, underscores, hyphens, and periods. If an entity with this external ID
    /// already exists, returns a 400.
    pub external_id: Option<ExternalId>,
}
