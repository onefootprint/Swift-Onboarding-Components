use newtypes::DupeKind;
use newtypes::FpId;
use newtypes::LabelKind;
use newtypes::TagKind;
use paperclip::actix::Apiv2Response;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PublicDuplicateFingerprint {
    pub fp_id: FpId,
    pub labels: Vec<LabelKind>,
    pub tags: Vec<TagKind>,
    pub kind: Option<DupeKind>,
}
