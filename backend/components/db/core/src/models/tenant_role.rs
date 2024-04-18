use std::collections::HashMap;

use super::ob_configuration::IsLive;
use crate::{DbError, DbResult, NextPage, NonNullVec, OffsetPagination, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::tenant_role::{self, BoxedQuery};
use diesel::{
    dsl::count_star,
    prelude::*,
    sql_types::{Bool, Nullable},
    Insertable, Queryable,
};
use itertools::Itertools;
use newtypes::{
    ApiKeyStatus, InvokeVaultProxyPermission, Locked, OrgIdentifierRef, PartnerTenantId, TenantId,
    TenantKind, TenantRoleId, TenantRoleKind, TenantRoleKindDiscriminant, TenantScope,
    TenantScopeDiscriminants,
};

pub type IsImmutable = bool;
pub type NumActiveUsers = i64;
pub type NumActiveApiKeys = i64;

pub struct TenantRoleInfo {
    pub role: TenantRole,
    pub num_active_users: NumActiveUsers,
    pub num_active_api_keys: NumActiveApiKeys,
}

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = tenant_role)]
pub struct TenantRole {
    pub id: TenantRoleId,
    pub tenant_id: Option<TenantId>,
    pub name: String,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    /// Denotes whether this is a default TenantRole that cannot be changed by a tenant.
    /// Each Tenant will have an immutable read-only and immutable admin role
    pub is_immutable: IsImmutable,
    /// The list of scopes that are granted to every user in this role
    #[diesel(deserialize_as = NonNullVec<TenantScope>)]
    pub scopes: Vec<TenantScope>,
    pub kind: TenantRoleKindDiscriminant,
    // For ApiKey roles, is_live must be set
    pub is_live: Option<IsLive>,
    pub partner_tenant_id: Option<PartnerTenantId>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
/// Represents the two immutable roles that every tenant has
pub enum ImmutableRoleKind {
    Admin,
    ReadOnly,
    CompliancePartnerAdmin,
    CompliancePartnerReadOnly,
}

impl ImmutableRoleKind {
    pub(super) fn tenant_kind(&self) -> TenantKind {
        match &self {
            Self::Admin | Self::ReadOnly => TenantKind::Tenant,
            Self::CompliancePartnerAdmin | Self::CompliancePartnerReadOnly => TenantKind::PartnerTenant,
        }
    }

    pub(super) fn props(&self) -> (&'static str, Vec<TenantScope>) {
        match self {
            Self::Admin => ("Admin", vec![TenantScope::Admin]),
            Self::ReadOnly => ("Member", vec![TenantScope::Read]),
            Self::CompliancePartnerAdmin => ("Admin", vec![TenantScope::CompliancePartnerAdmin]),
            Self::CompliancePartnerReadOnly => ("Member", vec![TenantScope::CompliancePartnerRead]),
        }
    }
}

impl TenantRole {
    fn validate_scopes(
        conn: &mut PgConn,
        scopes: &[TenantScope],
        org_id: OrgIdentifierRef,
        kind: TenantRoleKindDiscriminant,
        is_live: Option<IsLive>,
    ) -> DbResult<()> {
        // Every role must have at least Read permissions for now
        match org_id {
            OrgIdentifierRef::TenantId(_) => {
                if !scopes.contains(&TenantScope::Read) && !scopes.contains(&TenantScope::Admin) {
                    return Err(DbError::InsufficientTenantScopes(TenantScopeDiscriminants::Read));
                }
            }
            OrgIdentifierRef::PartnerTenantId(_) => {
                if !scopes.contains(&TenantScope::CompliancePartnerRead)
                    && !scopes.contains(&TenantScope::CompliancePartnerAdmin)
                {
                    return Err(DbError::InsufficientTenantScopes(
                        TenantScopeDiscriminants::CompliancePartnerRead,
                    ));
                }
            }
        }

        if scopes.iter().unique().count() != scopes.len() {
            return Err(DbError::NonUniqueTenantScopes);
        }

        if kind.tenant_kind() != org_id.into() {
            return Err(DbError::IncorrectTenantRoleKind);
        }

        if let Some(s) = scopes
            .iter()
            .find(|s| !s.role_kinds().into_iter().contains(&kind))
        {
            let s = TenantScopeDiscriminants::from(s);
            return Err(DbError::InvalidTenantScope(kind, s));
        }
        if let OrgIdentifierRef::TenantId(tenant_id) = org_id {
            let proxy_config_ids = scopes
                .iter()
                .filter_map(|s| match s {
                    TenantScope::InvokeVaultProxy {
                        data: InvokeVaultProxyPermission::Id { id },
                    } => Some(id.clone()),
                    _ => None,
                })
                .collect_vec();

            if !proxy_config_ids.is_empty() {
                use db_schema::schema::proxy_config;
                let mut query = proxy_config::table
                    .filter(proxy_config::tenant_id.eq(tenant_id))
                    .filter(proxy_config::id.eq_any(&proxy_config_ids))
                    .into_boxed();
                if let Some(is_live) = is_live {
                    query = query.filter(proxy_config::is_live.eq(is_live));
                }
                let proxy_configs_count: i64 = query.count().get_result(conn)?;
                if (proxy_config_ids.len() as i64) != proxy_configs_count {
                    return Err(DbError::InvalidProxyConfigId);
                }
            }
        }
        Ok(())
    }

    #[tracing::instrument("TenantRole::get_immutable", skip_all)]
    pub fn get_immutable<'a>(
        conn: &mut PgConn,
        org_id: impl Into<OrgIdentifierRef<'a>>,
        kind: ImmutableRoleKind,
        role_kind: TenantRoleKind,
    ) -> DbResult<Self> {
        let org_id: OrgIdentifierRef<'a> = org_id.into();

        let role_kind_discriminant = TenantRoleKindDiscriminant::from(&role_kind);
        if role_kind_discriminant.tenant_kind() != org_id.into() {
            return Err(DbError::IncorrectTenantRoleKind);
        }

        if kind.tenant_kind() != org_id.into() {
            return Err(DbError::IncorrectTenantRoleKind);
        }

        let (name, scopes) = kind.props();
        let mut query = tenant_role::table
            .filter(TenantRole::tenant_or_partner_tenant_id_eq(org_id))
            .filter(tenant_role::name.eq(name))
            .filter(tenant_role::scopes.eq(&scopes))
            .filter(tenant_role::is_immutable.eq(true))
            .into_boxed();
        query = query.filter(tenant_role::kind.eq(role_kind_discriminant));
        if let TenantRoleKind::ApiKey { is_live } = role_kind {
            query = query.filter(tenant_role::is_live.eq(is_live))
        }
        let role = query.first::<Self>(conn)?;
        Ok(role)
    }

    #[tracing::instrument("TenantRole::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &TenantRoleId) -> DbResult<Self> {
        let role = tenant_role::table
            .filter(tenant_role::id.eq(id))
            .first::<Self>(conn)?;
        Ok(role)
    }

    #[tracing::instrument("TenantRole::create", skip_all)]
    pub fn create<'a>(
        conn: &mut PgConn,
        org_id: impl Into<OrgIdentifierRef<'a>>,
        name: &str,
        scopes: Vec<TenantScope>,
        is_immutable: IsImmutable,
        kind: TenantRoleKind,
    ) -> DbResult<Self> {
        let org_id: OrgIdentifierRef<'a> = org_id.into();

        let is_live = kind.is_live();
        let kind = TenantRoleKindDiscriminant::from(kind);

        Self::validate_scopes(conn, &scopes, org_id, kind, is_live)?;

        let (tenant_id, partner_tenant_id) = match org_id {
            OrgIdentifierRef::TenantId(tid) => (Some(tid), None),
            OrgIdentifierRef::PartnerTenantId(ptid) => (None, Some(ptid)),
        };

        let new = NewTenantRoleRow {
            tenant_id,
            name,
            scopes,
            is_immutable,
            kind,
            is_live,
            created_at: Utc::now(),
            partner_tenant_id,
        };
        let result = diesel::insert_into(tenant_role::table)
            .values(new)
            .get_result(conn)
            .map_err(DbError::from)
            .map_err(|e| {
                if e.is_unique_constraint_violation() {
                    // There's already a role with this name at this tenant
                    DbError::TenantRoleAlreadyExists
                } else {
                    e
                }
            })?;
        Ok(result)
    }

    #[tracing::instrument("TenantRole::lock_active", skip_all)]
    pub fn lock_active<'a>(
        conn: &mut TxnPgConn,
        id: &TenantRoleId,
        org_id: impl Into<OrgIdentifierRef<'a>>,
    ) -> DbResult<Locked<Self>> {
        let org_id: OrgIdentifierRef<'a> = org_id.into();

        let role: TenantRole = tenant_role::table
                .filter(TenantRole::tenant_or_partner_tenant_id_eq(org_id))
                .filter(tenant_role::id.eq(id))
                .for_no_key_update() // Make sure someone doesn't deactivate the role while we are using it
                .first(conn.conn())?;

        if role.deactivated_at.is_some() {
            return Err(DbError::TargetTenantRoleDeactivated);
        }
        Ok(Locked::new(role))
    }

    #[tracing::instrument("TenantRole::deactivate", skip_all)]
    pub fn deactivate<'a>(
        conn: &mut TxnPgConn,
        id: &TenantRoleId,
        org_id: impl Into<OrgIdentifierRef<'a>>,
    ) -> DbResult<Self> {
        let org_id: OrgIdentifierRef<'a> = org_id.into();

        use db_schema::schema::{tenant_api_key, tenant_rolebinding};
        let role = Self::lock_active(conn, id, org_id)?.into_inner();
        if role.is_immutable {
            return Err(DbError::CannotUpdateImmutableRole(role.name));
        }
        // Make sure there are no users using this role before deactivating
        let num_active_users: i64 = tenant_rolebinding::table
            .filter(tenant_rolebinding::tenant_role_id.eq(&role.id))
            .filter(tenant_rolebinding::deactivated_at.is_null())
            .count()
            .get_result(conn.conn())?;
        let num_active_keys: i64 = tenant_api_key::table
            .filter(tenant_api_key::role_id.eq(&role.id))
            .filter(tenant_api_key::status.eq(ApiKeyStatus::Enabled))
            .count()
            .get_result(conn.conn())?;
        if num_active_users > 0 {
            return Err(DbError::TenantRoleHasUsers(num_active_users));
        }
        if num_active_keys > 0 {
            return Err(DbError::TenantRoleHasActiveApiKeys(num_active_keys));
        }
        let update = TenantRoleUpdate {
            deactivated_at: Some(Some(Utc::now())),
            ..TenantRoleUpdate::default()
        };
        let results: Vec<Self> = diesel::update(tenant_role::table)
            .filter(tenant_role::id.eq(id))
            .filter(TenantRole::tenant_or_partner_tenant_id_eq(org_id))
            // Don't allow updating an immutable role
            .filter(tenant_role::is_immutable.eq(false))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }

    #[tracing::instrument("TenantRole::update", skip_all)]
    pub fn update<'a>(
        conn: &mut TxnPgConn,
        org_id: impl Into<OrgIdentifierRef<'a>>,
        id: &TenantRoleId,
        name: Option<String>,
        scopes: Option<Vec<TenantScope>>,
    ) -> DbResult<Self> {
        let org_id: OrgIdentifierRef<'a> = org_id.into();

        let role = Self::lock_active(conn, id, org_id)?.into_inner();
        if let Some(scopes) = scopes.as_ref() {
            Self::validate_scopes(conn, scopes, org_id, role.kind, role.is_live)?;
        }
        if role.is_immutable {
            return Err(DbError::CannotUpdateImmutableRole(role.name));
        }
        let update = TenantRoleUpdate {
            name,
            scopes,
            ..TenantRoleUpdate::default()
        };
        let results: Vec<Self> = diesel::update(tenant_role::table)
            .filter(tenant_role::id.eq(id))
            .filter(TenantRole::tenant_or_partner_tenant_id_eq(org_id))
            // Don't allow updating an immutable role
            .filter(tenant_role::is_immutable.eq(false))
            .set(update)
            .load(conn.conn())
            .map_err(DbError::from)
            .map_err(|e| {
                if e.is_unique_constraint_violation() {
                    // There's already a role with this name at this tenant
                    DbError::TenantRoleAlreadyExists
                } else {
                    e
                }
            })?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }

    pub fn list_active_query<'a>(filters: &'a TenantRoleListFilters) -> BoxedQuery<'a, diesel::pg::Pg> {
        let mut query = tenant_role::table
            .filter(tenant_role::deactivated_at.is_null())
            .filter(
                tenant_role::is_live
                    .eq(filters.is_live)
                    // Always return results with is_live = null
                    .or(tenant_role::is_live.is_null()),
            )
            .into_boxed();

        query = match filters.org_ident {
            OrgIdentifierRef::TenantId(tenant_id) => query.filter(tenant_role::tenant_id.eq(tenant_id)),
            OrgIdentifierRef::PartnerTenantId(pt_id) => {
                query.filter(tenant_role::partner_tenant_id.eq(pt_id))
            }
        };

        if let Some(ref scopes) = filters.scopes {
            query = query.filter(tenant_role::scopes.overlaps_with(scopes))
        }
        if let Some(ref search) = filters.search {
            query = query.filter(tenant_role::name.ilike(format!("%{}%", search)))
        }
        if let Some(kind) = filters.kind.as_ref() {
            query = query.filter(tenant_role::kind.eq(kind))
        }
        query
    }

    #[tracing::instrument("TenantRole::list_active", skip_all)]
    pub fn list_active(
        conn: &mut PgConn,
        filters: &TenantRoleListFilters,
        pagination: OffsetPagination,
    ) -> DbResult<(Vec<TenantRoleInfo>, NextPage)> {
        use db_schema::schema::{tenant_api_key, tenant_rolebinding};
        let mut query = Self::list_active_query(filters)
            .order_by(tenant_role::name.asc())
            .limit(pagination.limit());

        if let Some(offset) = pagination.offset() {
            query = query.offset(offset)
        }
        let results: Vec<Self> = query.get_results(conn)?;

        // For each role, fetch the number of active users and api keys
        let role_ids = results.iter().map(|r| r.id.clone()).collect_vec();
        let num_active_users_per_role: Vec<(TenantRoleId, NumActiveUsers)> = tenant_rolebinding::table
            .filter(tenant_rolebinding::tenant_role_id.eq_any(&role_ids))
            .filter(tenant_rolebinding::deactivated_at.is_null())
            .group_by(tenant_rolebinding::tenant_role_id)
            .select((tenant_rolebinding::tenant_role_id, count_star()))
            .get_results(conn)?;

        let num_active_keys_per_role: Vec<(TenantRoleId, NumActiveApiKeys)> = tenant_api_key::table
            .filter(tenant_api_key::role_id.eq_any(&role_ids))
            .filter(tenant_api_key::status.eq(ApiKeyStatus::Enabled))
            .group_by(tenant_api_key::role_id)
            .select((tenant_api_key::role_id, count_star()))
            .get_results(conn)?;

        // Zip results together
        let mut num_active_users_per_role: HashMap<_, _> = num_active_users_per_role.into_iter().collect();
        let mut num_active_keys_per_role: HashMap<_, _> = num_active_keys_per_role.into_iter().collect();
        let results = results
            .into_iter()
            .map(|r| TenantRoleInfo {
                num_active_users: num_active_users_per_role.remove(&r.id).unwrap_or_default(),
                num_active_api_keys: num_active_keys_per_role.remove(&r.id).unwrap_or_default(),
                role: r,
            })
            .collect();
        let results = pagination.results(results);
        Ok(results)
    }

    #[tracing::instrument("TenantRole::count_active", skip_all)]
    pub fn count_active(conn: &mut PgConn, filters: &TenantRoleListFilters) -> DbResult<i64> {
        let query = Self::list_active_query(filters);
        let count = query.count().get_result(conn)?;
        Ok(count)
    }

    pub fn tenant_or_partner_tenant_id(&self) -> DbResult<OrgIdentifierRef> {
        match (&self.tenant_id, &self.partner_tenant_id) {
            (Some(tenant_id), None) => Ok(tenant_id.into()),
            (None, Some(partner_tenant_id)) => Ok(partner_tenant_id.into()),
            (Some(_), Some(_)) | (None, None) => {
                // DB constraints should prevent these cases from occurring.
                Err(DbError::ValidationError("Invalid tenant role".to_owned()))
            }
        }
    }

    pub fn tenant_or_partner_tenant_id_eq<'a, QS>(
        org_id: OrgIdentifierRef<'a>,
    ) -> Box<dyn BoxableExpression<QS, diesel::pg::Pg, SqlType = Nullable<Bool>> + 'a>
    where
        tenant_role::tenant_id: SelectableExpression<QS>,
        tenant_role::partner_tenant_id: SelectableExpression<QS>,
    {
        // n.b.: check constraints enforce that exactly one of tenant_id and partner_tenant_id is
        // not null.
        match org_id {
            OrgIdentifierRef::TenantId(tid) => Box::new(tenant_role::tenant_id.eq(tid)),
            OrgIdentifierRef::PartnerTenantId(ptid) => Box::new(tenant_role::partner_tenant_id.eq(ptid)),
        }
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_role)]
struct NewTenantRoleRow<'a> {
    pub(super) tenant_id: Option<&'a TenantId>,
    pub(super) name: &'a str,
    pub(super) scopes: Vec<TenantScope>,
    pub(super) created_at: DateTime<Utc>,
    pub(super) is_immutable: IsImmutable,
    pub(super) kind: TenantRoleKindDiscriminant,
    pub(super) is_live: Option<IsLive>,
    pub(super) partner_tenant_id: Option<&'a PartnerTenantId>,
}

#[derive(AsChangeset, Default)]
#[diesel(table_name = tenant_role)]
struct TenantRoleUpdate {
    name: Option<String>,
    scopes: Option<Vec<TenantScope>>,
    deactivated_at: Option<Option<DateTime<Utc>>>,
}

pub struct TenantRoleListFilters<'a> {
    pub org_ident: OrgIdentifierRef<'a>,
    pub scopes: Option<Vec<TenantScope>>,
    pub search: Option<String>,
    pub kind: Option<TenantRoleKindDiscriminant>,
    pub is_live: bool,
}
