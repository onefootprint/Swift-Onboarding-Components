use std::collections::HashMap;

use db::models::{
    ob_configuration::ObConfiguration,
    risk_signal::{IncludeHidden, NewRiskSignalInfo, RiskSignal},
};
use idv::ParsedResponse;
use itertools::Itertools;
use newtypes::{
    CollectedData, FootprintReasonCode, IdentityDataKind, RiskSignalGroupKind, ScopedVaultId, VendorAPI,
    VerificationResultId,
};

use super::{
    experian::ExperianFeatures, idology_expectid::IDologyFeatures, incode_docv::IncodeDocumentFeatures, lexis,
};
use crate::{
    decision::{
        onboarding::FeatureSet,
        vendor::{
            vendor_api::vendor_api_response::{VendorAPIResponseIdentifiersMap, VendorAPIResponseMap},
            vendor_result::VendorResult,
        },
    },
    errors::ApiResult,
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
pub struct VendorResultsAndVault<'a> {
    response_map: &'a VendorAPIResponseMap,
    ids_map: &'a VendorAPIResponseIdentifiersMap,
    vw: VaultWrapper, // TODO: use these bad boys
    obc: ObConfiguration,
}

impl<'a> VendorResultsAndVault<'a> {
    pub fn new(
        maps: (&'a VendorAPIResponseMap, &'a VendorAPIResponseIdentifiersMap),
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

pub struct ParsedFootprintReasonCodes {
    pub kyc: RiskSignalGroupStruct<Kyc>, // TODO: just have these be Vec<FRC>
    pub aml: RiskSignalGroupStruct<Aml>,
}

pub fn parse_reason_codes_from_vendor_result(
    vendor_result: VendorResult, // TODO: this could be VendorResponse later when vres_id is removed from here
    vw: &VaultWrapper,
) -> ApiResult<ParsedFootprintReasonCodes> {
    let vendor_api: VendorAPI = (&vendor_result.response.response).into();
    let vres_id = vendor_result.verification_result_id.clone();

    let (aml_frcs, kyc_frcs): (Vec<_>, Vec<_>) = parse_reason_codes(vendor_result.clone(), vw)
        .into_iter()
        .partition(|frc| frc.is_aml());

    let kyc = RiskSignalGroupStruct {
        footprint_reason_codes: kyc_frcs
            .into_iter()
            .map(|frc| (frc, vendor_api, vres_id.clone()))
            .collect(),
        group: Kyc,
    };

    let aml = RiskSignalGroupStruct {
        footprint_reason_codes: aml_frcs
            .into_iter()
            .map(|frc| (frc, vendor_api, vres_id.clone()))
            .collect(),
        group: Aml,
    };

    let res = ParsedFootprintReasonCodes { kyc, aml };
    Ok(res)
}

fn parse_reason_codes(vendor_result: VendorResult, vw: &VaultWrapper) -> Vec<FootprintReasonCode> {
    let dob_submitted = vw.has_field(IdentityDataKind::Dob);
    let ssn_submitted = vw.has_field(IdentityDataKind::Ssn4) || vw.has_field(IdentityDataKind::Ssn9);
    match vendor_result.response.response {
        ParsedResponse::IDologyExpectID(r) => {
            IDologyFeatures::from(
                r,
                vendor_result.verification_result_id, // TODO remove this param later
                dob_submitted,
                ssn_submitted,
            )
            .footprint_reason_codes()
            .into_iter()
            .collect()
        }
        ParsedResponse::ExperianPreciseID(r) => {
            ExperianFeatures::from(r, vendor_result.verification_result_id)
                .footprint_reason_codes()
                .into_iter()
                .collect()
        }
        ParsedResponse::LexisFlexId(r) => lexis::footprint_reason_codes(r, ssn_submitted)
            .into_iter()
            .collect(),
        _ => vec![],
    }
}

pub fn save_risk_signals(
    conn: &mut db::TxnPgConn,
    scoped_vault_id: &ScopedVaultId,
    new_risk_signals: Vec<NewRiskSignalInfo>,
    risk_signal_group_kind: RiskSignalGroupKind,
    hidden: bool,
) -> Result<(), ApiError> {
    RiskSignal::bulk_create(
        conn,
        scoped_vault_id,
        new_risk_signals,
        risk_signal_group_kind,
        // default to hiding for things using this code path
        hidden,
    )?;

    Ok(())
}

pub fn ssn_optional_and_missing<T>(vw: &VaultWrapper<T>, obc: &ObConfiguration) -> bool {
    let cd = CollectedData::Ssn;
    let cdos = cd.options();
    cdos.iter().any(|cdo| {
        !cdo.required_data_identifiers()
            .into_iter()
            .all(|di| vw.has_field(di))
            && obc.optional_data.contains(cdo)
    })
}

pub fn user_input_based_risk_signals(vw: &VaultWrapper, obc: &ObConfiguration) -> Vec<FootprintReasonCode> {
    let mut frcs = Vec::<FootprintReasonCode>::new();

    let ssn_optional_and_missing_and_no_doc_stepup =
        ssn_optional_and_missing(vw, obc) && !obc.should_stepup_to_do_for_optional_ssn();
    if ssn_optional_and_missing_and_no_doc_stepup {
        frcs.push(FootprintReasonCode::SsnNotProvided);
    }

    if !vw.has_field(IdentityDataKind::PhoneNumber) {
        frcs.push(FootprintReasonCode::PhoneNotProvided);
    }
    frcs
}

impl From<VendorResultsAndVault<'_>> for RiskSignalGroupStruct<Kyc> {
    fn from(results: VendorResultsAndVault) -> Self {
        let VendorResultsAndVault {
            response_map,
            ids_map,
            vw,
            obc,
        } = results;

        // Risk Signals that should be created for every vendor, based purely on data in vault + obc
        let user_input_risk_signals = user_input_based_risk_signals(&vw, &obc);

        let idology_features = IDologyFeatures::try_from(((response_map, ids_map), vw))
            .ok()
            .map(|f| {
                let vres = f.verification_result_id.clone();

                f.footprint_reason_codes
                    .into_iter()
                    .chain(user_input_risk_signals.clone())
                    .filter(|r| !r.is_aml()) // Filter out AML reason codes!
                    .map(|r| (r, VendorAPI::IdologyExpectId, vres.to_owned()))
                    .collect()
            })
            .unwrap_or(vec![]);
        let experian_features = ExperianFeatures::try_from((response_map, ids_map))
            .ok()
            .map(|f| {
                let vres = f.verification_result_id.clone();

                f.footprint_reason_codes
                    .into_iter()
                    .chain(user_input_risk_signals.clone())
                    .filter(|r| !r.is_aml()) // Filter out AML reason codes!
                    .map(|r| (r, VendorAPI::ExperianPreciseId, vres.to_owned()))
                    .collect()
            })
            .unwrap_or(vec![]);
        // TODO: incode here? it's done a bit out of band in the incode state machine so may just need this on the read side

        RiskSignalGroupStruct {
            footprint_reason_codes: idology_features.into_iter().chain(experian_features).collect(),
            group: Kyc,
        }
    }
}

impl From<VendorResultsAndVault<'_>> for RiskSignalGroupStruct<Aml> {
    fn from(results: VendorResultsAndVault) -> Self {
        let VendorResultsAndVault {
            response_map,
            ids_map,
            vw,
            obc: _,
        } = results;

        let idology_features = IDologyFeatures::try_from(((response_map, ids_map), vw))
            .ok()
            .map(|f| {
                let vres = f.verification_result_id.clone();

                f.footprint_reason_codes
                    .into_iter()
                    .filter(|r| r.is_aml())  // Filter to only AML risk signals!
                    .map(|r| (r, VendorAPI::IdologyExpectId, vres.to_owned()))
                    .collect()
            })
            .unwrap_or(vec![]);
        let experian_features = ExperianFeatures::try_from((response_map, ids_map))
            .ok()
            .map(|f| {
                let vres = f.verification_result_id.clone();

                f.footprint_reason_codes
                    .into_iter()
                    .filter(|r| r.is_aml()) // Filter to only AML risk signals!
                    .map(|r| (r, VendorAPI::ExperianPreciseId, vres.to_owned()))
                    .collect()
            })
            .unwrap_or(vec![]);

        RiskSignalGroupStruct {
            footprint_reason_codes: idology_features.into_iter().chain(experian_features).collect(),
            group: Aml,
        }
    }
}

//
// READ
//

// temp hack for the AlpacaKyc workflow which makes an initial decision purely on KYC risk signals and then later makes the AML vendor call and checks AML risk_signals
// this prevents scenarios like: A user goes through AlpacaKyc and gets a watchlist hit, the Tenant asks them to redo KYC and enter in their full name. They go through the flow again and enter a new name which doesn't have any watchlist hits associated with it. But we immediatly fail them in AlpacaKycDecisioning because their latest AML risk signals from the first onboarding still exist
pub fn fetch_latest_kyc_risk_signals(
    conn: &mut db::PgConn,
    scoped_vault_id: &ScopedVaultId,
) -> Result<RiskSignalsForDecision, ApiError> {
    let rsfd = fetch_latest_risk_signals_map(conn, scoped_vault_id)?;
    Ok(RiskSignalsForDecision {
        kyc: rsfd.kyc.clone(),
        doc: None,
        kyb: None,
        aml: None,
        risk_signals: rsfd.risk_signals.clone(),
    })
}

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

    let risk_signals = db_risk_signals_map.clone();

    let kyc = extract_risk_signal_group(&mut db_risk_signals_map, Kyc);
    let doc = extract_risk_signal_group(&mut db_risk_signals_map, Doc);
    let kyb = extract_risk_signal_group(&mut db_risk_signals_map, Kyb);
    let aml = extract_risk_signal_group(&mut db_risk_signals_map, Aml);

    Ok(RiskSignalsForDecision {
        kyc,
        doc,
        kyb,
        aml,
        risk_signals,
    })
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

impl<T> FeatureSet for RiskSignalGroupStruct<T>
where
    T: Into<WrappedRiskSignalGroupKind> + Clone,
{
    fn footprint_reason_codes(&self) -> Vec<FootprintReasonCode> {
        self.footprint_reason_codes
            .iter()
            .map(|(frc, _, _)| frc.clone())
            .collect()
    }

    fn vendor_apis(&self) -> Vec<VendorAPI> {
        self.footprint_reason_codes
            .iter()
            .map(|(_, v, _)| v)
            .unique()
            .cloned()
            .collect()
    }
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
    Doc,
    Device,
    NativeDevice,
    Aml,
}
use risk_signal_group_struct::*;

impl From<RiskSignalGroupKind> for WrappedRiskSignalGroupKind {
    fn from(value: RiskSignalGroupKind) -> Self {
        match value {
            RiskSignalGroupKind::Kyc => Self::Kyc,
            RiskSignalGroupKind::Kyb => Self::Kyb,
            RiskSignalGroupKind::Doc => Self::Doc,
            RiskSignalGroupKind::WebDevice => Self::Device,
            RiskSignalGroupKind::NativeDevice => Self::NativeDevice,
            RiskSignalGroupKind::Aml => Self::Aml,
        }
    }
}

impl From<WrappedRiskSignalGroupKind> for RiskSignalGroupKind {
    fn from(value: WrappedRiskSignalGroupKind) -> Self {
        match value {
            WrappedRiskSignalGroupKind::Kyc => Self::Kyc,
            WrappedRiskSignalGroupKind::Kyb => Self::Kyb,
            WrappedRiskSignalGroupKind::Doc => Self::Doc,
            WrappedRiskSignalGroupKind::Device => Self::WebDevice,
            WrappedRiskSignalGroupKind::NativeDevice => Self::NativeDevice,
            WrappedRiskSignalGroupKind::Aml => Self::Aml,
        }
    }
}

impl TryFrom<RiskSignalsForDecision> for IDologyFeatures {
    type Error = crate::decision::Error;

    fn try_from(signals: RiskSignalsForDecision) -> Result<Self, Self::Error> {
        let kyc_reason_codes = signals.kyc.map(|s| s.footprint_reason_codes).unwrap_or_default();
        let aml_reason_codes = signals.aml.map(|s| s.footprint_reason_codes).unwrap_or_default();

        let (footprint_reason_codes, mut verification_result_ids): (Vec<_>, Vec<_>) = kyc_reason_codes
            .into_iter()
            .chain(aml_reason_codes)
            .filter_map(|(frc, vendor_api, verification_result_id)| {
                if vendor_api == VendorAPI::IdologyExpectId {
                    Some((frc, verification_result_id))
                } else {
                    None
                }
            })
            .unzip();

        if footprint_reason_codes.is_empty() {
            Err(crate::decision::Error::FeatureVectorConversionError(
                VendorAPI::IdologyExpectId,
            ))
        } else {
            Ok(Self {
                footprint_reason_codes,
                verification_result_id: verification_result_ids.pop().ok_or(
                    crate::decision::Error::FeatureVectorConversionError(VendorAPI::IdologyExpectId),
                )?,
            })
        }
    }
}

impl TryFrom<RiskSignalsForDecision> for ExperianFeatures {
    type Error = crate::decision::Error;

    fn try_from(signals: RiskSignalsForDecision) -> Result<Self, Self::Error> {
        let kyc_reason_codes = signals.kyc.map(|s| s.footprint_reason_codes).unwrap_or_default();
        let aml_reason_codes = signals.aml.map(|s| s.footprint_reason_codes).unwrap_or_default();

        let (footprint_reason_codes, mut verification_result_ids): (Vec<_>, Vec<_>) = kyc_reason_codes
            .into_iter()
            .chain(aml_reason_codes)
            .filter_map(|(frc, vendor_api, verification_result_id)| {
                if vendor_api == VendorAPI::ExperianPreciseId {
                    Some((frc, verification_result_id))
                } else {
                    None
                }
            })
            .unzip();

        if footprint_reason_codes.is_empty() {
            Err(crate::decision::Error::FeatureVectorConversionError(
                VendorAPI::ExperianPreciseId,
            ))
        } else {
            Ok(Self {
                footprint_reason_codes,
                verification_result_id: verification_result_ids.pop().ok_or(
                    crate::decision::Error::FeatureVectorConversionError(VendorAPI::ExperianPreciseId),
                )?,
            })
        }
    }
}

impl TryFrom<RiskSignalsForDecision> for IncodeDocumentFeatures {
    type Error = crate::decision::Error;

    fn try_from(signals: RiskSignalsForDecision) -> Result<Self, Self::Error> {
        let doc_reason_codes = signals.doc.map(|s| s.footprint_reason_codes).unwrap_or_default();
        let apis = [VendorAPI::IncodeFetchScores, VendorAPI::IncodeFetchOcr];

        let (footprint_reason_codes, mut verification_result_ids): (Vec<_>, Vec<_>) = doc_reason_codes
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
    pub aml: Option<RiskSignalGroupStruct<Aml>>,
    pub risk_signals: HashMap<RiskSignalGroupKind, Vec<RiskSignal>>,
}

impl RiskSignalsForDecision {
    pub fn verification_result_ids(&self) -> Vec<VerificationResultId> {
        self.risk_signals
            .values()
            .flatten()
            .map(|rs| rs.verification_result_id.clone())
            .collect()
    }
}
