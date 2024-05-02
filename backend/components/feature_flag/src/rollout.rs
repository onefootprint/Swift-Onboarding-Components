use std::hash::{DefaultHasher, Hash, Hasher};

use newtypes::Uuid;

use crate::Error;

/// LaunchDarkly is hugely overkill for boolean flags. We generally just check if a tenant ID,
/// obc key, or user identifier is in a list of values.
/// In order to reduce LaunchDarkly cost, some flags have been migrated to perform this
/// "is in list" operation here instead of on the LaunchDarkly side.
/// This LdRollout struct is the only thing on LaunchDarkly
#[derive(serde::Serialize, serde::Deserialize)]
pub(super) struct LdRollout {
    #[serde(default)]
    whitelist: Vec<String>,
    #[serde(default)]
    blacklist: Vec<String>,
    rollout_percentage: u64,
}

impl LdRollout {
    /// Fallback value for a LdRollout when launch darkly is not available
    pub(super) fn default(value: bool) -> Result<serde_json::Value, Error> {
        let rollout = Self {
            whitelist: vec![],
            blacklist: vec![],
            rollout_percentage: if value { 100 } else { 0 },
        };
        let default = serde_json::to_value(rollout)?;
        Ok(default)
    }

    /// Evaluates if the given key is included in the rollout
    pub(super) fn evaluate(&self, key: Option<String>) -> bool {
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
        h_key % 100 < self.rollout_percentage
    }
}

#[cfg(test)]
mod test {
    use super::LdRollout;
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

    #[test_case(true)]
    #[test_case(false)]
    fn test_default(default: bool) {
        let v = LdRollout::default(default).unwrap();
        let rollout: LdRollout = serde_json::from_value(v).unwrap();
        assert_eq!(rollout.evaluate(None), default);
        assert_eq!(rollout.evaluate(Some("flerp".into())), default);
    }
}
