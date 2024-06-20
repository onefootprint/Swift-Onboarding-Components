use crate::PiiBytes;
use crypto::hex::ToHex;
use itertools::Itertools;
use std::fmt::Display;
use std::str::FromStr;
use std::vec::IntoIter;
use strum_macros::EnumDiscriminants;
use strum_macros::EnumString;

/// Represents a data transform to apply to underlying plaintext behind a data identifier
/// Proxy syntax example: `{{ id.first_name | to_lower_case }}
#[derive(
    Clone,
    EnumDiscriminants,
    PartialEq,
    Eq,
    Hash,
    serde_with::DeserializeFromStr,
    serde_with::SerializeDisplay,
)]
#[strum_discriminants(name(FilterFunctionName))]
#[strum_discriminants(derive(
    serde_with::SerializeDisplay,
    strum_macros::Display,
    EnumString,
    Hash,
    strum::EnumIter
))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
pub enum FilterFunction {
    ToLowercase,
    ToUppercase,
    ToAscii,
    Prefix(CountArgs),
    Suffix(CountArgs),
    Replace(ReplaceArgs),
    DateFormat(DateFormatArgs),
    HmacSha256(HmacSha256Args),
    Encrypt(EncryptArgs),
}

impl FilterFunctionName {
    fn example(&self) -> &'static str {
        match self {
            Self::ToLowercase => "to_lowercase",
            Self::ToUppercase => "to_uppercase",
            Self::ToAscii => "to_ascii",
            Self::Prefix => "prefix(<n>)",
            Self::Suffix => "suffix(<n>)",
            Self::Replace => "replace('<from>','<to>')",
            Self::DateFormat => "date_format('<from_format>','<to_format>')",
            Self::HmacSha256 => "hmac_sha256('<key>')",
            Self::Encrypt => "encrypt('<algorithm>','<public_key>')",
        }
    }
}

#[derive(Clone, PartialEq, Eq, Hash)]
pub struct CountArgs {
    pub count: usize,
}

#[derive(Clone, PartialEq, Eq, Hash)]
pub struct ReplaceArgs {
    pub from: String,
    pub to: String,
}

#[derive(Clone, PartialEq, Eq, Hash)]
pub struct DateFormatArgs {
    pub from_format: String,
    pub to_format: String,
}

#[derive(Clone, PartialEq, Eq, Hash)]
pub struct HmacSha256Args {
    /// hex-encoded signing key
    pub key: PiiBytes,
}

#[derive(Clone, PartialEq, Eq, Hash)]
pub struct EncryptArgs {
    pub algorithm: EncryptFilterAlgorithmName,
    /// hex encoded, DER-formatted asymmetric public key
    pub public_key: PiiBytes,
}

#[derive(Clone, PartialEq, Eq, Hash, strum_macros::Display, EnumString)]
pub enum EncryptFilterAlgorithmName {
    #[strum(serialize = "rsa_pkcs1v15")]
    RsaPkcs1v15,
    #[strum(serialize = "ecies_p256_x963_sha256_aes_gcm")]
    EciesP256X963Sha256AesGcm,
}

mod json_schema {
    use super::*;
    use strum::IntoEnumIterator;

    impl paperclip::v2::schema::Apiv2Schema for FilterFunction {
        fn name() -> Option<String> {
            Some("FilterFunction".to_string())
        }

        fn description() -> &'static str {
            "Represents a data transform to apply to underlying plaintext behind a data identifier. Specify only one of the following fields. See more here: https://docs.onefootprint.com/vault/proxy#filter-functions"
        }

        fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
            use paperclip::v2::models::DataType;
            use paperclip::v2::models::DefaultSchemaRaw;
            DefaultSchemaRaw {
                name: Some("FilterFunction".into()),
                example: None,
                data_type: Some(DataType::String),
                enum_: FilterFunctionName::iter()
                    .map(|k| k.example())
                    .map(|k| serde_json::Value::String(k.to_owned()))
                    .collect_vec(),
                ..Default::default()
            }
        }
    }
    impl paperclip::actix::OperationModifier for FilterFunction {}
}

#[derive(thiserror::Error, Debug, PartialEq)]
pub enum FilterFunctionParsingError {
    #[error("invalid parens")]
    InvalidParens,

    #[error("unexpected number of arguments: {found} but expected: {expected}")]
    UnexpectedArguments { expected: usize, found: usize },

    #[error("missing argument: {0}")]
    MissingArgument(&'static str),

    #[error("argument could not parse as Integer")]
    InvalidIntegerArgumentType(#[from] std::num::ParseIntError),

    #[error("argument invalid: {0}")]
    InvalidArgument(&'static str),

    #[error("argument '{0}' must be hex-encoded")]
    InvalidHexArgument(&'static str),

    #[error("unknown function")]
    UnknownFunctionName,

    #[error("invalid args separtor ','")]
    InvalidArgsSeparator,

    #[error("string argument {0} must use single or double quotes")]
    StringArgumentMustUseQuotes(&'static str),
}

impl FilterFunction {
    /// gets the name of the filter function
    pub fn name(&self) -> FilterFunctionName {
        self.into()
    }

    fn num_args(&self) -> usize {
        match self {
            FilterFunction::ToLowercase | FilterFunction::ToUppercase | FilterFunction::ToAscii => 0,
            FilterFunction::HmacSha256 { .. }
            | FilterFunction::Prefix { .. }
            | FilterFunction::Suffix { .. } => 1,
            FilterFunction::Encrypt { .. }
            | FilterFunction::DateFormat { .. }
            | FilterFunction::Replace { .. } => 2,
        }
    }
}

impl FromStr for FilterFunction {
    type Err = FilterFunctionParsingError;

    fn from_str(raw: &str) -> Result<Self, Self::Err> {
        let raw = raw.trim();

        // functions can either have arguments or none
        let (name, mut args) = match (raw.find('('), find_unescaped(raw, ')')) {
            (Some(open), Some(close)) if open < close => {
                // check nothing after close paren
                if close + 1 != raw.len() {
                    return Err(FilterFunctionParsingError::InvalidParens)?;
                }

                let name = &raw[0..open];
                let args = &raw[open + 1..close];

                let args = ArgParser::new(args);
                (name, args)
            }
            (None, None) => (raw, ArgParser::empty()),
            _ => return Err(FilterFunctionParsingError::InvalidParens)?,
        };

        let ff_name = FilterFunctionName::from_str(name)
            .map_err(|_| FilterFunctionParsingError::UnknownFunctionName)?;

        let func = match ff_name {
            FilterFunctionName::ToLowercase => FilterFunction::ToLowercase,
            FilterFunctionName::ToUppercase => FilterFunction::ToUppercase,
            FilterFunctionName::ToAscii => FilterFunction::ToAscii,
            FilterFunctionName::Prefix => FilterFunction::Prefix(CountArgs {
                count: args.parse_integer("count")?,
            }),
            FilterFunctionName::Suffix => FilterFunction::Suffix(CountArgs {
                count: args.parse_integer("count")?,
            }),
            FilterFunctionName::Replace => FilterFunction::Replace(ReplaceArgs {
                from: args.parse_string("from")?,
                to: args.parse_string("to")?,
            }),
            FilterFunctionName::DateFormat => FilterFunction::DateFormat(DateFormatArgs {
                from_format: args.parse_string("from_format")?,
                to_format: args.parse_string("to_format")?,
            }),
            FilterFunctionName::HmacSha256 => FilterFunction::HmacSha256(HmacSha256Args {
                key: PiiBytes::new(args.parse_hex("key")?),
            }),
            FilterFunctionName::Encrypt => FilterFunction::Encrypt(EncryptArgs {
                algorithm: EncryptFilterAlgorithmName::from_str(&args.parse_string("algorithm")?).map_err(
                    |_| FilterFunctionParsingError::InvalidArgument("algorithm is invalid or unsupported"),
                )?,
                public_key: PiiBytes::new(args.parse_hex("public_key")?),
            }),
        };

        if args.count != func.num_args() {
            return Err(FilterFunctionParsingError::UnexpectedArguments {
                expected: func.num_args(),
                found: args.count,
            })?;
        }

        Ok(func)
    }
}

impl std::fmt::Debug for FilterFunction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let ff_name = self.name();
        let args = match self {
            Self::ToLowercase => None,
            Self::ToUppercase => None,
            Self::ToAscii => None,
            Self::Prefix(CountArgs { count }) => Some(format!("{}", count)),
            Self::Suffix(CountArgs { count }) => Some(format!("{}", count)),
            Self::Replace(ReplaceArgs { from, to }) => Some(format!("\"{}\",\"{}\"", from, to)),
            Self::DateFormat(DateFormatArgs {
                from_format,
                to_format,
            }) => Some(format!("\"{}\",\"{}\"", from_format, to_format)),
            // NOTE: we are scrubbing the HMAC key
            Self::HmacSha256(HmacSha256Args { key: _ }) => Some(format!("\"{}\"", "<scrubbed>")),
            Self::Encrypt(EncryptArgs {
                algorithm,
                public_key: _,
            }) => Some(format!("\"{}\",\"<scrubbed>\"", algorithm,)),
        };
        if let Some(args) = args {
            write!(f, "{}({})", ff_name, args)
        } else {
            write!(f, "{}", ff_name)
        }
    }
}

impl Display for FilterFunction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let ff_name = self.name();
        let args = match self {
            Self::ToLowercase => None,
            Self::ToUppercase => None,
            Self::ToAscii => None,
            Self::Prefix(CountArgs { count }) => Some(format!("{}", count)),
            Self::Suffix(CountArgs { count }) => Some(format!("{}", count)),
            Self::Replace(ReplaceArgs { from, to }) => Some(format!("\"{}\",\"{}\"", from, to)),
            Self::DateFormat(DateFormatArgs {
                from_format,
                to_format,
            }) => Some(format!("\"{}\",\"{}\"", from_format, to_format)),
            // NOTE: we are scrubbing the HMAC key
            Self::HmacSha256(HmacSha256Args { key: _ }) => Some(format!("\"{}\"", "<scrubbed>")),
            Self::Encrypt(EncryptArgs {
                algorithm,
                public_key,
            }) => Some(format!(
                "\"{}\",\"{}\"",
                algorithm,
                public_key.encode_hex::<String>(), /* algorithm, public_key */
            )),
        };
        if let Some(args) = args {
            write!(f, "{}({})", ff_name, args)
        } else {
            write!(f, "{}", ff_name)
        }
    }
}

/// helper function to find an unescaped char (i.e. `c` but NOT `\c`)
fn find_unescaped(raw: &str, c: char) -> Option<usize> {
    let mut pos = 0;
    while let Some(loc) = raw[pos..].find(c) {
        if raw.get(loc - 1..loc) == Some("\\") {
            pos = loc + 1;
            continue;
        }
        return Some(pos + loc);
    }
    None
}

/// Args are comma-separated values.
/// Support parsing Integers and Strings
/// Escape special characters like `(`, `)`, `,` with the escape character `\`.
/// Strings must be in double or single quotes
/// We do this so that we can support escaped strings and separators.
struct ArgParser {
    count: usize,
    args: IntoIter<String>,
}

impl ArgParser {
    fn empty() -> Self {
        Self {
            count: 0,
            args: vec![].into_iter(),
        }
    }

    fn new(args: &str) -> Self {
        let mut args_list = vec![];

        let mut pos = 0;
        while let Some(sep) = find_unescaped(&args[pos..], ',') {
            args_list.push(&args[pos..pos + sep]);
            pos += sep + 1;
        }

        // add the last arg
        let last = &args[pos..];
        if !last.is_empty() {
            args_list.push(last);
        }

        // trim args and remove the escape literals
        let args_list = args_list
            .into_iter()
            .map(|arg| {
                arg.trim()
                    .replace("\\(", "(")
                    .replace("\\)", ")")
                    .replace("\\,", ",")
            })
            .collect_vec();
        let count = args_list.len();
        let args = args_list.into_iter();
        ArgParser { count, args }
    }

    fn parse_integer(&mut self, name: &'static str) -> Result<usize, FilterFunctionParsingError> {
        self.args
            .next()
            .ok_or(FilterFunctionParsingError::MissingArgument(name))?
            .parse()
            .map_err(FilterFunctionParsingError::from)
    }

    /// must be in single or double quotes `'`
    fn parse_string(&mut self, name: &'static str) -> Result<String, FilterFunctionParsingError> {
        let arg = self
            .args
            .next()
            .ok_or(FilterFunctionParsingError::MissingArgument(name))?;

        if let Some(rem) = arg.strip_prefix('\"') {
            if let Some(rem) = rem.strip_suffix('\"') {
                return Ok(rem.to_string());
            }
        } else if let Some(rem) = arg.strip_prefix('\'') {
            if let Some(rem) = rem.strip_suffix('\'') {
                return Ok(rem.to_string());
            }
        }

        Err(FilterFunctionParsingError::StringArgumentMustUseQuotes(name))
    }

    fn parse_hex(&mut self, name: &'static str) -> Result<Vec<u8>, FilterFunctionParsingError> {
        crypto::hex::decode(self.parse_string(name)?)
            .map_err(|_| FilterFunctionParsingError::InvalidHexArgument(name))
    }
}

#[cfg(test)]
mod tests {
    use super::FilterFunction as FF;
    use super::FilterFunctionParsingError::*;
    use super::*;
    use crypto::hex::FromHex;
    use test_case::test_case;

    #[test_case("to_ascii" => Ok(FF::ToAscii))]
    #[test_case("prefix(4)" => Ok(FF::Prefix(CountArgs { count: 4})))]
    #[test_case("suffix(412)" => Ok(FF::Suffix(CountArgs { count: 412})))]
    #[test_case("suffix(412, 42)" => Err(UnexpectedArguments { expected: 1, found: 2 }))]
    #[test_case("to_lowercase()" => Ok(FF::ToLowercase))]
    #[test_case("to_ascii(1)" => Err(UnexpectedArguments { expected: 0, found: 1 }))]
    #[test_case(" to_uppercase " => Ok(FF::ToUppercase))]
    #[test_case("replace('a','b')" => Ok(FF::Replace(ReplaceArgs { from: "a".into(), to: "b".into() })))]
    #[test_case("replace(c,d)" => Err(StringArgumentMustUseQuotes("from")))]
    #[test_case("replace('\"hi','flerp')" => Ok(FF::Replace(ReplaceArgs { from: "\"hi".into(), to: "flerp".into() })))]
    #[test_case("replace(\"my\\,flerp\",\" derp \")" => Ok(FF::Replace(ReplaceArgs { from: "my,flerp".into(), to: " derp ".into() })))]
    #[test_case("replace('\\(my','paren\\)')" => Ok(FF::Replace(ReplaceArgs { from: "(my".into(), to: "paren)".into() })))]
    #[test_case("hmac_sha256('00')" => Ok(FF::HmacSha256(HmacSha256Args { key: PiiBytes::new(vec![0x00]) })))]
    #[test_case("encrypt('rsa_pkcs1v15', '00')" => Ok(FF::Encrypt(EncryptArgs { algorithm: EncryptFilterAlgorithmName::RsaPkcs1v15, public_key: PiiBytes::new(vec![0x00]) })))]
    #[test_case("encrypt('ecies_p256_x963_sha256_aes_gcm', '00')" => Ok(FF::Encrypt(EncryptArgs { algorithm: EncryptFilterAlgorithmName::EciesP256X963Sha256AesGcm, public_key: PiiBytes::new(vec![0x00]) })))]
    fn test_filter_function_parsing(input: &str) -> Result<FilterFunction, FilterFunctionParsingError> {
        FilterFunction::from_str(input)
    }

    #[test_case(FF::ToLowercase => "to_lowercase".to_string())]
    #[test_case(FF::ToUppercase => "to_uppercase".to_string())]
    #[test_case(FF::ToAscii => "to_ascii".to_string())]
    #[test_case(FF::Prefix(CountArgs{count: 10}) => "prefix(10)".to_string())]
    #[test_case(FF::Suffix(CountArgs{count: 11}) => "suffix(11)".to_string())]
    #[test_case(FF::Replace(ReplaceArgs{from: "flerp".into(), to: "derp".into()}) => "replace(\"flerp\",\"derp\")".to_string())]
    #[test_case(FF::DateFormat(DateFormatArgs{from_format: "flerp".into(), to_format: "derp".into()}) => "date_format(\"flerp\",\"derp\")".to_string())]
    // NOTE: Be careful if we start not scrubbing the HMAC key - we may be logging it in places
    #[test_case(FF::HmacSha256(HmacSha256Args{key: PiiBytes::from_hex("deadbeef").unwrap()}) => "hmac_sha256(\"<scrubbed>\")".to_string())]
    #[test_case(FF::Encrypt(EncryptArgs{algorithm: EncryptFilterAlgorithmName::RsaPkcs1v15, public_key: PiiBytes::from_hex("deadbeef").unwrap()}) => "encrypt(\"rsa_pkcs1v15\",\"deadbeef\")".to_string())]
    #[test_case(FF::Encrypt(EncryptArgs{algorithm: EncryptFilterAlgorithmName::EciesP256X963Sha256AesGcm, public_key: PiiBytes::from_hex("ba5eba11").unwrap()}) => "encrypt(\"ecies_p256_x963_sha256_aes_gcm\",\"ba5eba11\")".to_string())]
    fn test_display(ff: FF) -> String {
        format!("{}", ff)
    }

    #[test_case(FF::ToLowercase)]
    #[test_case(FF::ToUppercase)]
    #[test_case(FF::ToAscii)]
    #[test_case(FF::Prefix(CountArgs{count: 10}))]
    #[test_case(FF::Suffix(CountArgs{count: 10}))]
    #[test_case(FF::Replace(ReplaceArgs{from: "flerp".into(), to: "derp".into()}))]
    #[test_case(FF::DateFormat(DateFormatArgs{from_format: "flerp".into(), to_format: "derp".into()}))]
    #[test_case(FF::Encrypt(EncryptArgs{algorithm: EncryptFilterAlgorithmName::EciesP256X963Sha256AesGcm, public_key: PiiBytes::from_hex("deadbeef").unwrap()}))]
    fn test_display_fromstr(ff: FF) {
        let ff_str = format!("{}", ff);
        let ff_parsed = FF::from_str(&ff_str).unwrap();
        assert_eq!(ff, ff_parsed);
    }

    #[test_case(FF::ToLowercase => "to_lowercase".to_string())]
    #[test_case(FF::ToUppercase => "to_uppercase".to_string())]
    #[test_case(FF::ToAscii => "to_ascii".to_string())]
    #[test_case(FF::Prefix(CountArgs{count: 10}) => "prefix(10)".to_string())]
    #[test_case(FF::Suffix(CountArgs{count: 11}) => "suffix(11)".to_string())]
    #[test_case(FF::Replace(ReplaceArgs{from: "flerp".into(), to: "derp".into()}) => "replace(\"flerp\",\"derp\")".to_string())]
    #[test_case(FF::DateFormat(DateFormatArgs{from_format: "flerp".into(), to_format: "derp".into()}) => "date_format(\"flerp\",\"derp\")".to_string())]
    #[test_case(FF::HmacSha256(HmacSha256Args{key: PiiBytes::from_hex("deadbeef").unwrap()}) => "hmac_sha256(\"<scrubbed>\")".to_string())]
    #[test_case(FF::Encrypt(EncryptArgs{algorithm: EncryptFilterAlgorithmName::RsaPkcs1v15, public_key: PiiBytes::from_hex("deadbeef").unwrap()}) => "encrypt(\"rsa_pkcs1v15\",\"<scrubbed>\")".to_string())]
    #[test_case(FF::Encrypt(EncryptArgs{algorithm: EncryptFilterAlgorithmName::EciesP256X963Sha256AesGcm, public_key: PiiBytes::from_hex("ba5eba11").unwrap()}) => "encrypt(\"ecies_p256_x963_sha256_aes_gcm\",\"<scrubbed>\")".to_string())]
    fn test_debug(ff: FF) -> String {
        format!("{:?}", ff)
    }

    #[test]
    fn test_display_hmac_scrubbed() {
        // HmacSha256 display should be scrubbed since it contains a private key
        let ff = FF::HmacSha256(HmacSha256Args {
            key: PiiBytes::from_hex("ba5eba11").unwrap(),
        });
        let ff_str = format!("{}", ff);
        assert_eq!(ff_str, "hmac_sha256(\"<scrubbed>\")");
    }

    #[test_case("hello my name, is", ',' => Some(13))]
    #[test_case("hello\\, world", ',' => None)]
    #[test_case("hello\\, world1,", ',' => Some(14))]
    fn test_unescaped(raw: &str, c: char) -> Option<usize> {
        find_unescaped(raw, c)
    }

    #[test_case("hello,world" => 2)]
    #[test_case("hello" => 1)]
    #[test_case("" => 0)]
    #[test_case("hello,world,today," => 3)]
    #[test_case("hello , world , hi" => 3)]
    fn test_arg_parser(args: &str) -> usize {
        ArgParser::new(args).count
    }
}
