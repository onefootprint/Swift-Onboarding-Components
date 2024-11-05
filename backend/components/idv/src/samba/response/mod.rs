use newtypes::PiiString;
use newtypes::SambaReportId;
use serde::Deserialize;
use serde::Serialize;
use std::str::FromStr;
use strum_macros::EnumString;

pub(crate) mod auth;
pub mod license_validation;
pub mod webhook;


#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateOrderResponse {
    pub order_id: PiiString,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderStatusResponse {
    pub order_id: String,
    pub order_status: String,
    pub control_number: Option<serde_json::Value>,
    pub order_date_time: Option<serde_json::Value>,
    pub order_completed_date_time: Option<serde_json::Value>,
    pub links: OrderStatusLinks,
}

impl OrderStatusResponse {
    pub fn report_id(&self) -> Option<SambaReportId> {
        // would we have more reports here?
        self.links
            .get_link(SambaLinkType::LicenseReports)
            .map(|l| l.report_id.into())
    }
}


#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct OrderStatusLink {
    pub rel: String,
    pub href: String,
    #[serde(rename = "type")]
    pub http_method: String,
    #[serde(rename = "id")]
    pub report_id: String,
}

#[derive(EnumString, PartialEq, Eq)]
pub enum SambaLinkType {
    #[strum(serialize = "activityreports")]
    ActivityReports,
    #[strum(serialize = "licensereports")]
    LicenseReports,
}
#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct OrderStatusLinks(pub Vec<OrderStatusLink>);
impl OrderStatusLinks {
    pub fn get_link(&self, link_type: SambaLinkType) -> Option<OrderStatusLink> {
        self.0
            .iter()
            .find(|osl| {
                let link = osl.rel.clone();
                SambaLinkType::from_str(link.as_str())
                    .map(|l| l == link_type)
                    .unwrap_or(false)
            })
            .cloned()
    }
}
