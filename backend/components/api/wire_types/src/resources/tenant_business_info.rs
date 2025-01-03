use newtypes::PiiString;
use paperclip::actix::Apiv2Response;
use serde::Serialize;

#[derive(Debug, Serialize, Clone, Apiv2Response, macros::JsonResponder)]
pub struct TenantBusinessInfo {
    pub company_name: PiiString,
    pub address_line1: PiiString,
    pub city: PiiString,
    pub state: PiiString,
    pub zip: PiiString,
    pub phone: PiiString,
}
