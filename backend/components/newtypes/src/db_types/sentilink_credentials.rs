use super::SealedVaultBytes;
use super::VaultPublicKey;
use crate::PiiString;
use api_errors::FpResult;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use serde::Deserialize;
use serde::Serialize;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, AsJsonb)]
pub struct SentilinkTenantVendorControlCredentials {
    pub account: SealedVaultBytes,
    pub token: SealedVaultBytes,
}

impl SentilinkTenantVendorControlCredentials {
    pub fn new_for_update(
        account: PiiString,
        token: PiiString,
        tenant_public_key: &VaultPublicKey,
    ) -> FpResult<Self> {
        let sealed_account = tenant_public_key.seal_bytes(account.leak().as_bytes())?;
        let sealed_token = tenant_public_key.seal_bytes(token.leak().as_bytes())?;

        Ok(Self {
            account: sealed_account,
            token: sealed_token,
        })
    }
}
