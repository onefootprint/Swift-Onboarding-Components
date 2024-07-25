use super::error::Error;
use age::secrecy::ExposeSecret;
use age::secrecy::SecretString;
use age::secrecy::Zeroize;
use bech32::FromBase32;
use itertools::Itertools;
use newtypes::PiiString;
use std::fmt::Display;
use std::io::Write;
use std::str::FromStr;

mod integration_tests;
mod p256;
mod piv_format;

pub trait AgeEncryptor {
    fn recipients(&self) -> Vec<Box<dyn age::Recipient + Send>>;

    fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>, Error> {
        let encryptor = age::Encryptor::with_recipients(self.recipients())
            .ok_or(Error::Age("given recipient vec is empty".to_owned()))?;

        let mut encrypted = vec![];
        let mut writer = encryptor.wrap_output(&mut encrypted)?;
        writer.write_all(plaintext)?;
        writer.finish()?;

        Ok(encrypted)
    }

    fn encrypt_armored(&self, plaintext: &[u8]) -> Result<String, Error> {
        let encryptor = age::Encryptor::with_recipients(self.recipients())
            .ok_or(Error::Age("given recipient vec is empty".to_owned()))?;

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
    fn wrap_key(&self, inner_key: age::x25519::Identity) -> Result<WrappedKey, Error> {
        let mut payload = inner_key.to_string().expose_secret().clone().into_bytes();

        let wrapped = self.encrypt_armored(&payload)?;
        payload.zeroize();

        Ok(WrappedKey(SecretString::new(wrapped)))
    }
}

#[derive(Clone)]
pub enum PublicKey {
    X15519Recipient(age::x25519::Recipient),
    YubiKeyRecipient {
        recipient: p256::Recipient,
        recipient_string: String,
    },
}

impl FromStr for PublicKey {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let (hrp, bytes, _) = bech32::decode(s)
            .map_err(|_| Error::InvalidAgeRecipient("invalid bech32 encoding".to_owned()))?;

        if hrp == "age1yubikey" {
            let bytes: Vec<_> = Vec::from_base32(&bytes)
                .map_err(|_| Error::InvalidAgeRecipient("invalid bech32 byte encoding".to_owned()))?;
            let recipient = p256::Recipient::from_bytes(bytes.as_slice())
                .ok_or_else(|| Error::InvalidAgeRecipient("parsing failed".to_owned()))?;

            Ok(Self::YubiKeyRecipient {
                recipient,
                recipient_string: s.to_owned(),
            })
        } else {
            let x25519_recipient: Result<age::x25519::Recipient, Error> = s
                .parse()
                .map_err(|err: &str| Error::InvalidAgeRecipient(err.to_owned()));

            Ok(Self::X15519Recipient(x25519_recipient?))
        }
    }
}

impl Display for PublicKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PublicKey::X15519Recipient(r) => write!(f, "{}", r),
            PublicKey::YubiKeyRecipient { recipient_string, .. } => write!(f, "{}", recipient_string),
        }
    }
}

impl std::fmt::Debug for PublicKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_tuple("PublicKey").field(&self.to_string()).finish()
    }
}

impl PublicKey {
    pub fn recipient(self) -> Box<dyn age::Recipient + Send> {
        match self {
            PublicKey::X15519Recipient(recipient) => Box::new(recipient),
            PublicKey::YubiKeyRecipient { recipient, .. } => Box::new(recipient),
        }
    }
}

impl AgeEncryptor for PublicKey {
    fn recipients(&self) -> Vec<Box<dyn age::Recipient + Send>> {
        vec![self.clone().recipient()]
    }
}

#[derive(Debug, Clone)]
pub struct PublicKeySet(Vec<PublicKey>);

impl PublicKeySet {
    pub fn new(public_keys: Vec<PublicKey>) -> Result<Self, Error> {
        if public_keys.is_empty() {
            return Err(Error::ValidationError("public key set is empty".to_owned()));
        }

        let set = Self(public_keys);
        if set.0.iter().map(|r| r.to_string()).unique().count() != set.0.len() {
            return Err(Error::ValidationError(
                "public key set contains duplicates".to_owned(),
            ));
        }

        Ok(set)
    }
}

impl AgeEncryptor for PublicKeySet {
    fn recipients(&self) -> Vec<Box<dyn age::Recipient + Send>> {
        self.0.iter().map(|pubkey| pubkey.clone().recipient()).collect()
    }
}

impl From<PublicKey> for PublicKeySet {
    fn from(pubkey: PublicKey) -> Self {
        Self(vec![pubkey])
    }
}

impl From<PublicKeySet> for Vec<String> {
    fn from(pubkeys: PublicKeySet) -> Self {
        pubkeys.0.iter().map(|pubkey| pubkey.to_string()).collect()
    }
}

#[derive(derive_more::Deref)]
pub struct WrappedKey(SecretString);

impl From<WrappedKey> for PiiString {
    fn from(value: WrappedKey) -> Self {
        PiiString::new(value.0.expose_secret().to_owned())
    }
}

pub struct EnrollmentKeys {
    pub recovery_public_key: String,
    pub wrapped_recovery_key: WrappedKey,
}

impl EnrollmentKeys {
    pub fn generate(org_public_keys: &PublicKeySet) -> Result<Self, Error> {
        let recovery_identity = age::x25519::Identity::generate();
        let recovery_public_key = recovery_identity.to_public();

        let wrapped_recovery_key = org_public_keys.wrap_key(recovery_identity)?;

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
    use std::io::Read;
    use std::iter;

    #[test]
    fn test_enrollment_keys() {
        let org_privkey_1 = age::x25519::Identity::generate();
        let org_pubkey_1 = PublicKey::from_str(&org_privkey_1.to_public().to_string()).unwrap();

        let org_privkey_2 = age::x25519::Identity::generate();
        let org_pubkey_2 = PublicKey::from_str(&org_privkey_2.to_public().to_string()).unwrap();

        let org_pubkey_3 =
            PublicKey::from_str("age1yubikey1q23xqm9y4ym90e90jqzdtejvpm3k65460aqxca5nm2p3vxhtr9dky648v2p")
                .unwrap();

        let org_pubkeys = PublicKeySet::new(vec![org_pubkey_1, org_pubkey_2, org_pubkey_3]).unwrap();

        let EnrollmentKeys {
            recovery_public_key,
            wrapped_recovery_key,
        } = EnrollmentKeys::generate(&org_pubkeys).unwrap();

        let wrapped_recovery_key = wrapped_recovery_key.expose_secret();

        PublicKey::from_str(&recovery_public_key).unwrap();

        assert!(wrapped_recovery_key.starts_with("-----BEGIN AGE ENCRYPTED FILE-----\n"));
        assert!(wrapped_recovery_key.ends_with("\n-----END AGE ENCRYPTED FILE-----\n"));

        // Check that both X25519 keys can independently decrypt and we get back a private key that
        // matches the recovery_public_key.
        for key in &[org_privkey_1, org_privkey_2] {
            let armored_reader = age::armor::ArmoredReader::new(wrapped_recovery_key.as_bytes());
            let decryptor = match age::Decryptor::new(armored_reader).unwrap() {
                age::Decryptor::Recipients(d) => d,
                age::Decryptor::Passphrase(_) => panic!("expected decryptor type"),
            };

            let mut decrypted = vec![];
            let mut reader = decryptor.decrypt(iter::once(key as &dyn age::Identity)).unwrap();
            reader.read_to_end(&mut decrypted).unwrap();

            let recovery_private_key =
                age::x25519::Identity::from_str(&String::from_utf8(decrypted).unwrap()).unwrap();
            assert_eq!(recovery_private_key.to_public().to_string(), recovery_public_key);
        }
    }
}
