use self::ec_decode_helper::EcPrivateKeyWrapper;
use crate::aead::ScopedSealingKey;
use elliptic_curve::pkcs8::DecodePublicKey;
use elliptic_curve::sec1::ToEncodedPoint;
use sec1::der::Decode;
use sec1::pkcs8::EncodePublicKey;

pub fn public_key_der_to_raw_uncompressed(der_bytes: &[u8]) -> Result<Vec<u8>, crate::Error> {
    let pk =
        p256::PublicKey::from_public_key_der(der_bytes).map_err(|_| crate::Error::InvalidDerP256PublicKey)?;
    Ok(pk.to_encoded_point(false).as_ref().to_vec())
}

pub fn public_key_raw_uncompressed_to_der(bytes: &[u8]) -> Result<Vec<u8>, crate::Error> {
    let pk = p256::PublicKey::from_sec1_bytes(bytes).map_err(|_| crate::Error::InvalidSec1P256PublicKey)?;
    Ok(pk
        .to_public_key_der()
        .map_err(|_| crate::Error::InvalidDerP256PublicKey)?
        .to_vec())
}

pub fn public_key_raw_uncompressed_validated(bytes: &[u8]) -> Result<Vec<u8>, crate::Error> {
    let pk = p256::PublicKey::from_sec1_bytes(bytes).map_err(|_| crate::Error::InvalidSec1P256PublicKey)?;
    Ok(pk.to_encoded_point(false).as_ref().to_vec())
}

pub fn private_key_der_to_raw_uncompressed(der_bytes: &[u8]) -> Result<Vec<u8>, crate::Error> {
    let EcPrivateKeyWrapper { private_key } = ec_decode_helper::EcPrivateKeyWrapper::from_der(der_bytes)
        .map_err(|_| crate::Error::InvalidDerP256PrivateKey)?;
    Ok(p256::SecretKey::from_be_bytes(private_key.private_key)?
        .to_be_bytes()
        .to_vec())
}

/// Scope for an enclave ikek
pub const ENCLAVE_IKEK_SCOPE: &str = "enclave_ikek";

/// parse bytes into an enaclave ikek scoped sealing key
pub fn to_enclave_ikek_sealing_key(bytes: Vec<u8>) -> Result<ScopedSealingKey, crate::Error> {
    ScopedSealingKey::new(bytes, ENCLAVE_IKEK_SCOPE)
}

mod ec_decode_helper {
    //! SEC1 elliptic curve private key support.
    //!
    //! Support for ASN.1 DER-encoded elliptic curve private keys as described in
    //! SEC1: Elliptic Curve Cryptography (Version 2.0) Appendix C.4 (p.108):
    //!
    //! <https://www.secg.org/sec1-v2.pdf>

    use core::fmt;
    use sec1::der::asn1::{
        Any,
        OctetStringRef,
    };
    use sec1::der::{
        self,
        Decode,
        Reader,
    };
    use sec1::EcPrivateKey;

    #[derive(Clone)]
    pub struct EcPrivateKeyWrapper<'a> {
        /// Private key data.
        pub private_key: EcPrivateKey<'a>,
    }

    impl<'a> Decode<'a> for EcPrivateKeyWrapper<'a> {
        fn decode<R: der::Reader<'a>>(decoder: &mut R) -> der::Result<Self> {
            decoder.sequence(|decoder| {
                if decoder.decode::<u8>()? != 0u8 {
                    return Err(der::Tag::Integer.value_error());
                }

                let _: Any = decoder.decode()?;

                let ec_private_key = decoder.decode::<OctetStringRef>()?.as_bytes();
                let private_key = EcPrivateKey::from_der(ec_private_key)?;

                Ok(EcPrivateKeyWrapper { private_key })
            })
        }
    }
    impl<'a> TryFrom<&'a [u8]> for EcPrivateKeyWrapper<'a> {
        type Error = der::Error;

        fn try_from(bytes: &'a [u8]) -> Result<EcPrivateKeyWrapper<'a>, Self::Error> {
            Self::from_der(bytes)
        }
    }

    impl<'a> fmt::Debug for EcPrivateKeyWrapper<'a> {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            self.private_key.fmt(f)
        }
    }
}
#[cfg(test)]
mod tests {
    #[test]
    fn test_convert_private_key() {
        let key = hex::decode("308193020100301306072a8648ce3d020106082a8648ce3d0301070479307702010104200885f83d737270e27c6d289670b25c53df74c938aa5ff6a92a0973f1078337cea00a06082a8648ce3d030107a1440342000443b939f03a7ece0d11d7bdad66c2c26aca4c8b36ef15af2eb4ce6b2a5126eaad2415a27928a8916db0404a143c74acbaa6ac4af3038d1d8ca97fa56aabb62e67").unwrap();

        super::private_key_der_to_raw_uncompressed(&key).unwrap();
    }
}
