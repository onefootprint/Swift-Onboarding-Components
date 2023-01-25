use crate::{schema::tenant_user, DbError, DbResult, TxnPgConnection};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{Locked, OrgMemberEmail, TenantUserId};
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
}

impl TenantUser {
    pub(crate) fn lock_or_create(
        conn: &mut PgConnection,
        email: OrgMemberEmail,
        first_name: Option<String>,
        last_name: Option<String>,
    ) -> DbResult<Locked<Self>> {
        let user = tenant_user::table
            .filter(tenant_user::email.eq(&email))
            .for_no_key_update()
            .first(conn)
            .optional()?;
        if let Some(user) = user {
            return Ok(Locked::new(user));
        }
        // User doesn't exist, create it.
        // Could be a race condition, but we're still protected by uniqueness constraints
        let new_user = NewTenantUser {
            email,
            first_name,
            last_name,
            created_at: Utc::now(),
        };
        let result = diesel::insert_into(tenant_user::table)
            .values(new_user)
            .get_result(conn)?;
        Ok(Locked::new(result))
    }

    pub fn update(conn: &mut TxnPgConnection, id: &TenantUserId, update: TenantUserUpdate) -> DbResult<Self> {
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
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant_user)]
struct NewTenantUser {
    email: OrgMemberEmail,
    created_at: DateTime<Utc>,
    first_name: Option<String>,
    last_name: Option<String>,
}

#[derive(AsChangeset)]
#[diesel(table_name = tenant_user)]
pub struct TenantUserUpdate {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}
