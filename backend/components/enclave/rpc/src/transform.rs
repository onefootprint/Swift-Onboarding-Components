use std::str::Utf8Error;

use thiserror::Error;

use crate::DataTransform;

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
}
