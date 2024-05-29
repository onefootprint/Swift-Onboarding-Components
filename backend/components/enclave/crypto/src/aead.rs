use aead::{
    Aead,
    KeyInit,
    Payload,
};
use chacha20poly1305::{
    Key,
    XChaCha20Poly1305,
    XNonce,
};
use rand_core::{
    OsRng,
    RngCore,
};
use serde::de::DeserializeOwned;
use serde::{
    Deserialize,
    Serialize,
};
use std::fmt::Debug;
use std::ops::Deref;

pub const CHA_CHA20_POLY1305_KEY_BYTES_LENGTH: usize = 32;
pub type ChaCha20Poly1305KeyBytes = [u8; CHA_CHA20_POLY1305_KEY_BYTES_LENGTH];

/// A SealingKey is simply a ScopedSealingKey with no scope (i.e. empty bytes, b"")
/// This is as if passing empty AAD.
#[derive(Clone)]
pub struct SealingKey(ScopedSealingKey);

/// This enables us to use the underlying crypto primitives of a ScopedSealingKey
impl Deref for SealingKey {
    type Target = ScopedSealingKey;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl SealingKey {
    pub fn generate() -> Result<Self, crate::Error> {
        Ok(Self(ScopedSealingKey::generate("")?))
    }

    pub fn new_from_key(key: ChaCha20Poly1305KeyBytes) -> Self {
        Self(ScopedSealingKey::new_from_key(key, ""))
    }

    pub fn new(bytes: Vec<u8>) -> Result<Self, crate::Error> {
        Ok(Self(ScopedSealingKey::new(bytes, "")?))
    }
}

impl Debug for SealingKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted>")
    }
}

#[derive(Clone)]
pub struct ScopedSealingKey {
    scope: &'static str,
    key: ChaCha20Poly1305KeyBytes,
}

impl ScopedSealingKey {
    pub fn sha256(&self) -> [u8; 32] {
        crate::sha256(&self.key)
    }
}

// hide the key from debug prints
impl Debug for ScopedSealingKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("{ <hidden> }")
    }
}

/// generate symmetrick key bytes to use with ChaCha20Poly1305 AEAD
pub fn generate_chacha20_poly1305_key_bytes() -> ChaCha20Poly1305KeyBytes {
    let mut key = [0u8; CHA_CHA20_POLY1305_KEY_BYTES_LENGTH];
    OsRng.fill_bytes(&mut key);
    key
}

impl ScopedSealingKey {
    pub fn generate(scope: &'static str) -> Result<Self, crate::Error> {
        Ok(Self {
            key: generate_chacha20_poly1305_key_bytes(),
            scope,
        })
    }

    pub fn new_from_key(key: ChaCha20Poly1305KeyBytes, scope: &'static str) -> Self {
        Self { key, scope }
    }

    pub fn new(mut bytes: Vec<u8>, scope: &'static str) -> Result<Self, crate::Error> {
        // reject keys with too little entropy
        if bytes.len() < CHA_CHA20_POLY1305_KEY_BYTES_LENGTH {
            return Err(crate::Error::InvalidKey);
        }

        // accept longer keys, but shorten them via sha256 to 32 bytes
        if bytes.len() > CHA_CHA20_POLY1305_KEY_BYTES_LENGTH {
            bytes = crate::sha256(&bytes).to_vec();
        }

        let mut key = ChaCha20Poly1305KeyBytes::default();
        key.copy_from_slice(&bytes[0..CHA_CHA20_POLY1305_KEY_BYTES_LENGTH]);

        Ok(Self::new_from_key(key, scope))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct SealedBytes {
    #[serde(rename = "n")]
    iv: Vec<u8>,
    #[serde(rename = "c")]
    cipher_text_and_tag: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(transparent)]
pub struct AeadSealedBytes(pub Vec<u8>);

/// seal_aead_scoped_with_nonce with a random nonce
fn seal_aead_scoped(key: &[u8], data: &[u8], scope: &'static str) -> Result<Vec<u8>, crate::Error> {
    let mut nonce = [0u8; 24];
    OsRng.fill_bytes(&mut nonce);
    seal_aead_scoped_with_nonce(key, data, scope, &nonce)
}

/// We use XChaCha20Poly1305 to here instead of AESGCM to help against nonce resuse attacks
/// The scope is used as AAD to prevent against confused deputy attacks
fn seal_aead_scoped_with_nonce(
    key: &[u8],
    data: &[u8],
    scope: &'static str,
    iv: &[u8],
) -> Result<Vec<u8>, crate::Error> {
    let key = Key::from_slice(key);
    let cipher = XChaCha20Poly1305::new(key);
    let nonce = XNonce::from_slice(iv);

    let payload = Payload {
        msg: data,
        aad: scope.as_bytes(),
    };

    let cipher_text_and_tag = cipher.encrypt(nonce, payload).map_err(|_| crate::Error::Aead)?;

    let sealed = SealedBytes {
        iv: iv.to_vec(),
        cipher_text_and_tag,
    };
    Ok(serde_cbor::to_vec(&sealed)?)
}

fn unseal_aead_scoped(key: &[u8], sealed: &[u8], scope: &'static str) -> Result<Vec<u8>, crate::Error> {
    let sealed_bytes: SealedBytes = serde_cbor::from_slice(sealed)?;

    let key = Key::from_slice(key);
    let cipher = XChaCha20Poly1305::new(key);
    let nonce = XNonce::from_slice(&sealed_bytes.iv);

    let payload = Payload {
        msg: &sealed_bytes.cipher_text_and_tag,
        aad: scope.as_bytes(),
    };

    let plaintext = cipher.decrypt(nonce, payload).map_err(|_| crate::Error::Aead)?;

    Ok(plaintext)
}

impl ScopedSealingKey {
    pub fn seal_bytes(&self, data: &[u8]) -> Result<AeadSealedBytes, crate::Error> {
        Ok(AeadSealedBytes(seal_aead_scoped(&self.key, data, self.scope)?))
    }

    pub fn seal<S: Serialize>(&self, object: &S) -> Result<AeadSealedBytes, crate::Error> {
        let data = serde_cbor::to_vec(object)?;
        self.seal_bytes(&data)
    }

    pub fn unseal_bytes(&self, sealed: AeadSealedBytes) -> Result<Vec<u8>, crate::Error> {
        unseal_aead_scoped(&self.key, &sealed.0, self.scope)
    }

    pub fn unseal<D: DeserializeOwned>(&self, sealed: AeadSealedBytes) -> Result<D, crate::Error> {
        let plain = self.unseal_bytes(sealed)?;
        Ok(serde_cbor::from_slice(&plain)?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const TEST_SCOPE: &str = "test_scope";

    fn random_key() -> [u8; 32] {
        let mut key = [0u8; 32];
        OsRng.fill_bytes(&mut key);
        key
    }

    #[test]
    fn test_seal_unseal_random() {
        let key = random_key();
        let data = b"hello world";
        let sealed = seal_aead_scoped(&key, data, TEST_SCOPE).unwrap();
        // dbg!(hex::encode(&key));
        // dbg!(hex::encode(&sealed));

        let plain = unseal_aead_scoped(&key, &sealed, TEST_SCOPE).unwrap();

        assert_eq!(&plain, &data);
    }

    #[test]
    fn test_seal_unseal_fixed() {
        let key = hex::decode("1c65ee85c88211b4aa323bfc6ef22f68d3ab99b940b35bed84c16c68843c43c5").unwrap();
        let data = b"hello world";
        let sealed = hex::decode("a2616e981818f118b41831184f18ca1866187f1898183f18571835001826185718a818fd184d1826189d12186f18a318ff18686163981b18e118df17187f18d0187918d9186718951888186a18a7188018be1318b91893188118ba18c618b6186718d018ed18f718a11856").unwrap();

        let plain = unseal_aead_scoped(&key, &sealed, TEST_SCOPE).unwrap();
        assert_eq!(&plain, &data);
    }

    #[test]
    fn test_seal_unseal_object() {
        let key = ScopedSealingKey::new(random_key().to_vec(), TEST_SCOPE).unwrap();

        #[derive(Debug, Serialize, Deserialize, PartialEq)]
        struct Object {
            x: String,
            y: u64,
        }

        let obj = Object {
            x: "blah".to_string(),
            y: 42,
        };

        let sealed = key.seal(&obj).unwrap();
        let unsealed: Object = key.unseal(sealed).unwrap();

        assert_eq!(unsealed, obj);
    }
}
