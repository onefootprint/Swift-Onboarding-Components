use std::str::FromStr;

use ring::aead::{BoundKey, NonceSequence};
use ring::agreement::EphemeralPrivateKey;
use ring::rand::SecureRandom;
use ring::{agreement, digest, rand};
use serde::{Deserialize, Serialize};

use crate::b64::Base64Data;

#[derive(Serialize, Debug, Deserialize, Clone)]
/// ECDH sealed data
pub struct EciesP256Sha256AesGcmSealed {
    #[serde(rename = "epk")]
    ephemeral_public_key: Vec<u8>,

    #[serde(rename = "iv")]
    iv: [u8; 12],

    #[serde(rename = "c")]
    ciphertext_and_tag: Vec<u8>,
}

impl EciesP256Sha256AesGcmSealed {
    /// Protocol Version
    pub const VERSION: &'static str = "fp01";

    pub fn from_str(input: &str) -> Result<Self, crate::Error> {
        let base64str = input
            .strip_prefix(Self::VERSION)
            .ok_or(crate::Error::InvalidCiphertext)?;
        let base64data = Base64Data::from_str(base64str)?;
        Ok(serde_cbor::from_slice(base64data.as_ref())?)
    }

    /// format = VERSION || Base64(CBOR(Self))
    pub fn to_string(&self) -> Result<String, crate::Error> {
        let encoded = serde_cbor::to_vec(&self)?;
        let base64 = Base64Data(encoded).to_string();
        let version = Self::VERSION;
        Ok(format!("{version}{base64}"))
    }
}

struct OneTimeNonce(Option<ring::aead::Nonce>);
impl NonceSequence for OneTimeNonce {
    fn advance(&mut self) -> Result<ring::aead::Nonce, ring::error::Unspecified> {
        self.0.take().ok_or(ring::error::Unspecified)
    }
}

fn x963_kdf_sha256_32(shared_key: &[u8], shared_info: &[u8]) -> [u8; 32] {
    // we only need one round
    let counter: Vec<u8> = vec![0, 0, 0, 1];
    let input = vec![shared_key, &counter, shared_info].concat();
    let digest = digest::digest(&digest::SHA256, &input);

    let mut output = [0u8; ring::digest::SHA256_OUTPUT_LEN];
    output.copy_from_slice(digest.as_ref());
    output
}

pub mod seal {
    use super::*;

    /// Anon ECDH0-based sealing under the public key (ECIESEncryptionCofactorVariableIVX963SHA256AESGCM)
    pub fn seal_ecies_p256_x963_sha256_aes_gcm(
        public_key: &[u8],
        message: Vec<u8>,
    ) -> Result<EciesP256Sha256AesGcmSealed, crate::Error> {
        let rng = rand::SystemRandom::new();

        // generate the ephemeral key pair
        let ephem_priv_key = agreement::EphemeralPrivateKey::generate(&agreement::ECDH_P256, &rng)?;

        // generate a nonce
        let mut nonce = [0u8; 12];
        rng.fill(&mut nonce)?;

        seal_ecies_p256_x963_sha256_aes_gcm_internal(public_key, ephem_priv_key, nonce, message)
    }

    /// Anon ECDH0-based sealing under the public key (ECIESEncryptionCofactorVariableIVX963SHA256AESGCM)
    fn seal_ecies_p256_x963_sha256_aes_gcm_internal(
        recipient_public_key: &[u8],
        ephemeral_private_key: EphemeralPrivateKey,
        nonce: [u8; 12],
        message: Vec<u8>,
    ) -> Result<EciesP256Sha256AesGcmSealed, crate::Error> {
        let peer_public_key =
            agreement::UnparsedPublicKey::new(&agreement::ECDH_P256, recipient_public_key);

        let ephemeral_public_key = ephemeral_private_key.compute_public_key()?;

        let sealed = agreement::agree_ephemeral(
            ephemeral_private_key,
            &peer_public_key,
            ring::error::Unspecified,
            |shared_key| {
                // compute x963 over sha256
                let kdf = x963_kdf_sha256_32(shared_key, ephemeral_public_key.as_ref());

                let iv = ring::aead::Nonce::assume_unique_for_key(nonce.clone());

                // do aesgcm-256
                let key = ring::aead::UnboundKey::new(&ring::aead::AES_256_GCM, &kdf)?;
                let mut key = ring::aead::SealingKey::new(key, OneTimeNonce(Some(iv)));
                let aad = ring::aead::Aad::from(recipient_public_key);

                let mut sealed = message;
                key.seal_in_place_append_tag(aad, &mut sealed)?;

                Ok(EciesP256Sha256AesGcmSealed {
                    ephemeral_public_key: ephemeral_public_key.as_ref().to_vec(),
                    iv: nonce,
                    ciphertext_and_tag: sealed,
                })
            },
        )?;

        Ok(sealed)
    }
}
pub use self::seal::seal_ecies_p256_x963_sha256_aes_gcm;

pub mod unseal {
    use openssl::{
        bn::{BigNum, BigNumContext},
        ec::{self, EcGroup, EcKey, EcPoint},
        nid::Nid,
        pkey::PKey,
    };

    use super::*;

    pub struct Plain(pub Vec<u8>);

    pub fn unseal_ecies_p256_x963_sha256_aes_gcm(
        private_key_bytes: &[u8],
        public_key_bytes: &[u8],
        sealed: EciesP256Sha256AesGcmSealed,
    ) -> Result<Plain, crate::Error> {
        openssl::init();

        // init our private key
        let private_key = {
            let group = EcGroup::from_curve_name(Nid::X9_62_PRIME256V1)?;
            let mut ctx = BigNumContext::new()?;
            let pk = EcPoint::from_bytes(&group, &public_key_bytes, &mut ctx)?;
            let sk = BigNum::from_slice(&private_key_bytes)?;
            EcKey::from_private_components(&group, &sk, &pk)?
        };

        let EciesP256Sha256AesGcmSealed {
            ephemeral_public_key,
            iv,
            ciphertext_and_tag: mut sealed,
        } = sealed;

        // init the peer public key
        let peer_public_key = {
            let group = EcGroup::from_curve_name(Nid::X9_62_PRIME256V1)?;
            let mut ctx = BigNumContext::new()?;
            let point = EcPoint::from_bytes(&group, &ephemeral_public_key, &mut ctx)?;
            EcKey::from_public_key(&group, &point)?
        };

        // ecdh
        let our_private_pkey = PKey::from_ec_key(private_key)?;
        let peer_pkey = PKey::from_ec_key(peer_public_key)?;

        let mut deriver = openssl::derive::Deriver::new(&our_private_pkey)?;
        deriver.set_peer(&peer_pkey)?;

        let shared_key = deriver.derive_to_vec()?;
        let kdf = x963_kdf_sha256_32(&shared_key, ephemeral_public_key.as_ref());

        let key = ring::aead::UnboundKey::new(&ring::aead::AES_256_GCM, &kdf)?;
        let iv = ring::aead::Nonce::assume_unique_for_key(iv.clone());
        let mut key = ring::aead::OpeningKey::new(key, OneTimeNonce(Some(iv)));
        let aad = ring::aead::Aad::from(public_key_bytes);

        key.open_in_place(aad, &mut sealed)?;
        let plaintext_len = sealed.len() - ring::aead::AES_256_GCM.tag_len();
        Ok(Plain(sealed[0..plaintext_len].to_vec()))
    }
}

#[cfg(test)]
mod tests {

    use openssl::{
        bn::BigNumContext,
        ec::{EcGroup, PointConversionForm},
        nid::Nid,
    };

    use super::*;

    #[test]
    fn test_seal_unseal_rand() {
        openssl::init();

        let group = EcGroup::from_curve_name(Nid::X9_62_PRIME256V1).unwrap();
        let mut ctx = BigNumContext::new().unwrap();

        let kp = openssl::ec::EcKey::generate(&group).unwrap();

        let sk = kp.private_key().to_vec();
        dbg!(sk.len());
        dbg!(hex::encode(&sk));

        let pk = kp
            .public_key()
            .to_bytes(&group, PointConversionForm::UNCOMPRESSED, &mut ctx)
            .unwrap();
        dbg!(pk.len());
        dbg!(hex::encode(&pk));

        let message = b"hello world";
        let sealed = seal::seal_ecies_p256_x963_sha256_aes_gcm(&pk, message.to_vec()).unwrap();
        dbg!(sealed.to_string().unwrap());

        let unsealed = unseal::unseal_ecies_p256_x963_sha256_aes_gcm(&sk, &pk, sealed).unwrap();

        assert_eq!(unsealed.0, message.to_vec());
    }

    #[test]
    fn test_seal_unseal_static() {
        let sealed = "fp01o2NlcGuYQQQSGLMYrRjQGCIYwRhLGJwYbBjpGOUY3BjJEhj8GFYYWQcY_xjIGPIY1Bj7GPsYSBj4GN8Y1RiVGH8YVRiTExgaGH4YLhjKGGsYvBi3GJYYXBi9GOUY1xj7GIAYaRiUGEQYaxhoGJwYNBjXGFUTGBsYsBhNGFsY-w0CYml2jBgoGJ0YjxirGOgYQhhaGN8YVBioABjfYWOYGxg7GLwY5xgbGDMYnBjWGMIYawoJGEAYnhg6GJcUGGQY0BiiGOAYGBiYGOQYTRhSGDUYmA";
        let pk = hex::decode("04b6b5fa75eb4d441a1aa67f7b1f38eee95e4f8c2bb7b203fba687a4c97833fecf1a6dd6ed3b3cc39f3af346df2bb0ac41037ae8b4ffcf992492a90e862353f23f").unwrap();
        let sk = hex::decode("85420d2c09045a9a13d5a6888026daf2b36716049be081d07faa43d4319f0ae6")
            .unwrap();

        let unsealed = unseal::unseal_ecies_p256_x963_sha256_aes_gcm(
            &sk,
            &pk,
            EciesP256Sha256AesGcmSealed::from_str(sealed).unwrap(),
        )
        .unwrap();
        assert_eq!(unsealed.0, b"hello world".to_vec());
    }
}
