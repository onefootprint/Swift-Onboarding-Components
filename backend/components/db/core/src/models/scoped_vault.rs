use super::insight_event::InsightEvent;
use super::manual_review::ManualReview;
use super::ob_configuration::{
    IsLive,
    ObConfiguration,
};
use super::scoped_vault_label::ScopedVaultLabel;
use super::tenant::Tenant;
use super::user_timeline::UserTimeline;
use super::vault::{
    NewVaultArgs,
    Vault,
};
use super::watchlist_check::WatchlistCheck;
use super::workflow::Workflow;
use super::workflow_request::WorkflowRequest;
use crate::models::data_lifetime::DataLifetime;
use crate::{
    DbError,
    DbResult,
    PgConn,
    TxnPgConn,
};
use chrono::{
    DateTime,
    Duration,
    Utc,
};
use db_schema::schema::scoped_vault::{
    self,
};
use diesel::dsl::{
    count_distinct,
    not,
};
use diesel::prelude::*;
use diesel::{
    Insertable,
    Queryable,
};
use itertools::Itertools;
use newtypes::{
    DataLifetimeSeqno,
    DbActor,
    ExternalId,
    FpId,
    IdempotencyId,
    Locked,
    ObConfigurationId,
    OnboardingStatus,
    ScopedVaultId,
    TenantId,
    VaultCreatedInfo,
    VaultId,
    VaultKind,
    WorkflowId,
};
use std::collections::HashMap;

/// Creates a unique identifier specific to each onboarding configuration.
/// This allows one user to onboard onto multiple onboarding configurations at the same tenant
/// while keeping information for each onboarding separate.
#[derive(Debug, Clone, Queryable, Insertable, Eq, PartialEq)]
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
    /// Last time we logged a hosted API interacted with this scoped vault. Vaults touched recently
    /// are considered in progress if their KYC status is still incomplete
    pub last_heartbeat_at: DateTime<Utc>,
    /// The seqno at which the SV was created or refreshed.
    /// Data _before_ this seqno and tenat-scoped data _after_ this seqno are used to contruct the
    /// VW
    pub snapshot_seqno: DataLifetimeSeqno,
    /// An optional external (customer-specified) identifier for the scoped vault
    pub external_id: Option<ExternalId>,
    /// An arbitrarily-defined timestamp for when "activity" has occurred on the vault. Users in
    /// the dashboard are sorted by this column.
    /// Right now, we'll update this to the current timestamp when vaults are (1) created and (2)
    /// have a workflow complete
    pub last_activity_at: DateTime<Utc>,
    /// When the scoped vault was deactivated, if it has been deactivated.
    /// This was used by the deprecated DELETE /users/{fp_id} API.
    pub deactivated_at: Option<DateTime<Utc>>,
    /// Denormalized from vault for faster querying
    pub kind: VaultKind,
    /// Determines whether the ScopedVault is generally active to be logged into, shown in the
    /// dashboard, and billable. There are two ways a scoped vault may be inactive:
    /// - The old DELETE /users/{fp_id} API could deactivate a user.
    /// - When an unverified vault is made via bifrost, it is inactive until it is OTP verified
    pub is_active: bool,
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
    last_heartbeat_at: DateTime<Utc>,
    snapshot_seqno: DataLifetimeSeqno,
    external_id: Option<ExternalId>,
    last_activity_at: DateTime<Utc>,
    kind: VaultKind,
    is_active: bool,
    status: Option<OnboardingStatus>,
}

#[derive(Debug, Clone, Default, AsChangeset)]
#[diesel(table_name = scoped_vault)]
pub struct ScopedVaultUpdate {
    pub status: Option<OnboardingStatus>,
    pub is_active: Option<bool>,
    pub last_activity_at: Option<DateTime<Utc>>,
}

#[derive(derive_more::From)]
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
    ExternalId {
        e_id: &'a ExternalId,
        t_id: &'a TenantId,
        is_live: IsLive,
    },
    /// Only used in firm-employee-authed GET /private/entities API
    #[from(ignore)]
    SuperAdminView {
        /// Either an fp id or a scoped vault id
        identifier: &'a str,
    },
}

#[derive(derive_more::From)]
pub enum BulkSvIdentifier<'a> {
    FpIds(Vec<FpId>),
    SvIds(Vec<&'a ScopedVaultId>),
}

pub type SerializableWorkflow = (Workflow, Option<InsightEvent>);
pub type SerializableEntity = (
    ScopedVault,
    Option<WatchlistCheck>,
    Option<WorkflowRequest>,
    Option<ScopedVaultLabel>,
    Vec<ManualReview>,
    Vec<SerializableWorkflow>,
);

pub type IsNew = bool;

pub struct NewScopedVaultArgs {
    pub is_active: bool,
    pub status: Option<OnboardingStatus>,
}

impl ScopedVault {
    /// Used to create a ScopedVault for an already-existing portable vault when that vault onboards
    /// onto a new tenant.
    #[tracing::instrument("ScopedVault::get_or_create_for_playbook", skip_all)]
    pub fn get_or_create_for_playbook(
        conn: &mut TxnPgConn,
        uv: &Locked<Vault>,
        ob_configuration_id: ObConfigurationId,
    ) -> DbResult<(Self, IsNew)> {
        let (ob_config, _) = ObConfiguration::get_enabled(conn, &ob_configuration_id)?;
        // Has to be inside locked txn, otherwise this could be a stale read.
        // Still protected by uniqueness constraints, but those are clunkier
        let scoped_vault = scoped_vault::table
            .filter(scoped_vault::vault_id.eq(&uv.id))
            .filter(scoped_vault::tenant_id.eq(&ob_config.tenant_id))
            .first(conn.conn())
            .optional()?;
        if let Some(scoped_vault) = scoped_vault {
            return Ok((scoped_vault, false));
        }
        // Row doesn't exist for vault_id, tenant_id - create a new one
        let args = NewScopedVaultArgs {
            is_active: true,
            status: None,
        };
        let sv = Self::create_for_playbook(conn, uv, ob_config, args)?;
        Ok((sv, true))
    }

    #[tracing::instrument("ScopedVault::create_for_playbook", skip_all)]
    pub fn create_for_playbook(
        conn: &mut TxnPgConn,
        uv: &Locked<Vault>,
        obc: ObConfiguration,
        args: NewScopedVaultArgs,
    ) -> DbResult<Self> {
        if uv.is_live != obc.is_live {
            return Err(DbError::SandboxMismatch);
        }
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let start_timestamp = Utc::now();
        let new = NewScopedVault {
            id: ScopedVaultId::generate(uv.kind),
            fp_id: FpId::generate(uv.kind, uv.is_live),
            vault_id: uv.id.clone(),
            start_timestamp,
            last_activity_at: start_timestamp,
            tenant_id: obc.tenant_id,
            is_live: obc.is_live,
            last_heartbeat_at: Utc::now(),
            is_active: args.is_active,
            snapshot_seqno: seqno,
            // NOTE: for now we won't support adding an external id to
            // users created via Verify
            external_id: None,
            kind: uv.kind,
            status: args.status,
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
        // Since the idempotency id and external ID are stored on the vault, concatenate them with
        // the tenant ID to make sure they are scoped per tenant.
        let idempotency_id = idempotency_id.map(|id| IdempotencyId::from(format!("{}.{}", tenant_id, id)));
        let idempotency_id_given = idempotency_id.is_some();

        let (uv, is_new_vault) = match &external_id {
            // Get the existing vault if an active scoped vault already exists with the given
            // external ID. Otherwise, create a new vault.
            Some(external_id) => {
                let id = ScopedVaultIdentifier::ExternalId {
                    e_id: external_id,
                    t_id: &tenant_id,
                    is_live: new_user.is_live,
                };
                let svr = ScopedVault::get(conn, id);
                match svr {
                    Ok(sv) => Ok((Vault::lock(conn, &sv.vault_id)?, false)),
                    Err(err) if err.is_not_found() => Ok(Vault::insert(conn, new_user, idempotency_id)?),
                    Err(err) => Err(err),
                }?
            }
            None => Vault::insert(conn, new_user, idempotency_id)?,
        };

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
                last_heartbeat_at: Utc::now(),
                // Vaults created via API are immediately active
                is_active: true,
                snapshot_seqno: seqno,
                external_id,
                kind: uv.kind,
                status: None,
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
                .filter(scoped_vault::is_active.eq(true))
                .get_result(conn.conn())
                .map_err(|e| match e {
                    diesel::result::Error::NotFound if idempotency_id_given => DbError::ValidationError(
                        "Vault previously created with given idempotency key has been deleted".to_owned(),
                    ),
                    e => e.into(),
                })?
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
                    .filter(scoped_vault::is_live.eq(is_live))
            }
            ScopedVaultIdentifier::Tenant { v_id, t_id } => {
                query = query
                    .filter(scoped_vault::vault_id.eq(v_id))
                    .filter(scoped_vault::tenant_id.eq(t_id))
            }
            ScopedVaultIdentifier::ExternalId { e_id, t_id, is_live } => {
                query = query
                    .filter(scoped_vault::external_id.eq(e_id))
                    .filter(scoped_vault::tenant_id.eq(t_id))
                    .filter(scoped_vault::is_live.eq(is_live))
                    .filter(scoped_vault::is_active.eq(true))
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
    pub fn bulk_get<'a, T: Into<BulkSvIdentifier<'a>>>(
        conn: &mut PgConn,
        ids: T,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<Vec<(Self, Vault)>> {
        use db_schema::schema::vault;
        let mut query = scoped_vault::table
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .inner_join(vault::table)
            .into_boxed();

        match ids.into() {
            BulkSvIdentifier::FpIds(fp_ids) => query = query.filter(scoped_vault::fp_id.eq_any(fp_ids)),
            BulkSvIdentifier::SvIds(sv_ids) => query = query.filter(scoped_vault::id.eq_any(sv_ids)),
        }
        let results = query.get_results::<(Self, Vault)>(conn)?;
        Ok(results)
    }

    #[tracing::instrument("ScopedVault::bulk_get_serializable_info", skip_all)]
    pub fn bulk_get_serializable_info(
        conn: &mut PgConn,
        ids: Vec<ScopedVaultId>,
    ) -> DbResult<HashMap<ScopedVaultId, SerializableEntity>> {
        use db_schema::schema::{
            insight_event,
            manual_review,
            scoped_vault_label,
            watchlist_check,
            workflow,
            workflow_request,
        };
        type ScopedVaultInfo = (
            ScopedVault,
            Option<WatchlistCheck>,
            Option<WorkflowRequest>,
            Option<ScopedVaultLabel>,
        );
        let results: Vec<ScopedVaultInfo> = scoped_vault::table
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
            .left_join(
                scoped_vault_label::table.on(scoped_vault_label::scoped_vault_id
                    .eq(scoped_vault::id)
                    .and(scoped_vault_label::deactivated_at.is_null())),
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
                let entity = (i.0, i.1, i.2, i.3, manual_reviews, workflows);
                (sv_id, entity)
            })
            .collect();
        Ok(result_map)
    }

    pub fn lock(conn: &mut PgConn, id: &ScopedVaultId) -> DbResult<Locked<Self>> {
        let result = scoped_vault::table
            .filter(scoped_vault::id.eq(id))
            .for_no_key_update()
            .get_result(conn)?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("ScopedVault::update", skip_all)]
    pub fn update(conn: &mut TxnPgConn, id: &ScopedVaultId, update: ScopedVaultUpdate) -> DbResult<Self> {
        let ScopedVaultUpdate {
            status,
            is_active,
            last_activity_at,
        } = &update;
        if status.is_none() && is_active.is_none() && last_activity_at.is_none() {
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

    #[tracing::instrument("ScopedVault::deactivate", skip_all)]
    pub fn deactivate(conn: &mut TxnPgConn, id: &ScopedVaultId) -> DbResult<Self> {
        let now = Utc::now();
        let updated_sv = diesel::update(scoped_vault::table)
            .filter(scoped_vault::id.eq(id))
            .filter(scoped_vault::deactivated_at.is_null())
            .set((
                scoped_vault::deactivated_at.eq(now),
                scoped_vault::is_active.eq(false),
            ))
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
        use db_schema::schema::{
            ob_configuration,
            tenant,
            workflow,
        };
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
            // Only allow billing for active users
            .filter(scoped_vault::is_active.eq(true))
            // Only bill for users that have data in them
            .filter(scoped_vault::id.eq_any(sv_with_data))
            // Only bill for vaults that existed by the end of the billng period
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::fixtures;
    use crate::tests::prelude::*;
    use macros::db_test;

    #[db_test]
    fn test_create_scoped_vault_idempotency(conn: &mut TestPgConn) {
        let tenant = fixtures::tenant::create(conn);

        let nva = NewVaultArgs {
            e_private_key: vec![].into(),
            public_key: vec![].into(),
            is_live: false,
            kind: VaultKind::Person,
            is_fixture: true,
            sandbox_id: None,
            is_created_via_api: true,
            duplicate_of_id: None,
        };

        struct Create<'a> {
            idempotency_id: Option<&'a str>,
            external_id: Option<&'a str>,
        }
        struct Test<'a> {
            name: &'a str,
            create_1: Create<'a>,
            create_2: Create<'a>,
            expect_same_fp_ids: bool,
            expect_external_ids: (Option<&'a str>, Option<&'a str>),
        }

        let tests = [
            Test {
                name: "Create with no idempotency ID and no external ID.",
                create_1: Create {
                    idempotency_id: None,
                    external_id: None,
                },
                create_2: Create {
                    idempotency_id: None,
                    external_id: None,
                },
                expect_same_fp_ids: false,
                expect_external_ids: (None, None),
            },
            Test {
                name: "Create with same idempotency ID and no external ID.",
                create_1: Create {
                    idempotency_id: Some("idempotency-id-1"),
                    external_id: None,
                },
                create_2: Create {
                    idempotency_id: Some("idempotency-id-1"),
                    external_id: None,
                },
                expect_same_fp_ids: true,
                expect_external_ids: (None, None),
            },
            Test {
                name: "Create with different idempotency ID and no external ID.",
                create_1: Create {
                    idempotency_id: Some("idempotency-id-2"),
                    external_id: None,
                },
                create_2: Create {
                    idempotency_id: Some("idempotency-id-3"),
                    external_id: None,
                },
                expect_same_fp_ids: false,
                expect_external_ids: (None, None),
            },
            Test {
                name: "Create with no idempotency ID and same external ID.",
                create_1: Create {
                    idempotency_id: None,
                    external_id: Some("external-id-1"),
                },
                create_2: Create {
                    idempotency_id: None,
                    external_id: Some("external-id-1"),
                },
                expect_same_fp_ids: true,
                expect_external_ids: (Some("external-id-1"), Some("external-id-1")),
            },
            Test {
                name: "Create with no idempotency ID and different external ID.",
                create_1: Create {
                    idempotency_id: None,
                    external_id: Some("external-id-2"),
                },
                create_2: Create {
                    idempotency_id: None,
                    external_id: Some("external-id-3"),
                },
                expect_same_fp_ids: false,
                expect_external_ids: (Some("external-id-2"), Some("external-id-3")),
            },
            Test {
                name: "Create with same idempotency ID and same external ID.",
                create_1: Create {
                    idempotency_id: Some("idempotency-id-4"),
                    external_id: Some("external-id-4"),
                },
                create_2: Create {
                    idempotency_id: Some("idempotency-id-4"),
                    external_id: Some("external-id-4"),
                },
                expect_same_fp_ids: true,
                expect_external_ids: (Some("external-id-4"), Some("external-id-4")),
            },
            Test {
                name: "Create with same idempotency ID and different external ID.",
                create_1: Create {
                    idempotency_id: Some("idempotency-id-5"),
                    external_id: Some("external-id-5"),
                },
                create_2: Create {
                    idempotency_id: Some("idempotency-id-5"),
                    external_id: Some("external-id-6"),
                },
                expect_same_fp_ids: true,
                expect_external_ids: (Some("external-id-5"), Some("external-id-5")),
            },
            Test {
                name: "Create with different idempotency ID and same external ID.",
                create_1: Create {
                    idempotency_id: Some("idempotency-id-6"),
                    external_id: Some("external-id-7"),
                },
                create_2: Create {
                    idempotency_id: Some("idempotency-id-7"),
                    external_id: Some("external-id-7"),
                },
                expect_same_fp_ids: true,
                expect_external_ids: (Some("external-id-7"), Some("external-id-7")),
            },
            Test {
                name: "Create with different idempotency ID and different external ID.",
                create_1: Create {
                    idempotency_id: Some("idempotency-id-8"),
                    external_id: Some("external-id-8"),
                },
                create_2: Create {
                    idempotency_id: Some("idempotency-id-9"),
                    external_id: Some("external-id-9"),
                },
                expect_same_fp_ids: false,
                expect_external_ids: (Some("external-id-8"), Some("external-id-9")),
            },
        ];

        for test in tests {
            let (sv0, _) = ScopedVault::get_or_create_non_portable(
                conn,
                nva.clone(),
                tenant.id.clone(),
                test.create_1.idempotency_id.map(|s| s.into()),
                test.create_1.external_id.map(|s| s.to_owned().into()),
                DbActor::Footprint,
            )
            .unwrap_or_else(|e| panic!("{}: create 1 failed with error: {}", test.name, e,));
            let (sv1, _) = ScopedVault::get_or_create_non_portable(
                conn,
                nva.clone(),
                tenant.id.clone(),
                test.create_2.idempotency_id.map(|s| s.into()),
                test.create_2.external_id.map(|s| s.to_owned().into()),
                DbActor::Footprint,
            )
            .unwrap_or_else(|e| panic!("{}: create 2 failed with error: {}", test.name, e,));
            if test.expect_same_fp_ids {
                assert_eq!(sv0.fp_id, sv1.fp_id, "{}", test.name);
            } else {
                assert_ne!(sv0.fp_id, sv1.fp_id, "{}", test.name);
            }
            assert_eq!(
                sv0.external_id,
                test.expect_external_ids.0.map(|s| s.to_owned().into()),
                "{}",
                test.name
            );
            assert_eq!(
                sv1.external_id,
                test.expect_external_ids.1.map(|s| s.to_owned().into()),
                "{}",
                test.name
            );
        }
    }

    #[db_test]
    fn test_create_scoped_vault_after_deactivate(conn: &mut TestPgConn) {
        let tenant = fixtures::tenant::create(conn);

        let nva = NewVaultArgs {
            e_private_key: vec![].into(),
            public_key: vec![].into(),
            is_live: false,
            kind: VaultKind::Person,
            is_fixture: true,
            sandbox_id: None,
            is_created_via_api: true,
            duplicate_of_id: None,
        };

        // Test first using an idempotency ID.
        let (sv0, _) = ScopedVault::get_or_create_non_portable(
            conn,
            nva.clone(),
            tenant.id.clone(),
            Some("idempotency-id-1".into()),
            Some("external-id-1".to_owned().into()),
            DbActor::Footprint,
        )
        .unwrap();
        assert_eq!(
            sv0.external_id.map(|e| e.to_string()),
            Some("external-id-1".to_owned())
        );

        ScopedVault::deactivate(conn, &sv0.id).unwrap();

        let err = ScopedVault::get_or_create_non_portable(
            conn,
            nva.clone(),
            tenant.id.clone(),
            Some("idempotency-id-1".into()),
            Some("external-id-1".to_owned().into()),
            DbActor::Footprint,
        )
        .unwrap_err();
        assert!(matches!(err, DbError::ValidationError(_)));

        let (sv1, _) = ScopedVault::get_or_create_non_portable(
            conn,
            nva.clone(),
            tenant.id.clone(),
            Some("idempotency-id-2".into()),
            Some("external-id-1".to_owned().into()),
            DbActor::Footprint,
        )
        .unwrap();
        assert_eq!(
            sv1.external_id.map(|e| e.to_string()),
            Some("external-id-1".to_owned())
        );

        assert_ne!(sv0.fp_id, sv1.fp_id);

        // Test next without an idempotency ID.
        let (sv2, _) = ScopedVault::get_or_create_non_portable(
            conn,
            nva.clone(),
            tenant.id.clone(),
            None,
            Some("external-id-1".to_owned().into()),
            DbActor::Footprint,
        )
        .unwrap();
        assert_eq!(
            sv2.external_id.map(|e| e.to_string()),
            Some("external-id-1".to_owned())
        );

        let (sv3, _) = ScopedVault::get_or_create_non_portable(
            conn,
            nva.clone(),
            tenant.id.clone(),
            None,
            Some("external-id-1".to_owned().into()),
            DbActor::Footprint,
        )
        .unwrap();
        assert_eq!(sv2.fp_id, sv3.fp_id);
        assert_eq!(
            sv3.external_id.map(|e| e.to_string()),
            Some("external-id-1".to_owned())
        );

        ScopedVault::deactivate(conn, &sv2.id).unwrap();

        let (sv4, _) = ScopedVault::get_or_create_non_portable(
            conn,
            nva.clone(),
            tenant.id.clone(),
            None,
            Some("external-id-1".to_owned().into()),
            DbActor::Footprint,
        )
        .unwrap();
        assert_ne!(sv3.fp_id, sv4.fp_id);
        assert_eq!(
            sv4.external_id.map(|e| e.to_string()),
            Some("external-id-1".to_owned())
        );
    }
}
