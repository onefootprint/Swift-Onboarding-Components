use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant_user;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::Locked;
use newtypes::OrgMemberEmail;
use newtypes::PiiString;
use newtypes::TenantUserId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Selectable)]
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
    #[tracing::instrument("TenantUser::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &TenantUserId) -> DbResult<Self> {
        let user = tenant_user::table
            .filter(tenant_user::id.eq(id))
            .select(TenantUser::as_select())
            .first(conn)?;
        Ok(user)
    }

    pub fn get_bulk(conn: &mut PgConn, ids: Vec<&TenantUserId>) -> DbResult<HashMap<TenantUserId, Self>> {
        let res = tenant_user::table
            .filter(tenant_user::id.eq_any(ids))
            .select(TenantUser::as_select())
            .get_results::<TenantUser>(conn)?
            .into_iter()
            .map(|w| (w.id.clone(), w))
            .collect();

        Ok(res)
    }

    #[tracing::instrument("TenantUser::get_firm_employee", skip_all)]
    pub fn get_firm_employee(conn: &mut PgConn, id: &TenantUserId) -> DbResult<Self> {
        let user = tenant_user::table
            .filter(tenant_user::id.eq(id))
            .filter(tenant_user::is_firm_employee.eq(true))
            .first(conn)?;
        Ok(user)
    }

    #[tracing::instrument("TenantUser::get_and_update_or_create", skip_all)]
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

    #[tracing::instrument("TenantUser::update", skip_all)]
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

    #[tracing::instrument("TenantUser::set_is_firm_employee_testing_only", skip_all)]
    pub fn set_is_firm_employee_testing_only(conn: &mut PgConn, id: &TenantUserId) -> DbResult<Self> {
        let user = diesel::update(tenant_user::table)
            .filter(tenant_user::id.eq(id))
            .filter(tenant_user::email.eq(OrgMemberEmail::INTEGRATION_TEST_USER_EMAIL))
            .set(tenant_user::is_firm_employee.eq(true))
            .get_result(conn)?;
        Ok(user)
    }

    #[tracing::instrument("TenantUser::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &TenantUserId) -> DbResult<Locked<Self>> {
        let user = tenant_user::table
            .filter(tenant_user::id.eq(id))
            .for_no_key_update()
            .first(conn.conn())?;
        Ok(Locked::new(user))
    }
}

impl TenantUser {
    pub fn name(&self) -> Option<PiiString> {
        match (self.first_name.as_ref(), self.last_name.as_ref()) {
            (None, None) => None,
            (None, Some(l)) => Some(l.clone().into()),
            (Some(f), None) => Some(f.clone().into()),
            (Some(f), Some(l)) => Some(format!("{} {}", f, l).into()),
        }
    }
}

#[derive(Debug, Clone, Insertable)]
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
