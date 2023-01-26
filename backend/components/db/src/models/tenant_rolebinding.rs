use super::tenant::Tenant;
use super::tenant_role::TenantRole;
use super::tenant_user::TenantUser;
use crate::DbError;
use crate::{
    schema::tenant_role, schema::tenant_rolebinding, schema::tenant_user, DbResult, TxnPgConnection,
};
use chrono::{DateTime, Utc};
use diesel::dsl::not;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::{OrgMemberEmail, TenantId, TenantRoleId, TenantRolebindingId, TenantUserId};
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

pub type TenantUserInfo = (TenantUser, TenantRolebinding, TenantRole, Tenant);

pub enum TenantRolebindingIdentifier<'a> {
    Id(&'a TenantRolebindingId),
    /// Used when we have a TenantRolebindingId but want to check that the tenant owns the RB
    Tenant(&'a TenantRolebindingId, &'a TenantId),
    Email(&'a OrgMemberEmail, &'a TenantId),
}

impl<'a> From<&'a TenantRolebindingId> for TenantRolebindingIdentifier<'a> {
    fn from(value: &'a TenantRolebindingId) -> Self {
        Self::Id(value)
    }
}

impl<'a> From<(&'a TenantRolebindingId, &'a TenantId)> for TenantRolebindingIdentifier<'a> {
    fn from((id, tenant_id): (&'a TenantRolebindingId, &'a TenantId)) -> Self {
        Self::Tenant(id, tenant_id)
    }
}

impl<'a> From<(&'a OrgMemberEmail, &'a TenantId)> for TenantRolebindingIdentifier<'a> {
    fn from((email, tenant_id): (&'a OrgMemberEmail, &'a TenantId)) -> Self {
        Self::Email(email, tenant_id)
    }
}

impl TenantRolebinding {
    /// Gets or creates the TenantUser with the provided email, and creates a rolebinding to
    /// associate the TenantUser with the provided role
    pub fn create(
        conn: &mut TxnPgConnection,
        tenant_user_id: TenantUserId,
        tenant_role_id: TenantRoleId,
        tenant_id: TenantId,
    ) -> DbResult<(Self, TenantRole)> {
        // Make sure the role we are using belongs to the tenant, otherwise could invite self to
        // another tenant's role
        let tenant_role = TenantRole::lock_active(conn, &tenant_role_id, &tenant_id)?;
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

    /// Only used when create integration test tenant users
    pub fn get_by_email_for_test(
        conn: &mut PgConnection,
        email: &OrgMemberEmail,
        tenant_id: &TenantId,
    ) -> DbResult<Self> {
        let user = tenant_rolebinding::table
            .inner_join(tenant_user::table)
            .filter(tenant_user::email.eq(email))
            .filter(tenant_rolebinding::tenant_id.eq(tenant_id))
            .select(tenant_rolebinding::all_columns)
            .get_result(conn)?;
        Ok(user)
    }

    /// Get the list of active TenantUserIds that have this email address.
    /// Could be multiple if a user has been invited to multiple tenants.
    pub fn list_by_email(
        conn: &mut PgConnection,
        email: &OrgMemberEmail,
    ) -> DbResult<Vec<(TenantRolebindingId, Tenant)>> {
        use crate::schema::tenant;
        let results = tenant_rolebinding::table
            .inner_join(tenant::table)
            .inner_join(tenant_user::table)
            .filter(tenant_user::email.eq(email))
            .filter(tenant_rolebinding::deactivated_at.is_null())
            .select((tenant_rolebinding::id, tenant::all_columns))
            .get_results(conn)?;
        Ok(results)
    }

    /// Fetches TenantUserInfo when logging them in via a workos auth token, and
    /// validates invariants for the TenantUser
    pub fn get<'a, T>(conn: &mut PgConnection, id: T) -> DbResult<TenantUserInfo>
    where
        T: Into<TenantRolebindingIdentifier<'a>>,
    {
        use crate::schema::tenant;
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
            TenantRolebindingIdentifier::Email(email, tenant_id) => {
                query = query
                    .filter(tenant_user::email.eq(email))
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
    pub fn login<'a, T>(conn: &mut TxnPgConnection, id: T) -> DbResult<TenantUserInfo>
    where
        T: Into<TenantRolebindingIdentifier<'a>>,
    {
        let (user, rb, role, tenant) = Self::get(conn, id)?;

        // Always set last_login_at to show when this user was logged into
        let rb_update = TenantRolebindingUpdate {
            last_login_at: Some(Some(Utc::now())),
            ..TenantRolebindingUpdate::default()
        };
        let rb = Self::update(conn, (&rb.id, &tenant.id), rb_update)?;
        Ok((user, rb, role, tenant))
    }

    pub fn update<'a, T>(conn: &mut TxnPgConnection, id: T, update: TenantRolebindingUpdate) -> DbResult<Self>
    where
        T: Into<TenantRolebindingIdentifier<'a>>,
    {
        let (_, rb, _, tenant) = Self::get(conn, id)?;

        if let Some(tenant_role_id) = update.tenant_role_id.as_ref() {
            // Lock the role to make sure we don't deactivate it before we update this rolebinding.
            // Make sure the role we are using belongs to the tenant, otherwise could update permissions to work on another tenant's role
            TenantRole::lock_active(conn, tenant_role_id, &tenant.id)?;
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

    pub fn count(conn: &mut PgConnection, filters: &TenantRolebindingFilters) -> DbResult<i64> {
        // Apply filters. TODO share these with list
        let mut query = tenant_user::table
            .inner_join(tenant_rolebinding::table)
            .filter(tenant_rolebinding::tenant_id.eq(filters.tenant_id))
            .into_boxed();

        if filters.only_active {
            query = query.filter(tenant_rolebinding::deactivated_at.is_null())
        }
        if let Some(ref role_ids) = filters.role_ids {
            query = query.filter(tenant_rolebinding::tenant_role_id.eq_any(role_ids));
        }
        if let Some(ref search) = filters.search {
            let pattern = format!("%{}%", search);
            query = query.filter(
                tenant_user::first_name
                    .ilike(pattern.clone())
                    .or(tenant_user::last_name.ilike(pattern.clone()))
                    .or(tenant_user::email.ilike(pattern)),
            )
        }
        if let Some(is_invite_pending) = filters.is_invite_pending {
            match is_invite_pending {
                true => query = query.filter(tenant_rolebinding::last_login_at.is_null()),
                false => query = query.filter(not(tenant_rolebinding::last_login_at.is_null())),
            }
        }

        let count = query.count().get_result(conn)?;
        Ok(count)
    }

    pub fn list(
        conn: &mut PgConnection,
        filters: &TenantRolebindingFilters,
    ) -> DbResult<Vec<(TenantUser, Self, TenantRole)>> {
        // Apply filters. TODO share these with count. Do list of filters
        let mut query = tenant_user::table
            .inner_join(tenant_rolebinding::table.inner_join(tenant_role::table))
            .filter(tenant_rolebinding::tenant_id.eq(filters.tenant_id))
            .into_boxed();

        if filters.only_active {
            query = query.filter(tenant_rolebinding::deactivated_at.is_null())
        }
        if let Some(ref role_ids) = filters.role_ids {
            query = query.filter(tenant_rolebinding::tenant_role_id.eq_any(role_ids));
        }
        if let Some(ref search) = filters.search {
            let pattern = format!("%{}%", search);
            query = query.filter(
                tenant_user::first_name
                    .ilike(pattern.clone())
                    .or(tenant_user::last_name.ilike(pattern.clone()))
                    .or(tenant_user::email.ilike(pattern)),
            )
        }
        if let Some(is_invite_pending) = filters.is_invite_pending {
            match is_invite_pending {
                true => query = query.filter(tenant_rolebinding::last_login_at.is_null()),
                false => query = query.filter(not(tenant_rolebinding::last_login_at.is_null())),
            }
        }

        // Apply pagination filters
        if let Some(page) = filters.page {
            query = query.offset(filters.page_size * (page as i64));
        }
        // Always fetch one extra result so we can see if there is another page
        query = query
            .order_by(tenant_user::email.asc())
            .limit(filters.page_size + 1);
        let results = query
            .get_results::<(TenantUser, (TenantRolebinding, TenantRole))>(conn)?
            .into_iter()
            .map(|(tu, (rb, tr))| (tu, rb, tr))
            .collect();
        Ok(results)
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
    pub page: Option<usize>,
    pub page_size: i64,
    pub role_ids: Option<Vec<TenantRoleId>>,
    pub search: Option<String>,
    pub is_invite_pending: Option<bool>,
}
