#[derive(FromSqlRow, AsExpression, serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ChallengeLastSentData {
    pub sent_at: chrono::NaiveDateTime,
}
