use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::incode_customer_session;
use diesel::prelude::*;
use newtypes::{
    IncodeCustomerId, IncodeCustomerSessionId, IncodeVerificationSessionId, ScopedVaultId, TenantId,
};

#[derive(Debug, Clone, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = incode_customer_session)]
pub struct IncodeCustomerSession {
    pub id: IncodeCustomerSessionId,
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub tenant_id: TenantId,
    pub incode_verification_session_id: IncodeVerificationSessionId,
    pub incode_customer_id: IncodeCustomerId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = incode_customer_session)]
struct NewIncodeCustomerSession {
    created_at: DateTime<Utc>,
    scoped_vault_id: ScopedVaultId,
    tenant_id: TenantId,
    incode_verification_session_id: IncodeVerificationSessionId,
    incode_customer_id: IncodeCustomerId,
}

impl IncodeCustomerSession {
    pub fn create(
        conn: &mut TxnPgConn,
        scoped_vault_id: ScopedVaultId,
        tenant_id: TenantId,
        incode_verification_session_id: IncodeVerificationSessionId,
        incode_customer_id: IncodeCustomerId,
    ) -> DbResult<Self> {
        let new = NewIncodeCustomerSession {
            created_at: Utc::now(),
            scoped_vault_id,
            tenant_id,
            incode_verification_session_id,
            incode_customer_id,
        };

        let res: IncodeCustomerSession = diesel::insert_into(incode_customer_session::table)
            .values(new)
            .get_result(conn.conn())?;

        Ok(res)
    }
}
