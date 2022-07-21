use newtypes::UserDataId;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifySession {
    pub user_data_id: UserDataId,
}
