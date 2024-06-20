use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::billing_profile;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::BillingProfileId;
use newtypes::TenantId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = billing_profile)]
pub struct BillingProfile {
    pub id: BillingProfileId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub tenant_id: TenantId,

    // WARNING: do NOT re-order these columns
    // All in cents
    pub kyc: Option<String>,
    pub kyb: Option<String>,
    pub pii: Option<String>,
    pub id_docs: Option<String>,
    pub watchlist: Option<String>,
    pub hot_vaults: Option<String>,
    pub hot_proxy_vaults: Option<String>,
    pub vaults_with_non_pci: Option<String>,
    pub vaults_with_pci: Option<String>,
    pub adverse_media_per_user: Option<String>,
    pub continuous_monitoring_per_year: Option<String>,
    pub monthly_minimum: Option<String>,
    pub kyc_waterfall_second_vendor: Option<String>,
    pub kyc_waterfall_third_vendor: Option<String>,
    pub one_click_kyc: Option<String>,
    pub monthly_platform_fee: Option<String>,
    pub curp_verification: Option<String>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = billing_profile)]
pub struct NewBillingProfile<'a> {
    pub tenant_id: &'a TenantId,
}

#[derive(Debug, Clone, AsChangeset, Default)]
#[diesel(table_name = billing_profile)]
pub struct UpdateBillingProfile {
    pub kyc: Option<Option<String>>,
    pub kyb: Option<Option<String>>,
    pub pii: Option<Option<String>>,
    pub id_docs: Option<Option<String>>,
    pub watchlist: Option<Option<String>>,
    pub hot_vaults: Option<Option<String>>,
    pub hot_proxy_vaults: Option<Option<String>>,
    pub vaults_with_non_pci: Option<Option<String>>,
    pub vaults_with_pci: Option<Option<String>>,
    pub adverse_media_per_user: Option<Option<String>>,
    pub continuous_monitoring_per_year: Option<Option<String>>,
    pub monthly_minimum: Option<Option<String>>,
    pub kyc_waterfall_second_vendor: Option<Option<String>>,
    pub kyc_waterfall_third_vendor: Option<Option<String>>,
    pub one_click_kyc: Option<Option<String>>,
    pub monthly_platform_fee: Option<Option<String>>,
    pub curp_verification: Option<Option<String>>,
}

impl BillingProfile {
    pub fn get(conn: &mut PgConn, tenant_id: &TenantId) -> DbResult<Option<Self>> {
        let result = billing_profile::table
            .filter(billing_profile::tenant_id.eq(tenant_id))
            .get_result::<Self>(conn)
            .optional()?;
        Ok(result)
    }

    pub fn update_or_create(
        conn: &mut TxnPgConn,
        tenant_id: &TenantId,
        update: UpdateBillingProfile,
    ) -> DbResult<Self> {
        let existing = billing_profile::table
            .filter(billing_profile::tenant_id.eq(tenant_id))
            .for_no_key_update()
            .get_result::<Self>(conn.conn())
            .optional()?;
        if existing.is_none() {
            let new = NewBillingProfile { tenant_id };
            diesel::insert_into(billing_profile::table)
                .values(new)
                .execute(conn.conn())?;
        }
        let result = diesel::update(billing_profile::table)
            .filter(billing_profile::tenant_id.eq(tenant_id))
            .set(update)
            .get_result::<Self>(conn.conn())?;
        Ok(result)
    }
}

#[cfg(test)]
mod test {
    use crate::models::billing_profile::BillingProfile;
    use crate::models::billing_profile::UpdateBillingProfile;
    use crate::tests::prelude::TestPgConn;
    use crate::tests::prelude::*;
    use macros::db_test;
    use newtypes::TenantId;

    #[db_test]
    fn test_billing_profile(conn: &mut TestPgConn) {
        let tenant_id = TenantId::test_data("org_flerp".into());
        let update = UpdateBillingProfile {
            kyc: Some(Some("50".into())),
            kyb: Some(Some("700".into())),
            pii: Some(Some("3".into())),
            ..Default::default()
        };
        BillingProfile::update_or_create(conn, &tenant_id, update).unwrap();
        let update = UpdateBillingProfile {
            // Should clear kyc
            kyc: Some(None),
            // Should leave kyb untouched
            kyb: None,
            // And should update pii
            pii: Some(Some("5".into())),
            ..Default::default()
        };
        let bp = BillingProfile::update_or_create(conn, &tenant_id, update).unwrap();
        assert!(bp.kyc.is_none());
        assert_eq!(bp.kyb, Some("700".into()));
        assert_eq!(bp.pii, Some("5".into()));
    }
}
