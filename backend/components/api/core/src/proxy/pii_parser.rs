//! Parses PII on the INGRESS for vaulting/tokenization

use std::collections::HashMap;

use crate::proxy::IngressRule;
use actix_web::web::Bytes;
use newtypes::PiiString;

use crate::errors::{proxy::VaultProxyError, ApiResult};

use super::config::{IngressConfig, IngressContentType};

pub struct TokenizedIngress {
    pub tokenized_body: Bytes,
    pub values_to_vault: HashMap<IngressRule, PiiString>,
}

/// Tranforms the ingress response into a tokenized response by the
/// configuration rules
///
/// Also: returns values to send to the vault
pub async fn process_ingress(response: bytes::Bytes, config: IngressConfig) -> ApiResult<TokenizedIngress> {
    let extractor = match config.content_type {
        IngressContentType::Unspecified => {
            // we need a content-type if rules are provided
            if !config.rules.is_empty() {
                return Err(VaultProxyError::MissingIngressRuleContentType)?;
            }

            // nothing to do!
            return Ok(TokenizedIngress {
                tokenized_body: response,
                values_to_vault: HashMap::new(),
            });
        }
        IngressContentType::Json => JsonPath {
            value: serde_json::from_slice(response.as_ref())?,
        },
    };

    Ok(extractor.process_rules(config.rules)?)
}

trait IngressTokenizer {
    /// convert an ingress body into a tokenized body byte buffer
    /// along with the resulting pii values that need tokenization
    fn process_rules(self, rules: Vec<IngressRule>) -> Result<TokenizedIngress, VaultProxyError>;
}

struct JsonPath {
    value: serde_json::Value,
}

impl IngressTokenizer for JsonPath {
    fn process_rules(self, rules: Vec<IngressRule>) -> Result<TokenizedIngress, VaultProxyError> {
        use serde_json::Value;

        let mut value = self.value;
        let mut values_to_vault: Vec<Result<_, _>> = vec![];

        for rule in rules {
            // note: clone here needed unfortunately because we don't necessarily get
            // value back if the replace_with call fails, see match below.
            let result = jsonpath_lib::replace_with(value.clone(), &rule.target, &mut |val| {
                let pii = match val {
                    Value::Number(d) => Ok(PiiString::from(format! {"{}", d})),
                    Value::String(value) => Ok(PiiString::from(value)),
                    _ => Err(VaultProxyError::TargetJsonPathValueNotAStringOrNumber),
                };
                values_to_vault.push(pii.map(|p| (rule.clone(), p)));
                Some(Value::String(rule.proxy_token.display_for_ingress()))
            });

            match result {
                // replacement happened, update our value
                Ok(new_value) => value = new_value,
                Err(error) => match error {
                    // empty, so skip
                    jsonpath_lib::JsonPathError::EmptyPath | jsonpath_lib::JsonPathError::EmptyValue => {
                        continue
                    }
                    // hard fail
                    jsonpath_lib::JsonPathError::Path(_) | jsonpath_lib::JsonPathError::Serde(_) => {
                        return Err(error)?
                    }
                },
            }
        }

        let values_to_vault = values_to_vault.into_iter().collect::<Result<Vec<_>, _>>()?;
        let values_to_vault = values_to_vault.into_iter().collect();
        let tokenized_body = Bytes::from(serde_json::to_vec(&value)?);

        Ok(TokenizedIngress {
            tokenized_body,
            values_to_vault,
        })
    }
}
