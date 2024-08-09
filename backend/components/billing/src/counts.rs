use crate::interval::BillingInterval;
use crate::profile::BillingProfile;
use crate::BResult;
use crate::Error;
use db::models::access_event::AccessEvent;
use db::models::billing_event::BillingEvent;
use db::models::billing_profile::BillingProfile as DbBillingProfile;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultPiiFilters;
use db::models::watchlist_check::WatchlistCheck;
use db::DbResult;
use db::PgConn;
use itertools::chain;
use newtypes::DecryptionContext;
use newtypes::Product;
use newtypes::TenantId;
use rust_decimal::prelude::FromPrimitive;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use std::collections::HashMap;
use std::ops::Add;
use strum::IntoEnumIterator;

#[derive(Debug, Default)]
pub struct BillingCounts(HashMap<Product, i64>);

#[derive(Debug)]
pub(crate) struct LineItem {
    pub product: Product,
    pub price: LineItemPrice,
    pub count: i64,
}

impl LineItem {
    pub fn notional(&self) -> Option<Decimal> {
        let LineItemPrice::Price(price_cents) = &self.price else {
            return None;
        };
        let count = Decimal::from_i64(self.count)?;
        let notional = price_cents * count;
        Some(notional)
    }
}

#[derive(Debug, derive_more::From)]
pub enum LineItemPrice {
    Price(Decimal),
    /// The tenant doesn't have a price listed for this product.
    Uncontracted,
}

impl BillingCounts {
    fn get_count(&self, product: Product) -> i64 {
        if matches!(product, Product::MonthlyPlatformFee) {
            // Platform fee always has quantity 1
            return 1;
        }
        self.0.get(&product).cloned().unwrap_or_default()
    }

    fn raw_line_items(&self) -> Vec<(Product, i64)> {
        Product::iter().map(|p| (p, self.get_count(p))).collect()
    }

    pub(crate) fn line_items(
        &self,
        tenant_id: &TenantId,
        profile: &BillingProfile,
    ) -> BResult<Vec<LineItem>> {
        let tenant_has = |p: Product| profile.get(&p).is_some();
        if tenant_has(Product::ContinuousMonitoringPerYear) && tenant_has(Product::WatchlistChecks) {
            return Err(Error::ValidationError(
                "Tenant can't have both WatchlistChecks and ContinuousMonitoringPerYear".into(),
            ));
        }

        let results = self
            .raw_line_items()
            .into_iter()
            .filter(|(p, _)| match p {
                Product::MonthlyPlatformFee => tenant_has(Product::MonthlyPlatformFee),
                // This is weird - there are two different products for effecitvely the same thing:
                // watchlist checks billed per instance vs billed per user per year.
                // If the tenant has pricing set up for one of those products, don't bill for the
                // other. We assert that a tenant can't have both prices.
                Product::WatchlistChecks => !tenant_has(Product::ContinuousMonitoringPerYear),
                Product::ContinuousMonitoringPerYear => !tenant_has(Product::WatchlistChecks),
                _ => true,
            })
            .filter(|(_, count)| count > &0)
            // Filter out line items that have a price of 0c explicitly in the billing profile
            .filter(|(product, _)| !profile.get(product).is_some_and(|p| *p == dec!(0)))
            .map(|(product, count)| -> BResult<_> {
                let price = if let Some(price_cents) = profile.get(&product) {
                    // If the BillingProfile for this tenant has a price set for the product, use it
                    LineItemPrice::Price(*price_cents)
                } else {
                    // If there is no price set up for this tenant but they have used the product,
                    // error by adding a line item to the invoice that shows the uncontracted price.
                    // These require manual human action, but we don't want to prevent invoice generation
                    tracing::error!(tenant_id=%tenant_id, product=%product, "Billing line item is uncontracted");
                    LineItemPrice::Uncontracted
                };
                Ok(LineItem { product, price, count })
            })
            .collect::<BResult<Vec<_>>>()?;

        // For some legacy tenants, apply "minimum of" clauses. We'll be phasing these out in the future.
        let results = apply_minimum_of(tenant_id, results);

        Ok(results)
    }

    pub fn build_for_tenant(
        conn: &mut PgConn,
        t_id: &TenantId,
        bp: Option<&DbBillingProfile>,
        i: &BillingInterval,
    ) -> DbResult<Self> {
        // Fetch counts for most products regardless of whether the tenant is set up with
        // billing for them. We will error if any of these products have use when they haven't
        // been contracted
        let pii =
            ScopedVault::count_billable_for_vault_storage(conn, t_id, i.end, ScopedVaultPiiFilters::None)?;
        let watchlist_checks = WatchlistCheck::get_billable_count(conn, t_id, i.start, i.end)?;

        // These billing schemes are only used by some tenants, so only count them conditionally
        let hot_vaults = if bp.and_then(|p| p.prices.get(&Product::HotVaults)).is_some() {
            let p = DecryptionContext::iter().collect(); // Any access is billable
            Some(AccessEvent::count_hot_vaults(conn, t_id, i.start, i.end, p)?)
        } else {
            None
        };
        let hot_proxy_vaults = if bp.and_then(|p| p.prices.get(&Product::HotProxyVaults)).is_some() {
            let p = vec![DecryptionContext::VaultProxy];
            Some(AccessEvent::count_hot_vaults(conn, t_id, i.start, i.end, p)?)
        } else {
            None
        };
        let vaults_with_non_pci = if bp
            .and_then(|p| p.prices.get(&Product::VaultsWithNonPci))
            .is_some()
        {
            let filter = ScopedVaultPiiFilters::NonPci;
            Some(ScopedVault::count_billable_for_vault_storage(
                conn, t_id, i.end, filter,
            )?)
        } else {
            None
        };
        let vaults_with_pci = if bp.and_then(|p| p.prices.get(&Product::VaultsWithPci)).is_some() {
            let filter = ScopedVaultPiiFilters::PciOrCustom;
            Some(ScopedVault::count_billable_for_vault_storage(
                conn, t_id, i.end, filter,
            )?)
        } else {
            None
        };

        // More modern-style BillingEvents - maybe we'll move some of these discrete events to
        // the BillingEvent model so it becomes easier to count at read time
        let billing_event_counts = BillingEvent::get_counts(conn, t_id, i.start, i.end)?;

        let counts = chain!(
            vec![
                (Product::Pii, pii),
                (Product::WatchlistChecks, watchlist_checks),
                (Product::HotVaults, hot_vaults.unwrap_or_default()),
                (Product::HotProxyVaults, hot_proxy_vaults.unwrap_or_default()),
                (Product::VaultsWithNonPci, vaults_with_non_pci.unwrap_or_default()),
                (Product::VaultsWithPci, vaults_with_pci.unwrap_or_default()),
            ],
            billing_event_counts.into_iter().map(|(k, c)| (k.into(), c)),
        )
        .collect();
        Ok(Self(counts))
    }
}

impl Add for BillingCounts {
    type Output = BillingCounts;

    fn add(self, b: BillingCounts) -> BillingCounts {
        let a = self;
        let counts = Product::iter()
            .map(|p| (p, a.get_count(p) + b.get_count(p)))
            .collect();
        BillingCounts(counts)
    }
}

/// For a few legacy tenants, applies the "minimum of(x, y)" clauses.
fn apply_minimum_of(tenant_id: &TenantId, line_items: Vec<LineItem>) -> Vec<LineItem> {
    let minimums_product_bundles = match tenant_id.as_str() {
        TenantId::ARYEO => vec![
            vec![
                Product::VaultsWithNonPci,
                Product::VaultsWithPci,
                Product::HotProxyVaults,
            ],
            vec![Product::HotVaults],
        ],
        TenantId::BLOOM => vec![vec![Product::HotVaults], vec![Product::VaultsWithNonPci]],
        _ => return line_items,
    };
    // Sum up the notionals of each line item for the bundles of products in the minimum clause
    let products_with_notionals = minimums_product_bundles.into_iter().map(|products| {
        let sum_for_products: Decimal = products
            .iter()
            .flat_map(|p| line_items.iter().find(|li| &li.product == p))
            .flat_map(|li| li.notional())
            .sum();
        tracing::info!(?products, notional=%sum_for_products, "Applying minimum of");
        (products, sum_for_products)
    });
    // Then, remove the products from the bundle whose sum is the greatest
    let products_to_remove = products_with_notionals
        .max_by_key(|(_, notional)| *notional)
        .map(|(p, _)| p)
        .unwrap_or_default();
    line_items
        .into_iter()
        .map(|mut li| {
            if products_to_remove.contains(&li.product) {
                tracing::info!(product=%li.product, count=%li.count, notional=?li.notional(), "Removing line item from invoice for minimum of clause");
                li.price = LineItemPrice::Price(dec!(0));
            }
            li
        })
        .collect()
}

#[cfg(test)]
mod test {
    use super::apply_minimum_of;
    use super::LineItem;
    use super::LineItemPrice;
    use db::test_helpers::assert_have_same_elements;
    use itertools::Itertools;
    use newtypes::Product;
    use newtypes::TenantId;
    use rust_decimal_macros::dec;
    use std::str::FromStr;

    #[test]
    fn test_minimum_of() {
        let li = |product, price, count| LineItem {
            product,
            price: LineItemPrice::Price(price),
            count,
        };
        let nonzero_items = |lis: Vec<LineItem>| {
            lis.iter()
                .filter(|li| match &li.price {
                    LineItemPrice::Price(price) => *price > dec!(0),
                    LineItemPrice::Uncontracted => false,
                })
                .map(|li| li.product)
                .collect_vec()
        };

        // Should filter out HotVaults
        let line_items = vec![
            li(Product::Kyc, dec!(3), 10), // Unrelated line item, should always be preserved
            li(Product::HotVaults, dec!(15), 10), // 150c
            li(Product::VaultsWithNonPci, dec!(3), 20), // 60c
            li(Product::VaultsWithPci, dec!(3), 20), // 60c
        ];
        let tenant_id = TenantId::from_str(TenantId::ARYEO).unwrap();
        let line_items = apply_minimum_of(&tenant_id, line_items);
        assert_have_same_elements(
            nonzero_items(line_items),
            vec![Product::Kyc, Product::VaultsWithNonPci, Product::VaultsWithPci],
        );

        // Should filter out NonPci + Pci
        let line_items = vec![
            li(Product::Kyc, dec!(3), 10), // Unrelated line item, should always be preserved
            li(Product::HotVaults, dec!(10), 10), // 100c
            li(Product::VaultsWithNonPci, dec!(3), 20), // 60c
            li(Product::VaultsWithPci, dec!(3), 20), // 60c
        ];
        let tenant_id = TenantId::from_str(TenantId::ARYEO).unwrap();
        let line_items = apply_minimum_of(&tenant_id, line_items);
        assert_have_same_elements(nonzero_items(line_items), vec![Product::Kyc, Product::HotVaults]);

        // No minimum of for other tenants
        let line_items = vec![
            li(Product::Kyc, dec!(3), 10), // Unrelated line item, should always be preserved
            li(Product::HotVaults, dec!(10), 10), // 100c
            li(Product::VaultsWithNonPci, dec!(3), 20), // 60c
            li(Product::VaultsWithPci, dec!(3), 20), // 60c
        ];
        let tenant_id = TenantId::from_str("flerp").unwrap();
        let line_items = apply_minimum_of(&tenant_id, line_items);
        assert_have_same_elements(
            nonzero_items(line_items),
            vec![
                Product::Kyc,
                Product::HotVaults,
                Product::VaultsWithNonPci,
                Product::VaultsWithPci,
            ],
        );
    }
}
