use crate::{
    models::tenant_role::TenantRole,
    schema::{tenant_role, tenant_user},
    DbError, DbResult, TxnPgConnection,
};
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{OrgMemberEmail, TenantId, TenantRoleId, TenantUserId};
use serde::{Deserialize, Serialize};

use super::tenant::Tenant;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = tenant_user)]
pub struct TenantUser {
    pub id: TenantUserId,
    pub tenant_role_id: TenantRoleId,
    pub email: OrgMemberEmail,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub last_login_at: Option<DateTime<Utc>>,
    pub tenant_id: TenantId,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}

pub type TenantUserInfo = (TenantUser, TenantRole, Tenant);

pub enum TenantUserIdentifier<'a> {
    Id(&'a TenantUserId),
    Email(&'a OrgMemberEmail, &'a TenantId),
}

impl<'a> From<&'a TenantUserId> for TenantUserIdentifier<'a> {
    fn from(value: &'a TenantUserId) -> Self {
        Self::Id(value)
    }
}

impl<'a> From<(&'a OrgMemberEmail, &'a TenantId)> for TenantUserIdentifier<'a> {
    fn from((email, tenant_id): (&'a OrgMemberEmail, &'a TenantId)) -> Self {
        Self::Email(email, tenant_id)
    }
}

impl TenantUser {
    /// Get the list of active TenantUserIds that have this email address.
    /// Could be multiple if a user has been invited to multiple tenants.
    pub fn list_by_email(conn: &mut PgConnection, email: OrgMemberEmail) -> DbResult<Vec<TenantUserId>> {
        let results: Vec<TenantUserId> = tenant_user::table
            .filter(tenant_user::email.eq(email))
            .filter(tenant_user::deactivated_at.is_null())
            .select(tenant_user::id)
            .get_results(conn)?;
        Ok(results)
    }

    /// Fetches TenantUserInfo by TenantUserId when logging them in via a workos auth token, and
    /// validates invariants for the TenantUser
    pub fn get<'a, T>(conn: &mut PgConnection, id: T) -> DbResult<TenantUserInfo>
    where
        T: Into<TenantUserIdentifier<'a>>,
    {
        use crate::schema::tenant;
        let mut query = tenant_user::table
            .inner_join(tenant_role::table)
            .inner_join(tenant::table)
            .into_boxed();
        match id.into() {
            TenantUserIdentifier::Id(id) => {
                query = query.filter(tenant_user::id.eq(id));
            }
            TenantUserIdentifier::Email(email, tenant_id) => {
                query = query
                    .filter(tenant_user::email.eq(email))
                    .filter(tenant_user::tenant_id.eq(tenant_id));
            }
        }
        let (user, role, tenant): TenantUserInfo = query.first(conn)?;
        user.validate_login(&role)?;
        Ok((user, role, tenant))
    }

    /// Log into a given TenantUser
    pub fn login<'a, T>(
        conn: &mut TxnPgConnection,
        id: T,
        workos_first_name: Option<String>,
        workos_last_name: Option<String>,
    ) -> DbResult<TenantUserInfo>
    where
        T: Into<TenantUserIdentifier<'a>>,
    {
        let (user, role, tenant) = Self::get(conn, id)?;

        // Update the name if there's no name on the tenant_user
        let tenant_user_has_no_name = user.first_name.is_none() && user.last_name.is_none();
        let (first_name, last_name) = if tenant_user_has_no_name {
            (workos_first_name, workos_last_name)
        } else {
            (None, None)
        };
        let update = TenantUserUpdate {
            first_name,
            last_name,
            // Always set last_login_at to show when this user was logged into
            last_login_at: Some(Utc::now()),
            ..TenantUserUpdate::default()
        };
        let user = Self::update(conn, &user.tenant_id, &user.id, update)?;
        Ok((user, role, tenant))
    }

    fn validate_login(&self, role: &TenantRole) -> DbResult<()> {
        if self.deactivated_at.is_some() {
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

    /// Only used when create integration test tenant users
    pub fn get_by_email_for_test(
        conn: &mut PgConnection,
        email: &OrgMemberEmail,
        tenant_id: &TenantId,
    ) -> DbResult<Self> {
        let user = tenant_user::table
            .filter(tenant_user::email.eq(email))
            .filter(tenant_user::tenant_id.eq(tenant_id))
            .get_result(conn)?;
        Ok(user)
    }

    pub fn create(
        conn: &mut TxnPgConnection,
        email: OrgMemberEmail,
        tenant_id: TenantId,
        tenant_role_id: TenantRoleId,
        first_name: Option<String>,
        last_name: Option<String>,
    ) -> DbResult<(Self, TenantRole)> {
        // Make sure the role we are using belongs to the tenant, otherwise could invite self to
        // another tenant's role
        let tenant_role = TenantRole::get_active(conn, &tenant_role_id, &tenant_id)?;
        let new_user = NewTenantUser {
            tenant_role_id: tenant_role.id.clone(),
            email,
            created_at: Utc::now(),
            // init to None since they haven't logged in yet!
            last_login_at: None,
            tenant_id,
            first_name,
            last_name,
        };
        let result = diesel::insert_into(tenant_user::table)
            .values(new_user)
            .get_result(conn.conn())?;
        Ok((result, tenant_role))
    }

    pub fn update(
        conn: &mut TxnPgConnection,
        tenant_id: &TenantId,
        id: &TenantUserId,
        update: TenantUserUpdate,
    ) -> DbResult<Self> {
        if let Some(tenant_role_id) = update.tenant_role_id.as_ref() {
            // Make sure the role we are using belongs to the tenant, otherwise could update permissions to work on another tenant's role
            TenantRole::get_active(conn, tenant_role_id, tenant_id)?;
        }
        let results: Vec<Self> = diesel::update(tenant_user::table)
            .filter(tenant_user::deactivated_at.is_null())
            .filter(tenant_user::tenant_id.eq(tenant_id))
            .filter(tenant_user::id.eq(id))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }

    pub fn list_active(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        cursor: Option<DateTime<Utc>>,
        page_size: i64,
    ) -> DbResult<Vec<(Self, TenantRole)>> {
        let mut query = tenant_user::table
            .inner_join(tenant_role::table)
            .filter(tenant_user::tenant_id.eq(tenant_id))
            .filter(tenant_user::deactivated_at.is_null())
            .into_boxed()
            .order_by(tenant_user::created_at.asc())
            .limit(page_size);

        if let Some(cursor) = cursor {
            query = query.filter(tenant_user::created_at.ge(cursor))
        }
        let results = query.get_results(conn)?;
        Ok(results)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant_user)]
struct NewTenantUser {
    tenant_role_id: TenantRoleId,
    email: OrgMemberEmail,
    created_at: DateTime<Utc>,
    last_login_at: Option<DateTime<Utc>>,
    tenant_id: TenantId,
    first_name: Option<String>,
    last_name: Option<String>,
}

#[derive(AsChangeset, Default)]
#[diesel(table_name = tenant_user)]
pub struct TenantUserUpdate {
    pub tenant_role_id: Option<TenantRoleId>,
    pub deactivated_at: Option<Option<DateTime<Utc>>>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub last_login_at: Option<DateTime<Utc>>,
}
