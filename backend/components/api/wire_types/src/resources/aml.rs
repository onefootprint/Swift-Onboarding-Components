use crate::*;

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct AmlDetail {
    pub share_url: Option<String>,
    pub hits: Vec<AmlHit>,
}

export_schema!(AmlDetail);

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct AmlHit {
    pub name: Option<PiiString>,
    pub fields: Option<PiiJsonValue>,
    pub match_types: Option<Vec<String>>,
    pub media: Option<Vec<AmlHitMedia>>,
}

export_schema!(AmlHit);

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct AmlHitMedia {
    pub date: Option<DateTime<Utc>>,
    pub pdf_url: Option<String>,
    pub snippet: Option<PiiString>,
    pub title: Option<PiiString>,
    pub url: Option<String>,
}

export_schema!(AmlHitMedia);
