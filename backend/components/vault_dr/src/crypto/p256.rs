use age_core::format::FileKey;
use age_core::format::Stanza;
use p256::elliptic_curve::sec1::FromEncodedPoint;
use p256::elliptic_curve::sec1::ToEncodedPoint;
use sha2::Digest;
use sha2::Sha256;

pub(crate) const TAG_BYTES: usize = 4;
use super::piv_format::RecipientLine;

/// Wrapper around a compressed secp256r1 curve point.
#[derive(Clone)]
pub struct Recipient(p256::PublicKey);

impl age::Recipient for Recipient {
    fn wrap_file_key(&self, file_key: &FileKey) -> Result<Vec<Stanza>, age::EncryptError> {
        let recipient_line = RecipientLine::wrap_file_key(file_key, self);
        Ok(vec![recipient_line.into()])
    }
}

impl Recipient {
    /// Attempts to parse a valid YubiKey recipient from its compressed SEC-1 byte encoding.
    pub(crate) fn from_bytes(bytes: &[u8]) -> Option<Self> {
        let encoded = p256::EncodedPoint::from_bytes(bytes).ok()?;
        if encoded.is_compressed() {
            Self::from_encoded(&encoded)
        } else {
            None
        }
    }

    /// Attempts to parse a valid YubiKey recipient from its SEC-1 encoding.
    ///
    /// This accepts both compressed (as used by the plugin) and uncompressed (as used in
    /// the YubiKey certificate) encodings.
    fn from_encoded(encoded: &p256::EncodedPoint) -> Option<Self> {
        Option::from(p256::PublicKey::from_encoded_point(encoded)).map(Recipient)
    }

    /// Returns the compressed SEC-1 encoding of this recipient.
    pub(crate) fn to_encoded(&self) -> p256::EncodedPoint {
        self.0.to_encoded_point(true)
    }

    pub(crate) fn tag(&self) -> [u8; TAG_BYTES] {
        let tag = Sha256::digest(self.to_encoded().as_bytes());
        (&tag[0..TAG_BYTES]).try_into().expect("length is correct")
    }

    /// Exposes the wrapped public key.
    pub(crate) fn public_key(&self) -> &p256::PublicKey {
        &self.0
    }
}
