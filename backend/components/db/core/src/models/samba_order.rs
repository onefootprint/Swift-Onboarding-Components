use super::data_lifetime::DataLifetime;
use super::samba_order_data_lifetime_junction::SambaOrderDataLifetimeJunction;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::samba_order;
use diesel::prelude::*;
use newtypes::samba::SambaOrderKind;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSeqno;
use newtypes::DecisionIntentId;
use newtypes::DocumentId;
use newtypes::Locked;
use newtypes::SambaOrderId;
use newtypes::SambaOrderTableId;
use newtypes::VerificationResultId;

/// Represents a single order placed with Samba
#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = samba_order)]
pub struct SambaOrder {
    pub id: SambaOrderTableId,
    pub decision_intent_id: DecisionIntentId,
    pub document_id: Option<DocumentId>,
    pub kind: SambaOrderKind, // TODO: enumify
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub completed_at: Option<DateTime<Utc>>,
    pub order_id: SambaOrderId,
    pub verification_result_id: VerificationResultId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = samba_order)]
pub struct UpdateSambaOrder {
    completed_at: Option<DateTime<Utc>>,
}
impl UpdateSambaOrder {
    pub fn set_completed_at() -> Self {
        UpdateSambaOrder {
            completed_at: Some(Utc::now()),
        }
    }
}

#[derive(Debug, Clone)]
pub struct NewSambaOrderArgs {
    pub decision_intent_id: DecisionIntentId,
    pub document_id: Option<DocumentId>,
    pub lifetime_ids: Vec<DataLifetimeId>,
    pub kind: SambaOrderKind,
    pub order_id: SambaOrderId,
    pub verification_result_id: VerificationResultId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = samba_order)]
struct NewSambaOrderRow {
    decision_intent_id: DecisionIntentId,
    document_id: Option<DocumentId>,
    kind: SambaOrderKind,
    created_at: DateTime<Utc>,
    order_id: SambaOrderId,
    verification_result_id: VerificationResultId,
    created_seqno: DataLifetimeSeqno,
}

impl SambaOrder {
    #[tracing::instrument("SambaOrder::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewSambaOrderArgs) -> FpResult<Self> {
        let NewSambaOrderArgs {
            decision_intent_id,
            document_id,
            lifetime_ids,
            kind,
            order_id,
            verification_result_id,
        } = args;
        let created_seqno = DataLifetime::get_current_seqno(conn)?;
        let new_row = NewSambaOrderRow {
            created_at: Utc::now(),
            decision_intent_id,
            document_id,
            created_seqno,
            kind,
            order_id,
            verification_result_id,
        };

        let res: SambaOrder = diesel::insert_into(samba_order::table)
            .values(new_row)
            .get_result(conn.conn())?;

        // create junction table rows
        let _ = SambaOrderDataLifetimeJunction::bulk_create(conn, lifetime_ids, res.id.clone())?;

        Ok(res)
    }

    #[tracing::instrument("SambaOrder::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &SambaOrderTableId) -> FpResult<Locked<Self>> {
        let result = samba_order::table
            .filter(samba_order::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("SambaOrder::update", skip(conn, update))]
    pub fn update(conn: &mut TxnPgConn, locked: Locked<Self>, update: UpdateSambaOrder) -> FpResult<Self> {
        let res = diesel::update(samba_order::table)
            .filter(samba_order::id.eq(&locked.id))
            .set(update)
            .get_result(conn.conn())?;

        Ok(res)
    }

    #[tracing::instrument("SambaOrder::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &SambaOrderId) -> FpResult<Self> {
        let result = samba_order::table
            .filter(samba_order::order_id.eq(id))
            .get_result(conn)?;
        Ok(result)
    }
}
