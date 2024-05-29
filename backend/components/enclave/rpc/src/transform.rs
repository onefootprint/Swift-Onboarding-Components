use crate::{
    DataTransform,
    EncryptTransformAlgorithm,
};
use std::str::Utf8Error;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum TransformError {
    #[error("cryptography error: {0}")]
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
            RsaPkcs1v15 => crypto::rsa_pksc1v15::encrypt(data, public_key_der)?,
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

        let pk_der = crypto::hex::decode("30820122300d06092a864886f70d01010105000382010f003082010a0282010100d1bd6da56e6cea4fddeed843a66ba94e534cbdaf61f90427d7b734ca9a36bb358cfb3a63e4e017c248f3ed39a6325fd48aed569bb59384870c050f8a2f39b8e7dd145f14935b1cce4905d6580133a78624a7120262c3470351a92eda9d03eac641ccb1dd3264761d7ee5259109c4494229146b9c1c02912cf8bfcd066f0078acbfaeab438dbd018c0a99be854f7b8276cc994fc306f1ac8b29b920909b195e6c81ed8bdefe99a7e51aecbff5757c6b0d4584a6cce68790c6cf4cd09e3dc756bb6aaa4812e5b7676db8510c2e1b3468d2f377a4fdd8192e5c7c58d58e5690157d04cdabe5e06eeef46d88a663e4cbf0357835b20b9d0afc5d0d442b586f8524c30203010001").expect("hex decode");

        let _ = test_apply_data_tranform(
            vec![Encrypt {
                algorithm: EncryptTransformAlgorithm::RsaPkcs1v15,
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
