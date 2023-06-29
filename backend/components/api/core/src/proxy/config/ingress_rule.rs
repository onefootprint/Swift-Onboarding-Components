use crate::{
    errors::{proxy::VaultProxyError, ApiError},
    utils::headers::get_header,
};
use actix_web::http::header::HeaderMap;
use db::models::proxy_config::ProxyConfigIngressRule;
use newtypes::{FilterFunction, FpId, ProxyToken};

use super::proxy_headers::INGRESS_RULE_HEADER;

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

        let rules = rules
            .into_iter()
            .map(|rule| -> Result<_, ApiError> {
                let proxy_token = ProxyToken::parse_global(&rule.token_path, fp_id.clone())?;
                Ok(IngressRule {
                    proxy_token,
                    target: rule.target,
                })
            })
            .collect::<Result<Vec<_>, _>>()?;
        Ok(rules)
    }
}

impl TryFrom<(&str, Option<FpId>)> for IngressRule {
    type Error = ApiError;

    /// <proxy_token> + '=' + <target>
    ///
    /// Note that the `<target>` also supports filter functions!
    ///
    /// Examples:
    ///     - fp_id_abc.custom.credit_card_number=$.data.card.number
    ///     - custom.credit_card_number = $.data.card.number
    ///     - custom.credit_card_number = $.data.card.number | replace('-', '')
    fn try_from((value, global_fp_id): (&str, Option<FpId>)) -> Result<Self, Self::Error> {
        let components: Vec<&str> = value.split('=').collect();

        if components.len() != 2 {
            return Err(VaultProxyError::BadIngressRule("must be one '=' only".into()))?;
        }
        let proxy_token = components[0].trim();
        let target = components[1].trim().to_string();

        let mut proxy_token = ProxyToken::parse_global(proxy_token, global_fp_id)?;

        if !proxy_token.filter_functions.is_empty() {
            return Err(VaultProxyError::BadIngressRule(
                "filter functions must be on the right side of the target".into(),
            ))?;
        }

        let components = target.split('|').map(|s| s.trim()).collect::<Vec<_>>();

        // parse the token and zero or more FFs
        let (target, filter_functions) = if components.len() > 1 {
            (
                components[0].to_string(),
                components[1..]
                    .iter()
                    .map(|raw| FilterFunction::parse(raw))
                    .collect::<Result<Vec<_>, _>>()
                    .map_err(|e| {
                        VaultProxyError::BadIngressRule(format!("bad filter function on target: {0}", e))
                    })?,
            )
        } else {
            (target.to_string(), vec![])
        };

        // set our filters
        proxy_token.filter_functions = filter_functions;

        Ok(Self { proxy_token, target })
    }
}

pub struct ParsedIngressRules(pub Vec<IngressRule>);

impl TryFrom<&HeaderMap> for ParsedIngressRules {
    type Error = ApiError;

    fn try_from(headers: &HeaderMap) -> Result<Self, Self::Error> {
        let global_fp_id =
            get_header(super::proxy_headers::USER_TOKEN_ASSIGNMENT_HEADER, headers).map(FpId::from);

        let result = headers
            .get_all(INGRESS_RULE_HEADER)
            .map(|value| {
                let value = value
                    .to_str()
                    .map_err(|_| VaultProxyError::InvalidIngressRuleHeader)?;
                // support HTTP1.1 where multi-header values are CSV
                let rules = value
                    .split(',')
                    .map(|value_split| IngressRule::try_from((value_split, global_fp_id.clone())))
                    .collect::<Result<Vec<_>, _>>()?;

                Ok(rules)
            })
            .collect::<Result<Vec<_>, ApiError>>()?
            .into_iter()
            .flatten()
            .collect();

        Ok(Self(result))
    }
}
