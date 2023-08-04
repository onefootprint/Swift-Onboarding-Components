use super::tenant::Tenant;
use super::tenant_role::TenantRole;
use super::tenant_user::TenantUser;
use crate::PgConn;
use crate::{DbError, NextPage, OffsetPagination};
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{tenant_role, tenant_rolebinding, tenant_user};
use diesel::dsl::not;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::{TenantId, TenantRoleId, TenantRoleKind, TenantRolebindingId, TenantUserId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = tenant_rolebinding)]
pub struct TenantRolebinding {
    pub id: TenantRolebindingId,
    pub tenant_user_id: TenantUserId,
    pub tenant_role_id: TenantRoleId,
    pub tenant_id: TenantId,
    pub last_login_at: Option<DateTime<Utc>>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

pub type IsFirstLogin = bool;
pub type TenantUserInfo = (TenantUser, TenantRolebinding, TenantRole, Tenant);
pub type BasicTenantUserInfo = (TenantUser, TenantRolebinding, TenantRole);

pub enum TenantRolebindingIdentifier<'a> {
    Id(&'a TenantRolebindingId),
    /// Used when we have a TenantRolebindingId but want to check that the tenant owns the RB
    Tenant(&'a TenantRolebindingId, &'a TenantId),
    User(&'a TenantUserId, &'a TenantId),
}

impl<'a> From<&'a TenantRolebindingId> for TenantRolebindingIdentifier<'a> {
    fn from(value: &'a TenantRolebindingId) -> Self {
        Self::Id(value)
    }
}

impl<'a> From<(&'a TenantUserId, &'a TenantId)> for TenantRolebindingIdentifier<'a> {
    fn from((user_id, tenant_id): (&'a TenantUserId, &'a TenantId)) -> Self {
        Self::User(user_id, tenant_id)
    }
}

// It's hard to type this query in Rust, so we use a macro to share its logic
macro_rules! list_query {
    ($params: ident) => {{
        let mut query = tenant_user::table
            .inner_join(tenant_rolebinding::table.inner_join(tenant_role::table))
            .filter(tenant_rolebinding::tenant_id.eq($params.tenant_id))
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
    /// Gets or creates the TenantUser with the provided email, and creates a rolebinding to
    /// associate the TenantUser with the provided role
    #[tracing::instrument("TenantRolebinding::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        tenant_user_id: TenantUserId,
        tenant_role_id: TenantRoleId,
        tenant_id: TenantId,
    ) -> DbResult<(Self, TenantRole)> {
        // Make sure the role we are using belongs to the tenant, otherwise could invite self to
        // another tenant's role
        let tenant_role = TenantRole::lock_active(conn, &tenant_role_id, &tenant_id)?;
        if tenant_role.kind == Some(TenantRoleKind::ApiKey) {
            return Err(DbError::IncorrectTenantRoleKind);
        }
        // Lock the user so we don't create two rolebindings in parallel
        TenantUser::lock(conn, &tenant_user_id)?;

        let new = NewTenantRolebinding {
            tenant_user_id,
            tenant_role_id,
            tenant_id,
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

    /// Get the list of active TenantRolebindingIds for the provided user.
    /// Could be multiple if a user has been invited to multiple tenants.
    #[tracing::instrument("TenantRolebinding::list_by_user", skip_all)]
    pub fn list_by_user(
        conn: &mut PgConn,
        user_id: &TenantUserId,
    ) -> DbResult<Vec<(TenantRolebindingId, Tenant)>> {
        use db_schema::schema::tenant;
        let results = tenant_rolebinding::table
            .inner_join(tenant::table)
            .filter(tenant_rolebinding::tenant_user_id.eq(user_id))
            .filter(tenant_rolebinding::deactivated_at.is_null())
            .select((tenant_rolebinding::id, tenant::all_columns))
            .get_results(conn)?;
        Ok(results)
    }

    /// Fetches TenantUserInfo when logging them in via a workos auth token, and
    /// validates invariants for the TenantUser
    #[tracing::instrument("TenantRolebinding::get", skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> DbResult<TenantUserInfo>
    where
        T: Into<TenantRolebindingIdentifier<'a>>,
    {
        use db_schema::schema::tenant;
        let mut query = tenant_user::table
            .inner_join(
                tenant_rolebinding::table
                    .inner_join(tenant_role::table)
                    .inner_join(tenant::table),
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
                    .filter(tenant_rolebinding::tenant_id.eq(tenant_id));
            }
            TenantRolebindingIdentifier::User(user_id, tenant_id) => {
                query = query
                    .filter(tenant_rolebinding::tenant_user_id.eq(user_id))
                    .filter(tenant_rolebinding::tenant_id.eq(tenant_id));
            }
        }
        let (user, (rb, role, tenant)) =
            query.first::<(TenantUser, (TenantRolebinding, TenantRole, Tenant))>(conn)?;
        rb.validate_login(&role)?;
        Ok((user, rb, role, tenant))
    }

    fn validate_login(&self, role: &TenantRole) -> DbResult<()> {
        if self.deactivated_at.is_some() {
            // We'll generally filter out deactivated rolebindings, but this can't hurt
            return Err(DbError::TenantUserDeactivated);
        }
        if role.deactivated_at.is_some() {
            return Err(DbError::TenantRoleDeactivated);
        }
        if role.tenant_id != self.tenant_id {
            return Err(DbError::TenantRoleMismatch);
        }
        Ok(())
    }

    /// Log into a given TenantRolebinding
    #[tracing::instrument("TenantRolebinding::login", skip_all)]
    pub fn login<'a, T>(conn: &mut TxnPgConn, id: T) -> DbResult<(TenantUserInfo, IsFirstLogin)>
    where
        T: Into<TenantRolebindingIdentifier<'a>>,
    {
        let (user, rb, role, tenant) = Self::get(conn, id)?;

        // Always set last_login_at to show when this user was logged into
        let is_first_login = rb.last_login_at.is_none();
        let rb_update = TenantRolebindingUpdate {
            last_login_at: Some(Some(Utc::now())),
            ..TenantRolebindingUpdate::default()
        };
        let rb = Self::update(conn, (&user.id, &tenant.id), rb_update)?;
        Ok(((user, rb, role, tenant), is_first_login))
    }

    #[tracing::instrument("TenantRolebinding::update", skip_all)]
    pub fn update<'a, T>(conn: &mut TxnPgConn, id: T, update: TenantRolebindingUpdate) -> DbResult<Self>
    where
        T: Into<TenantRolebindingIdentifier<'a>>,
    {
        let (_, rb, _, tenant) = Self::get(conn, id)?;

        if let Some(tenant_role_id) = update.tenant_role_id.as_ref() {
            // Lock the role to make sure we don't deactivate it before we update this rolebinding.
            // Make sure the role we are using belongs to the tenant, otherwise could update permissions to work on another tenant's role
            let role = TenantRole::lock_active(conn, tenant_role_id, &tenant.id)?;
            if role.kind == Some(TenantRoleKind::ApiKey) {
                return Err(DbError::IncorrectTenantRoleKind);
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

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant_rolebinding)]
struct NewTenantRolebinding {
    tenant_user_id: TenantUserId,
    tenant_role_id: TenantRoleId,
    tenant_id: TenantId,
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
    pub tenant_id: &'a TenantId,
    pub only_active: bool,
    pub role_ids: Option<Vec<TenantRoleId>>,
    pub search: Option<String>,
    pub is_invite_pending: Option<bool>,
}
