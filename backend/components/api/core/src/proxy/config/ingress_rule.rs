use std::str::FromStr;

use crate::errors::{proxy::VaultProxyError, ApiError};
use actix_web::http::header::HeaderMap;
use db::models::proxy_config::ProxyConfigIngressRule;
use newtypes::{DataIdentifier, FpId, ProxyToken, ProxyTokenError};

/// Ingress rules define how to vault data in the response
/// from the proxy requests
#[derive(Debug, Clone, PartialEq, Hash, Eq)]
pub struct IngressRule {
    /// The token to vault
    pub proxy_token: ProxyToken,

    /// Target data to tokenize
    /// for now this will be a JSONPath selector
    /// In the future we can support XPath, Regex, and more
    pub target: String,
}

impl IngressRule {
    /// These can be configured fully as headers:
    ///
    /// x-fp-proxy-ingress-rule: fp_id_abc.custom.credit_card_number=$.data.card.number
    /// x-fp-proxy-ingress-rule: fp_id_abc.custom.credit_card_exp=$.data.card.expiration
    /// x-fp-proxy-ingress-rule: fp_id_abc.custom.credit_card_cvc=$.data.card.security_code
    ///
    pub const INGRESS_RULE_HEADER: &str = "x-fp-proxy-ingress-rule";
}

impl IngressRule {
    /// If an ingress rule comes from a DB configuration
    /// we need to know "just-in-time" (JIT) which footprint token to
    /// use with the rules
    pub fn parse_from_db_rules(
        rules: Vec<ProxyConfigIngressRule>,
        fp_id: Option<FpId>,
    ) -> Result<Vec<Self>, ApiError> {
        if rules.is_empty() {
            return Ok(vec![]);
        }

        let fp_id = fp_id.ok_or(VaultProxyError::MissingFootprintUserTokenParameter)?;

        let rules = rules
            .into_iter()
            .map(|rule| -> Result<_, VaultProxyError> {
                Ok(IngressRule {
                    proxy_token: ProxyToken {
                        fp_id: fp_id.clone(),
                        identifier: DataIdentifier::from_str(&rule.token_path)
                            .map_err(ProxyTokenError::from)?,
                    },
                    target: rule.target,
                })
            })
            .collect::<Result<Vec<_>, _>>()?;
        Ok(rules)
    }
}

impl TryFrom<&str> for IngressRule {
    type Error = ApiError;

    /// <proxy_token> + '=' + <target>
    /// Example fp_id_abc.custom.credit_card_number=$.data.card.number
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let components: Vec<&str> = value.split('=').collect();

        if components.len() != 2 {
            return Err(VaultProxyError::BadIngressRule("must be one '=' only".into()))?;
        }
        let proxy_token = components[0].trim();
        let target = components[1].trim().to_string();

        let proxy_token = ProxyToken::parse(proxy_token)?;

        match proxy_token.identifier {
            DataIdentifier::Custom(_) => {}
            DataIdentifier::Id(_)
            | DataIdentifier::InvestorProfile(_)
            | DataIdentifier::Business(_)
            | DataIdentifier::CreditCard(_) => {}
            DataIdentifier::Document(_) => {
                return Err(VaultProxyError::IngressDocumentVaultProxyingNotSupported)?
            }
        }

        Ok(Self { proxy_token, target })
    }
}

pub struct ParsedIngressRules(pub Vec<IngressRule>);

impl TryFrom<&HeaderMap> for ParsedIngressRules {
    type Error = ApiError;

    fn try_from(headers: &HeaderMap) -> Result<Self, Self::Error> {
        let result = headers
            .iter()
            .filter(|(n, _v)| n.as_str() == IngressRule::INGRESS_RULE_HEADER)
            .map(|(_n, value)| {
                let value = value
                    .to_str()
                    .map_err(|_| VaultProxyError::InvalidIngressRuleHeader)?;
                let rule = IngressRule::try_from(value)?;
                Ok(rule)
            })
            .collect::<Result<Vec<_>, ApiError>>();

        Ok(Self(result?))
    }
}
