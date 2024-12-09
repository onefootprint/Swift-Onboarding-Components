use super::insight_event::InsightEvent;
use super::manual_review::ManualReview;
use super::ob_configuration::IsLive;
use super::ob_configuration::ObConfiguration;
use super::scoped_vault_label::ScopedVaultLabel;
use super::task::Task;
use super::tenant::Tenant;
use super::vault::NewVaultArgs;
use super::vault::Vault;
use super::watchlist_check::WatchlistCheck;
use super::workflow::Workflow;
use super::workflow_request::WorkflowRequest;
use crate::models::scoped_vault_tag::ScopedVaultTag;
use crate::models::workflow_request_junction::WorkflowRequestJunction;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::BadRequest;
use api_errors::FpErrorCode;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Duration;
use chrono::Utc;
use db_schema::schema::business_owner;
use db_schema::schema::playbook;
use db_schema::schema::scoped_vault;
use db_schema::schema::vault;
use diesel::dsl::count_distinct;
use diesel::dsl::not;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use itertools::Itertools;
use newtypes::BoId;
use newtypes::ExternalId;
use newtypes::FireWebhookArgs;
use newtypes::FpId;
use newtypes::IdempotencyId;
use newtypes::Locked;
use newtypes::OnboardingStatus;
use newtypes::ScopedVaultId;
use newtypes::ScopedVaultOrderingId;
use newtypes::TenantId;
use newtypes::UserSpecificWebhookKind;
use newtypes::UserSpecificWebhookPayload;
use newtypes::VaultId;
use newtypes::VaultKind;
use newtypes::WebhookEvent;
use newtypes::WorkflowId;
use std::collections::HashMap;

/// Creates a unique identifier specific to each onboarding configuration.
/// This allows one user to onboard onto multiple onboarding configurations at the same tenant
/// while keeping information for each onboarding separate.
#[derive(Debug, Clone, Queryable, Eq, PartialEq)]
#[diesel(table_name = scoped_vault)]
pub struct ScopedVault {
    pub id: ScopedVaultId,
    pub fp_id: FpId,
    pub vault_id: VaultId,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub ordering_id: ScopedVaultOrderingId,
    pub start_timestamp: DateTime<Utc>,
    /// Denormalized from the user vault just to make querying easier
    pub is_live: bool,
    pub status: OnboardingStatus,
    /// Last time we logged a hosted API interacted with this scoped vault. Vaults touched recently
    /// are considered in progress if their KYC status is still incomplete
    pub last_heartbeat_at: DateTime<Utc>,
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
    /// True if the vault has reached the threshold of being considered "billable" for vault data
    /// storage. Vaults cross this threshold when the first piece of data is vaulted other than
    /// name, email, phone. Effectively, we won't charge for vaults that only have name, email,
    /// and / or phone
    pub is_billable_for_vault_storage: bool,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = scoped_vault)]
struct NewScopedVault<'a> {
    id: ScopedVaultId,
    fp_id: FpId,
    vault_id: &'a VaultId,
    tenant_id: &'a TenantId,
    start_timestamp: DateTime<Utc>,
    is_live: bool,
    last_heartbeat_at: DateTime<Utc>,
    external_id: Option<&'a ExternalId>,
    last_activity_at: DateTime<Utc>,
    kind: VaultKind,
    is_active: bool,
    status: OnboardingStatus,
    is_billable_for_vault_storage: bool,
}

#[derive(Debug, Clone, Default, AsChangeset, Eq, PartialEq)]
#[diesel(table_name = scoped_vault)]
pub struct ScopedVaultUpdate {
    pub is_active: Option<bool>,
    pub is_billable_for_vault_storage: Option<bool>,
    pub last_activity_at: Option<DateTime<Utc>>,
    pub external_id: Option<ExternalId>,
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
    /// A business fp_bid owned by the provided user uv_id
    #[from(ignore)]
    OwnedFpBid {
        fp_bid: &'a FpId,
        uv_id: &'a VaultId,
    },
    #[from(ignore)]
    OwnedBusiness {
        bo_id: &'a BoId,
        uv_id: &'a VaultId,
        t_id: &'a TenantId,
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
    Vec<ScopedVaultTag>,
);

pub type IsNew = bool;

pub struct NewScopedVaultArgs<'a> {
    pub is_active: bool,
    pub status: OnboardingStatus,
    pub external_id: Option<&'a ExternalId>,
    pub tenant_id: &'a TenantId,
}

#[derive(Debug)]
pub struct SvStatusDelta {
    pub old_status: OnboardingStatus,
    pub new_status: OnboardingStatus,
}

impl ScopedVault {
    /// Creates a new ScopedVault for the provided (vault, tenant) combo if one doesn't already
    /// exist.
    #[tracing::instrument("ScopedVault::lock_or_create_for_tenant", skip_all)]
    pub fn lock_or_create_for_tenant(
        conn: &mut TxnPgConn,
        vault: &Locked<Vault>,
        tenant_id: &TenantId,
    ) -> FpResult<(Locked<Self>, IsNew)> {
        // Has to be inside locked txn, otherwise this could be a stale read.
        // Still protected by uniqueness constraints, but those are clunkier
        let scoped_vault: Option<ScopedVault> = scoped_vault::table
            .filter(scoped_vault::vault_id.eq(&vault.id))
            .filter(scoped_vault::tenant_id.eq(&tenant_id))
            .first(conn.conn())
            .optional()?;
        if let Some(scoped_vault) = scoped_vault {
            return Ok((Locked::new(scoped_vault), false));
        }
        // Row doesn't exist for vault_id, tenant_id - create a new one
        let args = NewScopedVaultArgs {
            is_active: true,
            status: OnboardingStatus::None,
            external_id: None,
            tenant_id,
        };
        let sv = Self::create(conn, vault, args)?;
        Ok((sv, true))
    }

    /// Used to get or create a new ScopedVault and Vault for the provided
    /// idempotency_id/external_id
    #[tracing::instrument("ScopedVault::get_or_create_by_external_id", skip_all)]
    pub fn get_or_create_by_external_id(
        conn: &mut TxnPgConn,
        new_user: NewVaultArgs,
        args: NewScopedVaultArgs,
        idempotency_id: Option<String>,
    ) -> FpResult<(Self, Vault, IsNew)> {
        // Since the idempotency id and external ID are stored on the vault, concatenate them with
        // the tenant ID to make sure they are scoped per tenant.
        let idempotency_id =
            idempotency_id.map(|id| IdempotencyId::from(format!("{}.{}", args.tenant_id, id)));
        let idempotency_id_given = idempotency_id.is_some();

        let (uv, is_new_vault) = match args.external_id.as_ref() {
            // Get the existing vault if an active scoped vault already exists with the given
            // external ID. Otherwise, create a new vault.
            Some(external_id) => {
                let id = ScopedVaultIdentifier::ExternalId {
                    e_id: external_id,
                    t_id: args.tenant_id,
                    is_live: new_user.is_live,
                };
                let svr = ScopedVault::get(conn, id);
                // TODO instead of silently inheriting, we might want to actualy HTTP 409
                match svr {
                    Ok(sv) => Ok((Vault::lock(conn, &sv.vault_id)?, false)),
                    Err(err) if err.code() == Some(FpErrorCode::DbDataNotFound) => {
                        Ok(Vault::insert(conn, new_user, idempotency_id)?)
                    }
                    Err(err) => Err(err),
                }?
            }
            None => Vault::insert(conn, new_user, idempotency_id)?,
        };

        let su = if is_new_vault {
            Self::create(conn, &uv, args)?.into_inner()
        } else {
            scoped_vault::table
                .filter(scoped_vault::vault_id.eq(&uv.id))
                .filter(scoped_vault::tenant_id.eq(args.tenant_id))
                .filter(scoped_vault::is_active.eq(true))
                .get_result(conn.conn())
                .map_err(|e| match e {
                    diesel::result::Error::NotFound if idempotency_id_given => {
                        BadRequest("Vault previously created with given external ID has been deleted")
                    }
                    e => e.into(),
                })?
        };
        Ok((su, uv.into_inner(), is_new_vault))
    }

    #[tracing::instrument("ScopedVault::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        uv: &Locked<Vault>,
        args: NewScopedVaultArgs,
    ) -> FpResult<Locked<Self>> {
        let NewScopedVaultArgs {
            tenant_id,
            is_active,
            status,
            external_id,
        } = args;
        let start_timestamp = Utc::now();
        let new = NewScopedVault {
            id: ScopedVaultId::generate(uv.kind),
            fp_id: FpId::generate(uv.kind, uv.is_live),
            vault_id: &uv.id,
            start_timestamp,
            last_activity_at: start_timestamp,
            tenant_id,
            is_live: uv.is_live,
            last_heartbeat_at: start_timestamp,
            is_active,
            external_id,
            kind: uv.kind,
            status,
            is_billable_for_vault_storage: false,
        };
        let sv = diesel::insert_into(scoped_vault::table)
            .values(new)
            .get_result::<ScopedVault>(conn.conn())?;
        Ok(Locked::new(sv))
    }

    #[tracing::instrument("ScopedVault::get", skip_all)]
    pub fn get<'a, T: Into<ScopedVaultIdentifier<'a>>>(conn: &mut PgConn, id: T) -> FpResult<ScopedVault> {
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
            ScopedVaultIdentifier::OwnedFpBid { fp_bid, uv_id } => {
                let bv_ids = business_owner::table
                    .filter(business_owner::user_vault_id.eq(uv_id))
                    .select(business_owner::business_vault_id);
                query = query
                    .filter(scoped_vault::fp_id.eq(fp_bid))
                    .filter(scoped_vault::kind.eq(VaultKind::Business))
                    .filter(scoped_vault::vault_id.eq_any(bv_ids))
            }
            ScopedVaultIdentifier::OwnedBusiness { bo_id, uv_id, t_id } => {
                let bv_ids = business_owner::table
                    .filter(business_owner::user_vault_id.eq(uv_id))
                    .filter(business_owner::id.eq(bo_id))
                    .select(business_owner::business_vault_id);
                query = query
                    .filter(scoped_vault::kind.eq(VaultKind::Business))
                    .filter(scoped_vault::vault_id.eq_any(bv_ids))
                    .filter(scoped_vault::tenant_id.eq(t_id))
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
    ) -> FpResult<Vec<(Self, Vault)>> {
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
    ) -> FpResult<HashMap<ScopedVaultId, SerializableEntity>> {
        use db_schema::schema::insight_event;
        use db_schema::schema::manual_review;
        use db_schema::schema::scoped_vault_label;
        use db_schema::schema::scoped_vault_tag;
        use db_schema::schema::watchlist_check;
        use db_schema::schema::workflow;
        use db_schema::schema::workflow_request;
        use db_schema::schema::workflow_request_junction;
        type ScopedVaultInfo = (
            ScopedVault,
            Option<WatchlistCheck>,
            Option<(WorkflowRequest, WorkflowRequestJunction)>,
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
                workflow_request::table
                    .inner_join(workflow_request_junction::table)
                    .on(workflow_request_junction::scoped_vault_id
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

        // Fetch workflows separately since there may be multiple for one scoped vault
        let mut tags = scoped_vault_tag::table
            .filter(scoped_vault_tag::scoped_vault_id.eq_any(&ids))
            .filter(scoped_vault_tag::deactivated_seqno.is_null())
            .get_results::<ScopedVaultTag>(conn)?
            .into_iter()
            .map(|i| (i.scoped_vault_id.clone(), i))
            .into_group_map();

        // Turn the Vec of OnboardingInfo into a hashmap of ScopedVaultId -> Vec<SerializableEntity>
        let result_map = results
            .into_iter()
            .map(|i| {
                let sv_id = i.0.id.clone();
                let manual_reviews = manual_reviews.remove(&sv_id).unwrap_or_default();
                let workflows = workflows.remove(&sv_id).unwrap_or_default();
                let tags = tags.remove(&sv_id).unwrap_or_default();
                let wfr = i.2.map(|(wfr, _)| wfr);
                let entity = (i.0, i.1, wfr, i.3, manual_reviews, workflows, tags);
                (sv_id, entity)
            })
            .collect();
        Ok(result_map)
    }

    pub fn lock<'a, T: Into<ScopedVaultIdentifier<'a>>>(conn: &mut PgConn, id: T) -> FpResult<Locked<Self>> {
        // First lock the vault so we have a defined ordering of locks between the vault and scoped vault
        // tables. This will no-op if we have already locked the vault
        let sv = Self::get(conn, id)?;
        vault::table
            .filter(vault::id.eq(&sv.vault_id))
            .for_no_key_update()
            .get_result::<Vault>(conn)?;
        let result = scoped_vault::table
            .filter(scoped_vault::id.eq(&sv.id))
            .for_no_key_update()
            .get_result(conn)?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("ScopedVault::update", skip_all)]
    pub fn update(conn: &mut TxnPgConn, id: &ScopedVaultId, update: ScopedVaultUpdate) -> FpResult<Self> {
        if update == Default::default() {
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

    #[tracing::instrument("ScopedVault::update_status_if_valid", skip_all)]
    pub fn update_status_if_valid(
        conn: &mut TxnPgConn,
        id: &ScopedVaultId,
        new_status: OnboardingStatus,
    ) -> FpResult<SvStatusDelta> {
        // Must lock to make sure scoped vault status isn't stale
        let sv = ScopedVault::lock(conn, id)?.into_inner();
        let can_transition = new_status.can_transition_from(&sv.status);
        if !can_transition {
            let result = SvStatusDelta {
                old_status: sv.status,
                new_status: sv.status,
            };
            return Ok(result);
        }

        // Only set to non-decision status if the current status is a non-decision status.
        // This has the effect of never letting the scoped vault status go from a decision to a
        // non-decision status
        diesel::update(scoped_vault::table)
            .filter(scoped_vault::id.eq(id))
            .set(scoped_vault::status.eq(new_status))
            .execute(conn.conn())?;

        let result = SvStatusDelta {
            old_status: sv.status,
            new_status,
        };
        Ok(result)
    }

    #[tracing::instrument("ScopedVault::deactivate", skip_all)]
    pub fn deactivate(conn: &mut TxnPgConn, id: &ScopedVaultId) -> FpResult<Self> {
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

    pub fn set_heartbeat(&self, conn: &mut PgConn) -> FpResult<()> {
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
    pub fn list_authorized(conn: &mut PgConn, v_id: &VaultId) -> FpResult<Vec<AuthorizedTenant>> {
        use db_schema::schema::ob_configuration;
        use db_schema::schema::tenant;
        use db_schema::schema::workflow;
        let results = workflow::table
            .inner_join(scoped_vault::table)
            .inner_join(ob_configuration::table.inner_join(playbook::table.inner_join(tenant::table)))
            .filter(scoped_vault::vault_id.eq(v_id))
            .filter(not(workflow::authorized_at.is_null()))
            .order_by(workflow::created_at.desc())
            .select((
                workflow::all_columns,
                scoped_vault::all_columns,
                ob_configuration::all_columns,
                tenant::all_columns,
            ))
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument("ScopedVault::list", skip_all)]
    pub fn list(conn: &mut PgConn, v_id: &VaultId) -> FpResult<Vec<Self>> {
        let results = scoped_vault::table
            .filter(scoped_vault::vault_id.eq(v_id))
            .get_results(conn)?;
        Ok(results)
    }

    /// Count the number of scoped vaults that are billable for PII storage
    #[tracing::instrument("ScopedVault::count_billable", skip_all)]
    pub fn count_billable_for_vault_storage(
        conn: &mut PgConn,
        t_id: &TenantId,
        end_date: DateTime<Utc>,
        filters: ScopedVaultPiiFilters,
    ) -> FpResult<i64> {
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
            .filter(scoped_vault::is_billable_for_vault_storage.eq(true))
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

    pub fn webhook_event(&self, webhook_event: WebhookEvent) -> FireWebhookArgs {
        FireWebhookArgs {
            scoped_vault_id: self.id.clone(),
            tenant_id: self.tenant_id.clone(),
            is_live: self.is_live,
            webhook_event,
        }
    }

    /// For the more modern webhook kinds, create a task that will send the provided webhook `kind`
    /// for the provided `ScopedVault`.
    pub fn create_webhook_task(&self, conn: &mut TxnPgConn, kind: UserSpecificWebhookKind) -> FpResult<()> {
        let payload = UserSpecificWebhookPayload {
            is_live: self.is_live,
            fp_id: self.fp_id.clone(),
            timestamp: Utc::now(),
        };
        let webhook_event = match kind {
            UserSpecificWebhookKind::InfoRequested => WebhookEvent::UserInfoRequested(payload),
            UserSpecificWebhookKind::ManualReview => WebhookEvent::UserManualReview(payload),
        };
        let args = FireWebhookArgs {
            scoped_vault_id: self.id.clone(),
            tenant_id: self.tenant_id.clone(),
            is_live: self.is_live,
            webhook_event,
        };
        Task::create(conn, Utc::now(), args)?;
        Ok(())
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
    use std::str::FromStr;

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
            let ext_id = (test.create_1.external_id).map(|s| ExternalId::from_str(s).unwrap());
            let sv_args = NewScopedVaultArgs {
                is_active: true,
                status: OnboardingStatus::None,
                tenant_id: &tenant.id,
                external_id: ext_id.as_ref(),
            };
            let (sv0, _, _) = ScopedVault::get_or_create_by_external_id(
                conn,
                nva.clone(),
                sv_args,
                test.create_1.idempotency_id.map(|s| s.into()),
            )
            .unwrap_or_else(|e| panic!("{}: create 1 failed with error: {}", test.name, e,));
            let ext_id = (test.create_2.external_id).map(|s| ExternalId::from_str(s).unwrap());
            let sv_args = NewScopedVaultArgs {
                is_active: true,
                status: OnboardingStatus::None,
                tenant_id: &tenant.id,
                external_id: ext_id.as_ref(),
            };
            let (sv1, _, _) = ScopedVault::get_or_create_by_external_id(
                conn,
                nva.clone(),
                sv_args,
                test.create_2.idempotency_id.map(|s| s.into()),
            )
            .unwrap_or_else(|e| panic!("{}: create 2 failed with error: {}", test.name, e,));
            if test.expect_same_fp_ids {
                assert_eq!(sv0.fp_id, sv1.fp_id, "{}", test.name);
            } else {
                assert_ne!(sv0.fp_id, sv1.fp_id, "{}", test.name);
            }
            assert_eq!(
                sv0.external_id,
                test.expect_external_ids
                    .0
                    .map(|s| ExternalId::from_str(s).unwrap()),
                "{}",
                test.name
            );
            assert_eq!(
                sv1.external_id,
                test.expect_external_ids
                    .1
                    .map(|s| ExternalId::from_str(s).unwrap()),
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
        let ext_id = ExternalId::from_str("external-id-1").unwrap();

        // Test first using an idempotency ID.
        let sv_args = NewScopedVaultArgs {
            is_active: true,
            status: OnboardingStatus::None,
            tenant_id: &tenant.id,
            external_id: Some(&ext_id),
        };
        let (sv0, _, _) = ScopedVault::get_or_create_by_external_id(
            conn,
            nva.clone(),
            sv_args,
            Some("idempotency-id-1".into()),
        )
        .unwrap();
        assert_eq!(sv0.external_id.unwrap(), ext_id);

        ScopedVault::deactivate(conn, &sv0.id).unwrap();

        let sv_args = NewScopedVaultArgs {
            is_active: true,
            status: OnboardingStatus::None,
            tenant_id: &tenant.id,
            external_id: Some(&ext_id),
        };
        let err = ScopedVault::get_or_create_by_external_id(
            conn,
            nva.clone(),
            sv_args,
            Some("idempotency-id-1".into()),
        )
        .unwrap_err();
        assert_eq!(
            err.message(),
            "Vault previously created with given external ID has been deleted",
        );

        let sv_args = NewScopedVaultArgs {
            is_active: true,
            status: OnboardingStatus::None,
            tenant_id: &tenant.id,
            external_id: Some(&ext_id),
        };
        let (sv1, _, _) = ScopedVault::get_or_create_by_external_id(
            conn,
            nva.clone(),
            sv_args,
            Some("idempotency-id-2".into()),
        )
        .unwrap();
        assert_eq!(sv1.external_id.unwrap(), ext_id);
        assert_ne!(sv0.fp_id, sv1.fp_id);

        // Test next without an idempotency ID.
        let sv_args = NewScopedVaultArgs {
            is_active: true,
            status: OnboardingStatus::None,
            tenant_id: &tenant.id,
            external_id: Some(&ext_id),
        };
        let (sv2, _, _) =
            ScopedVault::get_or_create_by_external_id(conn, nva.clone(), sv_args, None).unwrap();
        assert_eq!(sv2.external_id.unwrap(), ext_id);
        let sv_args = NewScopedVaultArgs {
            is_active: true,
            status: OnboardingStatus::None,
            tenant_id: &tenant.id,
            external_id: Some(&ext_id),
        };
        let (sv3, _, _) =
            ScopedVault::get_or_create_by_external_id(conn, nva.clone(), sv_args, None).unwrap();
        assert_eq!(sv2.fp_id, sv3.fp_id);
        assert_eq!(sv3.external_id.unwrap(), ext_id);

        ScopedVault::deactivate(conn, &sv2.id).unwrap();

        let sv_args = NewScopedVaultArgs {
            is_active: true,
            status: OnboardingStatus::None,
            tenant_id: &tenant.id,
            external_id: Some(&ext_id),
        };
        let (sv4, _, _) =
            ScopedVault::get_or_create_by_external_id(conn, nva.clone(), sv_args, None).unwrap();
        assert_ne!(sv3.fp_id, sv4.fp_id);
        assert_eq!(sv4.external_id.unwrap(), ext_id);
    }
}
