use crate::SignalScope;
use paperclip::actix::Apiv2Schema;

use serde::{Deserialize, Serialize};
use strum_macros::Display;

#[derive(
    Debug, Display, Clone, Copy, Ord, PartialOrd, Eq, PartialEq, Apiv2Schema, Serialize, Deserialize,
)]
pub enum OldSignalSeverity {
    TODO,
    // Basically can ignore this information - it carries no weight
    NotImportant,
    // Can ignore for the purpose of fraud, but is useful to know
    Info,
    // This piece of data could not be located for the matched identity
    NotFound,
    // Input data was invalid
    InvalidRequest,
    // General indicator of some risk. Higher values are more risky
    Alert(u32),
    // General indicator of high likelihood of fraud. Higher values are more risky
    Fraud(u32),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Signal {
    pub kind: OldSignalSeverity,
    pub scopes: Vec<SignalScope>,
    pub note: String,
}

#[cfg(test)]
mod tests {
    use std::cmp::Ordering;
    use test_case::test_case;

    use super::OldSignalSeverity;
    use super::OldSignalSeverity::*;

    #[test_case(TODO, NotImportant => Ordering::Less)]
    #[test_case(NotImportant, Info => Ordering::Less)]
    #[test_case(Info, NotFound => Ordering::Less)]
    #[test_case(NotFound, InvalidRequest => Ordering::Less)]
    #[test_case(Info, Alert(1) => Ordering::Less)]
    #[test_case(Alert(1), Fraud(1) => Ordering::Less)]
    #[test_case(Alert(1), Alert(3) => Ordering::Less)]
    #[test_case(Alert(1), Alert(1) => Ordering::Equal)]
    #[test_case(Fraud(5), Fraud(1) => Ordering::Greater)]
    #[test_case(Alert(500), Fraud(1) => Ordering::Less)]
    fn test_cmp(a: OldSignalSeverity, b: OldSignalSeverity) -> Ordering {
        // We use the enum variant ordering to determine the highest priority signal for an attribute,
        // so add some tests that this doesn't change
        a.cmp(&b)
    }
}
