use crate::{
    DbResult,
    TxnPgConn,
};
use chrono::{
    DateTime,
    Utc,
};
use db_schema::schema::samba_report;
use diesel::prelude::*;
use newtypes::{
    SambaOrderTableId,
    SambaReportId,
    SambaReportTableId,
    VerificationResultId,
};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = samba_report)]
pub struct SambaReport {
    pub id: SambaReportTableId,
    pub created_at: DateTime<Utc>,
    pub order_id: SambaOrderTableId,
    pub report_id: SambaReportId,
    pub verification_result_id: VerificationResultId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = samba_report)]
struct NewSambaReportRow {
    created_at: DateTime<Utc>,
    order_id: SambaOrderTableId,
    report_id: SambaReportId,
    verification_result_id: VerificationResultId,
}

impl SambaReport {
    #[tracing::instrument("SambaReport::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        order_id: SambaOrderTableId,
        report_id: SambaReportId,
        verification_result_id: VerificationResultId,
    ) -> DbResult<Self> {
        let new_row = NewSambaReportRow {
            created_at: Utc::now(),
            order_id,
            report_id,
            verification_result_id,
        };

        let res = diesel::insert_into(samba_report::table)
            .values(new_row)
            .get_result(conn.conn())?;

        Ok(res)
    }
}
