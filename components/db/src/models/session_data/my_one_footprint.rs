use newtypes::UserVaultId;

#[derive(FromSqlRow, AsExpression, serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct MyOneFootprintSessionData {
    pub user_vault_id: UserVaultId,
}
