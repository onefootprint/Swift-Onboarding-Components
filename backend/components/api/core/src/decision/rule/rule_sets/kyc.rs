use crate::decision::rule::rule_set::Rule;
use newtypes::{RuleAction, RuleName};

use newtypes::FootprintReasonCode as FRC;
const SSN_DOES_NOT_EXACTLY_MATCH_CODES: [FRC; 2] = [FRC::SsnDoesNotMatch, FRC::SsnPartiallyMatches];

pub fn kyc_rules() -> Vec<Rule<Vec<FRC>>> {
    vec![
        Rule {
            rule: |f: &Vec<FRC>| f.contains(&FRC::IdNotLocated),
            name: RuleName::IdNotLocated,
            action: RuleAction::Fail,
        },
        Rule {
            rule: |f: &Vec<FRC>| f.contains(&FRC::IdFlagged),
            name: RuleName::IdFlagged,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FRC>| f.iter().any(|frc| SSN_DOES_NOT_EXACTLY_MATCH_CODES.contains(frc)) },
            name: RuleName::SsnDoesNotMatch,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::SsnNotProvided) },
            name: RuleName::SsnNotProvided,
            action: RuleAction::ManualReview,
        },
        //
        // IDOLOGY RULES
        //
        // If we don't have a located identity, we should fail
        //
        // These rules fire when the id is located, but there's red flags
        //
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::SubjectDeceased) },
            name: RuleName::SubjectDeceased,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::AddressInputIsPoBox) },
            name: RuleName::AddressInputIsPoBox,
            action: RuleAction::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::DobLocatedCoppaAlert) },
            name: RuleName::CoppaAlert,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::SsnInputIsInvalid) },
            name: RuleName::SsnInputIsInvalid,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::SsnLocatedIsInvalid) },
            name: RuleName::SsnLocatedIsInvalid,
            action: RuleAction::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::MultipleRecordsFound) },
            name: RuleName::MultipleRecordsFound,
            action: RuleAction::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::SsnIssuedPriorToDob) },
            name: RuleName::SsnIssuedPriorToDob,
            action: RuleAction::Fail,
        },
    ]
}
