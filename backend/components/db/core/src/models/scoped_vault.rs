use std::collections::HashMap;

use super::insight_event::InsightEvent;
use super::manual_review::ManualReview;
use super::ob_configuration::{IsLive, ObConfiguration};
use super::tenant::Tenant;
use super::user_timeline::UserTimeline;
use super::vault::NewVaultArgs;
use super::vault::Vault;
use super::watchlist_check::WatchlistCheck;
use super::workflow::Workflow;
use crate::PgConn;
use crate::{DbError, DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::scoped_vault::{self};
use diesel::dsl::{count_distinct, not};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    DbActor, FpId, IdempotencyId, Locked, ObConfigurationId, OnboardingStatus, ScopedVaultId, SessionId,
    TenantId, VaultCreatedInfo, VaultId, WorkflowId,
};

/// Creates a unique identifier specific to each onboarding configuration.
/// This allows one user to onboard onto multiple onboarding configurations at the same tenant
/// while keeping information for each onboarding separate.
#[derive(Debug, Clone, Queryable, Insertable)]
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
    pub status: Option<OnboardingStatus>,
    /// Client-provided identifier during the request that created this ScopedVault. Other HTTP
    /// requests in the same session have the same ID. This is useful to search logs for this
    /// scoped vault
    pub session_id: Option<SessionId>,
    /// Denormalized column to track which vaults are billable for PII storage. True when
    ///   (1) the ScopedVault was created via API as a non-portable user OR
    ///   (2) the ScopedVault has an authorized onboarding
    pub is_billable: bool,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = scoped_vault)]
struct NewScopedVault {
    id: ScopedVaultId,
    fp_id: FpId,
    vault_id: VaultId,
    tenant_id: TenantId,
    start_timestamp: DateTime<Utc>,
    is_live: bool,
    session_id: Option<SessionId>,
    is_billable: bool,
}

#[derive(Debug, Clone, Default, AsChangeset)]
#[diesel(table_name = scoped_vault)]
pub struct ScopedVaultUpdate {
    pub status: Option<OnboardingStatus>,
    pub is_billable: Option<bool>,
}

pub enum ScopedVaultIdentifier<'a> {
    Id {
        id: &'a ScopedVaultId,
    },
    WorkflowId {
        id: &'a WorkflowId,
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
    Tenant {
        v_id: &'a VaultId,
        t_id: &'a TenantId,
    },
    /// Only used in firm-employee-authed GET /private/entities API
    SuperAdminView {
        fp_id: &'a FpId,
    },
}

impl<'a> From<&'a ScopedVaultId> for ScopedVaultIdentifier<'a> {
    fn from(id: &'a ScopedVaultId) -> Self {
        Self::Id { id }
    }
}

impl<'a> From<&'a WorkflowId> for ScopedVaultIdentifier<'a> {
    fn from(id: &'a WorkflowId) -> Self {
        Self::WorkflowId { id }
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

impl<'a> From<(&'a VaultId, &'a TenantId)> for ScopedVaultIdentifier<'a> {
    fn from((v_id, t_id): (&'a VaultId, &'a TenantId)) -> Self {
        Self::Tenant { v_id, t_id }
    }
}

pub type SerializableWorkflow = (Workflow, Option<InsightEvent>, Option<ManualReview>);
pub type SerializableEntity = (ScopedVault, Option<WatchlistCheck>, Vec<SerializableWorkflow>);

impl ScopedVault {
    /// Used to create a ScopedUser for a portable vault, linked to a specific onboarding configuration
    #[tracing::instrument("ScopedVault::get_or_create", skip_all)]
    pub fn get_or_create(
        conn: &mut TxnPgConn,
        uv: &Locked<Vault>,
        ob_configuration_id: ObConfigurationId,
        session_id: Option<SessionId>,
    ) -> DbResult<Self> {
        // Get the ob config to do some validation before we make the SV
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
            .filter(scoped_vault::tenant_id.eq(&ob_config.tenant_id))
            .first(conn.conn())
            .optional()?;
        if let Some(scoped_vault) = scoped_vault {
            // TODO if SV already exists, we should make a new workflow rather than an onboarding
            return Ok(scoped_vault);
        }
        // Row doesn't exist for vault_id, tenant_id - create a new one
        let new = NewScopedVault {
            id: ScopedVaultId::generate(uv.kind),
            fp_id: FpId::generate(uv.kind, uv.is_live),
            vault_id: uv.id.clone(),
            start_timestamp: Utc::now(),
            tenant_id: ob_config.tenant_id,
            is_live: ob_config.is_live,
            session_id,
            // All vaults created via bifrost start as non-billable. They are marked billable as
            // soon as they have an authorized workflow
            is_billable: false,
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
                fp_id: FpId::generate(uv.kind, uv.is_live),
                start_timestamp: Utc::now(),
                tenant_id,
                is_live: uv.is_live,
                vault_id: uv.id.clone(),
                session_id: None,
                // All vaults created via API are billable
                is_billable: true,
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
            ScopedVaultIdentifier::WorkflowId { id } => {
                use db_schema::schema::workflow;
                let scoped_user_ids = workflow::table
                    .filter(workflow::id.eq(id))
                    .select(workflow::scoped_vault_id);
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
            ScopedVaultIdentifier::Tenant { v_id, t_id } => {
                query = query
                    .filter(scoped_vault::vault_id.eq(v_id))
                    .filter(scoped_vault::tenant_id.eq(t_id));
            }
            ScopedVaultIdentifier::SuperAdminView { fp_id } => {
                query = query.filter(scoped_vault::fp_id.eq(fp_id));
            }
        }
        let result = query.first(conn)?;
        Ok(result)
    }

    #[tracing::instrument("ScopedVault::bulk_get", skip_all)]
    pub fn bulk_get(
        conn: &mut PgConn,
        fp_ids: Vec<FpId>,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<Vec<(Self, Vault)>> {
        use db_schema::schema::vault;
        let results = scoped_vault::table
            .filter(scoped_vault::fp_id.eq_any(fp_ids))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .inner_join(vault::table)
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument("ScopedVault::bulk_get_serializable_info", skip_all)]
    pub fn bulk_get_serializable_info(
        conn: &mut PgConn,
        ids: Vec<ScopedVaultId>,
    ) -> DbResult<HashMap<ScopedVaultId, SerializableEntity>> {
        use db_schema::schema::{insight_event, manual_review, watchlist_check, workflow};
        let results: Vec<(ScopedVault, Option<WatchlistCheck>)> = scoped_vault::table
            .left_join(
                watchlist_check::table.on(watchlist_check::scoped_vault_id
                    .eq(scoped_vault::id)
                    .and(watchlist_check::deactivated_at.is_null())
                    .and(not(watchlist_check::completed_at.is_null()))),
            )
            .filter(scoped_vault::id.eq_any(&ids))
            .load(conn)?;

        // Fetch workflows separately since there may be multiple for one scoped vault
        let mut workflows = workflow::table
            .filter(workflow::scoped_vault_id.eq_any(&ids))
            .left_join(insight_event::table)
            .left_join(
                manual_review::table.on(manual_review::workflow_id
                    .eq(workflow::id)
                    .and(manual_review::completed_at.is_null())),
            )
            .get_results::<SerializableWorkflow>(conn)?
            .into_iter()
            .map(|i| (i.0.scoped_vault_id.clone(), i))
            .into_group_map();

        // Turn the Vec of OnboardingInfo into a hashmap of ScopedVaultId -> Vec<SerializableEntity>
        let result_map = results
            .into_iter()
            .map(|i| {
                let sv_id = i.0.id.clone();
                let entity = (i.0, i.1, workflows.remove(&sv_id).unwrap_or_default());
                (sv_id, entity)
            })
            .collect();
        Ok(result_map)
    }

    pub fn lock(conn: &mut PgConn, id: &ScopedVaultId) -> DbResult<Self> {
        let result = scoped_vault::table
            .filter(scoped_vault::id.eq(id))
            .for_no_key_update()
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("ScopedVault::update", skip_all)]
    pub fn update(conn: &mut PgConn, id: &ScopedVaultId, update: ScopedVaultUpdate) -> DbResult<()> {
        if update.is_billable.is_none() && update.status.is_none() {
            return Ok(());
        }
        diesel::update(scoped_vault::table)
            .filter(scoped_vault::id.eq(id))
            .set(update)
            .execute(conn)?;
        Ok(())
    }
}

pub type AuthorizedTenant = (Workflow, ScopedVault, ObConfiguration, Tenant);

impl ScopedVault {
    /// List all authorized onboardings for a given vault
    #[tracing::instrument("ScopedVault::list_authorized", skip_all)]
    pub fn list_authorized(conn: &mut PgConn, v_id: &VaultId) -> DbResult<Vec<AuthorizedTenant>> {
        use db_schema::schema::{ob_configuration, tenant, workflow};
        let results = workflow::table
            .inner_join(scoped_vault::table)
            .inner_join(ob_configuration::table)
            .inner_join(tenant::table.on(tenant::id.eq(ob_configuration::tenant_id)))
            .filter(scoped_vault::vault_id.eq(v_id))
            .filter(not(workflow::authorized_at.is_null()))
            .order_by(workflow::created_at.desc())
            .get_results(conn)?;
        Ok(results)
    }

    /// Count the number of scoped vaults that are billable for PII storage
    #[tracing::instrument("ScopedVault::count_billable", skip_all)]
    pub fn count_billable(
        conn: &mut PgConn,
        t_id: &TenantId,
        end_date: DateTime<Utc>,
        filters: ScopedVaultPiiFilters,
    ) -> DbResult<i64> {
        use db_schema::schema::data_lifetime;

        let mut sv_with_data = data_lifetime::table
            .filter(data_lifetime::deactivated_seqno.is_null())
            .select(data_lifetime::scoped_vault_id)
            .into_boxed();
        // Aryeo billing is separate based on PCI/non-PCI data... I don't love this
        match filters {
            ScopedVaultPiiFilters::None => (),
            ScopedVaultPiiFilters::NonPci => {
                sv_with_data = sv_with_data
                    .filter(not(data_lifetime::kind.ilike("card.%")))
                    .filter(not(data_lifetime::kind.ilike("custom.%")))
            }
            ScopedVaultPiiFilters::PciOrCustom => {
                sv_with_data = sv_with_data.filter(
                    data_lifetime::kind
                        .ilike("card.%")
                        .or(data_lifetime::kind.ilike("custom.%")),
                )
            }
        }

        let count = scoped_vault::table
            .filter(scoped_vault::tenant_id.eq(t_id))
            .filter(scoped_vault::is_live.eq(true))
            // Only allow billing authorized scoped users for portable vaults OR non-portable vaults
            // owned by the tenant
            .filter(scoped_vault::is_billable.eq(true))
            // Only bill for users that have data in them
            .filter(scoped_vault::id.eq_any(sv_with_data))
            // Only bill for vaults that existed by the end of the bililng period
            // NOTE: We'll miss a handful of vaults that were created but not authorized before end_date.
            // And, this calculation won't be stable if we re-run it for a historical period. But
            // it will only change by very small amounts
            .filter(scoped_vault::start_timestamp.lt(end_date))
            .select(count_distinct(scoped_vault::id))
            .get_result(conn)?;
        Ok(count)
    }
}

pub enum ScopedVaultPiiFilters {
    /// Select all scoped vaults
    None,
    /// Select scoped vaults that have data other than `card.*` and `custom.*`
    NonPci,
    /// Select scoped vaults that have `card.*` or `custom.*` data
    PciOrCustom,
}
