use crate::{schema::tenant, DbError};
use crate::{DbPool, DbResult};
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, Queryable};
use newtypes::{EncryptedVaultPrivateKey, TenantId, TenantUserId, VaultPublicKey};
use serde::{Deserialize, Serialize};

use super::tenant_role::TenantRole;
use super::tenant_user::TenantUser;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant)]
pub struct Tenant {
    pub id: TenantId,
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub workos_id: Option<String>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub logo_url: Option<String>,
    pub workos_admin_profile_id: Option<String>,
    pub sandbox_restricted: bool,
}

impl Tenant {
    pub fn get_by_user(
        conn: &mut PgConnection,
        id: &TenantUserId,
    ) -> Result<(Self, TenantRole, TenantUser), DbError> {
        use crate::schema::{tenant_role, tenant_user};
        let (role, tenant, user) = tenant_role::table
            .inner_join(tenant::table)
            .inner_join(tenant_user::table)
            .filter(tenant_user::id.eq(id))
            .first(conn)?;
        Ok((tenant, role, user))
    }

    pub fn lock(conn: &mut PgConnection, id: &TenantId) -> DbResult<Self> {
        let tenant = tenant::table
            .for_no_key_update()
            .filter(tenant::id.eq(id))
            .first(conn)?;
        Ok(tenant)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant)]
pub struct NewTenant {
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub workos_id: Option<String>,
    pub logo_url: Option<String>,
    // TODO can we rm this?
    pub workos_admin_profile_id: Option<String>,
    pub sandbox_restricted: bool,
}

impl NewTenant {
    pub fn save(self, conn: &mut PgConnection) -> Result<Tenant, crate::DbError> {
        let tenant = diesel::insert_into(tenant::table)
            .values(&self)
            .get_result::<Tenant>(conn)?;
        Ok(tenant)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset)]
#[diesel(table_name = tenant)]
pub struct UpdateTenantNameOrLogo {
    pub id: TenantId,
    pub name: Option<String>,
    pub logo_url: Option<String>,
}

impl UpdateTenantNameOrLogo {
    pub async fn update(self, pool: &DbPool) -> Result<(), crate::DbError> {
        let _ = pool
            .db_query(move |conn| {
                diesel::update(tenant::table)
                    .filter(tenant::id.eq(&self.id))
                    .set(&self)
                    .execute(conn)
            })
            .await??;
        Ok(())
    }
}
