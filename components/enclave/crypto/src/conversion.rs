use openssl::{bn::BigNumContext, ec::PointConversionForm};

pub fn public_key_der_to_raw_uncompressed(der_bytes: &[u8]) -> Result<Vec<u8>, crate::Error> {
    let pk = openssl::ec::EcKey::public_key_from_der(der_bytes)?;
    let mut ctx = BigNumContext::new()?;
    let pk_raw =
        pk.public_key()
            .to_bytes(pk.group(), PointConversionForm::UNCOMPRESSED, &mut ctx)?;
    Ok(pk_raw)
}

pub fn private_key_der_to_raw_uncompressed(der_bytes: &[u8]) -> Result<Vec<u8>, crate::Error> {
    let sk = openssl::ec::EcKey::private_key_from_der(der_bytes)?;
    let sk_raw = sk.private_key().to_vec();
    Ok(sk_raw)
}
