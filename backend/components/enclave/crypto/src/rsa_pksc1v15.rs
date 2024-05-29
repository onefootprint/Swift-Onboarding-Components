use rsa::pkcs8::DecodePublicKey;
use rsa::{
    Pkcs1v15Encrypt,
    RsaPublicKey,
};

pub type HexEncodedBytes = String;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("Invalid DER public-key error")]
    DecodePublicKeyError(String),

    #[error("rsa crypto error")]
    Rsa(#[from] rsa::Error),
}

/// RSA PKCSv15 encryption
pub fn encrypt(data: &[u8], public_key_der: &[u8]) -> Result<Vec<u8>, crate::Error> {
    let pub_key = RsaPublicKey::from_public_key_der(public_key_der)
        .map_err(|e| Error::DecodePublicKeyError(format!("{:?}", &e)))?;
    let mut rng = rand::thread_rng();
    let enc_data = pub_key
        .encrypt(&mut rng, Pkcs1v15Encrypt, data)
        .map_err(Error::from)?;
    Ok(enc_data)
}

#[cfg(test)]
mod tests {
    use rsa::pkcs8::{
        DecodePublicKey,
        EncodePublicKey,
    };
    use rsa::{
        Pkcs1v15Encrypt,
        RsaPrivateKey,
        RsaPublicKey,
    };

    #[test]
    fn test_encrypt_decrypt() {
        let mut rng = rand::thread_rng();
        let bits = 2048;
        let priv_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
        let pub_key = RsaPublicKey::from(&priv_key);

        let pub_key = pub_key.to_public_key_der().expect("failed to encode der");
        let encrypted =
            super::encrypt(b"hello from footprint", pub_key.as_bytes()).expect("failed to encrypt");

        let dec_data = priv_key
            .decrypt(Pkcs1v15Encrypt, &encrypted)
            .expect("failed to decrypt");

        assert_eq!(dec_data.as_slice(), b"hello from footprint");
    }

    #[test]
    fn test_pubkey_parsing() {
        let pk_der_b64 = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0b1tpW5s6k/d7thDpmupTlNMva9h+QQn17c0ypo2uzWM+zpj5OAXwkjz7TmmMl/Uiu1Wm7WThIcMBQ+KLzm4590UXxSTWxzOSQXWWAEzp4YkpxICYsNHA1GpLtqdA+rGQcyx3TJkdh1+5SWRCcRJQikUa5wcApEs+L/NBm8AeKy/rqtDjb0BjAqZvoVPe4J2zJlPwwbxrIspuSCQmxlebIHti97+maflGuy/9XV8aw1FhKbM5oeQxs9M0J49x1a7aqpIEuW3Z224UQwuGzRo0vN3pP3YGS5cfFjVjlaQFX0Ezavl4G7u9G2IpmPky/A1eDWyC50K/F0NRCtYb4UkwwIDAQAB";
        let pk_der = base64::decode(pk_der_b64).expect("decode base64");
        let _ = RsaPublicKey::from_public_key_der(&pk_der).expect("invalid public key");
    }
}
