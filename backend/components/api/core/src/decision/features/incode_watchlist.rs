use idv::incode::watchlist::response::{Hit, WatchlistResultResponse};
use itertools::Itertools;
use newtypes::{vendor_reason_code_enum, AdverseMediaListKind, EnhancedAmlOption, FootprintReasonCode};
use strum_macros::EnumString;

vendor_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, Hash)]
    #[serde(try_from = "&str")]
    pub enum IncodeWatchlistType {
        #[ser = "sanction", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitOfac)]
        Sanction,

        #[ser = "warning", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitNonSdn)]
        Warning,

        #[ser = "fitness-probity", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitNonSdn)]
        FitnessProbity,

        #[ser = "pep", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitPep)]
        Pep,

        #[ser = "pep-class-1", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitPep)]
        PepClass1,

        #[ser = "pep-class-2", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitPep)]
        PepClass2,

        #[ser = "pep-class-3", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitPep)]
        PepClass3,

        #[ser = "pep-class-4", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitPep)]
        PepClass4,

        #[ser = "adverse-media", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMedia,

        #[ser = "adverse-media-financial-crime", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaFinancialCrime,

        #[ser = "adverse-media-violent-crime", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaViolentCrime,

        #[ser = "adverse-media-sexual-crime", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaSexualCrime,

        #[ser = "adverse-media-terrorism", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaTerrorism,

        #[ser = "adverse-media-fraud", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaFraud,

        #[ser = "adverse-media-narcotics", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaNarcotics,

        #[ser = "adverse-media-general", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaGeneral,

        #[ser = "adverse-media-v2-property", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2Property,

        #[ser = "adverse-media-v2-financial-aml-cft", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2FinancialAmlCft,

        #[ser = "adverse-media-v2-fraud-linked", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2FraudLinked,

        #[ser = "adverse-media-v2-narcotics-aml-cft", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2NarcoticsAmlCft,

        #[ser = "adverse-media-v2-violence-aml-cft", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2ViolenceAmlCft,

        #[ser = "adverse-media-v2-terrorism", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2Terrorism,

        #[ser = "adverse-media-v2-cybercrime", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2Cybercrime,

        #[ser = "adverse-media-v2-general-aml-cft", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2GeneralAmlCft,

        #[ser = "adverse-media-v2-regulatory", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2Regulatory,

        #[ser = "adverse-media-v2-financial-difficulty", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2FinancialDifficulty,

        #[ser = "adverse-media-v2-violence-non-aml-cft", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2ViolenceNonAmlCft,

        #[ser = "adverse-media-v2-other-financial", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2OtherFinancial,

        #[ser = "adverse-media-v2-other-serious", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2OtherSerious,

        #[ser = "adverse-media-v2-other-minor", description = ""]
        #[footprint_reason_code = Some(FootprintReasonCode::AdverseMediaHit)]
        AdverseMediaV2OtherMinor
    }
}

impl IncodeWatchlistType {
    pub fn from_adverse_media_list_kind(am_list_kind: &AdverseMediaListKind) -> Vec<IncodeWatchlistType> {
        match am_list_kind {
            AdverseMediaListKind::FinancialCrime => vec![
                Self::AdverseMediaFinancialCrime,
                Self::AdverseMediaV2FinancialAmlCft,
                Self::AdverseMediaV2GeneralAmlCft,
                Self::AdverseMediaV2OtherFinancial,
                Self::AdverseMediaV2Regulatory,
            ],
            AdverseMediaListKind::ViolentCrime => vec![
                Self::AdverseMediaViolentCrime,
                Self::AdverseMediaV2ViolenceAmlCft,
                Self::AdverseMediaV2ViolenceNonAmlCft,
            ],
            AdverseMediaListKind::SexualCrime => vec![Self::AdverseMediaSexualCrime],
            AdverseMediaListKind::CyberCrime => vec![Self::AdverseMediaV2Cybercrime],
            AdverseMediaListKind::Terrorism => {
                vec![Self::AdverseMediaTerrorism, Self::AdverseMediaV2Terrorism]
            }
            AdverseMediaListKind::Fraud => vec![Self::AdverseMediaFraud, Self::AdverseMediaV2FraudLinked],
            AdverseMediaListKind::Narcotics => {
                vec![Self::AdverseMediaNarcotics, Self::AdverseMediaV2NarcoticsAmlCft]
            }
            AdverseMediaListKind::GeneralSerious => {
                vec![Self::AdverseMediaV2OtherSerious, Self::AdverseMediaV2Property]
            }
            AdverseMediaListKind::GeneralMinor => vec![
                Self::AdverseMediaGeneral,
                Self::AdverseMediaV2OtherMinor,
                Self::AdverseMediaV2FinancialDifficulty,
            ],
        }
    }
}

// If a Hit's `score` is below this number, we will consider it a true hit. Else we will ignore it for the purposes for producing reason codes
const SCORE_THRESHOLD_FOR_HIT: f32 = 10.0;

pub fn type_to_frc(s: String) -> Option<FootprintReasonCode> {
    let watchlist_type = IncodeWatchlistType::try_from(s.trim());
    match watchlist_type {
        Ok(t) => {
            let frc = Into::<Option<FootprintReasonCode>>::into(&t);
            if frc.is_none() {
                tracing::error!(incode_watchlist_type=?t, "Could not parse FootprintReasonCode from IncodeWatchlistType");
            }
            frc
        }
        Err(err) => {
            tracing::error!(?err, s = s, "Could not parse IncodeWatchlistType");
            None
        }
    }
}

fn watchlist_types_for_enhanced_aml_opt(enhanced_aml: &EnhancedAmlOption) -> Vec<IncodeWatchlistType> {
    // i guess itd be better to consolidate this with the FRC macro we have on the type variants huh
    match enhanced_aml {
        EnhancedAmlOption::No => vec![],
        EnhancedAmlOption::Yes {
            ofac,
            pep,
            adverse_media,
            continuous_monitoring: _,
            adverse_media_lists: _,
        } => vec![
            adverse_media.then(|| {
                enhanced_aml
                    .adverse_media_lists()
                    .iter()
                    .flat_map(IncodeWatchlistType::from_adverse_media_list_kind)
                    .collect::<Vec<_>>()
            }),
            ofac.then(|| {
                vec![
                    IncodeWatchlistType::Sanction,
                    // TODO: turning these off now as a quick patch to improve precision. Getting clarity from CA on what exactly these entail and if `sanction` is sufficient for most general OFAC needs
                    // IncodeWatchlistType::Warning,
                    // IncodeWatchlistType::FitnessProbity,
                ]
            }),
            pep.then(|| {
                vec![
                    IncodeWatchlistType::Pep,
                    IncodeWatchlistType::PepClass1,
                    IncodeWatchlistType::PepClass2,
                    IncodeWatchlistType::PepClass3,
                    IncodeWatchlistType::PepClass4,
                ]
            }),
        ]
        .into_iter()
        .flatten()
        .flatten()
        .collect(),
    }
}

pub fn get_hits(res: &WatchlistResultResponse, enhanced_aml: &EnhancedAmlOption) -> Vec<Hit> {
    let hits = res
        .content
        .as_ref()
        .and_then(|o| o.data.as_ref())
        .and_then(|o| o.hits.as_ref())
        .cloned()
        .unwrap_or_default();

    let watchlist_types = watchlist_types_for_enhanced_aml_opt(enhanced_aml);

    hits.into_iter()
        .filter(|h| h.score.map(|s| s < SCORE_THRESHOLD_FOR_HIT).unwrap_or(false))
        // for now, also only consider it a hit if `name_exact`, for a bit more precision
        .filter(|h| h.match_types.as_ref().map(|t| t.contains(&"name_exact".to_string())).unwrap_or(false))
        .filter(|h| h.doc.as_ref().and_then(|d| d.types.as_ref().map(|ts| ts.iter().any(|t| IncodeWatchlistType::try_from(t.trim()).ok().map(|i| watchlist_types.contains(&i)).unwrap_or(false)))).unwrap_or(false))
        .collect()
}

pub fn reason_codes_from_watchlist_result(
    res: &WatchlistResultResponse,
    enhanced_aml: &EnhancedAmlOption,
) -> Vec<FootprintReasonCode> {
    let unique_types_for_valid_hits = get_hits(res, enhanced_aml)
        .into_iter()
        .flat_map(|h| h.doc.and_then(|d| d.types).unwrap_or_default())
        .unique()
        .collect::<Vec<_>>();

    unique_types_for_valid_hits
        .into_iter()
        .filter_map(type_to_frc)
        .unique()
        .collect::<Vec<_>>()
}

#[cfg(test)]
mod test {
    use idv::incode::watchlist::response::{Content, Data, Doc, Hit};
    use std::str::FromStr;
    use test_case::test_case;

    use super::*;

    #[test_case("pep" => (Some(IncodeWatchlistType::Pep), Some(FootprintReasonCode::WatchlistHitPep)))]
    #[test_case("pep-class-2" => (Some(IncodeWatchlistType::PepClass2), Some(FootprintReasonCode::WatchlistHitPep)))]
    #[test_case("sanction" => (Some(IncodeWatchlistType::Sanction), Some(FootprintReasonCode::WatchlistHitOfac)))]
    #[test_case("adverse-media-fraud" => (Some(IncodeWatchlistType::AdverseMediaFraud), Some(FootprintReasonCode::AdverseMediaHit)))]
    #[test_case("adverse-media-v2-terrorism" => (Some(IncodeWatchlistType::AdverseMediaV2Terrorism), Some(FootprintReasonCode::AdverseMediaHit)))]
    #[test_case("yo" => (None, None))]
    fn test_enum(s: &str) -> (Option<IncodeWatchlistType>, Option<FootprintReasonCode>) {
        let t = IncodeWatchlistType::from_str(s).ok();
        (
            t.clone(),
            t.and_then(|tt| Into::<Option<FootprintReasonCode>>::into(&tt)),
        )
    }

    #[test_case(vec![TestHit(55.0, vec!["pep", "sanction"], vec!["name_exact"])] => Vec::<FootprintReasonCode>::new())]
    #[test_case(vec![TestHit(1.7, vec!["pep", "sanction"], vec!["name_exact"])] => vec![FootprintReasonCode::WatchlistHitPep, FootprintReasonCode::WatchlistHitOfac])]
    #[test_case(vec![TestHit(1.7, vec!["pep"], vec!["name_exact"]), TestHit(1.8, vec!["sanction"], vec!["name_exact"])] => vec![FootprintReasonCode::WatchlistHitPep, FootprintReasonCode::WatchlistHitOfac])]
    #[test_case(vec![TestHit(1.7, vec!["pep"], vec!["name_exact"]), TestHit(1.8, vec!["sanction"], vec!["name_exact"]), TestHit(1.9, vec!["sanction"], vec!["name_exact"]), TestHit(2.0, vec!["sanction", "pep"], vec!["name_exact"])] => vec![FootprintReasonCode::WatchlistHitPep, FootprintReasonCode::WatchlistHitOfac])]
    #[test_case(vec![TestHit(1.7, vec!["adverse-media-v2-terrorism"], vec!["name_exact"]), TestHit(1.8, vec!["sanction"], vec!["name_exact"])] => vec![FootprintReasonCode::AdverseMediaHit, FootprintReasonCode::WatchlistHitOfac])]
    #[test_case(vec![TestHit(1.7, vec!["adverse-media-v2-terrorism"], vec!["unknown"]), TestHit(1.8, vec!["sanction"], vec!["name_exact"])] => vec![FootprintReasonCode::WatchlistHitOfac])]
    #[test_case(vec![TestHit(1.7, vec!["adverse-media-v2-terrorism"], vec!["unknown"]), TestHit(1.8, vec!["sanction"], vec!["equivalent_name"])] => Vec::<FootprintReasonCode>::new())]
    #[test_case(vec![TestHit(1.7, vec!["warning", "fitness-probity"], vec!["name_exact"])] => Vec::<FootprintReasonCode>::new())]
    fn test_reason_codes_from_watchlist_result(hits: Vec<TestHit>) -> Vec<FootprintReasonCode> {
        let res = make_watchlist_res(hits);
        reason_codes_from_watchlist_result(
            &res,
            &EnhancedAmlOption::Yes {
                ofac: true,
                pep: true,
                adverse_media: true,
                continuous_monitoring: true,
                adverse_media_lists: None,
            },
        )
    }

    #[test_case(vec![vec!["adverse-media-v2-terrorism"]], EnhancedAmlOption::No => Vec::<FootprintReasonCode>::new())]
    #[test_case(vec![vec!["adverse-media-v2-terrorism"]], EnhancedAmlOption::Yes{ofac: true, pep: true, adverse_media: false, continuous_monitoring: true, adverse_media_lists: None} => Vec::<FootprintReasonCode>::new())]
    #[test_case(vec![vec!["adverse-media-v2-terrorism"]], EnhancedAmlOption::Yes{ofac: true, pep: true, adverse_media: true, continuous_monitoring: true, adverse_media_lists: None} => vec![FootprintReasonCode::AdverseMediaHit])]
    #[test_case(vec![vec!["adverse-media-v2-terrorism"]], EnhancedAmlOption::Yes{ofac: true, pep: true, adverse_media: true, continuous_monitoring: true, adverse_media_lists: Some(vec![])} => Vec::<FootprintReasonCode>::new())]
    #[test_case(vec![vec!["adverse-media-v2-terrorism"]], EnhancedAmlOption::Yes{ofac: true, pep: true, adverse_media: true, continuous_monitoring: true, adverse_media_lists: Some(vec![AdverseMediaListKind::Narcotics])} => Vec::<FootprintReasonCode>::new())]
    #[test_case(vec![vec!["adverse-media-v2-terrorism", "adverse-media-terrorism"], vec!["adverse-media-v2-terrorism", "adverse-media-v2-cybercrime"]], EnhancedAmlOption::Yes{ofac: true, pep: true, adverse_media: true, continuous_monitoring: true, adverse_media_lists: None} => vec![FootprintReasonCode::AdverseMediaHit])]
    #[test_case(vec![vec!["sanction"], vec!["adverse-media-v2-terrorism", "adverse-media-terrorism"], vec!["adverse-media-v2-terrorism", "adverse-media-v2-cybercrime"]], EnhancedAmlOption::Yes{ofac: true, pep: true, adverse_media: true, continuous_monitoring: true, adverse_media_lists: None} => vec![FootprintReasonCode::WatchlistHitOfac, FootprintReasonCode::AdverseMediaHit])]
    #[test_case(vec![vec!["adverse-media-v2-terrorism", "adverse-media-violent-crime"], vec!["adverse-media
    ", "adverse-media-v2-other-serious
    "]], EnhancedAmlOption::Yes{ofac: true, pep: true, adverse_media: true, continuous_monitoring: true, adverse_media_lists: Some(vec![AdverseMediaListKind::FinancialCrime,AdverseMediaListKind::Fraud])} => Vec::<FootprintReasonCode>::new())]
    fn test_reason_codes_from_watchlist_result_am_list_filtering(
        hits: Vec<Vec<&str>>,
        enhanced_aml: EnhancedAmlOption,
    ) -> Vec<FootprintReasonCode> {
        let hits = hits
            .into_iter()
            .map(|h| TestHit(1.3, h, vec!["name_exact"]))
            .collect();
        let res = make_watchlist_res(hits);
        reason_codes_from_watchlist_result(&res, &enhanced_aml)
    }

    struct TestHit<'a>(f32, Vec<&'a str>, Vec<&'a str>);

    fn make_watchlist_res(hits: Vec<TestHit>) -> WatchlistResultResponse {
        let hits = hits
            .into_iter()
            .map(|h| Hit {
                score: Some(h.0),
                is_whitelisted: None,
                match_types: Some(h.2.into_iter().map(String::from).collect()),
                match_type_details: None,
                doc: Some(Doc {
                    aka: None,
                    fields: None,
                    id: None,
                    last_updated_utc: None,
                    media: None,
                    name: None,
                    sources: None,
                    types: Some(h.1.into_iter().map(String::from).collect()),
                }),
            })
            .collect::<Vec<_>>();

        WatchlistResultResponse {
            status: None,
            content: Some(Content {
                data: Some(Data {
                    id: None,
                    ref_: None,
                    filters: None,
                    hits: Some(hits),
                    searcher_id: None,
                    assignee_id: None,
                    match_status: None,
                    risk_level: None,
                    search_term: None,
                    total_hits: None,
                    total_matches: None,
                    updated_at: None,
                    created_at: None,
                    tags: None,
                    limit: None,
                    offset: None,
                    share_url: None,
                }),
            }),
            error: None,
        }
    }
}
