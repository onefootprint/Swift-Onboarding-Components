pub mod config;
pub mod detokenize;
pub mod net_client;
pub mod pii_parser;
pub mod token_parser;
pub mod tokenize;

use enclave_proxy::{DataTransform, DataTransformer, DataTransforms};
use newtypes::FilterFunction;

pub use self::config::ingress_rule::IngressRule;

/// convert filter functions to data transforms
pub fn filter_function_to_transform(value: &FilterFunction) -> DataTransform {
    match value {
        FilterFunction::ToLowercase => DataTransform::ToLowercase,
        FilterFunction::ToUppercase => DataTransform::ToUppercase,
        FilterFunction::ToAscii => DataTransform::ToAscii,
        FilterFunction::Prefix { count } => DataTransform::Prefix { count: *count },
        FilterFunction::Suffix { count } => DataTransform::Suffix { count: *count },
        FilterFunction::Replace { from, to } => DataTransform::Replace {
            from: from.clone(),
            to: to.clone(),
        },
        FilterFunction::DateFormat { from_format, to_format } => DataTransform::DateFormat {
            from_format: from_format.clone(),
            to_format: to_format.clone()
        },
    }
}

/// convert filter functions to data transforms
pub fn transform_to_filter_function(value: DataTransform) -> Option<FilterFunction> {
    let out = match value {
        DataTransform::ToLowercase => FilterFunction::ToLowercase,
        DataTransform::ToUppercase => FilterFunction::ToUppercase,
        DataTransform::ToAscii => FilterFunction::ToAscii,
        DataTransform::Prefix { count } => FilterFunction::Prefix { count },
        DataTransform::Suffix { count } => FilterFunction::Suffix { count },
        DataTransform::Replace { from, to } => FilterFunction::Replace { from, to },
        DataTransform::DateFormat { from_format, to_format } => FilterFunction::DateFormat { from_format, to_format },
        DataTransform::Identity | DataTransform::HmacSha256 { .. } => {
            // TODO: handle more gracefull this case :)
            return None;
        }
    };
    Some(out)
}

/// Like `DataTransforms` for FilterFunction
pub struct FilterFunctions(Vec<FilterFunction>);

impl DataTransformer for FilterFunctions {
    fn apply(&self, data: Vec<u8>) -> Result<Vec<u8>, enclave_proxy::TransformError> {
        DataTransforms(self.0.iter().map(filter_function_to_transform).collect()).apply(data)
    }

    fn apply_str<T: From<String>>(&self, data: &str) -> Result<T, enclave_proxy::TransformError> {
        DataTransforms(self.0.iter().map(filter_function_to_transform).collect()).apply_str(data)
    }
}
