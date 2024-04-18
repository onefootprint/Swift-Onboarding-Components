use std::cmp::Ordering;

use newtypes::{DecisionStatus, RuleAction};
use serde::Serialize;

#[derive(PartialEq, Eq, Debug, Clone, Serialize)]
pub struct Decision {
    pub decision_status: DecisionStatus,
    pub should_commit: bool,
    pub create_manual_review: bool,
    pub action: Option<RuleAction>,
}

// Note: follows the same convention as DecisionStatus, which has more egregious things as Ordering::Less
// This is tested
impl Ord for Decision {
    fn cmp(&self, other: &Self) -> Ordering {
        let ord = self.decision_status.cmp(&other.decision_status);

        // tie breaker is manual review
        match ord {
            Ordering::Equal => {
                // we have special logic for failure
                let decision_is_fail = self.decision_status == DecisionStatus::Fail;

                match (self.create_manual_review, other.create_manual_review) {
                    (true, true) => Ordering::Equal,
                    (true, false) => {
                        if decision_is_fail {
                            Ordering::Greater
                        } else {
                            Ordering::Less
                        }
                    }
                    (false, true) => {
                        if decision_is_fail {
                            Ordering::Less
                        } else {
                            Ordering::Greater
                        }
                    }
                    (false, false) => Ordering::Equal,
                }
            }
            _ => ord,
        }
    }
}

impl PartialOrd for Decision {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use super::Decision;
    use newtypes::DecisionStatus;
    use std::cmp::Ordering;

    // LESS is the one that we'll choose
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::Fail, false) => Ordering::Greater; "both fail, one without review is greater")]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::Fail, true) => Ordering::Less; "both fail, one without review is less")]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::Fail, false) => Ordering::Equal; "both fail, both no review")]
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::Fail, true) => Ordering::Equal; "both fail, both review")]
    // Pass
    #[test_case((DecisionStatus::Pass, true), (DecisionStatus::Pass, false) => Ordering::Less; "both pass, one without review is less")]
    #[test_case((DecisionStatus::Pass, false), (DecisionStatus::Pass, true) => Ordering::Greater; "both pass, one without review is greater")]
    #[test_case((DecisionStatus::Pass, false), (DecisionStatus::Pass, false) => Ordering::Equal; "both pass, both no review")]
    #[test_case((DecisionStatus::Pass, true), (DecisionStatus::Pass, true) => Ordering::Equal; "both pass, both review")]
    // Step up
    #[test_case((DecisionStatus::StepUp, true), (DecisionStatus::StepUp, false) => Ordering::Less)]
    #[test_case((DecisionStatus::StepUp, false), (DecisionStatus::StepUp, true) => Ordering::Greater)]
    #[test_case((DecisionStatus::StepUp, false), (DecisionStatus::StepUp, false) => Ordering::Equal)]
    #[test_case((DecisionStatus::StepUp, true), (DecisionStatus::StepUp, true) => Ordering::Equal)]
    // Ordered based on decision
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::Pass, false) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::Pass, true) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::Pass, false) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::Pass, true) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::StepUp, false) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::StepUp, true) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::StepUp, false) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::StepUp, true) => Ordering::Less)]
    #[test_case((DecisionStatus::StepUp, true), (DecisionStatus::Pass, false) => Ordering::Less)]
    #[test_case((DecisionStatus::StepUp, false), (DecisionStatus::Pass, true) => Ordering::Less)]
    #[test_case((DecisionStatus::StepUp, false), (DecisionStatus::Pass, false) => Ordering::Less)]
    #[test_case((DecisionStatus::StepUp, true), (DecisionStatus::Pass, true) => Ordering::Less)]

    fn test_ord_decision(d_args_1: (DecisionStatus, bool), d_args_2: (DecisionStatus, bool)) -> Ordering {
        let decision1 = Decision {
            decision_status: d_args_1.0,
            should_commit: false,
            create_manual_review: d_args_1.1,
            action: None,
        };

        let decision2 = Decision {
            decision_status: d_args_2.0,
            should_commit: false,
            create_manual_review: d_args_2.1,
            action: None,
        };

        decision1.cmp(&decision2)
    }
}
