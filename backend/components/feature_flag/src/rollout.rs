use std::hash::{DefaultHasher, Hash, Hasher};

use itertools::Itertools;
use newtypes::Uuid;

/// LaunchDarkly is hugely overkill for boolean flags. We generally just check if a tenant ID,
/// obc key, or user identifier is in a list of values.
/// In order to reduce LaunchDarkly cost, some flags have been migrated to perform this
/// "is in list" operation here instead of on the LaunchDarkly side.
/// This LdRollout struct is the only thing on LaunchDarkly
#[derive(Debug, serde::Serialize, serde::Deserialize, Eq, PartialEq)]
pub(super) struct LdRollout {
    #[serde(default)]
    whitelist: Vec<String>,
    #[serde(default)]
    blacklist: Vec<String>,
    rollout_percentage: u64,
}

impl LdRollout {
    /// Evaluates if the given key is included in the rollout
    pub(super) fn evaluate(&self, key: Option<String>) -> bool {
        self.evaluate_inner(key, 100)
    }

    /// Evaluates if the given key is included in the rollout
    pub fn evaluate_inner(&self, key: Option<String>, max_rollout_percentage: u64) -> bool {
        // If no stable key is provided, generate a random identifier so we can take advantage of
        // percentage rollouts
        let key = key.unwrap_or_else(|| Uuid::new_v4().to_string());
        if self.whitelist.contains(&key) {
            return true;
        }
        if self.blacklist.contains(&key) {
            return false;
        }

        // Otherwise, hash the key and see if the user is in the rollout percentage
        let mut h_key = DefaultHasher::new();
        key.hash(&mut h_key);
        let h_key = h_key.finish();
        if max_rollout_percentage == 0 {
            // Don't allow this to panic
            false
        } else {
            h_key % max_rollout_percentage < self.rollout_percentage
        }
    }
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Eq, PartialEq)]
struct JsonLdRolloutVariant {
    value: serde_json::Value,
    #[serde(flatten)]
    rollout: LdRollout,
}

/// For JSON flags, this representation supports serving different JSON values in different rollouts
#[derive(serde::Serialize, serde::Deserialize, Default)]
pub(super) struct JsonLdRollout(Vec<JsonLdRolloutVariant>);

impl JsonLdRollout {
    pub(super) fn evaluate(self, key: Option<String>) -> Option<serde_json::Value> {
        // Filter out variants that are blacklisted and only evaluate the remaining possible variants
        let options = self
            .0
            .into_iter()
            .filter(|v| !key.as_ref().is_some_and(|k| v.rollout.blacklist.contains(k)))
            .collect_vec();
        // Since we can't validate that the rollout percentages add up to 100, just hash modulo
        // the total rollout percentage
        let total_rollout_percentage = options.iter().map(|v| v.rollout.rollout_percentage).sum();
        // Evaluate each variant in order and return the first variant that matches
        options
            .into_iter()
            .find(|v| v.rollout.evaluate_inner(key.clone(), total_rollout_percentage))
            .map(|v| v.value)
    }
}

#[cfg(test)]
mod test {
    use super::{JsonLdRollout, JsonLdRolloutVariant, LdRollout};
    use serde_json::json;
    use test_case::test_case;

    #[test_case(LdRollout{whitelist: vec![], blacklist: vec![], rollout_percentage: 0}, None => false)]
    #[test_case(LdRollout{whitelist: vec![], blacklist: vec![], rollout_percentage: 100}, None => true)]
    #[test_case(LdRollout{whitelist: vec![], blacklist: vec![], rollout_percentage: 100}, Some("flerp".into()) => true)]
    #[test_case(LdRollout{whitelist: vec!["flerp".into()], blacklist: vec![], rollout_percentage: 0}, Some("flerp".into()) => true)]
    #[test_case(LdRollout{whitelist: vec!["flerp".into()], blacklist: vec![], rollout_percentage: 0}, Some("derp".into()) => false)]
    #[test_case(LdRollout{whitelist: vec![], blacklist: vec!["flerp".into()], rollout_percentage: 100}, Some("flerp".into()) => false)]
    #[test_case(LdRollout{whitelist: vec![], blacklist: vec!["flerp".into()], rollout_percentage: 100}, Some("derp".into()) => true)]
    fn test_evaluate(rollout: LdRollout, key: Option<String>) -> bool {
        rollout.evaluate(key)
    }

    fn json_rollout(
        value: serde_json::Value,
        percentage: u64,
        whitelist: Option<&str>,
        blacklist: Option<&str>,
    ) -> JsonLdRolloutVariant {
        JsonLdRolloutVariant {
            value,
            rollout: LdRollout {
                whitelist: whitelist.map(|s| vec![s.into()]).unwrap_or_default(),
                blacklist: blacklist.map(|s| vec![s.into()]).unwrap_or_default(),
                rollout_percentage: percentage,
            },
        }
    }

    #[test_case(vec![json_rollout(json!({"flerp": "derp"}), 100, None, None)] => Some(json!({"flerp": "derp"})))]
    #[test_case(vec![json_rollout(json!(["first"]), 100, None, Some("key")), json_rollout(json!(["second"]), 100, None, None)] => Some(json!(["second"])))]
    #[test_case(vec![json_rollout(json!(["first"]), 0, Some("key"), None), json_rollout(json!(["second"]), 50, None, None)] => Some(json!(["first"])); "takes_first_matching_variant")]
    #[test_case(vec![json_rollout(json!(["first"]), 50, None, Some("key")), json_rollout(json!(["second"]), 50, None, Some("key"))] => None; "no_matching_variants")]
    #[test_case(vec![json_rollout(json!(["first"]), 50, None, Some("key")), json_rollout(json!(["second"]), 0, None, None)] => None; "no_matching_variants_one_blacklist")]
    #[test_case(vec![] => None)]
    fn test_evaluate_json(variants: Vec<JsonLdRolloutVariant>) -> Option<serde_json::Value> {
        JsonLdRollout(variants).evaluate(Some("key".into()))
    }

    #[test]
    fn test_deser_json_ld_rollout() {
        // Make sure the serde(flatten) works properly
        let serialized = json!({
            "value": ["my", "special", "value"],
            "rollout_percentage": 10,
            "blacklist": ["key"],
        });
        let deserialized: JsonLdRolloutVariant = serde_json::from_value(serialized).unwrap();
        assert_eq!(
            deserialized,
            json_rollout(json!(["my", "special", "value"]), 10, None, Some("key"))
        );
    }
}
