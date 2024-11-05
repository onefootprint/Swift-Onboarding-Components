use newtypes::samba::SambaAddress;
use newtypes::samba::SambaData;
use newtypes::vendor_credentials::SambaSafetyCredentials;
use newtypes::PiiString;
use newtypes::SambaOrderId;
use newtypes::SambaReportId;
use serde::Serialize;
use std::marker::PhantomData;

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

pub struct SambaGetReportRequest<T> {
    pub credentials: SambaSafetyCredentials,
    pub report_id: SambaReportId,
    pub _phantom: PhantomData<T>,
}
impl<T> SambaGetReportRequest<T> {
    pub fn new(credentials: SambaSafetyCredentials, report_id: SambaReportId) -> Self {
        Self {
            credentials,
            report_id,
            _phantom: PhantomData::<T>,
        }
    }
}


pub struct SambaOrderRequest<T> {
    pub credentials: SambaSafetyCredentials,
    pub data: SambaData,
    pub _phantom: PhantomData<T>,
}

impl<T> SambaOrderRequest<T> {
    pub fn new(credentials: SambaSafetyCredentials, data: SambaData) -> Self {
        Self {
            credentials,
            data,
            _phantom: PhantomData::<T>,
        }
    }
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
