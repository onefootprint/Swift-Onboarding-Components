use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::samba_order;
use db_schema::schema::samba_report;
use diesel::dsl::not;
use diesel::prelude::*;
use newtypes::samba::SambaOrderKind;
use newtypes::DataLifetimeSeqno;
use newtypes::DocumentId;
use newtypes::SambaOrderTableId;
use newtypes::SambaReportId;
use newtypes::SambaReportTableId;
use newtypes::VerificationResultId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = samba_report)]
pub struct SambaReport {
    pub id: SambaReportTableId,
    pub created_at: DateTime<Utc>,
    pub order_id: SambaOrderTableId,
    pub report_id: SambaReportId,
    pub verification_result_id: VerificationResultId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub completed_seqno: Option<DataLifetimeSeqno>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = samba_report)]
struct NewSambaReportRow {
    created_at: DateTime<Utc>,
    order_id: SambaOrderTableId,
    report_id: SambaReportId,
    verification_result_id: VerificationResultId,
    completed_seqno: DataLifetimeSeqno,
}

impl SambaReport {
    #[tracing::instrument("SambaReport::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        order_id: SambaOrderTableId,
        report_id: SambaReportId,
        verification_result_id: VerificationResultId,
        completed_seqno: DataLifetimeSeqno,
    ) -> DbResult<Self> {
        let new_row = NewSambaReportRow {
            created_at: Utc::now(),
            order_id,
            report_id,
            verification_result_id,
            completed_seqno,
        };

        let res = diesel::insert_into(samba_report::table)
            .values(new_row)
            .get_result(conn.conn())?;

        Ok(res)
    }

    pub fn bulk_get_latest_by_order_kind(
        conn: &mut PgConn,
        document_ids: &[DocumentId],
    ) -> DbResult<HashMap<(DocumentId, SambaOrderKind), Self>> {
        let res = samba_report::table
            .inner_join(samba_order::table)
            .filter(samba_order::document_id.eq_any(document_ids))
            .filter(not(samba_report::completed_seqno.is_null()))
            .select((
                samba_order::document_id,
                samba_order::kind,
                samba_report::all_columns,
            ))
            .order((samba_order::document_id, samba_order::kind, samba_report::completed_seqno.desc()))
            .distinct_on((samba_order::document_id, samba_order::kind)) // just get latest for each (doc, kind)
            .get_results::<(Option<DocumentId>, SambaOrderKind, Self)>(conn)?
            .into_iter()
            .filter_map(|(doc_id, kind, report)| doc_id.map(|d| ((d, kind), report)))
            .collect();

        Ok(res)
    }
}
