use newtypes::put_data_request::RawUserDataRequest;
use newtypes::BoLinkId;
use newtypes::DataIdentifier;
use newtypes::PiiString;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct HostedBusinessOwner {
    pub link_id: BoLinkId,
    pub uuid: Uuid,
    /// True if a user has already started onboarding as this beneficial owner. In this case, the
    /// data below comes directly from that user's vault.
    pub has_linked_user: bool,
    /// True if this beneficial owner represents the currently authed user.
    pub is_authed_user: bool,
    /// True if this beneficial owner is editable by the currently authed user.
    pub is_mutable: bool,
    pub decrypted_data: HashMap<DataIdentifier, PiiString>,
    pub populated_data: Vec<DataIdentifier>,
    pub ownership_stake: Option<u32>,
}

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct CreateHostedBusinessOwnerRequest {
    pub uuid: Uuid,
    pub data: RawUserDataRequest,
    pub ownership_stake: u32,
}

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct UpdateHostedBusinessOwnerRequest {
    pub uuid: Uuid,
    #[serde(default)]
    pub data: RawUserDataRequest,
    pub ownership_stake: Option<u32>,
}

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct DeleteHostedBusinessOwnerRequest {
    pub uuid: Uuid,
}

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
#[serde(tag = "op")]
#[serde(rename_all = "snake_case")]
#[openapi(
    example = r#"{"op": "create", "uuid": "73b7e274-8080-44d6-b160-86cbc9877a00", "data": {"id.first_name": "John", "id.last_name": "Doe"}, "ownership_stake": 30}"#
)]
pub enum BatchHostedBusinessOwnerRequest {
    Update(UpdateHostedBusinessOwnerRequest),
    Create(CreateHostedBusinessOwnerRequest),
    Delete(DeleteHostedBusinessOwnerRequest),
}
