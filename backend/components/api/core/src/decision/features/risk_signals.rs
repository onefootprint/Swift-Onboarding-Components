use super::curp_validation;
use super::experian;
use super::idology_expectid;
use super::lexis;
use super::neuro_id;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use db::models::risk_signal::AtSeqno;
use db::models::risk_signal::NewRiskSignalInfo;
use db::models::risk_signal::RiskSignal;
use idv::ParsedResponse;
use newtypes::FootprintReasonCode;
use newtypes::IdentityDataKind as IDK;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::VendorAPI;
use std::collections::HashMap;

pub struct ParsedFootprintReasonCodes {
    pub kyc: Vec<NewRiskSignalInfo>,
    pub aml: Vec<NewRiskSignalInfo>,
}

// Helper to use in FRC construction
#[derive(Clone, Copy)]
pub struct UserSubmittedInfoForFRC {
    pub dob: bool,
    pub ssn: bool,
    pub phone: bool,
}

impl UserSubmittedInfoForFRC {
    pub fn new(vw: &VaultWrapper) -> Self {
        let dob = vw.has_field(&IDK::Dob.into());
        let ssn = vw.has_field(&IDK::Ssn4.into()) || vw.has_field(&IDK::Ssn9.into());
        let phone = vw.has_field(&IDK::PhoneNumber.into());
        Self { dob, ssn, phone }
    }
}

pub fn parse_reason_codes_from_vendor_result(
    vendor_result: VendorResult, /* TODO: this could be VendorResponse later when vres_id is removed from
                                  * here */
    vw: &VaultWrapper,
) -> FpResult<ParsedFootprintReasonCodes> {
    let vendor_api: VendorAPI = (&vendor_result.response.response).into();
    let vres_id = vendor_result.verification_result_id.clone();
    let submitted_info = UserSubmittedInfoForFRC::new(vw);

    let (aml_frcs, kyc_frcs): (Vec<_>, Vec<_>) = parse_reason_codes(vendor_result.clone(), submitted_info)
        .into_iter()
        .partition(|frc| frc.is_aml());

    let kyc = kyc_frcs
        .into_iter()
        .map(|frc| (frc, vendor_api, vres_id.clone()))
        .collect();


    let aml = aml_frcs
        .into_iter()
        .map(|frc| (frc, vendor_api, vres_id.clone()))
        .collect();

    let res = ParsedFootprintReasonCodes { kyc, aml };
    Ok(res)
}

pub fn parse_reason_codes(
    vendor_result: VendorResult,
    submitted_info: UserSubmittedInfoForFRC,
) -> Vec<FootprintReasonCode> {
    let dob_submitted = submitted_info.dob;
    let ssn_submitted = submitted_info.ssn;
    match vendor_result.response.response {
        ParsedResponse::IDologyExpectID(r) => {
            idology_expectid::footprint_reason_codes(r, dob_submitted, ssn_submitted)
        }
        ParsedResponse::ExperianPreciseID(r) => experian::footprint_reason_codes(r),
        ParsedResponse::LexisFlexId(r) => lexis::footprint_reason_codes(r, submitted_info)
            .into_iter()
            .collect(),
        ParsedResponse::IncodeCurpValidation(ref r) => {
            curp_validation::footprint_reason_codes(r).into_iter().collect()
        }
        ParsedResponse::NeuroIdAnalytics(ref r) => neuro_id::footprint_reason_codes(r).into_iter().collect(),
        _ => vec![],
    }
}

// TODO: remove this and just use RiskSignal::latest_by_risk_signal_group_kinds
pub fn fetch_latest_risk_signals_map(
    conn: &mut db::PgConn,
    scoped_vault_id: &ScopedVaultId,
) -> FpResult<RiskSignalsForDecision> {
    let mut db_risk_signals_map: HashMap<RiskSignalGroupKind, Vec<RiskSignal>> =
        // We don't make decisions on hidden risk signals
        RiskSignal::latest_by_risk_signal_group_kinds(conn, scoped_vault_id, AtSeqno(None))?
            .into_iter()
            .fold(HashMap::new(), |mut acc, (kind, rs)| {
                acc.entry(kind).or_default().push(rs);
                acc
            });

    let risk_signals = db_risk_signals_map.clone();

    let kyc = extract_risk_signal_group(&mut db_risk_signals_map, RiskSignalGroupKind::Kyc);
    let doc = extract_risk_signal_group(&mut db_risk_signals_map, RiskSignalGroupKind::Doc);
    let kyb = extract_risk_signal_group(&mut db_risk_signals_map, RiskSignalGroupKind::Kyb);
    let aml = extract_risk_signal_group(&mut db_risk_signals_map, RiskSignalGroupKind::Aml);

    Ok(RiskSignalsForDecision {
        kyc,
        doc,
        kyb,
        aml,
        risk_signals,
    })
}

fn extract_risk_signal_group(
    db_risk_signals_map: &mut HashMap<RiskSignalGroupKind, Vec<RiskSignal>>,
    group: RiskSignalGroupKind,
) -> Option<Vec<NewRiskSignalInfo>> {
    db_risk_signals_map.remove(&group).map(|rs| {
        rs.into_iter()
            .map(|rs| (rs.reason_code, rs.vendor_api, rs.verification_result_id))
            .collect::<Vec<_>>()
    })
}

#[derive(Clone, Default)]
pub struct RiskSignalsForDecision {
    pub kyc: Option<Vec<NewRiskSignalInfo>>,
    pub doc: Option<Vec<NewRiskSignalInfo>>,
    pub kyb: Option<Vec<NewRiskSignalInfo>>,
    pub aml: Option<Vec<NewRiskSignalInfo>>,
    pub risk_signals: HashMap<RiskSignalGroupKind, Vec<RiskSignal>>,
}
