use crate::{schema::business_owner, DbError, DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::{BoId, BoLinkId, BusinessOwnerKind, Locked, ObConfigurationId, VaultId};

use super::{onboarding::Onboarding, scoped_vault::ScopedVault};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = business_owner)]
pub struct BusinessOwner {
    pub id: BoId,
    pub user_vault_id: Option<VaultId>,
    pub business_vault_id: VaultId,
    pub kind: BusinessOwnerKind,
    pub link_id: BoLinkId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = business_owner)]
struct NewBusinessOwnerRow {
    user_vault_id: Option<VaultId>,
    business_vault_id: VaultId,
    kind: BusinessOwnerKind,
    link_id: BoLinkId,
}

impl BusinessOwner {
    #[tracing::instrument(skip(conn))]
    pub fn create_primary(
        conn: &mut TxnPgConn,
        user_vault_id: VaultId,
        business_vault_id: VaultId,
    ) -> DbResult<Self> {
        let new = NewBusinessOwnerRow {
            user_vault_id: Some(user_vault_id),
            business_vault_id,
            kind: BusinessOwnerKind::Primary,
            link_id: BoLinkId::generate(),
        };
        let result = diesel::insert_into(business_owner::table)
            .values(new)
            .get_result(conn.conn())?;
        Ok(result)
    }

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
            })
            .collect_vec();
        let result = diesel::insert_into(business_owner::table)
            .values(rows)
            .get_results(conn.conn())?;
        Ok(result)
    }

    pub fn list(
        conn: &mut PgConn,
        bv_id: &VaultId,
        ob_config_id: &ObConfigurationId,
    ) -> DbResult<Vec<(Self, (ScopedVault, Onboarding))>> {
        use crate::schema::{onboarding, scoped_vault};
        let result = business_owner::table
            .filter(business_owner::business_vault_id.eq(bv_id))
            .inner_join(
                scoped_vault::table
                    .inner_join(onboarding::table)
                    .on(scoped_vault::vault_id.nullable()
                    .eq(business_owner::user_vault_id)
                    // Only get the ScopedVault for the owner's user vault that onboarded onto the
                    // same ob config
                    .and(scoped_vault::ob_configuration_id.eq(ob_config_id))),
            )
            .get_results(conn)?;
        Ok(result)
    }

    pub fn get(conn: &mut PgConn, id: &BoId) -> DbResult<Self> {
        let result = business_owner::table
            .filter(business_owner::id.eq(id))
            .get_result(conn)?;
        Ok(result)
    }

    pub fn lock(conn: &mut TxnPgConn, id: &BoId) -> DbResult<Locked<Self>> {
        let result = business_owner::table
            .filter(business_owner::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

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
