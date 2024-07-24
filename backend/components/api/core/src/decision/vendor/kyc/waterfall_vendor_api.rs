use crate::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::FpResult;
use crate::State;
use db::models::verification_request::VReqIdentifier;
use newtypes::vendor_api_struct::ExperianPreciseId;
use newtypes::vendor_api_struct::IdologyExpectId;
use newtypes::vendor_api_struct::LexisFlexId;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::VendorAPI;
use strum::EnumIter;
use strum::IntoEnumIterator;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, EnumIter, Copy)]
// For now, we just have 1 singular KYC waterfall ordering for all vendors.
// we only make vendor calls that are available to the tenant as dictated by enabled vendors on
// TenantVendorControl (with no TVC, we default to Ido)
pub enum WaterfallVendorAPI {
    Lexis,
    Experian,
    Idology,
}

impl WaterfallVendorAPI {
    pub async fn get_vendor_result(
        order: Self,
        state: &State,
        id: VReqIdentifier,
        user_vault_private_key: &EncryptedVaultPrivateKey,
    ) -> FpResult<Option<VendorResult>> {
        let res = match order {
            WaterfallVendorAPI::Experian => {
                load_response_for_vendor_api(state, id, user_vault_private_key, ExperianPreciseId)
                    .await?
                    .into_vendor_result()
            }
            WaterfallVendorAPI::Idology => {
                load_response_for_vendor_api(state, id, user_vault_private_key, IdologyExpectId)
                    .await?
                    .into_vendor_result()
            }
            WaterfallVendorAPI::Lexis => {
                load_response_for_vendor_api(state, id, user_vault_private_key, LexisFlexId)
                    .await?
                    .into_vendor_result()
            }
        };

        Ok(res)
    }

    pub async fn get_all_vendor_results(
        state: &State,
        id: VReqIdentifier,
        user_vault_private_key: &EncryptedVaultPrivateKey,
    ) -> FpResult<Vec<VendorResult>> {
        let futs =
            Self::iter().map(|v| Self::get_vendor_result(v, state, id.clone(), user_vault_private_key));

        let res = futures::future::join_all(futs)
            .await
            .into_iter()
            .collect::<FpResult<Vec<Option<VendorResult>>>>()?
            .into_iter()
            .flatten()
            .collect();

        Ok(res)
    }

    // assumes we have a static ordering, which may not be the case. in future we'll define these
    // somewhere tenant-specific perhaps
    pub fn ordered_apis(available_apis: Vec<VendorAPI>) -> Vec<Self> {
        Self::iter()
            .filter(|v| {
                let vendor_api = (*v).into();
                available_apis.contains(&vendor_api)
            })
            .collect()
    }
}

impl From<WaterfallVendorAPI> for VendorAPI {
    fn from(value: WaterfallVendorAPI) -> Self {
        match value {
            WaterfallVendorAPI::Experian => VendorAPI::ExperianPreciseId,
            WaterfallVendorAPI::Idology => VendorAPI::IdologyExpectId,
            WaterfallVendorAPI::Lexis => VendorAPI::LexisFlexId,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cmp::Ordering;
    use test_case::test_case;
    #[test_case(WaterfallVendorAPI::Experian, WaterfallVendorAPI::Idology => Ordering::Less)]
    #[test_case(WaterfallVendorAPI::Lexis, WaterfallVendorAPI::Experian => Ordering::Less)]
    #[test_case(WaterfallVendorAPI::Lexis, WaterfallVendorAPI::Idology => Ordering::Less)]
    fn test_cmp_waterfall_vendor(s1: WaterfallVendorAPI, s2: WaterfallVendorAPI) -> Ordering {
        s1.cmp(&s2)
    }
}
