use crate::schema::scoped_user;
use crate::PgConn;
use crate::{DbError, DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{FootprintUserId, Locked, ObConfigurationId, OnboardingId, ScopedVaultId, TenantId, VaultId};
use serde::{Deserialize, Serialize};

use super::ob_configuration::{IsLive, ObConfiguration};
use super::tenant::Tenant;
use super::vault::Vault;

/// Creates a unique identifier specific to each onboarding configuration.
/// This allows one user to onboard onto multiple onboarding configurations at the same tenant
/// while keeping information for each onboarding separate.
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = scoped_user)]
pub struct ScopedVault {
    pub id: ScopedVaultId,
    pub fp_user_id: FootprintUserId,
    pub user_vault_id: VaultId,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub ordering_id: i64,
    pub start_timestamp: DateTime<Utc>,
    /// Denormalized from the user vault just to make querying easier
    pub is_live: bool,
    // Only null when the vault is non-portable
    pub ob_configuration_id: Option<ObConfigurationId>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = scoped_user)]
struct NewScopedVault {
    id: ScopedVaultId,
    fp_user_id: FootprintUserId,
    user_vault_id: VaultId,
    tenant_id: TenantId,
    start_timestamp: DateTime<Utc>,
    is_live: bool,
    ob_configuration_id: Option<ObConfigurationId>,
}

pub enum ScopedVaultIdentifier<'a> {
    Id {
        id: &'a ScopedVaultId,
    },
    OnboardingId {
        id: &'a OnboardingId,
    },
    User {
        id: &'a ScopedVaultId,
        uv_id: &'a VaultId,
    },
    FpUserId {
        fp_user_id: &'a FootprintUserId,
        t_id: &'a TenantId,
        is_live: IsLive,
    },
}

impl<'a> From<&'a ScopedVaultId> for ScopedVaultIdentifier<'a> {
    fn from(id: &'a ScopedVaultId) -> Self {
        Self::Id { id }
    }
}

impl<'a> From<&'a OnboardingId> for ScopedVaultIdentifier<'a> {
    fn from(id: &'a OnboardingId) -> Self {
        Self::OnboardingId { id }
    }
}

impl<'a> From<(&'a ScopedVaultId, &'a VaultId)> for ScopedVaultIdentifier<'a> {
    fn from((id, uv_id): (&'a ScopedVaultId, &'a VaultId)) -> Self {
        Self::User { id, uv_id }
    }
}

impl<'a> From<(&'a FootprintUserId, &'a TenantId, IsLive)> for ScopedVaultIdentifier<'a> {
    fn from((fp_user_id, t_id, is_live): (&'a FootprintUserId, &'a TenantId, IsLive)) -> Self {
        Self::FpUserId {
            fp_user_id,
            t_id,
            is_live,
        }
    }
}

impl ScopedVault {
    /// Used to create a ScopedUser for a portable vault, linked to a specific onboarding configuration
    #[tracing::instrument(skip_all)]
    pub fn get_or_create(
        conn: &mut TxnPgConn,
        uv: &Locked<Vault>,
        ob_configuration_id: ObConfigurationId,
    ) -> DbResult<Self> {
        let (ob_config, _) = ObConfiguration::get_enabled(conn, &ob_configuration_id)?;
        if uv.is_live != ob_config.is_live {
            return Err(DbError::SandboxMismatch);
        }
        if !uv.is_portable {
            return Err(DbError::CannotCreatedScopedUser);
        }
        // Has to be inside locked txn, otherwise this could be a stale read.
        // Still protected by uniqueness constraints, but those are clunkier
        let scoped_user = scoped_user::table
            .filter(scoped_user::user_vault_id.eq(&uv.id))
            .filter(scoped_user::ob_configuration_id.eq(&ob_configuration_id))
            .first(conn.conn())
            .optional()?;
        if let Some(scoped_user) = scoped_user {
            return Ok(scoped_user);
        }
        // Row doesn't exist for user_vault_id, tenant_id - create a new one
        let new = NewScopedVault {
            id: ScopedVaultId::generate(uv.kind),
            fp_user_id: FootprintUserId::generate(uv.kind),
            user_vault_id: uv.id.clone(),
            start_timestamp: Utc::now(),
            tenant_id: ob_config.tenant_id,
            is_live: ob_config.is_live,
            ob_configuration_id: Some(ob_configuration_id),
        };
        let ob = diesel::insert_into(scoped_user::table)
            .values(new)
            .get_result::<ScopedVault>(conn.conn())?;
        Ok(ob)
    }

    /// Used to create a ScopedUser for a non-portable vault
    #[tracing::instrument(skip_all)]
    pub fn create_non_portable(
        conn: &mut TxnPgConn,
        uv: Locked<Vault>,
        tenant_id: TenantId,
    ) -> DbResult<Self> {
        let uv = uv.into_inner();
        if uv.is_portable {
            return Err(DbError::CannotCreatedScopedUser);
        }
        let new = NewScopedVault {
            id: ScopedVaultId::generate(uv.kind),
            fp_user_id: FootprintUserId::generate(uv.kind),
            user_vault_id: uv.id,
            start_timestamp: Utc::now(),
            tenant_id,
            is_live: uv.is_live,
            ob_configuration_id: None,
        };
        let ob = diesel::insert_into(scoped_user::table)
            .values(new)
            .get_result::<ScopedVault>(conn.conn())?;
        Ok(ob)
    }

    /// get scoped_users by a specific user vault
    #[tracing::instrument(skip_all)]
    pub fn list_for_user_vault(
        conn: &mut PgConn,
        user_vault_id: &VaultId,
    ) -> DbResult<Vec<(ScopedVault, Tenant)>> {
        use crate::schema::tenant;
        let results = scoped_user::table
            .inner_join(tenant::table)
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument(skip_all)]
    pub fn get<'a, T: Into<ScopedVaultIdentifier<'a>>>(conn: &mut PgConn, id: T) -> DbResult<ScopedVault> {
        let mut query = scoped_user::table.into_boxed();

        match id.into() {
            ScopedVaultIdentifier::Id { id } => query = query.filter(scoped_user::id.eq(id)),
            ScopedVaultIdentifier::OnboardingId { id } => {
                use crate::schema::onboarding;
                let scoped_user_ids = onboarding::table
                    .filter(onboarding::id.eq(id))
                    .select(onboarding::scoped_user_id);
                query = query.filter(scoped_user::id.eq_any(scoped_user_ids))
            }
            ScopedVaultIdentifier::User { id, uv_id } => {
                query = query
                    .filter(scoped_user::id.eq(id))
                    .filter(scoped_user::user_vault_id.eq(uv_id))
            }
            ScopedVaultIdentifier::FpUserId {
                fp_user_id,
                t_id,
                is_live,
            } => {
                query = query
                    .filter(scoped_user::fp_user_id.eq(fp_user_id))
                    .filter(scoped_user::tenant_id.eq(t_id))
                    .filter(scoped_user::is_live.eq(is_live));
            }
        }
        let result = query.first(conn)?;
        Ok(result)
    }
}
