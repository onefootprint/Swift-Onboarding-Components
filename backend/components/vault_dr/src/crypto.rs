use super::error::Error;
use age::secrecy::ExposeSecret;
use age::secrecy::SecretString;
use age::secrecy::Zeroize;
use std::io::Write;
use std::str::FromStr;


pub struct PublicKey {
    recipient: age::x25519::Recipient,
}

impl FromStr for PublicKey {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self {
            recipient: age::x25519::Recipient::from_str(s)
                .map_err(|err| Error::InvalidAgeIdentity(err.to_owned()))?,
        })
    }
}

impl ToString for PublicKey {
    fn to_string(&self) -> String {
        self.recipient.to_string()
    }
}

impl PublicKey {
    fn encrypt_armored(&self, plaintext: &[u8]) -> Result<String, Error> {
        let encryptor = age::Encryptor::with_recipients(vec![Box::new(self.recipient.clone())])
            .ok_or(Error::Age("given recipient vec is not empty".to_owned()))?;

        let mut encrypted = vec![];
        let mut writer = encryptor.wrap_output(age::armor::ArmoredWriter::wrap_output(
            &mut encrypted,
            age::armor::Format::AsciiArmor,
        )?)?;

        writer.write_all(plaintext)?;

        let armored_writer = writer.finish()?;
        armored_writer.finish()?;

        Ok(String::from_utf8(encrypted)?)
    }

    // We ASCII armor wrapped keys so they are easy to transfer to the tenant.
    fn wrap_key(&self, inner_key: &age::x25519::Identity) -> Result<WrappedKey, Error> {
        let mut payload = inner_key.to_string().expose_secret().clone().into_bytes();

        let wrapped = self.encrypt_armored(&payload)?;
        payload.zeroize();

        Ok(WrappedKey(SecretString::new(wrapped)))
    }
}

#[derive(derive_more::Deref)]
pub struct WrappedKey(SecretString);

pub struct EnrollmentKeys {
    pub recovery_public_key: String,
    pub wrapped_recovery_key: WrappedKey,
}

impl EnrollmentKeys {
    pub fn generate(org_public_key: &PublicKey) -> Result<Self, Error> {
        let recovery_identity = age::x25519::Identity::generate();
        let recovery_public_key = recovery_identity.to_public();

        let wrapped_recovery_key = org_public_key.wrap_key(&recovery_identity)?;

        // We immediately discard the recovery private key.
        //
        // The recovery private key is never stored unencrypted, and Footprint is not able to
        // decrypt the wrapped recovery key since the org private key is generated by the tenant.

        Ok(Self {
            recovery_public_key: recovery_public_key.to_string(),
            wrapped_recovery_key,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_enrollment_keys() {
        let org_pubkey_str = "age12w83tzg054rhcrx32ludwxxkk0jj4d9mtmvufmmjv3utm97xdu7szgg538";
        let org_pubkey = PublicKey::from_str(org_pubkey_str).unwrap();

        let EnrollmentKeys {
            recovery_public_key,
            wrapped_recovery_key,
        } = EnrollmentKeys::generate(&org_pubkey).unwrap();

        let wrapped_recovery_key = wrapped_recovery_key.expose_secret();

        PublicKey::from_str(&recovery_public_key).unwrap();

        assert!(wrapped_recovery_key.starts_with("-----BEGIN AGE ENCRYPTED FILE-----\n"));
        assert!(wrapped_recovery_key.ends_with("\n-----END AGE ENCRYPTED FILE-----\n"));
    }
}
