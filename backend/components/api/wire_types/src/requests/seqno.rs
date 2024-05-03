use newtypes::DataLifetimeSeqno;

#[derive(serde::Deserialize, paperclip::actix::Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct GetHistoricalDataRequest {
    /// The seqno at which to load historical data
    pub seqno: Option<DataLifetimeSeqno>,
}
