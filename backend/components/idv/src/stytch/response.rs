use serde::*;

// TODO

#[derive(Debug, Clone, Deserialize)]
pub struct LookupResponse {
    pub telemetry_id: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_parse() {
        let json = json!({
            "telemetry_id": "abc_123",
        });
        let parsed: LookupResponse = serde_json::from_value(json).unwrap();
        assert_eq!("abc_123".to_owned(), parsed.telemetry_id);
    }
}
