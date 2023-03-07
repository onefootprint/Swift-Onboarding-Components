use crate::schema::{scoped_user, tenant};
use crate::PgConn;
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use diesel::insertable::CanInsertInSingleQuery;
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::query_builder::QueryFragment;
use diesel::query_builder::QueryId;
use diesel::{Insertable, Queryable};
use newtypes::{CompanySize, EncryptedVaultPrivateKey, StripeCustomerId, TenantId, VaultId, VaultPublicKey};
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
    pub privacy_policy_url: Option<String>,
    pub stripe_customer_id: Option<StripeCustomerId>,
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
    #[tracing::instrument(skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &TenantId) -> DbResult<Self> {
        let tenant = tenant::table
            .for_no_key_update()
            .filter(tenant::id.eq(id))
            .first(conn.conn())?;
        Ok(tenant)
    }

    #[tracing::instrument(skip_all)]
    pub fn get(conn: &mut PgConn, id: &TenantId) -> DbResult<Self> {
        let tenant = tenant::table.filter(tenant::id.eq(id)).first(conn)?;
        Ok(tenant)
    }

    #[tracing::instrument(skip_all)]
    pub fn list_live(conn: &mut PgConn) -> DbResult<Vec<Self>> {
        let results = tenant::table
            .filter(tenant::sandbox_restricted.eq(false))
            .get_results(conn)?;
        Ok(results)
    }

    /// Save any struct that implements `Insertable<tenant::table>`. The diesel trait constraints
    /// are kind of clunky, but removes the need to have two separate functions with the same exact body
    #[tracing::instrument(skip_all)]
    pub fn save<T>(conn: &mut PgConn, value: T) -> DbResult<Self>
    where
        T: Insertable<tenant::table>,
        <T as Insertable<tenant::table>>::Values: QueryFragment<Pg> + CanInsertInSingleQuery<Pg> + QueryId,
    {
        let tenant = diesel::insert_into(tenant::table)
            .values(value)
            .get_result(conn)?;
        Ok(tenant)
    }

    #[tracing::instrument(skip_all)]
    pub fn update(conn: &mut PgConn, id: &TenantId, update_tenant: UpdateTenant) -> DbResult<Self> {
        let result = diesel::update(tenant::table)
            .filter(tenant::id.eq(id))
            .set(update_tenant)
            .get_result(conn)?;

        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn list_by_user_vault_id(conn: &mut PgConn, user_vault_id: &VaultId) -> DbResult<Vec<Tenant>> {
        let res = scoped_user::table
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .inner_join(tenant::table)
            .select(tenant::all_columns)
            .get_results(conn)?;
        Ok(res)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset, Default)]
#[diesel(table_name = tenant)]
pub struct UpdateTenant {
    pub name: Option<String>,
    pub logo_url: Option<String>,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
    pub privacy_policy_url: Option<String>,
    pub stripe_customer_id: Option<StripeCustomerId>,
}
