use super::license_validation::OrderStatusLink;
use super::license_validation::OrderStatusLinks;
use super::license_validation::SambaLinkType;
use newtypes::SambaOrderId;
use newtypes::SambaWebhookEventType;
use serde::Deserialize;
use serde::Serialize;
use std::str::FromStr;

#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SambaWebhook {
    pub event_id: String,
    pub data: WebhookData,
    pub created_date_time: Option<String>,
    event_type: String,
}
impl SambaWebhook {
    pub fn event_type(&self) -> Option<SambaWebhookEventType> {
        SambaWebhookEventType::from_str(self.event_type.as_str()).ok()
    }

    pub fn get_link(&self, link_type: SambaLinkType) -> Option<OrderStatusLink> {
        self.data.links.get_link(link_type)
    }
}

#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WebhookData {
    pub order_id: SambaOrderId,
    pub links: OrderStatusLinks,
    pub order_date: Option<serde_json::Value>,
    pub product_ordered: Option<serde_json::Value>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;
    #[test_case("activityhistory.received", SambaWebhookEventType::ActivityHistoryReceived)]
    #[test_case(
        "licensevalidation.received",
        SambaWebhookEventType::LicenseValidationReceived
    )]
    #[test_case("activityhistory.error", SambaWebhookEventType::ActivityHistoryError)]
    #[test_case("licensevalidation.error", SambaWebhookEventType::LicenseValidationError)]
    fn test_webhook_deser(event_type: &str, expected_event_type: SambaWebhookEventType) {
        let raw = fixture_webhook(event_type);
        let parsed: SambaWebhook = serde_json::from_value(raw.clone()).unwrap();
        assert_eq!(parsed.event_type().unwrap(), expected_event_type);

        let ser = serde_json::to_value(parsed).unwrap();
        assert_eq!(ser, raw);
    }

    #[test_case(SambaLinkType::LicenseReports)]
    #[test_case(SambaLinkType::ActivityReports)]
    fn test_get_link_type(link_type: SambaLinkType) {
        // we wouldn't get activity history stuff in a license validation event, but that's ok for the
        // purpose of this test
        let webhook: SambaWebhook =
            serde_json::from_value(fixture_webhook("licensevalidation.received").clone()).unwrap();

        assert!(webhook.get_link(link_type).is_some())
    }

    fn fixture_webhook(event_type: &str) -> serde_json::Value {
        serde_json::json!(
            {
                "eventId": "b2814c46-3411-4a0d-ac90-49334fa08b8b",
                "data": {
                    "orderId": "80f3046f-a3a6-4e73-b7c9-799b829726e5",
                    "links": [
                        {
                            "rel": "activityreports",
                            "href": "/reports/v1/activityreports/detail/c325920d-503e-4da2-891f-3b05bf20c27f",
                            "id": "c325920d-503e-4da2-891f-3b05bf20c27f",
                            "type": "GET"
                        },
                        {
                            "rel": "licensereports",
                            "href": "/reports/v1/licensereports/verifylicense/4008991e-08eb-43fe-9ece-75f7f5530833",
                            "id": "c325920d-503e-4da2-891f-3b05bf20c27f",
                            "type": "GET"
                        }
                    ],
                    "orderDate": "2023-12-16T22:26:18.728370Z",
                    "productOrdered": "standard"
                },
                "createdDateTime": "2023-12-16T22:26:19.697836Z",
                "eventType": event_type
            }
        )
    }
}
