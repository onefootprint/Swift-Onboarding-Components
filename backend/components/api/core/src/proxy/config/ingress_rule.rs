use super::ProxyHeaderParams;
use crate::errors::proxy::VaultProxyError;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use actix_web::http::header::HeaderMap;
use db::models::proxy_config::ProxyConfigIngressRule;
use newtypes::FilterFunction;
use newtypes::FpId;
use newtypes::ProxyToken;
use std::str::FromStr;

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
    ) -> ApiResult<Vec<Self>> {
        if rules.is_empty() {
            return Ok(vec![]);
        }

        let rules = rules
            .into_iter()
            .map(|rule| -> ApiResult<_> { Self::parse(fp_id.clone(), &rule.token_path, &rule.target) })
            .collect::<Result<Vec<_>, _>>()?;
        Ok(rules)
    }

    fn parse(fp_id: Option<FpId>, token_path: &str, target: &str) -> ApiResult<Self> {
        let mut proxy_token = ProxyToken::parse_global(token_path, fp_id.as_ref())?;

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
                    .map(|raw| FilterFunction::from_str(raw))
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

        Self::parse(global_fp_id, proxy_token, &target)
    }
}

pub struct ParsedIngressRules(pub Vec<IngressRule>);

impl TryFrom<&HeaderMap> for ParsedIngressRules {
    type Error = ApiError;

    fn try_from(headers: &HeaderMap) -> Result<Self, Self::Error> {
        let global_fp_id = ProxyHeaderParams::raw_get_user_token_assignment(headers)
            .map(ToString::to_string)
            .map(FpId::from);

        let result = ProxyHeaderParams::raw_get_all_ingress_rule(headers)
            .into_iter()
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
            .collect::<ApiResult<Vec<_>>>()?
            .into_iter()
            .flatten()
            .collect();

        Ok(Self(result))
    }
}
