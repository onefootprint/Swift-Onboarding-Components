use age::secrecy::SecretString;

pub struct OrgIdentity {
    identity: age::x25519::Identity,
}

impl OrgIdentity {
    pub fn generate() -> Self {
        Self {
            identity: age::x25519::Identity::generate(),
        }
    }

    pub fn public_key_string(&self) -> String {
        self.identity.to_public().to_string()
    }

    pub fn private_key_string(&self) -> SecretString {
        self.identity.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use age::secrecy::ExposeSecret;

    #[test]
    fn test_org_identity() {
        let org_identity = OrgIdentity::generate();

        let public_key = org_identity.public_key_string();
        assert!(public_key.starts_with("age"));

        let private_key = org_identity.private_key_string();
        assert!(private_key.expose_secret().starts_with("AGE-SECRET-KEY"));
    }
}
