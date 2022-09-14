use crate::DbPool;
use crate::{schema::tenant, DbError};
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, Queryable};
use newtypes::{EncryptedVaultPrivateKey, TenantId, VaultPublicKey};
use serde::{Deserialize, Serialize};

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
    pub fn get(conn: &mut PgConnection, id: &TenantId) -> Result<Self, DbError> {
        let result = tenant::table.filter(tenant::id.eq(id)).first(conn)?;
        Ok(result)
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
