use super::data_lifetime::DataLifetime;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant_business_info;
use diesel::ExpressionMethods;
use diesel::Insertable;
use diesel::OptionalExtension;
use diesel::QueryDsl;
use diesel::Queryable;
use diesel::RunQueryDsl;
use newtypes::DataLifetimeSeqno;
use newtypes::SealedVaultBytes;
use newtypes::TenantBusinessInfoId;
use newtypes::TenantId;

#[derive(Debug, Clone, Queryable, PartialEq, Eq)]
#[diesel(table_name = tenant_business_info)]
pub struct TenantBusinessInfo {
    pub id: TenantBusinessInfoId,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,
    pub tenant_id: TenantId,
    pub company_name: SealedVaultBytes,
    pub address_line1: SealedVaultBytes,
    pub city: SealedVaultBytes,
    pub state: SealedVaultBytes,
    pub zip: SealedVaultBytes,
    pub phone: SealedVaultBytes,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_business_info)]
struct NewTenantBusinessInfo {
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub tenant_id: TenantId,
    pub company_name: SealedVaultBytes,
    pub address_line1: SealedVaultBytes,
    pub city: SealedVaultBytes,
    pub state: SealedVaultBytes,
    pub zip: SealedVaultBytes,
    pub phone: SealedVaultBytes,
}

pub struct NewBusinessInfo {
    pub company_name: SealedVaultBytes,
    pub address_line1: SealedVaultBytes,
    pub city: SealedVaultBytes,
    pub state: SealedVaultBytes,
    pub zip: SealedVaultBytes,
    pub phone: SealedVaultBytes,
}

impl TenantBusinessInfo {
    #[tracing::instrument("TenantBusinessInfo::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        tenant_id: &TenantId,
        new_business_info: NewBusinessInfo,
    ) -> FpResult<Self> {
        let NewBusinessInfo {
            company_name,
            address_line1,
            city,
            state,
            zip,
            phone,
        } = new_business_info;

        let now = Utc::now();
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let new = NewTenantBusinessInfo {
            created_at: now,
            created_seqno: seqno,
            tenant_id: tenant_id.clone(),
            company_name,
            address_line1,
            city,
            state,
            zip,
            phone,
        };
        diesel::update(tenant_business_info::table)
            .filter(tenant_business_info::tenant_id.eq(tenant_id))
            .filter(tenant_business_info::deactivated_at.is_null())
            .set((
                tenant_business_info::deactivated_at.eq(now),
                tenant_business_info::deactivated_seqno.eq(seqno),
            ))
            .execute(conn.conn())?;

        let res = diesel::insert_into(tenant_business_info::table)
            .values(new)
            .get_result(conn.conn())?;

        Ok(res)
    }

    #[tracing::instrument("TenantBusinessInfo::get", skip_all)]
    pub fn get(conn: &mut PgConn, tenant_id: &TenantId) -> FpResult<Option<Self>> {
        let res = tenant_business_info::table
            .filter(tenant_business_info::tenant_id.eq(tenant_id))
            .filter(tenant_business_info::deactivated_at.is_null())
            .get_result(conn)
            .optional()?;

        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::prelude::*;
    use macros::db_test;

    #[db_test]
    fn test_create(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);

        let new_tbi = TenantBusinessInfo::create(
            conn,
            &t.id,
            NewBusinessInfo {
                company_name: SealedVaultBytes(vec![1]),
                address_line1: SealedVaultBytes(vec![1]),
                city: SealedVaultBytes(vec![1]),
                state: SealedVaultBytes(vec![1]),
                zip: SealedVaultBytes(vec![1]),
                phone: SealedVaultBytes(vec![1]),
            },
        )
        .unwrap();

        let tbi = TenantBusinessInfo::get(conn, &t.id).unwrap().unwrap();
        assert_eq!(new_tbi.id, tbi.id);
        assert_eq!(SealedVaultBytes(vec![1]), tbi.company_name);

        let new_tbi2 = TenantBusinessInfo::create(
            conn,
            &t.id,
            NewBusinessInfo {
                company_name: SealedVaultBytes(vec![2]),
                address_line1: SealedVaultBytes(vec![2]),
                city: SealedVaultBytes(vec![2]),
                state: SealedVaultBytes(vec![2]),
                zip: SealedVaultBytes(vec![2]),
                phone: SealedVaultBytes(vec![2]),
            },
        )
        .unwrap();

        let tbi = TenantBusinessInfo::get(conn, &t.id).unwrap().unwrap();
        assert_eq!(new_tbi2.id, tbi.id);
        assert_eq!(SealedVaultBytes(vec![2]), tbi.company_name);
    }
}
