use crate::schema::tenants;
use crate::DbPool;
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, Queryable};
use newtypes::{EncryptedVaultPrivateKey, TenantId, VaultPublicKey};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenants)]
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

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenants)]
pub struct NewTenant {
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub workos_id: Option<String>,
    pub logo_url: Option<String>,
    pub workos_admin_profile_id: Option<String>,
    pub sandbox_restricted: bool,
}

impl NewTenant {
    pub async fn create(self, pool: &DbPool) -> Result<Tenant, crate::DbError> {
        pool.db_query(move |conn| {
            let tenant = diesel::insert_into(tenants::table)
                .values(&self)
                .get_result::<Tenant>(conn)?;
            Ok(tenant)
        })
        .await?
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset)]
#[diesel(table_name = tenants)]
pub struct UpdateTenantNameOrLogo {
    pub id: TenantId,
    pub name: Option<String>,
    pub logo_url: Option<String>,
}

impl UpdateTenantNameOrLogo {
    pub async fn update(self, pool: &DbPool) -> Result<(), crate::DbError> {
        let _ = pool
            .db_query(move |conn| {
                diesel::update(tenants::table)
                    .filter(tenants::id.eq(&self.id))
                    .set(&self)
                    .execute(conn)
            })
            .await??;
        Ok(())
    }
}
