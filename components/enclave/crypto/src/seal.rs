use aes_gcm::aead::Payload;
use aes_gcm::aead::{Aead, NewAead};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use p256::{ecdh::EphemeralSecret, EncodedPoint};
use rand_core::{OsRng, RngCore};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::str::FromStr;

use crate::b64::Base64Data;

pub use self::seal::seal_ecies_p256_x963_sha256_aes_gcm;
pub use self::unseal::unseal_ecies_p256_x963_sha256_aes_gcm;

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

impl EciesP256Sha256AesGcmSealed {
    /// Protocol Version
    pub const VERSION: u8 = 1;

    pub fn from_str(input: &str) -> Result<Self, crate::Error> {
        let base64data = Base64Data::from_str(input)?;
        Ok(serde_cbor::from_slice(base64data.as_ref())?)
    }

    pub fn to_string(&self) -> Result<String, crate::Error> {
        let encoded = serde_cbor::to_vec(&self)?;
        let base64 = Base64Data(encoded).to_string();
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
    let input = vec![shared_key, &counter, shared_info].concat();

    let mut hasher = Sha256::new();
    hasher.update(&input);
    let output = hasher.finalize();
    output.into()
}

pub mod seal {
    use super::*;

    /// Anon ECDH0-based sealing under the public key (ECIESEncryptionCofactorVariableIVX963SHA256AESGCM)
    /// public key is uncompressed
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

    /// Anon ECDH0-based sealing under the public key (ECIESEncryptionCofactorVariableIVX963SHA256AESGCM)
    /// public key is uncompressed
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
            x963_kdf_sha256_32(pre_shared.as_bytes(), ephemeral_public_key.as_bytes())
        };

        let key = Key::from_slice(&shared_key);
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(&iv);

        let payload = Payload {
            msg: &message,
            aad: &recipient_public_key,
        };
        let ciphertext_and_tag = cipher
            .encrypt(nonce, payload)
            .map_err(|_| crate::Error::AeadEncrypt)?;

        Ok(EciesP256Sha256AesGcmSealed {
            ephemeral_public_key: ephemeral_public_key.as_ref().to_vec(),
            iv,
            ciphertext_and_tag,
            version: EciesP256Sha256AesGcmSealed::VERSION
        })
    }
}

pub mod unseal {
    use super::*;
    use elliptic_curve::{ecdh::diffie_hellman, sec1::ToEncodedPoint};

    pub struct Plain(pub Vec<u8>);

    /// raw private key BE
    pub fn unseal_ecies_p256_x963_sha256_aes_gcm(
        private_key_bytes: &[u8],
        sealed: EciesP256Sha256AesGcmSealed,
    ) -> Result<Plain, crate::Error> {
        // init our private key
        let private_key = p256::SecretKey::from_be_bytes(private_key_bytes)?;
        let public_key = private_key.public_key().to_encoded_point(false);

        let EciesP256Sha256AesGcmSealed {
            ephemeral_public_key,
            iv,
            ciphertext_and_tag,
            version: _
        } = sealed;

        // init the peer public key
        let peer_public_key = p256::PublicKey::from_sec1_bytes(&ephemeral_public_key)?;

        // ecdh
        let shared_key = {
            let pre_shared =
                diffie_hellman(private_key.to_nonzero_scalar(), peer_public_key.as_affine());
            x963_kdf_sha256_32(pre_shared.as_bytes(), &ephemeral_public_key)
        };

        let key = Key::from_slice(&shared_key);
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(&iv);
        let payload = Payload {
            msg: &ciphertext_and_tag,
            aad: public_key.as_bytes(),
        };

        let plain = cipher
            .decrypt(nonce, payload)
            .map_err(|_| crate::Error::AeadEncrypt)?;

        Ok(Plain(plain))
    }
}

#[cfg(test)]
mod tests {
    use elliptic_curve::sec1::ToEncodedPoint;

    use super::*;

    #[test]
    fn test_seal_unseal_rand() {
        let sk = p256::SecretKey::random(&mut OsRng);
        let pk = sk.public_key().to_encoded_point(false);
        dbg!(pk.len());
        dbg!(sk.to_be_bytes().to_vec().len());

        let message = b"hello world";
        let sealed =
            seal::seal_ecies_p256_x963_sha256_aes_gcm(pk.as_bytes(), message.to_vec()).unwrap();
        dbg!(sealed.to_vec().unwrap());
        dbg!(sealed.ephemeral_public_key.len());
        let unsealed =
            unseal::unseal_ecies_p256_x963_sha256_aes_gcm(&sk.to_be_bytes().to_vec(), sealed)
                .unwrap();

        assert_eq!(unsealed.0, message.to_vec());
    }

    #[test]
    fn test_seal_unseal_static() {
        // let sealed = "fp01o2NlcGuYQQQSGLMYrRjQGCIYwRhLGJwYbBjpGOUY3BjJEhj8GFYYWQcY_xjIGPIY1Bj7GPsYSBj4GN8Y1RiVGH8YVRiTExgaGH4YLhjKGGsYvBi3GJYYXBi9GOUY1xj7GIAYaRiUGEQYaxhoGJwYNBjXGFUTGBsYsBhNGFsY-w0CYml2jBgoGJ0YjxirGOgYQhhaGN8YVBioABjfYWOYGxg7GLwY5xgbGDMYnBjWGMIYawoJGEAYnhg6GJcUGGQY0BiiGOAYGBiYGOQYTRhSGDUYmA";
        // let _pk = hex::decode("04b6b5fa75eb4d441a1aa67f7b1f38eee95e4f8c2bb7b203fba687a4c97833fecf1a6dd6ed3b3cc39f3af346df2bb0ac41037ae8b4ffcf992492a90e862353f23f").unwrap();
        // let sk = hex::decode("85420d2c09045a9a13d5a6888026daf2b36716049be081d07faa43d4319f0ae6")
        //     .unwrap();

        // let unsealed = unseal::unseal_ecies_p256_x963_sha256_aes_gcm(
        //     &sk,
        //     EciesP256Sha256AesGcmSealed::from_str(sealed).unwrap(),
        // )
        // .unwrap();
        // assert_eq!(unsealed.0, b"hello world".to_vec());
    }
}
