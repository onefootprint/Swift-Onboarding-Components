use crate::schema::tenant;
use crate::{DbPool, DbResult, TxnPgConnection};
use diesel::insertable::CanInsertInSingleQuery;
use diesel::pg::Pg;
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::query_builder::QueryFragment;
use diesel::query_builder::QueryId;
use diesel::{Insertable, Queryable};
use newtypes::{CompanySize, EncryptedVaultPrivateKey, TenantId, VaultPublicKey};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Queryable, Insertable)]
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
    pub sandbox_restricted: bool,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant)]
pub struct NewTenant {
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub workos_id: Option<String>,
    pub logo_url: Option<String>,
    pub sandbox_restricted: bool,
}

/// Allows creating with an application-generated TenantId rather than db-generated
#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant)]
pub struct NewIntegrationTestTenant {
    pub id: TenantId,
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub sandbox_restricted: bool,
}

impl Tenant {
    pub fn lock(conn: &mut TxnPgConnection, id: &TenantId) -> DbResult<Self> {
        let tenant = tenant::table
            .for_no_key_update()
            .filter(tenant::id.eq(id))
            .first(conn.conn())?;
        Ok(tenant)
    }

    /// Save any struct that implements `Insertable<tenant::table>`. The diesel trait constraints
    /// are kind of clunky, but removes the need to have two separate functions with the same exact body
    pub fn save<T>(conn: &mut PgConnection, value: T) -> DbResult<Self>
    where
        T: Insertable<tenant::table>,
        <T as Insertable<tenant::table>>::Values: QueryFragment<Pg> + CanInsertInSingleQuery<Pg> + QueryId,
    {
        let tenant = diesel::insert_into(tenant::table)
            .values(value)
            .get_result(conn)?;
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
    pub async fn update(self, pool: &DbPool) -> DbResult<()> {
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
