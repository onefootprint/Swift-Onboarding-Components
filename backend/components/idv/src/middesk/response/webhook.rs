use super::business::{
    BusinessResponse,
    Tin,
};
use crate::middesk::Error;
use chrono::{
    DateTime,
    Utc,
};
use serde::{
    Deserialize,
    Serialize,
};

#[derive(Debug)]
#[allow(clippy::large_enum_variant)]
pub enum MiddeskWebhookResponse {
    BusinessUpdate(MiddeskBusinessUpdateWebhookResponse),
    TinRetried(MiddeskTinRetriedWebhookResponse),
}

pub fn parse_webhook(v: serde_json::Value) -> Result<MiddeskWebhookResponse, Error> {
    let type_ = (&v)["type"].as_str().ok_or(Error::MalformedWebhookResponse)?;
    let res = match type_ {
        "business.updated" => Some(MiddeskWebhookResponse::BusinessUpdate(serde_json::from_value::<
            MiddeskBusinessUpdateWebhookResponse,
        >(v.clone())?)),
        "tin.retried" => Some(MiddeskWebhookResponse::TinRetried(serde_json::from_value::<
            MiddeskTinRetriedWebhookResponse,
        >(v.clone())?)),
        _ => None,
    };
    res.ok_or(Error::UnexpectedWebhookType(type_.to_owned()))
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct MiddeskBusinessUpdateWebhookResponse {
    pub object: Option<String>,
    pub id: Option<String>,
    pub account_id: Option<String>,
    #[serde(rename(serialize = "type"))]
    pub type_: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub data: Option<BusinessData>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct BusinessData {
    pub object: Option<BusinessResponse>,
}

impl MiddeskBusinessUpdateWebhookResponse {
    pub fn business_id(&self) -> Option<String> {
        self.data
            .as_ref()
            .and_then(|d| d.object.as_ref())
            .and_then(|o| o.id.clone())
    }

    pub fn webhook_id(&self) -> Option<String> {
        self.id.clone()
    }

    pub fn has_tin_error(&self) -> bool {
        self.data
            .as_ref()
            .and_then(|d| d.object.as_ref())
            .and_then(|o| o.review.as_ref())
            .and_then(|r| r.tasks.as_ref())
            .and_then(|ts| {
                ts.iter().find(|t| {
                    if let (Some(key), Some(sub_label), Some(message)) = (&t.key, &t.sub_label, &t.message) {
                        key.to_lowercase() == "tin"
                            && sub_label.to_lowercase() == "error"
                            && message.to_lowercase().contains("unavailable")
                    } else {
                        false
                    }
                })
            })
            .is_some()
    }

    pub fn business_response(&self) -> Option<&BusinessResponse> {
        self.data.as_ref().and_then(|d| d.object.as_ref())
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct MiddeskTinRetriedWebhookResponse {
    pub object: Option<String>,
    pub id: Option<String>,
    pub account_id: Option<String>,
    #[serde(rename(serialize = "type"))]
    pub type_: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub data: Option<TinData>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TinData {
    pub object: Option<Tin>,
}

impl MiddeskTinRetriedWebhookResponse {
    pub fn business_id(&self) -> Option<String> {
        self.data
            .as_ref()
            .and_then(|d| d.object.as_ref())
            .and_then(|t| t.business_id.clone())
    }

    pub fn webhook_id(&self) -> Option<String> {
        self.id.clone()
    }
}

impl MiddeskWebhookResponse {
    pub fn business_id(&self) -> Option<String> {
        match self {
            MiddeskWebhookResponse::BusinessUpdate(v) => v.business_id(),
            MiddeskWebhookResponse::TinRetried(v) => v.business_id(),
        }
    }

    pub fn webhook_id(&self) -> Option<String> {
        match self {
            MiddeskWebhookResponse::BusinessUpdate(v) => v.webhook_id(),
            MiddeskWebhookResponse::TinRetried(v) => v.webhook_id(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deser() {
        let res = serde_json::from_value::<MiddeskBusinessUpdateWebhookResponse>(
            crate::test_fixtures::middesk_business_update_webhook_response(),
        )
        .unwrap();
        assert_eq!(
            "bankruptcies".to_owned(),
            res.clone()
                .data
                .unwrap()
                .object
                .unwrap()
                .review
                .unwrap()
                .tasks
                .unwrap()
                .pop()
                .unwrap()
                .key
                .unwrap()
        );
        assert_eq!(
            1,
            res.data
                .unwrap()
                .object
                .unwrap()
                .watchlist
                .unwrap()
                .hit_count
                .unwrap()
        );
    }
}
