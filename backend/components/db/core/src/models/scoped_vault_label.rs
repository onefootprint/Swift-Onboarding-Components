use super::data_lifetime::DataLifetimeSeqnoTxn;
use super::user_timeline::UserTimeline;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::scoped_vault_label;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::DataLifetimeSeqno;
use newtypes::DbActor;
use newtypes::LabelAddedInfo;
use newtypes::LabelId;
use newtypes::LabelKind;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Insertable, Default)]
#[diesel(table_name = scoped_vault_label)]
pub struct ScopedVaultLabel {
    pub id: LabelId,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub created_seqno: DataLifetimeSeqno,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: LabelKind,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_by_actor: Option<DbActor>,
    pub deactivated_by_actor: Option<DbActor>,
    pub tenant_id: TenantId,
    pub is_live: bool,
}

impl ScopedVaultLabel {
    #[tracing::instrument("ScopedVaultLabel::get_active", skip_all)]
    pub fn get_active(conn: &mut PgConn, sv_id: &ScopedVaultId) -> FpResult<Option<ScopedVaultLabel>> {
        let label = scoped_vault_label::table
            .filter(scoped_vault_label::scoped_vault_id.eq(sv_id))
            .filter(scoped_vault_label::deactivated_seqno.is_null())
            .first(conn)
            .optional()?;
        Ok(label)
    }

    #[tracing::instrument("ScopedVaultLabel::bulk_get_active", skip_all)]
    pub fn bulk_get_active(
        conn: &mut PgConn,
        sv_ids: Vec<&ScopedVaultId>,
    ) -> FpResult<Vec<ScopedVaultLabel>> {
        let labels = scoped_vault_label::table
            .filter(scoped_vault_label::scoped_vault_id.eq_any(sv_ids))
            .filter(scoped_vault_label::deactivated_seqno.is_null())
            .get_results(conn)?;
        Ok(labels)
    }

    #[tracing::instrument("ScopedVaultLabel::get_bulk", skip_all)]
    pub fn get_bulk(conn: &mut PgConn, ids: Vec<LabelId>) -> FpResult<HashMap<LabelId, ScopedVaultLabel>> {
        let results = scoped_vault_label::table
            .filter(scoped_vault_label::id.eq_any(ids))
            .get_results::<Self>(conn)?
            .into_iter()
            .map(|l| (l.id.clone(), l))
            .collect();
        Ok(results)
    }

    #[tracing::instrument("ScopedVaultLabel::deactivate", skip_all)]
    pub fn deactivate(conn: &mut PgConn, sv_txn: &DataLifetimeSeqnoTxn<'_>, actor: DbActor) -> FpResult<()> {
        let update: DeactivateLabelUpdate = DeactivateLabelUpdate {
            deactivated_at: Utc::now(),
            deactivated_seqno: sv_txn.seqno(),
            deactivated_by_actor: actor.clone(),
        };

        diesel::update(scoped_vault_label::table)
            .filter(scoped_vault_label::scoped_vault_id.eq(&sv_txn.scoped_vault().id))
            .filter(scoped_vault_label::deactivated_seqno.is_null())
            .set(update)
            .execute(conn)?;

        Ok(())
    }
}
#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = scoped_vault_label)]
struct NewScopedVaultLabelRow {
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    scoped_vault_id: ScopedVaultId,
    kind: LabelKind,
    created_by_actor: DbActor,
    tenant_id: TenantId,
    is_live: bool,
}

#[derive(Debug, Clone, AsChangeset)]
#[diesel(table_name = scoped_vault_label)]
pub struct DeactivateLabelUpdate {
    pub deactivated_at: DateTime<Utc>,
    pub deactivated_seqno: DataLifetimeSeqno,
    pub deactivated_by_actor: DbActor,
}

impl ScopedVaultLabel {
    #[tracing::instrument("ScopedVaultLabel::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        sv_txn: &DataLifetimeSeqnoTxn<'_>,
        kind: LabelKind,
        actor: DbActor,
    ) -> FpResult<ScopedVaultLabel> {
        // First deactivate
        Self::deactivate(conn.conn(), sv_txn, actor.clone())?;

        let sv = sv_txn.scoped_vault();

        // now insert the new one
        let row = NewScopedVaultLabelRow {
            created_at: Utc::now(),
            created_seqno: sv_txn.seqno(),
            scoped_vault_id: sv.id.clone(),
            created_by_actor: actor,
            kind,
            tenant_id: sv.tenant_id.clone(),
            is_live: sv.is_live,
        };
        let ev = diesel::insert_into(db_schema::schema::scoped_vault_label::table)
            .values(row)
            .get_result::<Self>(conn.conn())?;

        let info = LabelAddedInfo { id: ev.id.clone() };
        UserTimeline::create(conn, sv_txn, info)?;

        Ok(ev)
    }
}
