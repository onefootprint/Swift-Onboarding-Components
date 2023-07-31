use std::str::Utf8Error;

use thiserror::Error;

use crate::{DataTransform, EncryptTransformAlgorithm};

#[derive(Error, Debug)]
pub enum TransformError {
    #[error("failed cryptographic operation: {0}")]
    CryptoError(#[from] crypto::Error),

    #[error("invalid utf-8 string")]
    TransformExpectedString(#[from] Utf8Error),

    #[error("invalid date or date format")]
    DateFormat(#[from] chrono::ParseError),
}

pub trait DataTransformer {
    fn apply(&self, data: Vec<u8>) -> Result<Vec<u8>, TransformError>;
    fn apply_str<T: From<String>>(&self, data: &str) -> Result<T, TransformError>;
}

impl DataTransformer for DataTransform {
    /// applies the transform to a data input
    fn apply(&self, data: Vec<u8>) -> Result<Vec<u8>, TransformError> {
        let out = match self {
            DataTransform::Identity => data,
            DataTransform::HmacSha256 { key } => crypto::hex::encode(crypto::hmac_sha256_sign(key, &data)?)
                .as_bytes()
                .to_vec(),
            DataTransform::Encrypt {
                algorithm,
                public_key_der,
            } => crypto::hex::encode(algorithm.encrypt(public_key_der.as_slice(), data.as_slice())?)
                .as_bytes()
                .to_vec(),
            DataTransform::Prefix { .. }
            | DataTransform::Suffix { .. }
            | DataTransform::ToLowercase
            | DataTransform::ToUppercase
            | DataTransform::ToAscii
            | DataTransform::Replace { .. }
            | DataTransform::DateFormat { .. } => {
                let str = std::str::from_utf8(&data)?;
                let out = self.apply_str::<String>(str)?;
                out.as_bytes().to_vec()
            }
        };

        Ok(out)
    }

    /// applies the transform when a string input
    fn apply_str<T: From<String>>(&self, data: &str) -> Result<T, TransformError> {
        let string = match self {
            DataTransform::Identity => data.to_string(),
            DataTransform::HmacSha256 { key } => {
                crypto::hex::encode(crypto::hmac_sha256_sign(key, data.as_bytes())?)
            }
            DataTransform::Encrypt {
                algorithm,
                public_key_der,
            } => crypto::hex::encode(algorithm.encrypt(public_key_der.as_slice(), data.as_bytes())?),
            DataTransform::ToLowercase => data.to_lowercase(),
            DataTransform::ToUppercase => data.to_uppercase(),
            DataTransform::ToAscii => deunicode::deunicode(data),
            DataTransform::Prefix { count } => data.chars().take(*count).collect(),
            DataTransform::Suffix { count } => {
                if *count < data.len() {
                    data.chars().skip(data.len() - count).collect()
                } else {
                    data.to_string()
                }
            }
            DataTransform::Replace { from, to } => data.replace(from.as_str(), to.as_str()),
            DataTransform::DateFormat {
                from_format,
                to_format,
            } => {
                let datetime = chrono::NaiveDate::parse_from_str(data, from_format.as_str())?;
                datetime.format(to_format).to_string()
            }
        };
        Ok(T::from(string))
    }
}

impl EncryptTransformAlgorithm {
    pub fn encrypt(&self, public_key_der: &[u8], data: &[u8]) -> Result<Vec<u8>, TransformError> {
        use EncryptTransformAlgorithm::*;
        Ok(match self {
            RsaPksc1v15 => crypto::rsa_pksc1v15::encrypt(data, public_key_der)?,
            EciesP256X963Sha256AesGcm => {
                let pub_key = crypto::conversion::public_key_der_to_raw_uncompressed(public_key_der)?;
                crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(&pub_key, data.to_vec())?.to_vec()?
            }
        })
    }
}

pub struct DataTransforms(pub Vec<DataTransform>);
impl DataTransformer for DataTransforms {
    fn apply(&self, data: Vec<u8>) -> Result<Vec<u8>, TransformError> {
        let mut out = data;
        for transform in &self.0 {
            out = transform.apply(out)?;
        }
        Ok(out)
    }

    fn apply_str<T: From<String>>(&self, data: &str) -> Result<T, TransformError> {
        let mut out = data.to_string();
        for transform in &self.0 {
            out = transform.apply_str(&out)?;
        }
        Ok(T::from(out))
    }
}

#[cfg(test)]
mod tests {
    use super::DataTransform::*;
    use super::*;
    use test_case::test_case;

    #[test_case(vec![], "Hi Hello 🎉" => "Hi Hello 🎉".to_string())]
    #[test_case(vec![Identity], "Hi Hello 🎉" => "Hi Hello 🎉".to_string())]
    #[test_case(vec![ToLowercase], "HeLLo WORld" => "hello world".to_string())]
    #[test_case(vec![ToUppercase], "HeLLo WORld" => "HELLO WORLD".to_string())]
    #[test_case(vec![ToAscii], "Hi Álex Hello 🎉" => "Hi Alex Hello tada".to_string())]
    #[test_case(vec![Prefix { count: 3}], "Hello World" => "Hel".to_string())]
    #[test_case(vec![Suffix { count: 3}], "Hello World" => "rld".to_string())]
    #[test_case(vec![Prefix { count: 15}], "Hello World" => "Hello World".to_string())]
    #[test_case(vec![Suffix { count: 43}], "Hello World" => "Hello World".to_string())]
    #[test_case(vec![HmacSha256 { key: vec![0,1,2,3]}], "Hello World" => "a1616b32521caae43a9479cca28904bc5f6b9e3056fadef332129116d50523eb".to_string())]
    #[test_case(vec![ToAscii, ToUppercase], "Hi Hello 🎉" => "HI HELLO TADA".to_string())]
    #[test_case(vec![ToUppercase, Suffix { count: 4 }, Prefix { count: 2 } ], "Hello flerp derp" => "DE".to_string())]
    #[test_case(vec![ToUppercase, Prefix { count: 4 }, ToLowercase ], "Hello flerp derp" => "hell".to_string())]
    #[test_case(vec![ToUppercase, Replace { from: "FLERP".into(), to: "".into() }, ToLowercase ], "Hello flerp derp" => "hello  derp".to_string())]
    #[test_case(vec![DateFormat { from_format: "%Y-%m-%d".into(), to_format: "%m/%y".into()}], "1984-09-24" => "09/84".to_string())]
    #[test_case(vec![DateFormat { from_format: "%Y-%m-%d".into(), to_format: "%A in %B".into()}], "1984-09-24" => "Monday in September".to_string())]
    fn test_apply_data_tranform(transforms: Vec<DataTransform>, input: &str) -> String {
        DataTransforms(transforms)
            .apply_str(input)
            .expect("error occured processing transform")
    }

    #[test]
    fn test_rsa_encrypt() {
        let input = "footprint hello world";
        let pk_der = crypto::hex::decode("3082010a0282010100ebe06f857cf432c7ac5994e95651f3af27cd2653ee92a42ae4d46c614f0e29b408d5ae0905736d765dcfb304bb5ca9f6c2557979c8c1250cd2d1cb832150a9e3fc4c554ccea1ce98744c2ec3a02998ef3146e0a441c403860af9c123f729820e3b62a6877d75734b9b69c4ec60b9bbae85a0582515f6b1deda43f542e74dbdfe85ba0a2be5d440f1d1745c7f4808c81509520adb3ed7e9fa9078fb481e495d6bcb8a7a780c46ad88a3c4bdf6da73e3d4d11b4f2a720b7ad99e49d5952d004dc6bcc462e3fac6e8fcdbb419c63e3fc028fa4c2ab91d5adcb48a984a4b2e430b843c563672753eafd43e3b2c7fbedae73f2bd40a44e69b059c77dd48397307e6590203010001").expect("hex decode");

        let _ = test_apply_data_tranform(
            vec![Encrypt {
                algorithm: EncryptTransformAlgorithm::RsaPksc1v15,
                public_key_der: pk_der,
            }],
            input,
        );
    }

    #[test]
    fn test_ecies_encrypt() {
        let input = "footprint hello world";
        let pk = crypto::hex::decode("0460f81c63e9bb142cc75091bf44ae979e707e0928785c84e4f936ca3e680d3c6029eb2844268aa117349277abf0c60c03dc6f1ae80530857f8438865ff5166321").expect("hex decode");
        let pk_der = crypto::conversion::public_key_raw_uncompressed_to_der(&pk).expect("convert");

        let _ = test_apply_data_tranform(
            vec![Encrypt {
                algorithm: EncryptTransformAlgorithm::EciesP256X963Sha256AesGcm,
                public_key_der: pk_der,
            }],
            input,
        );
    }
}
