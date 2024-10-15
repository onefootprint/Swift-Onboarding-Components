use newtypes::BoLinkId;
use newtypes::DataIdentifier;
use newtypes::PiiString;
use paperclip::actix::Apiv2Response;
use std::collections::HashMap;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct HostedBusinessOwner {
    pub id: BoLinkId,
    /// True if a user has already started onboarding as this beneficial owner. In this case, the
    /// data below comes directly from that user's vault.
    pub has_linked_user: bool,
    /// True if this beneficial owner represents the currently authed user.
    pub is_authed_user: bool,
    pub decrypted_data: HashMap<DataIdentifier, PiiString>,
    pub populated_data: Vec<DataIdentifier>,
    pub ownership_stake: Option<u32>,
}
