use strum_macros::Display;

#[derive(Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct Message {
    pub account_sid: String,
    pub date_created: String,
    pub date_updated: String,
    pub date_sent: Option<String>,
    pub api_version: String,
    pub body: String,
    pub direction: String,
    pub error_code: Option<i64>,
    pub error_message: Option<String>,
    pub from: Option<String>,
    pub messaging_service_sid: Option<String>,
    pub num_media: String,
    pub num_segments: String,
    pub price: Option<String>,
    pub price_unit: Option<String>,
    pub sid: String,
    pub status: Status,
    pub to: String,
    pub uri: String,
}

impl std::fmt::Debug for Message {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        format!(
            "Twilio Message: Created={} Sent={:?} error_code={:?} error_message={:?} status={:?}",
            &self.date_created, &self.date_sent, self.error_code, self.error_message, self.status
        )
        .fmt(f)
    }
}

#[derive(Debug, Display, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Copy)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Accepted,
    Scheduled,
    Queued,
    Sending,
    Sent,
    Delivered,
    Undelivered,
    Read,
    Failed,
    /// Match any variant not represented above
    #[serde(other)]
    Unknown,
}
