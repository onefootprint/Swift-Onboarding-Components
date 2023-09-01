use std::collections::HashMap;

use db::models::{
    ob_configuration::ObConfiguration,
    risk_signal::{IncludeHidden, RiskSignal},
};
use newtypes::{
    CollectedData, FootprintReasonCode, IdentityDataKind, RiskSignalGroupKind, ScopedVaultId, VendorAPI,
    VerificationResultId,
};

use super::{
    experian::ExperianFeatures, idology_expectid::IDologyFeatures, incode_docv::IncodeDocumentFeatures,
};
use crate::{
    decision::vendor::vendor_api::vendor_api_response::{
        VendorAPIResponseIdentifiersMap, VendorAPIResponseMap,
    },
    utils::vault_wrapper::VaultWrapper,
    ApiError,
};
use derive_more::Display;
use enum_variant_type::EnumVariantType;

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
#[derive(Clone)]
pub struct RiskSignalGroupStruct<T>
where
    T: Into<WrappedRiskSignalGroupKind> + Clone,
{
    pub footprint_reason_codes: Vec<(FootprintReasonCode, VendorAPI, VerificationResultId)>,
    pub group: T,
}

impl<T> Default for RiskSignalGroupStruct<T>
where
    T: Into<WrappedRiskSignalGroupKind> + Clone + Default,
{
    fn default() -> Self {
        Self {
            footprint_reason_codes: vec![],
            group: T::default(),
        }
    }
}

#[allow(dead_code)]
pub struct VendorResultsAndVault {
    response_map: VendorAPIResponseMap,
    ids_map: VendorAPIResponseIdentifiersMap,
    vw: VaultWrapper, // TODO: use these bad boys
    obc: ObConfiguration,
}

impl VendorResultsAndVault {
    pub fn new(
        maps: (VendorAPIResponseMap, VendorAPIResponseIdentifiersMap),
        vw: VaultWrapper,
        obc: ObConfiguration,
    ) -> Self {
        Self {
            response_map: maps.0,
            ids_map: maps.1,
            vw,
            obc,
        }
    }
}

//
// WRITE
//
pub fn create_risk_signals_from_vendor_results<T>(
    vendor_result_maps: (VendorAPIResponseMap, VendorAPIResponseIdentifiersMap),
    vw: VaultWrapper,
    obc: ObConfiguration,
) -> Result<RiskSignalGroupStruct<T>, ApiError>
where
    T: Into<WrappedRiskSignalGroupKind> + Clone,
    RiskSignalGroupStruct<T>: From<VendorResultsAndVault>,
{
    let res = RiskSignalGroupStruct::<T>::from(VendorResultsAndVault::new(vendor_result_maps, vw, obc));

    Ok(res)
}

pub fn save_risk_signals<T>(
    conn: &mut db::TxnPgConn,
    scoped_vault_id: &ScopedVaultId,
    risk_signals: &RiskSignalGroupStruct<T>,
    hidden: bool,
) -> Result<(), ApiError>
where
    T: Into<WrappedRiskSignalGroupKind> + Clone,
{
    RiskSignal::bulk_create(
        conn,
        scoped_vault_id,
        risk_signals.footprint_reason_codes.clone(),
        risk_signals.group.clone().into().into(),
        // default to hiding for things using this code path
        hidden,
    )?;

    Ok(())
}

pub fn user_input_based_risk_signals(vw: &VaultWrapper, obc: &ObConfiguration) -> Vec<FootprintReasonCode> {
    let mut frcs = Vec::<FootprintReasonCode>::new();

    let cd = CollectedData::Ssn;
    let cdos = cd.options();
    let ssn_optional_and_missing = cdos.iter().any(|cdo| {
        !cdo.required_data_identifiers()
            .into_iter()
            .all(|di| vw.has_field(di))
            && obc.optional_data.contains(cdo)
    });
    if ssn_optional_and_missing {
        frcs.push(FootprintReasonCode::SsnNotProvided);
    }

    if !vw.has_field(IdentityDataKind::PhoneNumber) {
        frcs.push(FootprintReasonCode::PhoneNotProvided);
    }
    frcs
}

impl From<VendorResultsAndVault> for RiskSignalGroupStruct<Kyc> {
    fn from(results: VendorResultsAndVault) -> Self {
        let VendorResultsAndVault {
            response_map,
            ids_map,
            vw,
            obc,
        } = results;

        // Risk Signals that should be created for every vendor, based purely on data in vault + obc
        let user_input_risk_signals = user_input_based_risk_signals(&vw, &obc);

        let idology_features = IDologyFeatures::try_from(((&response_map, &ids_map), vw))
            .ok()
            .map(|f| {
                let vres = f.verification_result_id.clone();

                f.footprint_reason_codes
                    .into_iter()
                    .chain(user_input_risk_signals.clone().into_iter())
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
                    .chain(user_input_risk_signals.clone().into_iter())
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
            group: Kyc,
        }
    }
}

//
// READ
//

pub fn fetch_latest_risk_signals_map(
    conn: &mut db::PgConn,
    scoped_vault_id: &ScopedVaultId,
) -> Result<RiskSignalsForDecision, ApiError> {
    let mut db_risk_signals_map: HashMap<RiskSignalGroupKind, Vec<RiskSignal>> =
        RiskSignal::latest_by_risk_signal_group_kinds(conn, scoped_vault_id, IncludeHidden(true))?
            .into_iter()
            .fold(HashMap::new(), |mut acc, (kind, rs)| {
                acc.entry(kind).or_default().push(rs);
                acc
            });

    let kyc = extract_risk_signal_group(&mut db_risk_signals_map, Kyc);
    let doc = extract_risk_signal_group(&mut db_risk_signals_map, Doc);
    let kyb = extract_risk_signal_group(&mut db_risk_signals_map, Kyb);

    Ok(RiskSignalsForDecision { kyc, doc, kyb })
}

fn extract_risk_signal_group<T>(
    db_risk_signals_map: &mut HashMap<RiskSignalGroupKind, Vec<RiskSignal>>,
    group: T,
) -> Option<RiskSignalGroupStruct<T>>
where
    T: Into<WrappedRiskSignalGroupKind> + Clone,
{
    let rsg_kind = group.clone().into().into();
    db_risk_signals_map
        .remove(&rsg_kind)
        .map(|rs| {
            rs.into_iter()
                .map(|rs| (rs.reason_code, rs.vendor_api, rs.verification_result_id))
                .collect::<Vec<_>>()
        })
        .map(|frcs| RiskSignalGroupStruct {
            footprint_reason_codes: frcs,
            group,
        })
}

// RiskSignalGroupKind is defined in `newtypes` with all the other
/// db types, we have another "Wrapped" enum here so we can implement extra functionality that is
/// helpful for working with RiskSignals in application code
#[derive(Debug, Display, Clone, Copy, Hash, PartialEq, Eq, EnumVariantType)]
#[evt(module = "risk_signal_group_struct")]
#[evt(derive(Clone, Hash, PartialEq, Eq, Default))]
pub enum WrappedRiskSignalGroupKind {
    Kyc,
    Kyb,
    Watchlist,
    AdverseMedia,
    Doc,
    Device,
    NativeDevice,
}
use risk_signal_group_struct::*;

impl From<RiskSignalGroupKind> for WrappedRiskSignalGroupKind {
    fn from(value: RiskSignalGroupKind) -> Self {
        match value {
            RiskSignalGroupKind::Kyc => Self::Kyc,
            RiskSignalGroupKind::Kyb => Self::Kyb,
            RiskSignalGroupKind::Watchlist => Self::Watchlist,
            RiskSignalGroupKind::AdverseMedia => Self::AdverseMedia,
            RiskSignalGroupKind::Doc => Self::Doc,
            RiskSignalGroupKind::WebDevice => Self::Device,
            RiskSignalGroupKind::NativeDevice => Self::NativeDevice,
        }
    }
}

impl From<WrappedRiskSignalGroupKind> for RiskSignalGroupKind {
    fn from(value: WrappedRiskSignalGroupKind) -> Self {
        match value {
            WrappedRiskSignalGroupKind::Kyc => Self::Kyc,
            WrappedRiskSignalGroupKind::Kyb => Self::Kyb,
            WrappedRiskSignalGroupKind::Watchlist => Self::Watchlist,
            WrappedRiskSignalGroupKind::AdverseMedia => Self::AdverseMedia,
            WrappedRiskSignalGroupKind::Doc => Self::Doc,
            WrappedRiskSignalGroupKind::Device => Self::WebDevice,
            WrappedRiskSignalGroupKind::NativeDevice => Self::NativeDevice,
        }
    }
}

impl TryFrom<RiskSignalGroupStruct<Kyc>> for IDologyFeatures {
    type Error = crate::decision::Error;

    fn try_from(group: RiskSignalGroupStruct<Kyc>) -> Result<Self, Self::Error> {
        let (footprint_reason_codes, mut verification_result_ids): (Vec<_>, Vec<_>) = group
            .footprint_reason_codes
            .into_iter()
            .filter_map(|(frc, vendor_api, verification_result_id)| {
                if vendor_api == VendorAPI::IdologyExpectID {
                    Some((frc, verification_result_id))
                } else {
                    None
                }
            })
            .unzip();

        if footprint_reason_codes.is_empty() {
            Err(crate::decision::Error::FeatureVectorConversionError(
                VendorAPI::IdologyExpectID,
            ))
        } else {
            Ok(Self {
                footprint_reason_codes,
                verification_result_id: verification_result_ids.pop().ok_or(
                    crate::decision::Error::FeatureVectorConversionError(VendorAPI::IdologyExpectID),
                )?,
            })
        }
    }
}

impl TryFrom<RiskSignalGroupStruct<Kyc>> for ExperianFeatures {
    type Error = crate::decision::Error;

    fn try_from(group: RiskSignalGroupStruct<Kyc>) -> Result<Self, Self::Error> {
        let (footprint_reason_codes, mut verification_result_ids): (Vec<_>, Vec<_>) = group
            .footprint_reason_codes
            .into_iter()
            .filter_map(|(frc, vendor_api, verification_result_id)| {
                if vendor_api == VendorAPI::ExperianPreciseID {
                    Some((frc, verification_result_id))
                } else {
                    None
                }
            })
            .unzip();

        if footprint_reason_codes.is_empty() {
            Err(crate::decision::Error::FeatureVectorConversionError(
                VendorAPI::ExperianPreciseID,
            ))
        } else {
            Ok(Self {
                footprint_reason_codes,
                verification_result_id: verification_result_ids.pop().ok_or(
                    crate::decision::Error::FeatureVectorConversionError(VendorAPI::ExperianPreciseID),
                )?,
            })
        }
    }
}

impl TryFrom<RiskSignalGroupStruct<Doc>> for IncodeDocumentFeatures {
    type Error = crate::decision::Error;

    fn try_from(group: RiskSignalGroupStruct<Doc>) -> Result<Self, Self::Error> {
        let apis = vec![VendorAPI::IncodeFetchScores, VendorAPI::IncodeFetchOCR];

        let (footprint_reason_codes, mut verification_result_ids): (Vec<_>, Vec<_>) = group
            .footprint_reason_codes
            .into_iter()
            .filter_map(|(frc, vendor_api, verification_result_id)| {
                if apis.contains(&vendor_api) {
                    Some((frc, verification_result_id))
                } else {
                    None
                }
            })
            .unzip();

        if footprint_reason_codes.is_empty() {
            Err(crate::decision::Error::FeatureVectorConversionError(
                VendorAPI::IncodeFetchScores,
            ))
        } else {
            Ok(Self {
                footprint_reason_codes,
                verification_result_id: verification_result_ids.pop().ok_or(
                    crate::decision::Error::FeatureVectorConversionError(VendorAPI::IncodeFetchScores),
                )?,
            })
        }
    }
}

#[derive(Clone, Default)]
pub struct RiskSignalsForDecision {
    pub kyc: Option<RiskSignalGroupStruct<Kyc>>,
    pub doc: Option<RiskSignalGroupStruct<Doc>>,
    pub kyb: Option<RiskSignalGroupStruct<Kyb>>,
}
