use crate::*;
use newtypes::{
    PiiJsonValue,
    PiiString,
};

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct AmlDetail {
    pub share_url: Option<String>,
    pub hits: Vec<AmlHit>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct AmlHit {
    pub name: Option<PiiString>,
    pub fields: Option<PiiJsonValue>,
    pub match_types: Option<Vec<String>>,
    pub media: Option<Vec<AmlHitMedia>>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct AmlHitMedia {
    pub date: Option<DateTime<Utc>>,
    pub pdf_url: Option<String>,
    pub snippet: Option<PiiString>,
    pub title: Option<PiiString>,
    pub url: Option<String>,
}
