use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::billing_profile;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::BillingProfileId;
use newtypes::PriceMap;
use newtypes::Product;
use newtypes::TenantId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = billing_profile)]
pub struct BillingProfile {
    pub id: BillingProfileId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub prices: PriceMap,
}


#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = billing_profile)]
pub struct NewBillingProfile<'a> {
    pub tenant_id: &'a TenantId,
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
        let existing = if let Some(existing) = existing {
            existing
        } else {
            let new = NewBillingProfile { tenant_id };
            diesel::insert_into(billing_profile::table)
                .values(new)
                .get_result::<Self>(conn.conn())?
        };
        let mut new_prices = existing.prices;
        update.into_iter().for_each(|(product, value)| match value {
            Some(Some(v)) => {
                new_prices.insert(product, v);
            }
            Some(None) => {
                new_prices.remove(&product);
            }
            None => (),
        });
        // Apply onto existing prices
        let result = diesel::update(billing_profile::table)
            .filter(billing_profile::tenant_id.eq(tenant_id))
            .set(billing_profile::prices.eq(new_prices))
            .get_result::<Self>(conn.conn())?;
        Ok(result)
    }
}

pub type UpdateBillingProfile = HashMap<Product, Option<Option<String>>>;

#[cfg(test)]
mod test {
    use crate::models::billing_profile::BillingProfile;
    use crate::tests::prelude::TestPgConn;
    use crate::tests::prelude::*;
    use macros::db_test;
    use newtypes::Product;
    use newtypes::TenantId;
    use std::collections::HashMap;

    #[db_test]
    fn test_billing_profile(conn: &mut TestPgConn) {
        let tenant_id = TenantId::test_data("org_flerp".into());
        let update = HashMap::from_iter([
            (Product::Kyc, Some(Some("50".into()))),
            (Product::Kyb, Some(Some("700".into()))),
            (Product::KybEinOnly, Some(Some("100".into()))),
            (Product::Pii, Some(Some("3".into()))),
        ]);
        BillingProfile::update_or_create(conn, &tenant_id, update).unwrap();
        let update = HashMap::from_iter([
            // Should clear kyc
            (Product::Kyc, Some(None)),
            // Should leave kyb untouched, and KybEinOnly because omitted
            (Product::Kyb, None),
            // And should update pii
            (Product::Pii, Some(Some("5".into()))),
        ]);
        let bp = BillingProfile::update_or_create(conn, &tenant_id, update).unwrap();
        assert!(bp.prices.get(&Product::Kyc).is_none());
        assert_eq!(bp.prices.get(&Product::Kyb).unwrap(), "700");
        assert_eq!(bp.prices.get(&Product::KybEinOnly).unwrap(), "100");
        assert_eq!(bp.prices.get(&Product::Pii).unwrap(), "5");
    }
}
