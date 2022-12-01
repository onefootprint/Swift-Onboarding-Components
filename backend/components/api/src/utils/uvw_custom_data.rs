use std::collections::HashMap;

use db::{
    models::kv_data::{KeyValueData, NewKeyValueDataArgs},
    TxnPgConnection,
};
use newtypes::{KvDataKey, PiiString, TenantId};

use crate::errors::{ApiError, ApiResult};

use super::user_vault_wrapper::UserVaultWrapper;

/// UVW impls related to working with custom data stored in a UserVault
impl UserVaultWrapper {
    pub fn update_custom_data(
        &self,
        conn: &mut TxnPgConnection,
        tenant_id: TenantId,
        update: HashMap<KvDataKey, PiiString>,
    ) -> ApiResult<()> {
        self.assert_is_locked(conn)?;

        let update = update
            .into_iter()
            .map(|(data_key, pii)| {
                let e_data = self.user_vault.public_key.seal_pii(&pii)?;
                Ok(NewKeyValueDataArgs { data_key, e_data })
            })
            .collect::<Result<Vec<_>, ApiError>>()?;

        KeyValueData::update_or_insert(conn, self.user_vault.id.clone(), tenant_id, update)?;
        Ok(())
    }
}
