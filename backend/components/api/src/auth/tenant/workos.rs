#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WorkOsSession {
    /// The email that was proven to be owned by WorkOs auth.
    pub email: String,
}
