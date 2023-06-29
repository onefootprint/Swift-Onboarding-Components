use std::collections::HashMap;

use super::insight_event::InsightEvent;
use super::manual_review::ManualReview;
use super::ob_configuration::{IsLive, ObConfiguration};
use super::onboarding::Onboarding;
use super::user_timeline::UserTimeline;
use super::vault::NewVaultArgs;
use super::vault::Vault;
use super::watchlist_check::WatchlistCheck;
use crate::PgConn;
use crate::{DbError, DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::scoped_vault;
use diesel::dsl::not;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    DbActor, FpId, IdempotencyId, Locked, ObConfigurationId, OnboardingId, ScopedVaultId, TenantId,
    VaultCreatedInfo, VaultId,
};
use serde::{Deserialize, Serialize};

/// Creates a unique identifier specific to each onboarding configuration.
/// This allows one user to onboard onto multiple onboarding configurations at the same tenant
/// while keeping information for each onboarding separate.
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = scoped_vault)]
pub struct ScopedVault {
    pub id: ScopedVaultId,
    pub fp_id: FpId,
    pub vault_id: VaultId,
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
#[diesel(table_name = scoped_vault)]
struct NewScopedVault {
    id: ScopedVaultId,
    fp_id: FpId,
    vault_id: VaultId,
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
    FpId {
        fp_id: &'a FpId,
        t_id: &'a TenantId,
        is_live: IsLive,
    },
    ObConfig {
        v_id: &'a VaultId,
        ob_config_id: &'a ObConfigurationId,
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

impl<'a> From<(&'a FpId, &'a TenantId, IsLive)> for ScopedVaultIdentifier<'a> {
    fn from((fp_id, t_id, is_live): (&'a FpId, &'a TenantId, IsLive)) -> Self {
        Self::FpId { fp_id, t_id, is_live }
    }
}

impl<'a> From<(&'a VaultId, &'a ObConfigurationId)> for ScopedVaultIdentifier<'a> {
    fn from((v_id, ob_config_id): (&'a VaultId, &'a ObConfigurationId)) -> Self {
        Self::ObConfig { v_id, ob_config_id }
    }
}

pub type SerializableOnboarding = (Onboarding, ObConfiguration, InsightEvent, Option<ManualReview>);
pub type SerializableEntity = (
    ScopedVault,
    Option<WatchlistCheck>,
    Option<SerializableOnboarding>,
);

impl ScopedVault {
    /// Used to create a ScopedUser for a portable vault, linked to a specific onboarding configuration
    #[tracing::instrument("ScopedVault::get_or_create", skip_all)]
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
        let scoped_vault = scoped_vault::table
            .filter(scoped_vault::vault_id.eq(&uv.id))
            .filter(scoped_vault::ob_configuration_id.eq(&ob_configuration_id))
            .first(conn.conn())
            .optional()?;
        if let Some(scoped_vault) = scoped_vault {
            return Ok(scoped_vault);
        }
        // Row doesn't exist for vault_id, tenant_id - create a new one
        let new = NewScopedVault {
            id: ScopedVaultId::generate(uv.kind),
            fp_id: FpId::generate(uv.kind),
            vault_id: uv.id.clone(),
            start_timestamp: Utc::now(),
            tenant_id: ob_config.tenant_id,
            is_live: ob_config.is_live,
            ob_configuration_id: Some(ob_configuration_id),
        };
        let sv = diesel::insert_into(scoped_vault::table)
            .values(new)
            .get_result::<ScopedVault>(conn.conn())?;
        Ok(sv)
    }

    /// Used to create a ScopedUser for a non-portable vault
    #[tracing::instrument("ScopedVault::get_or_create_non_portable", skip_all)]
    pub fn get_or_create_non_portable(
        conn: &mut TxnPgConn,
        new_user: NewVaultArgs,
        tenant_id: TenantId,
        idempotency_id: Option<String>,
        actor: DbActor,
    ) -> DbResult<(Self, Vault)> {
        // Since the idempotency id is stored on the vault, concatenate it with the tenant ID to
        // make sure they are scoped per tenant
        let idempotency_id = idempotency_id.map(|id| IdempotencyId::from(format!("{}.{}", tenant_id, id)));
        let (uv, is_new_vault) = Vault::insert(conn, new_user, idempotency_id)?;
        if uv.is_portable {
            return Err(DbError::CannotCreatedScopedUser);
        }
        let su = if is_new_vault {
            let new = NewScopedVault {
                id: ScopedVaultId::generate(uv.kind),
                fp_id: FpId::generate(uv.kind),
                start_timestamp: Utc::now(),
                tenant_id,
                is_live: uv.is_live,
                vault_id: uv.id.clone(),
                ob_configuration_id: None,
            };
            let sv: ScopedVault = diesel::insert_into(scoped_vault::table)
                .values(new)
                .get_result(conn.conn())?;
            let event = VaultCreatedInfo { actor };
            UserTimeline::create(conn, event, uv.id.clone(), sv.id.clone())?;
            sv
        } else {
            scoped_vault::table
                .filter(scoped_vault::vault_id.eq(&uv.id))
                .filter(scoped_vault::tenant_id.eq(&tenant_id))
                .get_result(conn.conn())?
        };
        Ok((su, uv.into_inner()))
    }

    #[tracing::instrument("ScopedVault::get", skip_all)]
    pub fn get<'a, T: Into<ScopedVaultIdentifier<'a>>>(conn: &mut PgConn, id: T) -> DbResult<ScopedVault> {
        let mut query = scoped_vault::table.into_boxed();

        match id.into() {
            ScopedVaultIdentifier::Id { id } => query = query.filter(scoped_vault::id.eq(id)),
            ScopedVaultIdentifier::OnboardingId { id } => {
                use db_schema::schema::onboarding;
                let scoped_user_ids = onboarding::table
                    .filter(onboarding::id.eq(id))
                    .select(onboarding::scoped_vault_id);
                query = query.filter(scoped_vault::id.eq_any(scoped_user_ids))
            }
            ScopedVaultIdentifier::User { id, uv_id } => {
                query = query
                    .filter(scoped_vault::id.eq(id))
                    .filter(scoped_vault::vault_id.eq(uv_id))
            }
            ScopedVaultIdentifier::FpId { fp_id, t_id, is_live } => {
                query = query
                    .filter(scoped_vault::fp_id.eq(fp_id))
                    .filter(scoped_vault::tenant_id.eq(t_id))
                    .filter(scoped_vault::is_live.eq(is_live));
            }
            ScopedVaultIdentifier::ObConfig { v_id, ob_config_id } => {
                query = query
                    .filter(scoped_vault::vault_id.eq(v_id))
                    .filter(scoped_vault::ob_configuration_id.eq(ob_config_id));
            }
        }
        let result = query.first(conn)?;
        Ok(result)
    }

    #[tracing::instrument("ScopedVault::bulk_get_serializable_info", skip_all)]
    pub fn bulk_get_serializable_info(
        conn: &mut PgConn,
        ids: Vec<&ScopedVaultId>,
    ) -> DbResult<HashMap<ScopedVaultId, SerializableEntity>> {
        use db_schema::schema::{insight_event, manual_review, ob_configuration, onboarding, watchlist_check};
        let results: Vec<SerializableEntity> = scoped_vault::table
            .left_join(
                watchlist_check::table.on(watchlist_check::scoped_vault_id
                    .eq(scoped_vault::id)
                    .and(watchlist_check::deactivated_at.is_null())
                    .and(not(watchlist_check::completed_at.is_null()))),
            )
            .left_join(
                onboarding::table
                .inner_join(ob_configuration::table)
                .inner_join(insight_event::table)
                // Only fetch active manual review for this onboarding
                .left_join(manual_review::table.on(
                    manual_review::onboarding_id.eq(onboarding::id)
                    .and(manual_review::completed_at.is_null())
                )),
            )
            .filter(scoped_vault::id.eq_any(ids))
            .load(conn)?;

        // Turn the Vec of OnboardingInfo into a hashmap of ScopedVaultId -> Vec<SerializableEntity>
        let result_map = results.into_iter().map(|ob| (ob.0.id.clone(), ob)).collect();
        Ok(result_map)
    }
}
