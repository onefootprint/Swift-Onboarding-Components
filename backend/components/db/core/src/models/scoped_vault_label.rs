use super::data_lifetime::DataLifetime;
use super::scoped_vault::ScopedVault;
use super::user_timeline::UserTimeline;
use crate::{
    DbResult,
    PgConn,
    TxnPgConn,
};
use chrono::{
    DateTime,
    Utc,
};
use db_schema::schema::scoped_vault_label;
use diesel::prelude::*;
use diesel::{
    Insertable,
    Queryable,
};
use newtypes::{
    DataLifetimeSeqno,
    LabelAddedInfo,
    LabelId,
    LabelKind,
    ScopedVaultId,
};
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
}

impl ScopedVaultLabel {
    #[tracing::instrument("ScopedVaultLabel::get_active", skip_all)]
    pub fn get_active(conn: &mut PgConn, sv_id: &ScopedVaultId) -> DbResult<Option<ScopedVaultLabel>> {
        let label = scoped_vault_label::table
            .filter(scoped_vault_label::scoped_vault_id.eq(sv_id))
            .filter(scoped_vault_label::deactivated_seqno.is_null())
            .first(conn)
            .optional()?;
        Ok(label)
    }

    #[tracing::instrument("ScopedVaultLabel::get_bulk", skip_all)]
    pub fn get_bulk(conn: &mut PgConn, ids: Vec<LabelId>) -> DbResult<HashMap<LabelId, ScopedVaultLabel>> {
        let results = scoped_vault_label::table
            .filter(scoped_vault_label::id.eq_any(ids))
            .get_results::<Self>(conn)?
            .into_iter()
            .map(|l| (l.id.clone(), l))
            .collect();
        Ok(results)
    }
}
#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = scoped_vault_label)]
struct NewScopedVaultLabelRow {
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    scoped_vault_id: ScopedVaultId,
    kind: LabelKind,
}

#[derive(Debug, Clone, AsChangeset)]
#[diesel(table_name = scoped_vault_label)]
pub struct DeactivateLabelUpdate {
    pub deactivated_at: DateTime<Utc>,
    pub deactivated_seqno: DataLifetimeSeqno,
}

impl ScopedVaultLabel {
    #[tracing::instrument("ScopedVaultLabel::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, sv: ScopedVault, kind: LabelKind) -> DbResult<ScopedVaultLabel> {
        // first deactivate existing one
        let seqno = DataLifetime::get_next_seqno(conn)?;
        let update: DeactivateLabelUpdate = DeactivateLabelUpdate {
            deactivated_at: Utc::now(),
            deactivated_seqno: seqno,
        };

        let _: Vec<ScopedVaultLabel> = diesel::update(scoped_vault_label::table)
            .filter(scoped_vault_label::scoped_vault_id.eq(&sv.id))
            .filter(scoped_vault_label::deactivated_seqno.is_null())
            .set(update)
            .get_results(conn.conn())?;

        // now insert the new one
        let row = NewScopedVaultLabelRow {
            created_at: Utc::now(),
            created_seqno: seqno,
            scoped_vault_id: sv.id.clone(),
            kind,
        };
        let ev = diesel::insert_into(db_schema::schema::scoped_vault_label::table)
            .values(row)
            .get_result::<Self>(conn.conn())?;

        let info = LabelAddedInfo { id: ev.id.clone() };
        UserTimeline::create(conn, info, sv.vault_id, sv.id)?;

        Ok(ev)
    }
}
