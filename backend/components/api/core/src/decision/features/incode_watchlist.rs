use idv::incode::watchlist::response::{Hit, WatchlistResultResponse};
use itertools::Itertools;
use newtypes::{vendor_reason_code_enum, FootprintReasonCode};
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
        Err(e) => {
            tracing::error!(error=?e, s=s, "Could not parse IncodeWatchlistType");
            None
        }
    }
}

// TODO: probably remove filtering on `score` based on last chat w/ Incode
pub fn get_hits(res: &WatchlistResultResponse) -> Vec<Hit> {
    let hits = res
        .content
        .as_ref()
        .and_then(|o| o.data.as_ref())
        .and_then(|o| o.hits.as_ref())
        .cloned()
        .unwrap_or_default();

    hits.into_iter()
        .filter(|h| h.score.map(|s| s < SCORE_THRESHOLD_FOR_HIT).unwrap_or(false))
        .collect()
}

pub fn reason_codes_from_watchlist_result(res: &WatchlistResultResponse) -> Vec<FootprintReasonCode> {
    let unique_types_for_valid_hits = get_hits(res)
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

    #[test_case(vec![(55.0, vec!["pep", "sanction"])] => Vec::<FootprintReasonCode>::new())]
    #[test_case(vec![(1.7, vec!["pep", "sanction"])] => vec![FootprintReasonCode::WatchlistHitPep, FootprintReasonCode::WatchlistHitOfac])]
    #[test_case(vec![(1.7, vec!["pep"]), (1.8, vec!["sanction"])] => vec![FootprintReasonCode::WatchlistHitPep, FootprintReasonCode::WatchlistHitOfac])]
    #[test_case(vec![(1.7, vec!["pep"]), (1.8, vec!["sanction"]), (1.9, vec!["sanction"]), (2.0, vec!["sanction", "pep"])] => vec![FootprintReasonCode::WatchlistHitPep, FootprintReasonCode::WatchlistHitOfac])]
    #[test_case(vec![(1.7, vec!["adverse-media-v2-terrorism"]), (1.8, vec!["sanction"])] => vec![FootprintReasonCode::AdverseMediaHit, FootprintReasonCode::WatchlistHitOfac])]

    fn test_reason_codes_from_watchlist_result(hits: Vec<(f32, Vec<&str>)>) -> Vec<FootprintReasonCode> {
        let res = make_watchlist_res(hits);
        reason_codes_from_watchlist_result(&res)
    }

    fn make_watchlist_res(hits: Vec<(f32, Vec<&str>)>) -> WatchlistResultResponse {
        let hits = hits
            .into_iter()
            .map(|(score, types)| Hit {
                score: Some(score),
                is_whitelisted: None,
                match_types: None,
                match_type_details: None,
                doc: Some(Doc {
                    aka: None,
                    fields: None,
                    id: None,
                    last_updated_utc: None,
                    media: None,
                    name: None,
                    sources: None,
                    types: Some(types.into_iter().map(String::from).collect()),
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
