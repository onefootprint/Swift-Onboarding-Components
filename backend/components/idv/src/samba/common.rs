use newtypes::samba::SambaAddress;
use newtypes::samba::SambaData;
use newtypes::vendor_credentials::SambaSafetyCredentials;
use newtypes::PiiString;
use newtypes::SambaOrderId;
use newtypes::SambaReportId;
use serde::Serialize;


#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SambaOrderAddress {
    pub street: PiiString,
    pub city: PiiString,
    pub state: PiiString,
    pub zip_code: PiiString,
}

pub struct SambaCheckOrderStatusRequest {
    pub credentials: SambaSafetyCredentials,
    pub order_id: SambaOrderId,
}

pub struct SambaGetReportRequest {
    pub credentials: SambaSafetyCredentials,
    pub report_id: SambaReportId,
}

pub struct SambaOrderRequest {
    pub credentials: SambaSafetyCredentials,
    pub data: SambaData,
}


impl From<SambaAddress> for SambaOrderAddress {
    fn from(value: SambaAddress) -> Self {
        let SambaAddress {
            street,
            city,
            state,
            zip_code,
        } = value;
        SambaOrderAddress {
            street,
            city,
            state,
            zip_code,
        }
    }
}
