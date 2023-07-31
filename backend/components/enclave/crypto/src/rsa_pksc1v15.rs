use pkcs1::DecodeRsaPublicKey;
use rsa::{Pkcs1v15Encrypt, RsaPublicKey};

pub type HexEncodedBytes = String;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("pksc1 error: {0}")]
    Pksc1(#[from] pkcs1::Error),

    #[error("rsa crypto error: {0}")]
    Rsa(#[from] rsa::Error),
}

/// RSA PKCSv15 encryption
pub fn encrypt(data: &[u8], public_key_der: &[u8]) -> Result<Vec<u8>, crate::Error> {
    let pub_key = RsaPublicKey::from_pkcs1_der(public_key_der).map_err(Error::from)?;
    let mut rng = rand::thread_rng();
    let enc_data = pub_key
        .encrypt(&mut rng, Pkcs1v15Encrypt, data)
        .map_err(Error::from)?;
    Ok(enc_data)
}

#[cfg(test)]
mod tests {
    use pkcs1::EncodeRsaPublicKey;
    use rsa::Pkcs1v15Encrypt;
    use rsa::RsaPrivateKey;
    use rsa::RsaPublicKey;

    #[test]
    fn test_encrypt_decrypt() {
        let mut rng = rand::thread_rng();
        let bits = 2048;
        let priv_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
        let pub_key = RsaPublicKey::from(&priv_key);

        let pub_key = pub_key.to_pkcs1_der().expect("failed to encode der");
        let encrypted =
            super::encrypt(b"hello from footprint", pub_key.as_bytes()).expect("failed to encrypt");

        let dec_data = priv_key
            .decrypt(Pkcs1v15Encrypt, &encrypted)
            .expect("failed to decrypt");

        assert_eq!(dec_data.as_slice(), b"hello from footprint");
    }
}
