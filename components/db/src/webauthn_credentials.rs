use deadpool_diesel::postgres::Pool;
use newtypes::UserVaultId;

use crate::{models::webauthn_credential::WebauthnCredential, DbError};

pub async fn get_webauthn_creds(
    pool: &Pool,
    user_vault_id: UserVaultId,
) -> Result<Vec<WebauthnCredential>, DbError> {
    pool.get()
        .await
        .map_err(DbError::from)?
        .interact(move |conn| WebauthnCredential::get_for_user_vault(conn, user_vault_id))
        .await
        .map_err(DbError::from)?
}
