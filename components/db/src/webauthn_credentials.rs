use newtypes::UserVaultId;

use crate::{models::webauthn_credential::WebauthnCredential, DbError};

pub async fn get_webauthn_creds(
    pool: &crate::DbPool,
    user_vault_id: UserVaultId,
) -> Result<Vec<WebauthnCredential>, DbError> {
    pool.db_query(move |conn| WebauthnCredential::get_for_user_vault(conn, user_vault_id))
        .await?
}
