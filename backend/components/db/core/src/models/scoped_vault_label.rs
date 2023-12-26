use db_schema::schema::scoped_vault_label;
use newtypes::DataLifetimeSeqno;
use newtypes::LabelId;

use chrono::{DateTime, Utc};
use newtypes::LabelKind;
use newtypes::ScopedVaultId;

use crate::DbError;
use crate::PgConn;
use crate::TxnPgConn;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};

use super::data_lifetime::DataLifetime;

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
    pub fn get_active(conn: &mut PgConn, sv_id: &ScopedVaultId) -> Result<Option<ScopedVaultLabel>, DbError> {
        Ok(scoped_vault_label::table
            .filter(scoped_vault_label::scoped_vault_id.eq(sv_id))
            .filter(scoped_vault_label::deactivated_seqno.is_null())
            .first(conn)
            .optional()?)
    }
}
#[derive(Debug, Clone, Insertable, Default)]
#[diesel(table_name = scoped_vault_label)]
pub struct NewScopedVaultLabel {
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: LabelKind,
}

#[derive(Debug, Clone, AsChangeset, Default)]
#[diesel(table_name = scoped_vault_label)]
pub struct DeactivateLabelUpdate {
    pub deactivated_at: DateTime<Utc>,
    pub deactivated_seqno: DataLifetimeSeqno,
}

impl NewScopedVaultLabel {
    #[tracing::instrument("NewScopedVaultLabel::insert", skip_all)]
    pub fn insert(self, conn: &mut TxnPgConn) -> Result<ScopedVaultLabel, DbError> {
        // first deactivate existing one
        let seqno = DataLifetime::get_next_seqno(conn)?;
        let update: DeactivateLabelUpdate = DeactivateLabelUpdate {
            deactivated_at: Utc::now(),
            deactivated_seqno: seqno,
        };

        let _: Vec<ScopedVaultLabel> = diesel::update(scoped_vault_label::table)
            .filter(scoped_vault_label::scoped_vault_id.eq(&self.scoped_vault_id))
            .filter(scoped_vault_label::deactivated_seqno.is_null())
            .set(update)
            .get_results(conn.conn())?;

        // now insert the new one
        let ev = diesel::insert_into(db_schema::schema::scoped_vault_label::table)
            .values(self)
            .get_result(conn.conn())?;

        Ok(ev)
    }
}
