pub use self::seal::seal_ecies_p256_x963_sha256_aes_gcm;
pub use self::unseal::unseal_ecies_p256_x963_sha256_aes_gcm;
use crate::aead::{
    generate_chacha20_poly1305_key_bytes,
    AeadSealedBytes,
    ScopedSealingKey,
    SealingKey,
};
use aes_gcm::aead::Payload;
use aes_gcm::{
    Aes256Gcm,
    Key,
    Nonce,
};
use p256::ecdh::EphemeralSecret;
use p256::elliptic_curve::sec1::ToEncodedPoint;
use p256::EncodedPoint;
use rand_core::{
    OsRng,
    RngCore,
};
use serde::{
    Deserialize,
    Serialize,
};
use sha2::{
    Digest,
    Sha256,
};
use std::fmt::Debug;
use std::str::FromStr;

#[derive(Serialize, Debug, Deserialize, Clone)]
/// ECDH sealed data
pub struct EciesP256Sha256AesGcmSealed {
    #[serde(rename = "v")]
    version: u8,

    #[serde(rename = "epk")]
    ephemeral_public_key: Vec<u8>,

    #[serde(rename = "iv")]
    iv: [u8; 12],

    #[serde(rename = "c")]
    ciphertext_and_tag: Vec<u8>,
}

impl FromStr for EciesP256Sha256AesGcmSealed {
    type Err = crate::Error;

    fn from_str(input: &str) -> Result<Self, crate::Error> {
        let base64data = base64::decode_config(input, Self::BASE64_CONFIG)?;
        Ok(serde_cbor::from_slice(base64data.as_ref())?)
    }
}

impl EciesP256Sha256AesGcmSealed {
    const BASE64_CONFIG: base64::Config = base64::URL_SAFE_NO_PAD;
    /// Protocol Version
    pub const VERSION: u8 = 1;

    pub fn to_string(&self) -> Result<String, crate::Error> {
        let encoded = serde_cbor::to_vec(&self)?;
        let base64 = base64::encode_config(encoded, Self::BASE64_CONFIG);
        Ok(base64)
    }

    pub fn from_bytes(input: &[u8]) -> Result<Self, crate::Error> {
        Ok(serde_cbor::from_slice(input)?)
    }

    pub fn to_vec(&self) -> Result<Vec<u8>, crate::Error> {
        Ok(serde_cbor::to_vec(&self)?)
    }
}

fn x963_kdf_sha256_32(shared_key: &[u8], shared_info: &[u8]) -> [u8; 32] {
    // we only need one round
    let counter: Vec<u8> = vec![0, 0, 0, 1];
    let input = [shared_key, &counter, shared_info].concat();

    let mut hasher = Sha256::new();
    hasher.update(&input);
    let output = hasher.finalize();
    output.into()
}

#[allow(clippy::module_inception)]
pub mod seal {
    use super::*;
    use aes_gcm::aead::Aead;
    use aes_gcm::aes::Aes256;
    use aes_gcm::KeyInit;

    /// Anon ECDH0-based sealing under the public key
    /// (ECIESEncryptionCofactorVariableIVX963SHA256AESGCM) public key is uncompressed
    pub fn seal_ecies_p256_x963_sha256_aes_gcm(
        public_key: &[u8],
        message: Vec<u8>,
    ) -> Result<EciesP256Sha256AesGcmSealed, crate::Error> {
        // generate the ephemeral key pair
        let ephem_priv_key = EphemeralSecret::random(&mut OsRng);

        // generate a nonce
        let mut nonce = [0u8; 12];
        OsRng.fill_bytes(&mut nonce);

        seal_ecies_p256_x963_sha256_aes_gcm_internal(public_key, ephem_priv_key, nonce, message)
    }

    /// Anon ECDH0-based sealing under the public key
    /// (ECIESEncryptionCofactorVariableIVX963SHA256AESGCM) public key is uncompressed
    fn seal_ecies_p256_x963_sha256_aes_gcm_internal(
        recipient_public_key: &[u8],
        ephemeral_private_key: EphemeralSecret,
        iv: [u8; 12],
        message: Vec<u8>,
    ) -> Result<EciesP256Sha256AesGcmSealed, crate::Error> {
        let peer_public_key = p256::PublicKey::from_sec1_bytes(recipient_public_key)?;

        let ephemeral_public_key = EncodedPoint::from(ephemeral_private_key.public_key());

        let shared_key = {
            let pre_shared = ephemeral_private_key.diffie_hellman(&peer_public_key);
            x963_kdf_sha256_32(pre_shared.raw_secret_bytes(), ephemeral_public_key.as_bytes())
        };

        let key = Key::<Aes256>::from_slice(&shared_key);
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(&iv);

        let payload = Payload {
            msg: &message,
            aad: recipient_public_key,
        };
        let ciphertext_and_tag = cipher.encrypt(nonce, payload).map_err(|_| crate::Error::Aead)?;

        Ok(EciesP256Sha256AesGcmSealed {
            ephemeral_public_key: ephemeral_public_key.as_ref().to_vec(),
            iv,
            ciphertext_and_tag,
            version: EciesP256Sha256AesGcmSealed::VERSION,
        })
    }
}

pub mod unseal {
    use super::*;
    use aes_gcm::aead::Aead;
    use aes_gcm::aes::Aes256;
    use aes_gcm::KeyInit;
    use elliptic_curve::ecdh::diffie_hellman;
    use elliptic_curve::sec1::ToEncodedPoint;
    pub struct Unsealed(pub Vec<u8>);

    /// raw private key BE
    pub fn unseal_ecies_p256_x963_sha256_aes_gcm(
        private_key_bytes: &[u8],
        sealed: EciesP256Sha256AesGcmSealed,
    ) -> Result<Unsealed, crate::Error> {
        // init our private key
        let private_key = p256::SecretKey::from_be_bytes(private_key_bytes)?;
        let public_key = private_key.public_key().to_encoded_point(false);

        let EciesP256Sha256AesGcmSealed {
            ephemeral_public_key,
            iv,
            ciphertext_and_tag,
            version: _,
        } = sealed;

        // init the peer public key
        let peer_public_key = p256::PublicKey::from_sec1_bytes(&ephemeral_public_key)?;

        // ecdh
        let shared_key = {
            let pre_shared = diffie_hellman(private_key.to_nonzero_scalar(), peer_public_key.as_affine());
            x963_kdf_sha256_32(pre_shared.raw_secret_bytes(), &ephemeral_public_key)
        };

        let key = Key::<Aes256>::from_slice(&shared_key);
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(&iv);
        let payload = Payload {
            msg: &ciphertext_and_tag,
            aad: public_key.as_bytes(),
        };

        let plain = cipher.decrypt(nonce, payload).map_err(|_| crate::Error::Aead)?;

        Ok(Unsealed(plain))
    }
}

#[derive(Serialize, Debug, Deserialize, Clone)]
pub struct SealedEciesP256KeyPair {
    pub sealed_private_key: AeadSealedBytes,
    pub public_key_bytes: Vec<u8>,
}

impl ScopedSealingKey {
    /// generate a key pair for use with ecies
    pub fn generate_sealed_random_ecies_p256_key_pair(&self) -> Result<SealedEciesP256KeyPair, crate::Error> {
        let sk = p256::SecretKey::random(&mut OsRng);
        let sealed_private_key = self.seal_bytes(&sk.to_be_bytes())?;

        let public_key_bytes = sk.public_key().to_encoded_point(false).as_bytes().to_vec();

        Ok(SealedEciesP256KeyPair {
            public_key_bytes,
            sealed_private_key,
        })
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SealedChaCha20Poly1305DataKey {
    pub sealed_key: EciesP256Sha256AesGcmSealed,
}

impl Debug for SealedChaCha20Poly1305DataKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("SealedChaCha20Poly1305DataKey { omitted }")
    }
}

impl SealedChaCha20Poly1305DataKey {
    /// generate a symmetric (ChaCha20Poly1305) sealing AEAD key
    pub fn generate_sealed_random_chacha20_poly1305_key(
        public_key: &[u8],
    ) -> Result<SealedChaCha20Poly1305DataKey, crate::Error> {
        let key = generate_chacha20_poly1305_key_bytes();
        let sealed_key = seal::seal_ecies_p256_x963_sha256_aes_gcm(public_key, key.to_vec())?;

        Ok(SealedChaCha20Poly1305DataKey { sealed_key })
    }

    /// generate a symmetric (ChaCha20Poly1305) sealing AEAD key with plaintext
    pub fn generate_sealed_random_chacha20_poly1305_key_with_plaintext(
        public_key: &[u8],
    ) -> Result<(SealedChaCha20Poly1305DataKey, SealingKey), crate::Error> {
        let key = generate_chacha20_poly1305_key_bytes();
        let sealed_key = seal::seal_ecies_p256_x963_sha256_aes_gcm(public_key, key.to_vec())?;
        let sealed = SealedChaCha20Poly1305DataKey { sealed_key };
        let key = SealingKey::new_from_key(key);
        Ok((sealed, key))
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn test_seal_unseal_rand() {
        let sk = p256::SecretKey::random(&mut OsRng);
        let pk = sk.public_key().to_encoded_point(false);
        dbg!(pk.len());
        dbg!(sk.to_be_bytes().to_vec().len());

        let sk_hex = hex::encode(sk.to_be_bytes());
        dbg!(sk_hex);

        let pk_hex = hex::encode(pk.to_bytes());
        dbg!(pk_hex);

        let message = b"hello world";
        let sealed = seal::seal_ecies_p256_x963_sha256_aes_gcm(pk.as_bytes(), message.to_vec()).unwrap();

        dbg!(sealed.ephemeral_public_key.len());
        dbg!(sealed.to_string().unwrap());
        let unsealed = unseal::unseal_ecies_p256_x963_sha256_aes_gcm(&sk.to_be_bytes(), sealed).unwrap();

        assert_eq!(unsealed.0, message.to_vec());
    }

    #[test]
    fn test_seal_unseal_static() {
        let sealed = "pGF2AWNlcGuYQQQYwRjJGJ4YGxjmAxiBGJcY6hg9GJwY7A4YlhiZGJAYfBiQGNkYIhhxGO0Y9xj4GPIY_xg5Bxh_GPYYvxhwGD0YlxgxABjqABj2GG8RGPoYyxi2GMoGGIcYfRiLGF8GGN4YwhizGDIYyRgxGD8YvRijGDAYRxhnGJFiaXaMGK8Y_BiAFBi0GOUYMhi3GE4YYRigGD9hY5gbGOAYtRiZGIoYJBj6GIIAGIcY2hg_GJwYshjQDBgdGFEYpRiVGJEYgBi6GLMYqhjgGEUC";

        let _pk = hex::decode("0460f81c63e9bb142cc75091bf44ae979e707e0928785c84e4f936ca3e680d3c6029eb2844268aa117349277abf0c60c03dc6f1ae80530857f8438865ff5166321").unwrap();
        let sk = hex::decode("fb9bd259890df88650a797e04e812fe5a6c60ce0377f293781ac407e6ffb90b1").unwrap();

        let unsealed = unseal::unseal_ecies_p256_x963_sha256_aes_gcm(
            &sk,
            EciesP256Sha256AesGcmSealed::from_str(sealed).unwrap(),
        )
        .unwrap();
        assert_eq!(unsealed.0, b"hello world".to_vec());
    }

    const TEST_SCOPE: &str = "test_scope";

    fn random_key() -> [u8; 32] {
        let mut key = [0u8; 32];
        OsRng.fill_bytes(&mut key);
        key
    }

    #[test]
    fn test_generate_sealed_ecies_key() {
        let sealing_key = ScopedSealingKey::new(random_key().to_vec(), TEST_SCOPE).unwrap();

        let sealed_kp = sealing_key.generate_sealed_random_ecies_p256_key_pair().unwrap();

        let unsealed_sk = sealing_key.unseal_bytes(sealed_kp.sealed_private_key).unwrap();

        let message = b"hello world";
        let sealed =
            seal::seal_ecies_p256_x963_sha256_aes_gcm(&sealed_kp.public_key_bytes, message.to_vec()).unwrap();

        let unsealed = unseal::unseal_ecies_p256_x963_sha256_aes_gcm(&unsealed_sk, sealed).unwrap();

        assert_eq!(unsealed.0.as_slice(), message.as_slice());
    }
}
