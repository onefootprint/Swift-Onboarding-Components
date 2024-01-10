use crate::PiiString;
use serde::Serialize;

#[derive(Serialize, Clone, Debug)]
pub struct TenantBusinessInfo {
    pub company_name: PiiString,
    pub address_line1: PiiString,
    pub city: PiiString,
    pub state: PiiString,
    pub zip: PiiString,
    pub phone: PiiString,
}
