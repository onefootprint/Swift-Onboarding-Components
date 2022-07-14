use crate::errors::DbError;
use crate::schema::user_vaults;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, QueryDsl, Queryable};
use newtypes::{
    EncryptedVaultPrivateKey, Fingerprint, LiveModeConsistency, SealedVaultBytes, Status, UserVaultId,
    VaultPublicKey,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = user_vaults)]
pub struct UserVault {
    pub id: UserVaultId,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub id_verified: Status,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: bool,
}

impl LiveModeConsistency for UserVault {
    type Error = crate::errors::DbError;

    fn is_live(&self) -> bool {
        self.is_live
    }

    fn mismatch_self_is_live(&self) -> Self::Error {
        crate::errors::DbError::LiveUserInSandbox
    }

    fn mismatch_self_is_sandbox(&self) -> Self::Error {
        crate::errors::DbError::SandboxUserInLive
    }
}

impl UserVault {
    pub fn lock(conn: &mut PgConnection, id: UserVaultId) -> Result<Self, DbError> {
        let user = user_vaults::table
            .for_no_key_update()
            .filter(user_vaults::id.eq(id))
            .first(conn)?;
        Ok(user)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_vaults)]
pub struct NewUserVault {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub id_verified: Status,
    pub is_live: bool,
}

pub struct NewUserVaultReq {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub id_verified: Status,
    pub is_live: bool,
    // Note: these aren't actual columns on the table -
    pub e_phone_number: SealedVaultBytes,
    pub sh_phone_number: Fingerprint,
    pub e_phone_country: SealedVaultBytes,
    pub sh_phone_country: Fingerprint,
}
