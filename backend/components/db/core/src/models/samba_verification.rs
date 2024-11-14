use super::data_lifetime::DataLifetime;
use super::samba_verification_data_lifetime_junction::SambaVerificationDataLifetimeJunction;
use api_errors::FpResult;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::samba_verification;
use diesel::prelude::*;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSeqno;
use newtypes::DecisionIntentId;
use newtypes::DocumentId;
use newtypes::Locked;
use newtypes::SambaVerificationId;
#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = samba_verification)]
pub struct SambaVerification {
    pub id: SambaVerificationId,
    pub decision_intent_id: DecisionIntentId,
    pub document_id: Option<DocumentId>,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub completed_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = samba_verification)]
struct NewSambaVerificationRow {
    decision_intent_id: DecisionIntentId,
    document_id: Option<DocumentId>,
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
}

#[derive(Debug, Clone)]
pub struct NewSambaVerificationArgs {
    pub decision_intent_id: DecisionIntentId,
    pub document_id: Option<DocumentId>,
    pub lifetime_ids: Vec<DataLifetimeId>,
}

impl SambaVerification {
    #[tracing::instrument("SambaVerification::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewSambaVerificationArgs) -> FpResult<Self> {
        let NewSambaVerificationArgs {
            decision_intent_id,
            document_id,
            lifetime_ids,
        } = args;
        let created_seqno = DataLifetime::get_current_seqno(conn)?;
        let new_row = NewSambaVerificationRow {
            decision_intent_id,
            document_id,
            created_at: Utc::now(),
            created_seqno,
        };

        let res: SambaVerification = diesel::insert_into(samba_verification::table)
            .values(new_row)
            .get_result(conn.conn())?;

        // create junction table rows
        let _ = SambaVerificationDataLifetimeJunction::bulk_create(conn, lifetime_ids, res.id.clone())?;


        Ok(res)
    }

    #[tracing::instrument("SambaVerification::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &SambaVerificationId) -> FpResult<Locked<Self>> {
        let result = samba_verification::table
            .filter(samba_verification::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("SambaVerification::get", skip_all)]
    pub fn get(conn: &mut TxnPgConn, id: &SambaVerificationId) -> FpResult<Self> {
        let result = samba_verification::table
            .filter(samba_verification::id.eq(id))
            .get_result(conn.conn())?;
        Ok(result)
    }
}
