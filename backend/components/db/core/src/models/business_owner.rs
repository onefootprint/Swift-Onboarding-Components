use super::scoped_vault::ScopedVault;
use super::vault::Vault;
use crate::DbError;
use crate::DbResult;
use crate::OffsetPaginatedResult;
use crate::OffsetPagination;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::business_owner;
use db_schema::schema::scoped_vault;
use db_schema::schema::vault;
use db_schema::schema::workflow;
use diesel::dsl::exists;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::BoId;
use newtypes::BoLinkId;
use newtypes::BusinessOwnerKind;
use newtypes::BusinessOwnerSource;
use newtypes::Locked;
use newtypes::ObConfigurationId;
use newtypes::TenantId;
use newtypes::VaultId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = business_owner)]
/// Represents a _KYCed_ owner of a business. Non-KYCed owners only exist in the vault and not in
/// this table
pub struct BusinessOwner {
    pub id: BoId,
    pub user_vault_id: Option<VaultId>,
    pub business_vault_id: VaultId,
    pub kind: BusinessOwnerKind,
    pub link_id: BoLinkId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub source: BusinessOwnerSource,
    /// Only set for BOs linked via API
    pub ownership_stake: Option<i32>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = business_owner)]
struct NewBusinessOwnerRow {
    user_vault_id: Option<VaultId>,
    business_vault_id: VaultId,
    kind: BusinessOwnerKind,
    link_id: BoLinkId,
    created_at: DateTime<Utc>,
    source: BusinessOwnerSource,
    ownership_stake: Option<i32>,
}

pub type UserData = (ScopedVault, Vault);

impl BusinessOwner {
    #[tracing::instrument("BusinessOwner::create_primary", skip_all)]
    pub fn create_primary(
        conn: &mut TxnPgConn,
        user_vault_id: VaultId,
        business_vault_id: VaultId,
    ) -> DbResult<Self> {
        let new = NewBusinessOwnerRow {
            user_vault_id: Some(user_vault_id),
            business_vault_id,
            kind: BusinessOwnerKind::Primary,
            link_id: BoLinkId::generate(BusinessOwnerKind::Primary),
            created_at: Utc::now(),
            source: BusinessOwnerSource::Hosted,
            ownership_stake: None,
        };
        let result = diesel::insert_into(business_owner::table)
            .values(new)
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("BusinessOwner::bulk_create_secondary", skip_all)]
    pub fn bulk_create_secondary(
        conn: &mut TxnPgConn,
        link_ids: Vec<BoLinkId>,
        business_vault_id: VaultId,
    ) -> DbResult<Vec<Self>> {
        let rows = link_ids
            .into_iter()
            .map(|link_id| NewBusinessOwnerRow {
                user_vault_id: None,
                business_vault_id: business_vault_id.clone(),
                kind: BusinessOwnerKind::Secondary,
                link_id,
                created_at: Utc::now(),
                source: BusinessOwnerSource::Hosted,
                ownership_stake: None,
            })
            .collect_vec();
        let result = diesel::insert_into(business_owner::table)
            .values(rows)
            .get_results(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("BusinessOwner::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        sb: Locked<ScopedVault>,
        owner_vault_id: VaultId,
        ownership_stake: i32,
    ) -> DbResult<Self> {
        let existing = business_owner::table
            .filter(business_owner::business_vault_id.eq(&sb.vault_id))
            .get_results::<Self>(conn.conn())?;
        let kind = if existing.is_empty() {
            BusinessOwnerKind::Primary
        } else {
            BusinessOwnerKind::Secondary
        };
        let new = NewBusinessOwnerRow {
            user_vault_id: Some(owner_vault_id),
            business_vault_id: sb.into_inner().vault_id,
            kind,
            // The link ID isn't used here
            link_id: BoLinkId::generate(kind),
            created_at: Utc::now(),
            source: BusinessOwnerSource::Tenant,
            ownership_stake: Some(ownership_stake),
        };
        let result = diesel::insert_into(business_owner::table)
            .values(new)
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("BusinessOwner::list_all", skip_all)]
    pub fn list_all(
        conn: &mut PgConn,
        bv_id: &VaultId,
        // by ob config ID?
        // we really want to just return workflows here
        tenant_id: &TenantId,
    ) -> DbResult<Vec<(Self, Option<UserData>)>> {
        let result = business_owner::table
            .filter(business_owner::business_vault_id.eq(bv_id))
            .left_join(
                scoped_vault::table
                    .on(scoped_vault::vault_id
                        .nullable()
                        .eq(business_owner::user_vault_id)
                        .and(scoped_vault::tenant_id.eq(tenant_id)))
                    .inner_join(vault::table),
            )
            .get_results(conn)?;
        Ok(result)
    }

    /// List the set of businesses belonging to this user onboarded onto the provided ob config
    #[tracing::instrument("BusinessOwner::list_businesses_for_playbook", skip_all)]
    pub fn list_businesses_for_playbook(
        conn: &mut PgConn,
        uv_id: &VaultId,
        ob_config_id: &ObConfigurationId,
    ) -> DbResult<Vec<(BusinessOwner, ScopedVault)>> {
        let result = business_owner::table
            .inner_join(scoped_vault::table.on(scoped_vault::vault_id.eq(business_owner::business_vault_id)))
            .filter(business_owner::user_vault_id.eq(uv_id))
            // Only get the ScopedVault for the businesses that onboarded onto the
            // same ob config
            .filter(exists(
                workflow::table
                    .filter(workflow::scoped_vault_id.eq(scoped_vault::id))
                    .filter(workflow::ob_configuration_id.eq(ob_config_id))
            ))
            .order_by(scoped_vault::start_timestamp.desc())
            .get_results(conn)?;
        Ok(result)
    }

    /// List the set of businesses belonging to this user
    #[tracing::instrument("BusinessOwner::list_businesses", skip_all)]
    pub fn list_businesses(
        conn: &mut PgConn,
        uv_id: &VaultId,
        tenant_id: &TenantId,
    ) -> DbResult<Vec<(BusinessOwner, ScopedVault)>> {
        let result = business_owner::table
            .inner_join(scoped_vault::table.on(scoped_vault::vault_id.eq(business_owner::business_vault_id)))
            .filter(business_owner::user_vault_id.eq(uv_id))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .order_by(business_owner::created_at.asc())
            .get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument("BusinessOwner::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &BoId) -> DbResult<Self> {
        let result = business_owner::table
            .filter(business_owner::id.eq(id))
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("BusinessOwner::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &BoId) -> DbResult<Locked<Self>> {
        let result = business_owner::table
            .filter(business_owner::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("BusinessOwner::add_user_vault_id", skip_all)]
    pub fn add_user_vault_id(self, conn: &mut PgConn, user_vault_id: &VaultId) -> DbResult<Self> {
        // This should only happen inside of a Locked<Self>
        if self.user_vault_id.is_some() {
            return Err(DbError::ValidationError("BO already has a user_vault_id".into()));
        }
        let result = diesel::update(business_owner::table)
            .filter(business_owner::id.eq(self.id))
            .set(business_owner::user_vault_id.eq(user_vault_id))
            .get_result(conn)?;
        Ok(result)
    }
}

pub struct BusinessOwnerQuery<'a> {
    pub bv_id: &'a VaultId,
    pub tenant_id: &'a TenantId,
}

impl BusinessOwner {
    #[tracing::instrument("BusinessOwner::list", skip_all)]
    pub fn list<'a>(
        conn: &mut PgConn,
        args: BusinessOwnerQuery<'a>,
        pagination: OffsetPagination,
    ) -> DbResult<OffsetPaginatedResult<(Self, UserData)>> {
        let BusinessOwnerQuery { bv_id, tenant_id } = args;
        let mut query = business_owner::table
            .filter(business_owner::business_vault_id.eq(bv_id))
            .inner_join(
                scoped_vault::table
                    .on(scoped_vault::vault_id.eq(business_owner::user_vault_id.assume_not_null()))
                    .inner_join(vault::table),
            )
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .limit(pagination.limit())
            .order_by(business_owner::created_at)
            .into_boxed();
        if let Some(offset) = pagination.offset() {
            query = query.offset(offset)
        }
        let results = query.get_results(conn)?;
        Ok(pagination.results(results))
    }
}
