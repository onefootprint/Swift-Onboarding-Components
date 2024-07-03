use super::p256::Recipient;
use age_core::format::FileKey;
use age_core::format::Stanza;
use age_core::primitives::aead_encrypt;
use age_core::secrecy::ExposeSecret;
use p256::ecdh::EphemeralSecret;
use p256::elliptic_curve::sec1::ToEncodedPoint;
use rand::rngs::OsRng;
use sha2::Sha256;
const STANZA_TAG: &str = "piv-p256";
pub(crate) const STANZA_KEY_LABEL: &[u8] = b"piv-p256";

const TAG_BYTES: usize = 4;
const ENCRYPTED_FILE_KEY_BYTES: usize = 32;

/// The ephemeral key bytes in a piv-p256 stanza.
///
/// The bytes contain a compressed SEC-1 encoding of a valid point.
#[derive(Debug)]
pub(crate) struct EphemeralKeyBytes(p256::EncodedPoint);

impl EphemeralKeyBytes {
    fn from_public_key(epk: &p256::PublicKey) -> Self {
        EphemeralKeyBytes(epk.to_encoded_point(true))
    }

    pub(crate) fn as_bytes(&self) -> &[u8] {
        self.0.as_bytes()
    }
}

#[derive(Debug)]
pub(crate) struct RecipientLine {
    pub(crate) tag: [u8; TAG_BYTES],
    pub(crate) epk_bytes: EphemeralKeyBytes,
    pub(crate) encrypted_file_key: [u8; ENCRYPTED_FILE_KEY_BYTES],
}

impl From<RecipientLine> for Stanza {
    fn from(r: RecipientLine) -> Self {
        Stanza {
            tag: STANZA_TAG.to_owned(),
            args: vec![
                base64::encode_config(r.tag, base64::STANDARD_NO_PAD),
                base64::encode_config(r.epk_bytes.as_bytes(), base64::STANDARD_NO_PAD),
            ],
            body: r.encrypted_file_key.to_vec(),
        }
    }
}

impl RecipientLine {
    pub(crate) fn wrap_file_key(file_key: &FileKey, pk: &Recipient) -> Self {
        let esk = EphemeralSecret::random(&mut OsRng);
        let epk = esk.public_key();
        let epk_bytes = EphemeralKeyBytes::from_public_key(&epk);

        let shared_secret = esk.diffie_hellman(pk.public_key());

        let mut salt = vec![];
        salt.extend_from_slice(epk_bytes.as_bytes());
        salt.extend_from_slice(pk.to_encoded().as_bytes());

        let enc_key = {
            let mut okm = [0; 32];
            shared_secret
                .extract::<Sha256>(Some(&salt))
                .expand(STANZA_KEY_LABEL, &mut okm)
                .expect("okm is the correct length");
            okm
        };

        let encrypted_file_key = {
            let mut key = [0; ENCRYPTED_FILE_KEY_BYTES];
            key.copy_from_slice(&aead_encrypt(&enc_key, file_key.expose_secret()));
            key
        };

        RecipientLine {
            tag: pk.tag(),
            epk_bytes,
            encrypted_file_key,
        }
    }
}
