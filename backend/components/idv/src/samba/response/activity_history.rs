use newtypes::ScrubbedPiiJsonValue;
use serde::Deserialize;
use serde::Serialize;


#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetAHOrderResponse {
    pub report_id: String,
    pub report_date_time: String,
    pub report_order: Option<ScrubbedPiiJsonValue>,
    pub report_order_result: Option<ScrubbedPiiJsonValue>,
    pub court_record: Option<ScrubbedPiiJsonValue>,
    pub public_record: Option<ScrubbedPiiJsonValue>,
}
