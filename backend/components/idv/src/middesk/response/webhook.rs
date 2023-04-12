use super::business::BusinessResponse;
use crate::middesk::Error;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

pub enum MiddeskWebhookResponse {
    BusinessUpdate(MiddeskBusinessUpdateWebhookResponse),
}

pub fn parse_webhook(v: serde_json::Value) -> Result<MiddeskWebhookResponse, Error> {
    let type_ = (&v)["type"].as_str().ok_or(Error::MalformedWebhookResponse)?;
    let res = match type_ {
        "business.updated" => Some(MiddeskWebhookResponse::BusinessUpdate(serde_json::from_value::<
            MiddeskBusinessUpdateWebhookResponse,
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
    pub data: Option<Data>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Data {
    pub object: Option<BusinessResponse>,
}

impl MiddeskBusinessUpdateWebhookResponse {
    pub fn business_id(&self) -> Option<String> {
        self.data
            .as_ref()
            .and_then(|d| d.object.as_ref())
            .and_then(|o| o.id.clone())
    }
}
