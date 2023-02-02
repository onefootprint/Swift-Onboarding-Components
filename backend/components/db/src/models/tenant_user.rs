use crate::PgConn;
use crate::{schema::tenant_user, DbError, DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{Locked, OrgMemberEmail, TenantUserId, INTEGRATION_TEST_USER_EMAIL};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = tenant_user)]
pub struct TenantUser {
    pub id: TenantUserId,
    pub email: OrgMemberEmail,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub is_firm_employee: bool,
}

impl TenantUser {
    pub fn get(conn: &mut PgConn, id: &TenantUserId) -> DbResult<Self> {
        let user = tenant_user::table.filter(tenant_user::id.eq(id)).first(conn)?;
        Ok(user)
    }

    pub fn get_firm_employee(conn: &mut PgConn, id: &TenantUserId) -> DbResult<Self> {
        let user = tenant_user::table
            .filter(tenant_user::id.eq(id))
            .filter(tenant_user::is_firm_employee.eq(true))
            .first(conn)?;
        Ok(user)
    }

    pub fn get_and_update_or_create(
        conn: &mut TxnPgConn,
        email: OrgMemberEmail,
        first_name: Option<String>,
        last_name: Option<String>,
    ) -> DbResult<Self> {
        let user: Option<Self> = tenant_user::table
            .filter(tenant_user::email.eq(&email))
            .first(conn.conn())
            .optional()?;
        if let Some(user) = user {
            // Update the name if there's no name on the tenant_user
            let tenant_user_has_no_name = user.first_name.is_none() && user.last_name.is_none();
            let workos_provided_name = first_name.is_some() || last_name.is_some();
            let user = if tenant_user_has_no_name && workos_provided_name {
                let user_update = TenantUserUpdate {
                    first_name,
                    last_name,
                };
                TenantUser::update(conn, &user.id, user_update)?
            } else {
                user
            };
            return Ok(user);
        }
        // User doesn't exist, create it.
        // Could be a race condition, but we're still protected by uniqueness constraints
        let new_user = NewTenantUser {
            email,
            first_name,
            last_name,
            created_at: Utc::now(),
            // No codepaths make firm-employee TenantUsers. For now, we'll just set this flag in
            // the DB manually
            is_firm_employee: false,
        };
        let result = diesel::insert_into(tenant_user::table)
            .values(new_user)
            .get_result(conn.conn())?;
        Ok(result)
    }

    pub fn update(conn: &mut TxnPgConn, id: &TenantUserId, update: TenantUserUpdate) -> DbResult<Self> {
        let results: Vec<Self> = diesel::update(tenant_user::table)
            .filter(tenant_user::id.eq(id))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }

    pub fn set_is_firm_employee_testing_only(conn: &mut PgConn, id: &TenantUserId) -> DbResult<Self> {
        let user = diesel::update(tenant_user::table)
            .filter(tenant_user::id.eq(id))
            .filter(tenant_user::email.eq(INTEGRATION_TEST_USER_EMAIL))
            .set(tenant_user::is_firm_employee.eq(true))
            .get_result(conn)?;
        Ok(user)
    }

    pub fn lock(conn: &mut TxnPgConn, id: &TenantUserId) -> DbResult<Locked<Self>> {
        let user = tenant_user::table
            .filter(tenant_user::id.eq(id))
            .for_no_key_update()
            .first(conn.conn())?;
        Ok(Locked::new(user))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant_user)]
struct NewTenantUser {
    email: OrgMemberEmail,
    created_at: DateTime<Utc>,
    first_name: Option<String>,
    last_name: Option<String>,
    is_firm_employee: bool,
}

#[derive(AsChangeset)]
#[diesel(table_name = tenant_user)]
pub struct TenantUserUpdate {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}
