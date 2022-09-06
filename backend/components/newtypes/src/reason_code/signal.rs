use crate::DataAttribute;

#[derive(Debug, Clone, Copy, Ord, PartialOrd, Eq, PartialEq)]
pub enum SignalKind {
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

pub enum SignalAttribute {
    General,
    DataAttribute(DataAttribute),
}

pub struct Signal {
    pub kind: SignalKind,
    // TODO one day use more representative SignalAttribute
    pub attributes: Vec<DataAttribute>,
}

#[cfg(test)]
mod tests {
    use std::cmp::Ordering;
    use test_case::test_case;

    use super::SignalKind;
    use super::SignalKind::*;

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
    fn test_cmp(a: SignalKind, b: SignalKind) -> Ordering {
        // We use the enum variant ordering to determine the highest priority signal for an attribute,
        // so add some tests that this doesn't change
        a.cmp(&b)
    }
}
