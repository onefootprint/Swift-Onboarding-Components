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
use super::workflow_request::WorkflowRequest;
use crate::models::data_lifetime::DataLifetime;
use crate::PgConn;
use crate::{DbError, DbResult, TxnPgConn};
use chrono::{DateTime, Duration, Utc};
use db_schema::schema::scoped_vault::{self};
use diesel::dsl::{count_distinct, not};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    DataLifetimeSeqno, DbActor, ExternalId, FpId, IdempotencyId, Locked, ObConfigurationId, OnboardingStatus,
    ScopedVaultId, TenantId, VaultCreatedInfo, VaultId, VaultKind, WorkflowId,
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
    /// Denormalized column to track which vaults are billable for PII storage. True when
    ///   (1) the ScopedVault was created via API as a non-portable user OR
    ///   (2) the ScopedVault has an authorized onboarding
    pub is_billable: bool,
    /// Last time we logged a hosted API interacted with this scoped vault. Vaults touched recently
    /// are considered in progress if their KYC status is still incomplete
    pub last_heartbeat_at: DateTime<Utc>,
    /// Temporary flag that will hide users without verified credentials from search
    /// NOTE: replaced by vault.is_verified
    pub show_in_search: bool,
    /// The seqno at which the SV was created or refreshed.
    /// Data _before_ this seqno and tenat-scoped data _after_ this seqno are used to contruct the VW
    pub snapshot_seqno: DataLifetimeSeqno,
    /// An optional external (customer-specified) identifier for the scoped vault
    pub external_id: Option<ExternalId>,
    /// An arbitrarily-defined timestamp for when "activity" has occurred on the vault. Users in
    /// the dashboard are sorted by this column.
    /// Right now, we'll update this to the current timestamp when vaults are (1) created and (2)
    /// have a workflow complete
    pub last_activity_at: DateTime<Utc>,
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
    is_billable: bool,
    last_heartbeat_at: DateTime<Utc>,
    show_in_search: bool,
    snapshot_seqno: DataLifetimeSeqno,
    external_id: Option<ExternalId>,
    last_activity_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Default, AsChangeset)]
#[diesel(table_name = scoped_vault)]
pub struct ScopedVaultUpdate {
    pub status: Option<OnboardingStatus>,
    pub is_billable: Option<bool>,
    pub show_in_search: Option<bool>,
    pub last_activity_at: Option<DateTime<Utc>>,
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
        /// Either an fp id or a scoped vault id
        identifier: &'a str,
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

pub type SerializableWorkflow = (Workflow, Option<InsightEvent>);
pub type SerializableEntity = (
    ScopedVault,
    Option<WatchlistCheck>,
    Option<WorkflowRequest>,
    Vec<ManualReview>,
    Vec<SerializableWorkflow>,
);

impl ScopedVault {
    /// Used to create a ScopedUser for a portable vault, linked to a specific onboarding configuration
    #[tracing::instrument("ScopedVault::get_or_create", skip_all)]
    pub fn get_or_create(
        conn: &mut TxnPgConn,
        uv: &Locked<Vault>,
        ob_configuration_id: ObConfigurationId,
    ) -> DbResult<Self> {
        // Get the ob config to do some validation before we make the SV
        let (ob_config, _) = ObConfiguration::get_enabled(conn, &ob_configuration_id)?;
        if uv.is_live != ob_config.is_live {
            return Err(DbError::SandboxMismatch);
        }
        // Has to be inside locked txn, otherwise this could be a stale read.
        // Still protected by uniqueness constraints, but those are clunkier
        let scoped_vault = scoped_vault::table
            .filter(scoped_vault::vault_id.eq(&uv.id))
            .filter(scoped_vault::tenant_id.eq(&ob_config.tenant_id))
            .first(conn.conn())
            .optional()?;
        if let Some(scoped_vault) = scoped_vault {
            return Ok(scoped_vault);
        }
        // Row doesn't exist for vault_id, tenant_id - create a new one
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let start_timestamp = Utc::now();
        let new = NewScopedVault {
            id: ScopedVaultId::generate(uv.kind),
            fp_id: FpId::generate(uv.kind, uv.is_live),
            vault_id: uv.id.clone(),
            start_timestamp,
            last_activity_at: start_timestamp,
            tenant_id: ob_config.tenant_id,
            is_live: ob_config.is_live,
            // All vaults created via bifrost start as non-billable. They are marked billable as
            // soon as they have an authorized workflow
            is_billable: false,
            last_heartbeat_at: Utc::now(),
            show_in_search: true,
            snapshot_seqno: seqno,
            // NOTE: for now we won't support adding an external id to
            // users created via Verify
            external_id: None,
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
        external_id: Option<ExternalId>,
        actor: DbActor,
    ) -> DbResult<(Self, Vault)> {
        // Since the idempotency id is stored on the vault, concatenate it with the tenant ID to
        // make sure they are scoped per tenant
        // if there is no idempotency id provided, but an external id is provided use that instead
        let idempotency_id = idempotency_id
            .or(external_id.as_ref().map(|e| e.to_string()))
            .map(|id| IdempotencyId::from(format!("{}.{}", tenant_id, id)));

        let (uv, is_new_vault) = Vault::insert(conn, new_user, idempotency_id)?;
        if !uv.is_created_via_api {
            return Err(DbError::CannotCreatedScopedUser);
        }
        let su = if is_new_vault {
            let start_timestamp = Utc::now();
            let seqno = DataLifetime::get_current_seqno(conn)?;
            let new = NewScopedVault {
                id: ScopedVaultId::generate(uv.kind),
                fp_id: FpId::generate(uv.kind, uv.is_live),
                start_timestamp,
                last_activity_at: start_timestamp,
                tenant_id,
                is_live: uv.is_live,
                vault_id: uv.id.clone(),
                // All vaults created via API are billable
                is_billable: true,
                last_heartbeat_at: Utc::now(),
                show_in_search: true,
                snapshot_seqno: seqno,
                external_id,
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
            ScopedVaultIdentifier::SuperAdminView { identifier } => {
                query = query.filter(
                    scoped_vault::id
                        .eq(identifier)
                        .or(scoped_vault::fp_id.eq(identifier)),
                );
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
        use db_schema::schema::{insight_event, manual_review, watchlist_check, workflow, workflow_request};
        let results: Vec<(ScopedVault, Option<WatchlistCheck>, Option<WorkflowRequest>)> =
            scoped_vault::table
                .left_join(
                    watchlist_check::table.on(watchlist_check::scoped_vault_id
                        .eq(scoped_vault::id)
                        .and(watchlist_check::deactivated_at.is_null())
                        .and(not(watchlist_check::completed_at.is_null()))),
                )
                .left_join(
                    workflow_request::table.on(workflow_request::scoped_vault_id
                        .eq(scoped_vault::id)
                        .and(workflow_request::deactivated_at.is_null())),
                )
                .filter(scoped_vault::id.eq_any(&ids))
                .load(conn)?;

        // Fetch manual reviews separately since there may be multiple for one scoped vault
        let mut manual_reviews = manual_review::table
            .filter(manual_review::scoped_vault_id.eq_any(&ids))
            .filter(manual_review::completed_at.is_null())
            .get_results::<ManualReview>(conn)?
            .into_iter()
            .map(|i| (i.scoped_vault_id.clone(), i))
            .into_group_map();

        // Fetch workflows separately since there may be multiple for one scoped vault
        let mut workflows = workflow::table
            .filter(workflow::scoped_vault_id.eq_any(&ids))
            .left_join(insight_event::table)
            .get_results::<SerializableWorkflow>(conn)?
            .into_iter()
            .map(|i| (i.0.scoped_vault_id.clone(), i))
            .into_group_map();

        // Turn the Vec of OnboardingInfo into a hashmap of ScopedVaultId -> Vec<SerializableEntity>
        let result_map = results
            .into_iter()
            .map(|i| {
                let sv_id = i.0.id.clone();
                let manual_reviews = manual_reviews.remove(&sv_id).unwrap_or_default();
                let workflows = workflows.remove(&sv_id).unwrap_or_default();
                let entity = (i.0, i.1, i.2, manual_reviews, workflows);
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
    pub fn update(conn: &mut TxnPgConn, id: &ScopedVaultId, update: ScopedVaultUpdate) -> DbResult<Self> {
        let ScopedVaultUpdate {
            is_billable,
            status,
            show_in_search,
            last_activity_at,
        } = &update;
        if is_billable.is_none() && status.is_none() && show_in_search.is_none() && last_activity_at.is_none()
        {
            // No-op if the update is empty
            let existing_sv = scoped_vault::table
                .filter(scoped_vault::id.eq(id))
                .get_result(conn.conn())?;
            return Ok(existing_sv);
        }
        let updated_sv = diesel::update(scoped_vault::table)
            .filter(scoped_vault::id.eq(id))
            .set(update)
            .get_result(conn.conn())?;
        Ok(updated_sv)
    }

    #[tracing::instrument("ScopedVault::clear_status", skip_all)]
    /// Used to clear the status of a business vault going through a skip_kyb workflow.
    pub fn clear_business_status(conn: &mut TxnPgConn, wf_id: &WorkflowId) -> DbResult<()> {
        let (wf, v) = Workflow::get_with_vault(conn, wf_id)?;
        if v.kind != VaultKind::Business {
            return Err(DbError::ValidationError(
                "Not allowed to clear status of non-business vault".into(),
            ));
        }
        use db_schema::schema::workflow;
        let count_wf = workflow::table
            .filter(workflow::scoped_vault_id.eq(&wf.scoped_vault_id))
            .count()
            .execute(conn.conn())?;
        if count_wf > 1 {
            return Err(DbError::ValidationError(
                "Not allowed to clear status of a business with multiple workflows".into(),
            ));
        }
        diesel::update(scoped_vault::table)
            .filter(scoped_vault::id.eq(&wf.scoped_vault_id))
            .set(scoped_vault::status.eq(Option::<OnboardingStatus>::None))
            .execute(conn.conn())?;
        Ok(())
    }

    pub fn set_heartbeat(&self, conn: &mut PgConn) -> DbResult<()> {
        // To reduce frequency of writes, only set the heartbeat if it's >3 mins old
        if Utc::now() - self.last_heartbeat_at > Duration::minutes(3) {
            diesel::update(scoped_vault::table)
                .filter(scoped_vault::id.eq(&self.id))
                .set(scoped_vault::last_heartbeat_at.eq(Utc::now()))
                .execute(conn)?;
        }
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
