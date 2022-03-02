use elliptic_curve::{pkcs8::DecodePublicKey, sec1::ToEncodedPoint};

pub fn public_key_der_to_raw_uncompressed(der_bytes: &[u8]) -> Result<Vec<u8>, crate::Error> {
    let pk = p256::PublicKey::from_public_key_der(der_bytes)
        .map_err(|_| crate::Error::InvalidDerP256PublicKey)?;
    Ok(pk.to_encoded_point(false).as_ref().to_vec())
}

pub fn private_key_der_to_raw_uncompressed(der_bytes: &[u8]) -> Result<Vec<u8>, crate::Error> {
    Ok(p256::SecretKey::from_sec1_der(der_bytes)?
        .to_be_bytes()
        .to_vec())
}
