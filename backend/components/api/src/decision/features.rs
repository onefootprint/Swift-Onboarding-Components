/// This module is for taking parsed responses from vendors and transforming them into a FeatureVector
/// we can use to make decisions
use idv::{idology::verification::IDologySuccess, ParsedResponse, VendorResponse};

use newtypes::{OnboardingStatus, Signal, SignalScope};

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq)]
pub struct IDologyFeatures {
    pub status: OnboardingStatus,
    pub verification_attributes: Vec<SignalScope>,
    pub signals: Vec<Signal>,
    pub id_located: bool,
    pub id_number_for_scan_required: Option<String>,
    pub is_id_scan_required: bool,
}

impl IDologyFeatures {
    fn signals_from_response_qualifiers(response: IDologySuccess) -> Vec<Signal> {
        let qualifiers = response.parse_qualifiers();

        // TODO move this logic into decision engine
        qualifiers.into_iter().map(|r| r.signal()).collect()
    }
}

// TODO!
#[derive(Clone)]
pub struct TwilioFeatures;

#[derive(Clone, Default)]
pub struct FeatureVector {
    pub idology_features: Option<IDologyFeatures>,
    pub twilio_features: Option<TwilioFeatures>,
}

impl FeatureVector {
    fn merge(&self, other: FeatureVector) -> Self {
        Self {
            idology_features: self.idology_features.clone().or(other.idology_features),
            twilio_features: self.twilio_features.clone().or(other.twilio_features),
        }
    }
}

impl FeatureVector {
    // A helper to expose all the top level statuses from the individual vendors
    pub fn statuses(&self) -> Vec<Option<OnboardingStatus>> {
        let idology_status = self.idology_features.as_ref().map(|i| i.status);
        vec![idology_status]
    }
}

impl From<VendorResponse> for FeatureVector {
    fn from(response: VendorResponse) -> Self {
        match response.response {
            ParsedResponse::IDology(resp) => {
                let r = resp.response;

                let idology_features = IDologyFeatures {
                    status: r.status(),
                    id_located: r.id_located(),
                    is_id_scan_required: r.is_id_scan_required(),
                    id_number_for_scan_required: r.id_number.clone(),
                    signals: IDologyFeatures::signals_from_response_qualifiers(r),
                    // These represent the signal scopes we have information about from the verification
                    verification_attributes: response.verification_attributes,
                };
                Self {
                    idology_features: Some(idology_features),
                    twilio_features: None,
                }
            }
            // TODO!
            ParsedResponse::Twilio(_) => Self {
                idology_features: None,
                twilio_features: Some(TwilioFeatures {}),
            },
        }
    }
}

// From an array of VendorResponses, create our FeatureVector
// 2022-10-15: This won't be the way we do this forever, but let's start here and revisit as we have a better idea on how we want
//   to aggregate and compute features. once we have more complex features and scoring (aggregations/models and so on) we'll likely want a separate
//   risk features/scoring service
pub fn create_features(responses: Vec<VendorResponse>) -> FeatureVector {
    let base_features = FeatureVector::default();

    responses
        .into_iter()
        .fold(base_features, |acc, v| acc.merge(FeatureVector::from(v)))
}

mod helpers {
    use itertools::Itertools;
    use levenshtein::levenshtein;

    #[allow(dead_code)] // temp
    pub(super) fn smart_name_distance(name1: &str, name2: &str) -> Option<usize> {
        let clean_and_split = |s: &str| -> Vec<String> {
            let s = s.trim().to_uppercase();
            s.split(' ')
                .map(|x| x.chars().filter(|c| c.is_alphanumeric()).collect::<String>())
                .collect()
        };
        let name1_parts = clean_and_split(name1);
        let name2_parts = clean_and_split(name2);

        if name1_parts.len() < 2 || name2_parts.len() < 2 {
            return None;
        }

        // Where N is the number of words in name1, select all length-N permutations of name2_parts.
        // Choose the permutation that yields the smallest levenshtein difference.
        // This has a few benefits:
        // - We ignore differences in the ordering of names
        // - We remove extra names from name2, like a middle name
        name2_parts
            .into_iter()
            .permutations(name1_parts.len())
            .map(|name2_parts| {
                // Calculate the sum of levenshtein difference between parts of name1 and name2 zipped
                name2_parts
                    .iter()
                    .zip(name1_parts.iter())
                    .map(|(x, y)| levenshtein(x, y))
                    .sum()
            })
            .min()
    }
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use super::helpers::smart_name_distance;

    #[test_case("elliott forde", "ElLioTt ForDe" => Some(0))]
    #[test_case("elliott forde", "FORDE, ELLIOTT" => Some(0))]
    #[test_case("elliott forde", "FORDE ELLIOT" => Some(1))]
    #[test_case("elliott forde", "FORDE ELLIOTT VETLE" => Some(0))]
    #[test_case("forde elliott", "ELLIOTT FORDE VETLE" => Some(0))]
    #[test_case("elliott forde", "CONRAD FORDE" => Some(7))]
    #[test_case("elliott", "elliott forde" => None)]
    #[test_case("elliott forde", "elliott" => None)]
    #[test_case("elliott forde", "" => None)]
    fn test_good_emails(name1: &str, name2: &str) -> Option<usize> {
        smart_name_distance(name1, name2)
    }
}
