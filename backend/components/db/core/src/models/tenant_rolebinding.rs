use super::{
    partner_tenant::PartnerTenant,
    tenant::Tenant,
    tenant_role::{ImmutableRoleKind, TenantRole},
    tenant_user::TenantUser,
};
use crate::{
    helpers::{TenantOrPartnerTenant, WorkosAuthIdentity},
    DbError, DbResult, NextPage, OffsetPagination, PgConn, TxnPgConn,
};
use chrono::{DateTime, Utc};
use db_schema::schema::{tenant_role, tenant_rolebinding, tenant_user};
use derive_more::From;
use diesel::{dsl::not, prelude::*, Queryable};
use newtypes::{
    OrgIdentifierRef, PartnerTenantId, TenantId, TenantRoleId, TenantRoleKind, TenantRoleKindDiscriminant,
    TenantRolebindingId, TenantUserId, WorkosAuthMethod,
};

#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = tenant_rolebinding)]
pub struct TenantRolebinding {
    pub id: TenantRolebindingId,
    pub tenant_user_id: TenantUserId,
    pub tenant_role_id: TenantRoleId,
    pub last_login_at: Option<DateTime<Utc>>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

pub type IsFirstLogin = bool;
pub type TenantUserInfo = (TenantUser, TenantRolebinding, TenantRole, TenantOrPartnerTenant);
pub type BasicTenantUserInfo = (TenantUser, TenantRolebinding, TenantRole);

#[non_exhaustive] // Prevents composing outside of this crate
pub struct TenantRbLoginResult {
    pub t_user: TenantUser,
    pub rb: TenantRolebinding,
    pub role: TenantRole,
    pub t_pt: TenantOrPartnerTenant,
    pub is_first_login: IsFirstLogin,
    pub auth_method: WorkosAuthMethod,
}

#[derive(From)]
pub enum TenantRolebindingIdentifier<'a> {
    Id(&'a TenantRolebindingId),
    /// Used when we have a TenantRolebindingId but want to check that the tenant owns the RB
    Tenant(&'a TenantRolebindingId, &'a TenantId),
    User(&'a TenantUserId, &'a TenantId),
    PartnerTenantUser(&'a TenantUserId, &'a PartnerTenantId),
    OrgUser(&'a TenantUserId, OrgIdentifierRef<'a>),
}

// It's hard to type this query in Rust, so we use a macro to share its logic
macro_rules! list_query {
    ($params: ident) => {{
        let mut query = tenant_user::table
            .inner_join(tenant_rolebinding::table.inner_join(tenant_role::table))
            .filter(TenantRole::tenant_or_partner_tenant_id_eq($params.org_id))
            .into_boxed();

        if $params.only_active {
            query = query.filter(tenant_rolebinding::deactivated_at.is_null())
        }
        if let Some(ref role_ids) = $params.role_ids {
            query = query.filter(tenant_rolebinding::tenant_role_id.eq_any(role_ids));
        }
        if let Some(ref search) = $params.search {
            let pattern = format!("%{}%", search);
            query = query.filter(
                tenant_user::first_name
                    .ilike(pattern.clone())
                    .or(tenant_user::last_name.ilike(pattern.clone()))
                    .or(tenant_user::email.ilike(pattern)),
            )
        }
        if let Some(is_invite_pending) = $params.is_invite_pending {
            match is_invite_pending {
                true => query = query.filter(tenant_rolebinding::last_login_at.is_null()),
                false => query = query.filter(not(tenant_rolebinding::last_login_at.is_null())),
            }
        }

        query
    }};
}

impl TenantRolebinding {
    /// Creates a rolebinding to associate the TenantUser with the provided role
    #[tracing::instrument("TenantRolebinding::create", skip_all)]
    pub fn create<'a>(
        conn: &mut TxnPgConn,
        tenant_user_id: TenantUserId,
        tenant_role_id: TenantRoleId,
        org_id: impl Into<OrgIdentifierRef<'a>>,
    ) -> DbResult<(Self, TenantRole)> {
        let org_id: OrgIdentifierRef<'a> = org_id.into();

        // Make sure the role we are using belongs to the tenant, otherwise could invite self to
        // another tenant's role
        let tenant_role = TenantRole::lock_active(conn, &tenant_role_id, org_id)?;

        // Validate the given role's kind.
        match tenant_role.kind {
            TenantRoleKindDiscriminant::DashboardUser
            | TenantRoleKindDiscriminant::CompliancePartnerDashboardUser => {
                if tenant_role.kind.tenant_kind() != org_id.into() {
                    return Err(DbError::IncorrectTenantKind);
                }
            }
            TenantRoleKindDiscriminant::ApiKey => {
                // API keys roles can't be bound to a tenant user.
                return Err(DbError::IncorrectTenantRoleKind);
            }
        }

        // Lock the user so we don't create two rolebindings in parallel
        TenantUser::lock(conn, &tenant_user_id)?;

        let new = NewTenantRolebinding {
            tenant_user_id,
            tenant_role_id,
            // init to None since they haven't logged in yet!
            last_login_at: None,
            created_at: Utc::now(),
        };
        let rb = diesel::insert_into(tenant_rolebinding::table)
            .values(new)
            .get_result(conn.conn())
            .map_err(DbError::from)
            .map_err(|e| {
                if e.is_unique_constraint_violation() {
                    // There's already a rolebinding for this tenant user at this tenant
                    DbError::TenantRolebindingAlreadyExists
                } else {
                    e
                }
            })?;
        Ok((rb, tenant_role.into_inner()))
    }

    #[tracing::instrument("TenantRolebinding::create_for_login", skip_all)]
    pub fn create_for_login<'a>(
        conn: &mut TxnPgConn,
        user_id: TenantUserId,
        org_id: impl Into<OrgIdentifierRef<'a>>,
    ) -> DbResult<Self> {
        let org_id: OrgIdentifierRef<'a> = org_id.into();

        // Get the default admin and read-only role for this tenant/partner tenant.
        let (tenant_role_kind, admin_role_kind, ro_role_kind) = match org_id {
            OrgIdentifierRef::TenantId(_) => (
                TenantRoleKind::DashboardUser,
                ImmutableRoleKind::Admin,
                ImmutableRoleKind::ReadOnly,
            ),
            OrgIdentifierRef::PartnerTenantId(_) => (
                TenantRoleKind::CompliancePartnerDashboardUser,
                ImmutableRoleKind::CompliancePartnerAdmin,
                ImmutableRoleKind::CompliancePartnerReadOnly,
            ),
        };
        let admin_role = TenantRole::get_immutable(conn, org_id, admin_role_kind, tenant_role_kind)?;
        let ro_role = TenantRole::get_immutable(conn, org_id, ro_role_kind, tenant_role_kind)?;

        // If the tenant was just created and has no users, give the user admin perms.
        // Otherwise, read-only perms
        let filters = TenantRolebindingFilters {
            org_id,
            only_active: false,
            role_ids: None,
            search: None,
            is_invite_pending: None,
        };
        let pagination = OffsetPagination::new(None, 1);
        let (users, _) = TenantRolebinding::list(conn, &filters, pagination)?;
        let are_no_users = users.is_empty();
        let role_id = if are_no_users { admin_role.id } else { ro_role.id };
        let (rb, _) = TenantRolebinding::create(conn, user_id, role_id, org_id)?;
        Ok(rb)
    }

    /// Get the list of active TenantRolebindings for the provided user along with the
    /// corresponding tenant or partner tenant. Could be multiple if a user has been invited to
    /// multiple tenants.
    #[tracing::instrument("TenantRolebinding::list_by_user", skip_all)]
    pub fn list_by_user(
        conn: &mut TxnPgConn,
        user_id: &TenantUserId,
    ) -> DbResult<Vec<(Self, TenantOrPartnerTenant)>> {
        use db_schema::schema::{partner_tenant, tenant};
        #[allow(clippy::type_complexity)]
        let results: Vec<(
            TenantRolebinding,
            (TenantRole, Option<Tenant>, Option<PartnerTenant>),
        )> = tenant_rolebinding::table
            .inner_join(
                tenant_role::table
                    .left_join(tenant::table)
                    .left_join(partner_tenant::table),
            )
            .filter(tenant_rolebinding::tenant_user_id.eq(user_id))
            .filter(tenant_rolebinding::deactivated_at.is_null())
            .get_results(conn.conn())?;

        results
            .into_iter()
            .map(|(rb, (_, t, pt))| Ok((rb, (t, pt).try_into()?)))
            .collect()
    }

    /// Fetches TenantUserInfo when logging them in via a workos auth token, and
    /// validates invariants for the TenantUser
    #[tracing::instrument("TenantRolebinding::get", skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> DbResult<TenantUserInfo>
    where
        T: Into<TenantRolebindingIdentifier<'a>>,
    {
        use db_schema::schema::{partner_tenant, tenant};
        let mut query = tenant_user::table
            .inner_join(
                tenant_rolebinding::table.inner_join(
                    tenant_role::table
                        .left_join(tenant::table)
                        .left_join(partner_tenant::table),
                ),
            )
            .filter(tenant_rolebinding::deactivated_at.is_null())
            .into_boxed();
        match id.into() {
            TenantRolebindingIdentifier::Id(id) => {
                query = query.filter(tenant_rolebinding::id.eq(id));
            }
            TenantRolebindingIdentifier::Tenant(id, tenant_id) => {
                query = query
                    .filter(tenant_rolebinding::id.eq(id))
                    .filter(tenant_role::tenant_id.eq(tenant_id));
            }
            TenantRolebindingIdentifier::User(user_id, tenant_id) => {
                query = query
                    .filter(tenant_rolebinding::tenant_user_id.eq(user_id))
                    .filter(tenant_role::tenant_id.eq(tenant_id));
            }
            TenantRolebindingIdentifier::PartnerTenantUser(user_id, pt_id) => {
                query = query
                    .filter(tenant_rolebinding::tenant_user_id.eq(user_id))
                    .filter(tenant_role::partner_tenant_id.eq(pt_id));
            }
            TenantRolebindingIdentifier::OrgUser(user_id, org_ident) => {
                query = query.filter(tenant_rolebinding::tenant_user_id.eq(user_id));
                match org_ident {
                    OrgIdentifierRef::TenantId(t_id) => {
                        query = query.filter(tenant_role::tenant_id.eq(t_id));
                    }
                    OrgIdentifierRef::PartnerTenantId(pt_id) => {
                        query = query.filter(tenant_role::partner_tenant_id.eq(pt_id));
                    }
                }
            }
        }
        let (user, (rb, (role, tenant, partner_tenant))) = query.first::<(
            TenantUser,
            (
                TenantRolebinding,
                (TenantRole, Option<Tenant>, Option<PartnerTenant>),
            ),
        )>(conn)?;

        let t_pt: TenantOrPartnerTenant = (tenant, partner_tenant).try_into()?;
        rb.validate_login(&role)?;

        Ok((user, rb, role, t_pt))
    }

    fn validate_login(&self, role: &TenantRole) -> DbResult<()> {
        if self.deactivated_at.is_some() {
            // We'll generally filter out deactivated rolebindings, but this can't hurt
            return Err(DbError::TenantUserDeactivated);
        }
        if role.deactivated_at.is_some() {
            return Err(DbError::TenantRoleDeactivated);
        }

        Ok(())
    }

    /// Log into a given TenantRolebinding
    #[tracing::instrument("TenantRolebinding::login", skip_all)]
    pub fn login<'a, T>(
        conn: &mut TxnPgConn,
        id: T,
        auth_method: WorkosAuthMethod,
    ) -> DbResult<TenantRbLoginResult>
    where
        T: Into<TenantRolebindingIdentifier<'a>>,
    {
        let (user, rb, role, t_pt) = Self::get(conn, id)?;

        // Always set last_login_at to show when this user was logged into
        let is_first_login = rb.last_login_at.is_none();
        let rb_update = TenantRolebindingUpdate {
            last_login_at: Some(Some(Utc::now())),
            ..TenantRolebindingUpdate::default()
        };
        let rb_id: TenantRolebindingIdentifier<'_> = match &t_pt {
            TenantOrPartnerTenant::Tenant(t) => (&user.id, &t.id).into(),
            TenantOrPartnerTenant::PartnerTenant(pt) => (&user.id, &pt.id).into(),
        };
        if !t_pt.supports_auth_method(auth_method) {
            return Err(DbError::UnsupportedAuthMethod);
        }
        let rb = Self::update(conn, rb_id, rb_update)?;
        let result = TenantRbLoginResult {
            t_user: user,
            rb,
            role,
            t_pt,
            is_first_login,
            auth_method,
        };
        Ok(result)
    }

    #[tracing::instrument("TenantRolebinding::update", skip_all)]
    pub fn update<'a, T>(conn: &mut TxnPgConn, id: T, update: TenantRolebindingUpdate) -> DbResult<Self>
    where
        T: Into<TenantRolebindingIdentifier<'a>>,
    {
        let (_, rb, _, t_pt) = Self::get(conn, id)?;

        if let Some(tenant_role_id) = update.tenant_role_id.as_ref() {
            // Lock the role to make sure we don't deactivate it before we update this rolebinding.
            // Make sure the role we are using belongs to the tenant, otherwise could update permissions to work on another tenant's role
            let role = TenantRole::lock_active(conn, tenant_role_id, t_pt.id())?;

            // Validate the given role's kind.
            match role.kind {
                TenantRoleKindDiscriminant::DashboardUser
                | TenantRoleKindDiscriminant::CompliancePartnerDashboardUser => {
                    if role.kind.tenant_kind() != (&t_pt).into() {
                        return Err(DbError::IncorrectTenantRoleKind);
                    }
                }
                TenantRoleKindDiscriminant::ApiKey => {
                    // API keys roles can't be bound to a tenant user.
                    return Err(DbError::IncorrectTenantRoleKind);
                }
            }
            if role.deactivated_at.is_some() {
                return Err(DbError::TenantRoleAlreadyDeactivated);
            }
        }
        let results: Vec<Self> = diesel::update(tenant_rolebinding::table)
            .filter(tenant_rolebinding::deactivated_at.is_null())
            .filter(tenant_rolebinding::id.eq(rb.id))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }

    #[tracing::instrument("TenantRolebinding::count", skip_all)]
    pub fn count(conn: &mut PgConn, filters: &TenantRolebindingFilters) -> DbResult<i64> {
        let query = list_query!(filters);

        let count = query.count().get_result(conn)?;
        Ok(count)
    }

    #[tracing::instrument("TenantRolebinding::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        filters: &TenantRolebindingFilters,
        pagination: OffsetPagination,
    ) -> DbResult<(Vec<BasicTenantUserInfo>, NextPage)> {
        let mut query = list_query!(filters);

        // Apply pagination filters
        if let Some(offset) = pagination.offset() {
            query = query.offset(offset)
        }
        query = query.order_by(tenant_user::email.asc()).limit(pagination.limit());
        let results = query
            .get_results::<(TenantUser, (TenantRolebinding, TenantRole))>(conn)?
            .into_iter()
            .map(|(tu, (rb, tr))| (tu, rb, tr))
            .collect();
        Ok(pagination.results(results))
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_rolebinding)]
struct NewTenantRolebinding {
    tenant_user_id: TenantUserId,
    tenant_role_id: TenantRoleId,
    last_login_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
}

#[derive(AsChangeset, Default)]
#[diesel(table_name = tenant_rolebinding)]
pub struct TenantRolebindingUpdate {
    pub deactivated_at: Option<Option<DateTime<Utc>>>,
    pub last_login_at: Option<Option<DateTime<Utc>>>,
    // TODO when we give a user a new rolebinding, should we deactivate the old one and make a new one?
    // More history trakcing
    pub tenant_role_id: Option<TenantRoleId>,
}

pub struct TenantRolebindingFilters<'a> {
    pub org_id: OrgIdentifierRef<'a>,
    pub only_active: bool,
    pub role_ids: Option<Vec<TenantRoleId>>,
    pub search: Option<String>,
    pub is_invite_pending: Option<bool>,
}
