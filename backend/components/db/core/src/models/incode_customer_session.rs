use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::incode_customer_session;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::{
    DupeKind, IncodeCustomerId, IncodeCustomerSessionId, IncodeVerificationSessionId, ScopedVaultId, TenantId,
};

use super::scoped_vault::ScopedVault;

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
    #[tracing::instrument("IncodeCustomerSession::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
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
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument("IncodeCustomerSession::list", skip_all)]
    pub fn list<'a, T: Into<IncodeCustomerSessionIdentifier<'a>>>(
        conn: &mut PgConn,
        id: T,
    ) -> DbResult<Vec<Self>> {
        let res = match id.into() {
            IncodeCustomerSessionIdentifier::ScopedVaultId { id } => incode_customer_session::table
                .filter(incode_customer_session::scoped_vault_id.eq(id))
                .get_results(conn)?,
            IncodeCustomerSessionIdentifier::ScopedVaultIdAndSession { id, session } => {
                incode_customer_session::table
                    .filter(incode_customer_session::scoped_vault_id.eq(id))
                    .filter(incode_customer_session::incode_verification_session_id.eq(session))
                    .get_results(conn)?
            }
        };

        Ok(res)
    }
}

pub struct IncodeSelfieDupesResult {
    pub internal: Vec<(DupeKind, ScopedVaultId)>,
}

impl IncodeCustomerSession {
    #[tracing::instrument("IncodeCustomerSession::get_dupes_for_tenant", skip_all)]
    pub fn get_dupes_for_tenant(conn: &mut PgConn, sv: &ScopedVault) -> DbResult<IncodeSelfieDupesResult> {
        let customer_ids: Vec<IncodeCustomerId> = Self::list(conn, &sv.id)?
            .into_iter()
            .map(|s| s.incode_customer_id)
            .unique()
            .collect();

        let matches = incode_customer_session::table
            .filter(incode_customer_session::tenant_id.eq(&sv.tenant_id))
            .filter(
                incode_customer_session::incode_customer_id
                    .eq_any(customer_ids)
            )
            .filter(incode_customer_session::scoped_vault_id.ne(&sv.id))
            .select(incode_customer_session::scoped_vault_id)
            .get_results(conn)?
            .into_iter()
            .unique() // need this because other sv could go through multiple wfs with same selfie
            .map(|sv| (DupeKind::Selfie, sv))
            .collect();

        Ok(IncodeSelfieDupesResult { internal: matches })
    }
}

#[derive(derive_more::From)]
pub enum IncodeCustomerSessionIdentifier<'a> {
    ScopedVaultId {
        id: &'a ScopedVaultId,
    },
    ScopedVaultIdAndSession {
        id: &'a ScopedVaultId,
        session: &'a IncodeVerificationSessionId,
    },
}
