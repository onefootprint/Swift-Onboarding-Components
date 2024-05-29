use super::{
    curp_validation,
    experian,
    idology_expectid,
    lexis,
    neuro_id,
};
use crate::decision::vendor::vendor_result::VendorResult;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::ApiError;
use db::models::risk_signal::{
    AtSeqno,
    RiskSignal,
};
use derive_more::Display;
use enum_variant_type::EnumVariantType;
use idv::ParsedResponse;
use newtypes::{
    FootprintReasonCode,
    IdentityDataKind as IDK,
    RiskSignalGroupKind,
    ScopedVaultId,
    VendorAPI,
    VerificationResultId,
};
use std::collections::HashMap;

// There are 2 main ways we interact RiskSignals:
//  - WRITE - when handling vendor responses, in order to produce and save risk signals
//  - READ - when reading from the database for decisioning or populating an Alpaca CIP or
//    displaying the dashboard etc
//
//
// However, rules are defined per Vendor for a multitude of reasons (the main one being that reason
// codes are different across vendors, or mean different things) so when using the most recent
// grouping of risk signals, we need a way to decompose back into vendor-specific risk signals
// (currently our `*Features`)
//
// Walking through an example:
//  * Writing
//   1. we make vendor requests
//   2. we convert the responses into a `RiskSignalGroupStruct`. We have defined via traits how to
//      convert a HashMap of vendor responses into the appropriate grouping of RiskSignals
//   3. Save RiskSignals
// * Reading
//   1. We reach a decision point where we need all the latest risk signals for a specific
//      RiskSignalGroupKind
//   2. We fetch all RiskSignals from the latest RSG of that kind
//   3. We define (via `From`) ways to convert from `RiskSignalGroupStruct` into the various
//      Vendor-specific features that are used in rules
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

//
// WRITE
//

pub struct ParsedFootprintReasonCodes {
    pub kyc: RiskSignalGroupStruct<Kyc>, // TODO: just have these be Vec<FRC>
    pub aml: RiskSignalGroupStruct<Aml>,
}

pub fn parse_reason_codes_from_vendor_result(
    vendor_result: VendorResult, /* TODO: this could be VendorResponse later when vres_id is removed from
                                  * here */
    vw: &VaultWrapper,
) -> ApiResult<ParsedFootprintReasonCodes> {
    let vendor_api: VendorAPI = (&vendor_result.response.response).into();
    let vres_id = vendor_result.verification_result_id.clone();
    let dob_submitted = vw.has_field(&IDK::Dob.into());
    let ssn_submitted = vw.has_field(&IDK::Ssn4.into()) || vw.has_field(&IDK::Ssn9.into());

    let (aml_frcs, kyc_frcs): (Vec<_>, Vec<_>) =
        parse_reason_codes(vendor_result.clone(), dob_submitted, ssn_submitted)
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

pub fn parse_reason_codes(
    vendor_result: VendorResult,
    dob_submitted: bool,
    ssn_submitted: bool,
) -> Vec<FootprintReasonCode> {
    match vendor_result.response.response {
        ParsedResponse::IDologyExpectID(r) => {
            idology_expectid::footprint_reason_codes(r, dob_submitted, ssn_submitted)
        }
        ParsedResponse::ExperianPreciseID(r) => experian::footprint_reason_codes(r),
        ParsedResponse::LexisFlexId(r) => lexis::footprint_reason_codes(r, ssn_submitted)
            .into_iter()
            .collect(),
        ParsedResponse::IncodeCurpValidation(ref r) => {
            curp_validation::footprint_reason_codes(r).into_iter().collect()
        }
        ParsedResponse::NeuroIdAnalytics(ref r) => neuro_id::footprint_reason_codes(r).into_iter().collect(),
        _ => vec![],
    }
}

//
// READ
//

// temp hack for the AlpacaKyc workflow which makes an initial decision purely on KYC risk signals
// and then later makes the AML vendor call and checks AML risk_signals this prevents scenarios
// like: A user goes through AlpacaKyc and gets a watchlist hit, the Tenant asks them to redo KYC
// and enter in their full name. They go through the flow again and enter a new name which doesn't
// have any watchlist hits associated with it. But we immediatly fail them in AlpacaKycDecisioning
// because their latest AML risk signals from the first onboarding still exist
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
        // We don't make decisions on hidden risk signals
        RiskSignal::latest_by_risk_signal_group_kinds(conn, scoped_vault_id, AtSeqno(None))?
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
    Behavior,
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
            RiskSignalGroupKind::Behavior => Self::Behavior,
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
            WrappedRiskSignalGroupKind::Behavior => Self::Behavior,
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
