use db::models::risk_signal::RiskSignal;
use newtypes::{
    risk_signal_group_struct, FootprintReasonCode, RiskSignalGroupKind, ScopedVaultId, VendorAPI,
    VerificationResultId,
};

use crate::{
    decision::vendor::vendor_api::vendor_api_response::{
        VendorAPIResponseIdentifiersMap, VendorAPIResponseMap,
    },
    ApiError,
};

use super::{experian::ExperianFeatures, idology_expectid::IDologyFeatures};

// There are 2 main ways we interact RiskSignals:
//  - WRITE - when handling vendor responses, in order to produce and save risk signals
//  - READ - when reading from the database for decisioning or populating an Alpaca CIP or displaying the dashboard etc
//
//
// However, rules are defined per Vendor for a multitude of reasons (the main one being that reason codes are different across vendors, or mean different things)
// so when using the most recent grouping of risk signals, we need a way to decompose back into vendor-specific risk signals (currently our `*Features`)
//
// Walking through an example:
//  * Writing
//   1. we make vendor requests
//   2. we convert the responses into a `RiskSignalGroupStruct`. We have defined via traits how to convert a HashMap of vendor responses into the appropriate grouping of RiskSignals
//   3. Save RiskSignals
// * Reading
//   1. We reach a decision point where we need all the latest risk signals for a specific RiskSignalGroupKind
//   2. We fetch all RiskSignals from the latest RSG of that kind
//   3. We define (via `From`) ways to convert from `RiskSignalGroupStruct` into the various Vendor-specific features that are used in rules
//
// Why all these traits?
//  convenience and type safety, and makes the decisioning code more generic

// Represents a typed grouping of FootprintReasonCodes
pub struct RiskSignalGroupStruct<T>
where
    T: Into<RiskSignalGroupKind>,
{
    pub footprint_reason_codes: Vec<(FootprintReasonCode, VendorAPI, VerificationResultId)>,
    pub group: T,
}

//
// WRITE
//
pub fn create_risk_signals_from_vendor_results<T>(
    vendor_result_maps: (VendorAPIResponseMap, VendorAPIResponseIdentifiersMap),
) -> Result<RiskSignalGroupStruct<T>, ApiError>
where
    T: Into<RiskSignalGroupKind>,
    RiskSignalGroupStruct<T>: From<(VendorAPIResponseMap, VendorAPIResponseIdentifiersMap)>,
{
    let res = RiskSignalGroupStruct::<T>::from(vendor_result_maps);

    Ok(res)
}

pub fn save_risk_signals<T>(
    conn: &mut db::TxnPgConn,
    scoped_vault_id: &ScopedVaultId,
    risk_signals: RiskSignalGroupStruct<T>,
) -> Result<(), ApiError>
where
    T: Into<RiskSignalGroupKind>,
    RiskSignalGroupStruct<T>: From<(VendorAPIResponseMap, VendorAPIResponseIdentifiersMap)>,
{
    RiskSignal::bulk_create(
        conn,
        scoped_vault_id,
        risk_signals.footprint_reason_codes,
        risk_signals.group.into(),
        // default to hiding for things using this code path
        true,
    )?;

    Ok(())
}

impl From<(VendorAPIResponseMap, VendorAPIResponseIdentifiersMap)>
    for RiskSignalGroupStruct<risk_signal_group_struct::Kyc>
{
    fn from(maps: (VendorAPIResponseMap, VendorAPIResponseIdentifiersMap)) -> Self {
        let (response_map, ids_map) = maps;
        let idology_features = IDologyFeatures::try_from((&response_map, &ids_map))
            .ok()
            .map(|f| {
                let vres = f.verification_result_id.clone();

                f.footprint_reason_codes
                    .into_iter()
                    .map(|r| (r, VendorAPI::IdologyExpectID, vres.to_owned()))
                    .collect()
            })
            .unwrap_or(vec![]);
        let experian_features = ExperianFeatures::try_from((&response_map, &ids_map))
            .ok()
            .map(|f| {
                let vres = f.verification_result_id.clone();

                f.footprint_reason_codes
                    .into_iter()
                    .map(|r| (r, VendorAPI::ExperianPreciseID, vres.to_owned()))
                    .collect()
            })
            .unwrap_or(vec![]);
        // TODO: incode here? it's done a bit out of band in the incode state machine so may just need this on the read side

        RiskSignalGroupStruct {
            footprint_reason_codes: idology_features
                .into_iter()
                .chain(experian_features.into_iter())
                .collect(),
            group: risk_signal_group_struct::Kyc,
        }
    }
}

// #[cfg(test)]
// mod tests {
//     use newtypes::risk_signal_group_struct;

//     use super::RiskSignalGroupStruct;

//     #[test]
//     fn test_create_risk_signals() {
//         let s: RiskSignalGroupStruct<risk_signal_group_struct::Doc> =
//             super::create_risk_signals_from_vendor_results(vec![]).unwrap();
//     }
// }
