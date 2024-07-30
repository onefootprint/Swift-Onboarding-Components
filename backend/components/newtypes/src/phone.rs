use serde::Serialize;
use strum_macros::Display;

#[derive(Debug, Clone, Copy, Serialize, Display)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum TwilioLookupField {
    CallerName,
    SimSwap,
    CallForwarding,
    LiveActivity,
    LineTypeIntelligence,
}

#[cfg(test)]
mod tests {
    use super::*;
    use itertools::Itertools;
    #[test]
    fn test_display() {
        let s: String = [
            TwilioLookupField::LineTypeIntelligence,
            TwilioLookupField::CallerName,
        ]
        .iter()
        .map(|s| s.to_string())
        .collect_vec()
        .join(",");
        assert_eq!(s, "line_type_intelligence,caller_name".to_string());
    }
}
