use std::collections::HashMap;

use api_wire_types::{FieldValidation, FieldValidationDetail};
use itertools::Itertools;
use newtypes::{decision::MatchLevel, FootprintReasonCode, SignalScope};

pub fn create_field_validation_results(
    reason_codes: Vec<FootprintReasonCode>,
) -> HashMap<SignalScope, FieldValidation> {
    let rs: HashMap<SignalScope, Vec<FieldValidationDetail>> = reason_codes
        .iter()
        .filter_map(|r| {
            r.scope().and_then(|ms| {
                r.match_level().map(|ml| {
                    let fvd = FieldValidationDetail {
                        reason_code: r.clone(),
                        note: r.note(),
                        description: r.description(),
                        severity: r.severity(),
                        match_level: ml,
                    };

                    (ms, fvd)
                })
            })
        })
        .fold(HashMap::new(), |mut acc, (scope, fvd)| {
            acc.entry(scope).or_insert(Vec::new()).push(fvd);
            acc
        });

    rs.into_iter()
        .map(|(k, v)| {
            let sorted_signals: Vec<FieldValidationDetail> = v
                .into_iter()
                // sort by match level, less matching -> most matching
                .sorted_by(|x, y| x.match_level.cmp(&y.match_level))
                .collect();
            let match_level = sorted_signals
                .first()
                .map(|f| f.match_level)
                .unwrap_or(MatchLevel::CouldNotMatch);
            (
                k,
                FieldValidation {
                    match_level,
                    signals: sorted_signals,
                },
            )
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use db::test_helpers::have_same_elements;
    use newtypes::{FootprintReasonCode, MatchLevel, SignalScope};

    use crate::decision::field_validations::create_field_validation_results;

    #[test]
    fn test_field_validation() {
        let reason_codes = vec![
            // no match
            FootprintReasonCode::SsnDoesNotMatch,
            // match
            FootprintReasonCode::NameLastMatches,
            // partial, but we should prioritze no match for same signal scope
            FootprintReasonCode::SsnDoesNotMatchWithin1Digit,
            // no matching for these ones
            FootprintReasonCode::IpAlertHighRiskBot,
            FootprintReasonCode::WatchlistHitOfac,
            FootprintReasonCode::BusinessNameWatchlistHit,
        ];
        let result = create_field_validation_results(reason_codes);

        // Only expect keys for FPRs that have match levels defined
        assert_eq!(result.keys().len(), 2);

        // SSN has a partial + no match, should prioritize min(match_level)
        let ssn_res = result.get(&SignalScope::Ssn).unwrap();
        assert_eq!(ssn_res.match_level, MatchLevel::NoMatch);
        // Retain all reason codes for a signal scope
        assert!(have_same_elements(
            vec![
                FootprintReasonCode::SsnDoesNotMatch,
                FootprintReasonCode::SsnDoesNotMatchWithin1Digit,
            ],
            ssn_res.signals.iter().map(|s| s.reason_code.clone()).collect(),
        ));

        // Name matches
        assert_eq!(
            result.get(&SignalScope::Name).unwrap().match_level,
            MatchLevel::Exact
        );
    }
}
