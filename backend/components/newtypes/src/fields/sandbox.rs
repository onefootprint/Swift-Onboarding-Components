use crate::SandboxId;
use std::collections::HashSet;

impl SandboxId {
    pub fn new() -> Self {
        Self::from(crypto::random::gen_random_alphanumeric_code(10))
    }

    pub fn parse(s: &str) -> Result<Self, crate::Error> {
        // "sandbox suffix" must match [a-zA-Z0-9_]+
        let allowed_characters = HashSet::<char>::from_iter(['_']);
        if s.is_empty()
            || !s
                .chars()
                .all(|x| x.is_alphanumeric() || allowed_characters.contains(&x))
        {
            return Err(crate::Error::InvalidSandboxSuffix);
        }
        Ok(SandboxId::from(s.to_string()))
    }
}
