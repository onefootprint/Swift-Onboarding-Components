use derive_more::Deref;
use itertools::Itertools;
use std::fmt::{
    Debug,
    Display,
};

/// Wraps a Vec<T> with a display implementation that joins Vec<T> with a ", ", using T's display
/// implementation
#[derive(Clone, Hash, PartialEq, Eq, Default, Deref)]
pub struct Csv<T>(pub Vec<T>);

impl<T> From<Vec<T>> for Csv<T> {
    fn from(value: Vec<T>) -> Self {
        Self(value)
    }
}

impl<T: Display> Display for Csv<T> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0.iter().map(|i| i.to_string()).join(", "))
    }
}

impl<T: Debug> Debug for Csv<T> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0.iter().map(|i| format!("{:?}", i)).join(", "))
    }
}

#[cfg(test)]
mod tests {
    use super::Csv;
    use crate::IdentityDataKind;

    #[test]
    fn test_display() {
        let csv = Csv(vec![IdentityDataKind::Email, IdentityDataKind::PhoneNumber]);
        let csv_str = format!("{}", csv);
        assert_eq!(csv_str, "email, phone_number");
    }
}
