use api_wire_types::{
    FieldValidation,
    FieldValidationDetail,
};
use itertools::Itertools;
use newtypes::decision::MatchLevel;
use newtypes::{
    FootprintReasonCode,
    SignalScope,
};
use std::collections::HashMap;

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
            acc.entry(scope).or_default().push(fvd);
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
    use crate::decision::field_validations::create_field_validation_results;
    use db::test_helpers::have_same_elements;
    use newtypes::{
        ExperianAddressAndNameMatchReasonCodes,
        ExperianDobMatchReasonCodes,
        FootprintReasonCode,
        MatchLevel,
        SignalScope,
    };
    use test_case::test_case;

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

    fn create_reason_codes_for_experian(
        name_and_address: ExperianAddressAndNameMatchReasonCodes,
        dob: ExperianDobMatchReasonCodes,
    ) -> Vec<FootprintReasonCode> {
        let mut n: Vec<FootprintReasonCode> = (&name_and_address).into();
        let dob: Option<FootprintReasonCode> = (&dob).into();

        n.push(dob.unwrap());

        n
    }
    #[test_case(ExperianAddressAndNameMatchReasonCodes::A1, ExperianDobMatchReasonCodes::Match => (MatchLevel::Exact, MatchLevel::Exact, MatchLevel::Exact))]
    #[test_case(ExperianAddressAndNameMatchReasonCodes::H1, ExperianDobMatchReasonCodes::Match => (MatchLevel::Exact, MatchLevel::Exact, MatchLevel::Exact))]
    #[test_case(ExperianAddressAndNameMatchReasonCodes::Q1, ExperianDobMatchReasonCodes::Match => (MatchLevel::Exact, MatchLevel::Exact, MatchLevel::Exact))]
    #[test_case(ExperianAddressAndNameMatchReasonCodes::A1, ExperianDobMatchReasonCodes::PartialMatch => (MatchLevel::Exact, MatchLevel::Exact, MatchLevel::Partial))]
    #[test_case(ExperianAddressAndNameMatchReasonCodes::A1, ExperianDobMatchReasonCodes::NoMatch => (MatchLevel::Exact, MatchLevel::Exact, MatchLevel::NoMatch))]
    #[test_case(ExperianAddressAndNameMatchReasonCodes::C8, ExperianDobMatchReasonCodes::Match => (MatchLevel::Partial, MatchLevel::NoMatch, MatchLevel::Exact))]
    #[test_case(ExperianAddressAndNameMatchReasonCodes::D1, ExperianDobMatchReasonCodes::PartialMatch => (MatchLevel::Partial, MatchLevel::Exact, MatchLevel::Partial))]
    fn test_experian_field_validations(
        name_and_address: ExperianAddressAndNameMatchReasonCodes,
        dob: ExperianDobMatchReasonCodes,
    ) -> (MatchLevel, MatchLevel, MatchLevel) {
        let res = create_field_validation_results(create_reason_codes_for_experian(name_and_address, dob));

        (
            res.get(&SignalScope::Name).unwrap().match_level,
            res.get(&SignalScope::Address).unwrap().match_level,
            res.get(&SignalScope::Dob).unwrap().match_level,
        )
    }
}
