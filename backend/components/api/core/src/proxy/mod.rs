pub mod config;
pub mod detokenize;
pub mod net_client;
pub mod pii_parser;
pub mod token_parser;
pub mod tokenize;
use crate::errors::{proxy::VaultProxyError, ApiResult};
use enclave_proxy::{DataTransform, DataTransforms};
use newtypes::{CountArgs, DateFormatArgs, EncryptArgs, FilterFunction, HmacSha256Args, ReplaceArgs};

pub use self::config::ingress_rule::IngressRule;

pub fn to_data_transforms(transforms: &[FilterFunction]) -> Vec<DataTransform> {
    transforms.iter().map(filter_function_to_transform).collect()
}

/// convert filter functions to data transforms
fn filter_function_to_transform(value: &FilterFunction) -> DataTransform {
    match value {
        FilterFunction::ToLowercase => DataTransform::ToLowercase,
        FilterFunction::ToUppercase => DataTransform::ToUppercase,
        FilterFunction::ToAscii => DataTransform::ToAscii,
        FilterFunction::Prefix(CountArgs { count }) => DataTransform::Prefix { count: *count },
        FilterFunction::Suffix(CountArgs { count }) => DataTransform::Suffix { count: *count },
        FilterFunction::Replace(ReplaceArgs { from, to }) => DataTransform::Replace {
            from: from.clone(),
            to: to.clone(),
        },
        FilterFunction::DateFormat(DateFormatArgs {
            from_format,
            to_format,
        }) => DataTransform::DateFormat {
            from_format: from_format.clone(),
            to_format: to_format.clone(),
        },
        FilterFunction::HmacSha256(HmacSha256Args { key }) => DataTransform::HmacSha256 {
            key: key.clone().into_leak(),
        },
        FilterFunction::Encrypt(EncryptArgs {
            algorithm,
            public_key,
        }) => DataTransform::Encrypt {
            algorithm: match algorithm {
                newtypes::EncryptFilterAlgorithmName::RsaPkcs1v15 => {
                    enclave_proxy::EncryptTransformAlgorithm::RsaPksc1v15
                }
                newtypes::EncryptFilterAlgorithmName::EciesP256X963Sha256AesGcm => {
                    enclave_proxy::EncryptTransformAlgorithm::EciesP256X963Sha256AesGcm
                }
            },
            public_key_der: public_key.clone().into_leak(),
        },
    }
}

pub fn get_transformer(ffs: &[FilterFunction]) -> DataTransforms {
    DataTransforms(to_data_transforms(ffs))
}

pub fn validate_not_footprint_url(url: &url::Url) -> ApiResult<()> {
    if let Some(domain) = url.domain().as_ref() {
        if domain.to_lowercase().ends_with("onefootprint.com") {
            return Err(VaultProxyError::InvalidFootprintDestinationUrl.into());
        }
    }
    Ok(())
}

#[cfg(test)]
mod test {
    use super::validate_not_footprint_url;
    use test_case::test_case;

    #[test_case("http://flerp.derp.com/hayes_valley" => true)]
    #[test_case("https://api.onefootprint.com/vault_proxy/jit" => false)]
    #[test_case("http://onefootprint.com" => false)]
    fn test_validate_not_footprint_url(url: &str) -> bool {
        let url = url::Url::parse(url).unwrap();
        validate_not_footprint_url(&url).is_ok()
    }
}
