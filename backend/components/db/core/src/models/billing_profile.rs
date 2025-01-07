use crate::NonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::billing_profile;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::BillingMinimum;
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
    pub billing_email: Option<String>,
    pub omit_billing: bool,
    pub send_automatically: bool,
    #[diesel(deserialize_as = NonNullVec<BillingMinimum>)]
    pub minimums: Vec<BillingMinimum>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = billing_profile)]
pub struct NewBillingProfile<'a> {
    pub tenant_id: &'a TenantId,
}

impl BillingProfile {
    pub fn get(conn: &mut PgConn, tenant_id: &TenantId) -> FpResult<Option<Self>> {
        let result = billing_profile::table
            .filter(billing_profile::tenant_id.eq(tenant_id))
            .get_result::<Self>(conn)
            .optional()?;
        Ok(result)
    }

    pub fn update_or_create(
        conn: &mut TxnPgConn,
        tenant_id: &TenantId,
        args: UpdateBillingProfileArgs,
    ) -> FpResult<Self> {
        // Create a new BillingProfile row if one doesn't exist
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

        let UpdateBillingProfileArgs {
            prices,
            billing_email,
            omit_billing,
            send_automatically,
        } = args;

        let mut new_prices = existing.prices;
        prices
            .unwrap_or_default()
            .into_iter()
            .for_each(|(product, value)| match value {
                Some(Some(v)) => {
                    new_prices.insert(product, v);
                }
                Some(None) => {
                    new_prices.remove(&product);
                }
                None => (),
            });

        let update = UpdateBillingProfileRow {
            prices: Some(new_prices),
            billing_email,
            omit_billing,
            send_automatically,
        };

        // Apply onto existing prices
        let result = diesel::update(billing_profile::table)
            .filter(billing_profile::tenant_id.eq(tenant_id))
            .set(update)
            .get_result::<Self>(conn.conn())?;
        Ok(result)
    }
}

#[derive(Debug, Clone, AsChangeset, Default)]
#[diesel(table_name = billing_profile)]
struct UpdateBillingProfileRow {
    prices: Option<PriceMap>,
    billing_email: Option<Option<String>>,
    omit_billing: Option<bool>,
    send_automatically: Option<bool>,
}

#[derive(Debug, Clone, Default)]
pub struct UpdateBillingProfileArgs {
    pub prices: Option<HashMap<Product, Option<Option<String>>>>,
    pub billing_email: Option<Option<String>>,
    pub omit_billing: Option<bool>,
    pub send_automatically: Option<bool>,
}

#[cfg(test)]
mod test {
    use crate::models::billing_profile::BillingProfile;
    use crate::models::billing_profile::UpdateBillingProfileArgs;
    use crate::tests::prelude::TestPgConn;
    use crate::tests::prelude::*;
    use macros::db_test;
    use newtypes::Product;
    use newtypes::TenantId;
    use std::collections::HashMap;

    #[db_test]
    fn test_billing_profile(conn: &mut TestPgConn) {
        let tenant_id = TenantId::test_data("org_flerp".into());
        let prices = HashMap::from_iter([
            (Product::Kyc, Some(Some("50".into()))),
            (Product::Kyb, Some(Some("700".into()))),
            (Product::KybEinOnly, Some(Some("100".into()))),
            (Product::Pii, Some(Some("3".into()))),
        ]);
        let update = UpdateBillingProfileArgs {
            prices: Some(prices),
            ..Default::default()
        };
        BillingProfile::update_or_create(conn, &tenant_id, update).unwrap();

        let prices = HashMap::from_iter([
            // Should clear kyc
            (Product::Kyc, Some(None)),
            // Should leave kyb untouched, and KybEinOnly because omitted
            (Product::Kyb, None),
            // And should update pii
            (Product::Pii, Some(Some("5".into()))),
        ]);
        let update = UpdateBillingProfileArgs {
            prices: Some(prices),
            ..Default::default()
        };
        let bp = BillingProfile::update_or_create(conn, &tenant_id, update).unwrap();
        assert!(bp.prices.get(&Product::Kyc).is_none());
        assert_eq!(bp.prices.get(&Product::Kyb).unwrap(), "700");
        assert_eq!(bp.prices.get(&Product::KybEinOnly).unwrap(), "100");
        assert_eq!(bp.prices.get(&Product::Pii).unwrap(), "5");
    }
}
