#[derive(Default, FromSqlRow, AsExpression, serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct TenantDashboardSessionData {
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub workos_id: String,
}
