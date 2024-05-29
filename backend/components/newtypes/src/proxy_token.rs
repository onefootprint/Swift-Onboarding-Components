use crate::{
    DataIdentifier,
    FilterFunction,
    FpId,
};
use itertools::Itertools;
use std::str::FromStr;

/// A proxy token with zero or more applied filter functions:
/// `<token> | filter1 | filter2 | ...`
///
/// The token part of the format is as follows:
/// <fp_id>.<data_identifier>
///
/// OR, if a global fp_id is known, the following is also accepted:
/// <data_identifier>
///
/// Example:
/// fp_id_Gysdl9zxbBfrbSvfc0xCz.id.ssn9
///
/// Filter function examples:
///     - `id.first_name | to_lowercase`
///     - `id.ssn9 | suffix(4)`
///
/// Rules:
///     - Surrounding whitespaces are ignored
///     - Case SENSITIVE
///
///
/// Future work: support filters / transformations, i.e: :: <fp_id>.id.last_name | uppercase ::
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct ProxyToken {
    pub fp_id: FpId,
    pub identifier: DataIdentifier,
    pub filter_functions: Vec<FilterFunction>,
}

impl ProxyToken {
    /// parses a string into a single Proxy Token with support for a global footprint user id
    /// in the case where just an identifier is specified
    /// Supports `| filter_fn1 | filter_fn2| ..`
    pub fn parse_global(raw: &str, global_fp_id: Option<&FpId>) -> Result<Self, crate::Error> {
        let raw = raw.trim();
        let components: Vec<&str> = raw.split('|').map(|s| s.trim()).collect::<Vec<_>>();

        // parse the token and zero or more FFs
        let (token, filter_functions) = if components.len() > 1 {
            (
                components[0],
                components[1..]
                    .iter()
                    .map(|raw| FilterFunction::from_str(raw).map_err(crate::Error::from))
                    .collect::<Result<Vec<_>, _>>()?,
            )
        } else {
            (raw, vec![])
        };

        if let (Some(fp_id), Ok(identifier)) = (global_fp_id, DataIdentifier::from_str(token)) {
            // accept the case where the token is just a data identifier but we have a global fp_id
            return Ok(Self {
                fp_id: fp_id.clone(),
                identifier,
                filter_functions,
            });
        };

        let mut token = token.split('.');
        let Some(fp_id) = token.next() else {
            return Err(ProxyTokenError::InvalidTokenComponents)?;
        };

        let fp_id =
            FpId::parse_with_prefix(fp_id).map_err(|_| ProxyTokenError::InvalidFootprintIdInProxyToken)?;

        // don't support mixing FQPTs with a different globally set fp_id
        if let Some(global_fp_id) = global_fp_id {
            if &fp_id != global_fp_id {
                return Err(ProxyTokenError::CannotMixFullyQualifiedProxyTokens)?;
            }
        }

        let data_identifier = token.join(".");

        Ok(Self {
            fp_id,
            identifier: DataIdentifier::from_str(&data_identifier)?,
            filter_functions,
        })
    }
}

impl ProxyToken {
    pub fn display_for_ingress(&self) -> String {
        format!("{}.{}", self.fp_id, self.identifier)
    }
}

impl std::fmt::Display for ProxyToken {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let filters = if self.filter_functions.is_empty() {
            "".to_string()
        } else {
            format!(
                " | {}",
                self.filter_functions.iter().map(|ff| ff.name()).join(" | ")
            )
        };
        format!("{}.{}{}", self.fp_id, self.identifier, filters).fmt(f)
    }
}

impl paperclip::v2::schema::Apiv2Schema for ProxyToken {
    fn name() -> Option<String> {
        Some("ProxyToken".into())
    }

    fn description() -> &'static str {
        "String of format '<token> | filter_1 | filter_2 | ...' where '<token>' is defined as either '<fp_id>.<data_identifier>' or '<data_identifier>' if `fp_id` specified as a header. Following the token, zero or more filter functions can be specified, separated by `|`."
    }

    fn required() -> bool {
        true
    }
}

#[derive(Debug, Clone, thiserror::Error, PartialEq)]
pub enum ProxyTokenError {
    #[error("Missing or invalid components.")]
    InvalidTokenComponents,
    #[error("Cannot mix global footprint token with fully-qualified proxy tokens. Please remove the header 'x-fp-id' or remove the 'fp_id.' prefix from proxy tokens.")]
    CannotMixFullyQualifiedProxyTokens,
    #[error("Missing or invalid fp_id in proxy token.")]
    InvalidFootprintIdInProxyToken,
}

#[cfg(test)]
mod tests {
    use super::FilterFunction::*;
    use super::*;
    use crate::{
        CountArgs,
        DataIdentifier,
        FpId,
        IdentityDataKind as IDK,
    };
    use test_case::test_case;

    fn tok<D: Into<DataIdentifier>>(
        fp_id: &str,
        identifier: D,
        filter_functions: Vec<FilterFunction>,
    ) -> ProxyToken {
        ProxyToken {
            fp_id: FpId::from_str(fp_id).unwrap(),
            identifier: identifier.into(),
            filter_functions,
        }
    }

    #[test_case("fp_id_abcd.id.ssn9", None => tok("fp_id_abcd", IDK::Ssn9, vec![]))]
    #[test_case("fp_id_xyz.id.last_name", None => tok("fp_id_xyz", IDK::LastName, vec![]))]
    #[test_case("id.ssn9   | to_lowercase", Some("fp_id_xyz") => tok("fp_id_xyz", IDK::Ssn9, vec![ToLowercase]))]
    #[test_case("id.last_name | suffix(4) | to_lowercase", Some("fp_id_1") => tok("fp_id_1", IDK::LastName, vec![
        Suffix(CountArgs { count: 4 }),
        ToLowercase
    ]))]
    #[test_case("id.address_line1 | suffix(16) | prefix(4) | to_lowercase | to_ascii", Some("fp_id_1") => tok("fp_id_1", IDK::AddressLine1, vec![
        Suffix(CountArgs { count: 16 }),
        Prefix(CountArgs { count: 4 }),
        ToLowercase,
        ToAscii
    ]))]
    fn test_proxy_parse_token(raw: &str, global: Option<&str>) -> ProxyToken {
        let global: Option<FpId> = global.map(|s| FpId::from(s.to_string()));
        ProxyToken::parse_global(raw, global.as_ref()).expect("failed to parse proxy token")
    }

    #[test_case("fp_id_abcd.id.ssn9", Some("fp_id_xyz") => false)]
    #[test_case("fp_id_abcd.id.dob", Some("fp_id_abcd") => true)]
    fn test_ok_proxy_parse_token(raw: &str, global: Option<&str>) -> bool {
        let global: Option<FpId> = global.map(|s| FpId::from(s.to_string()));
        ProxyToken::parse_global(raw, global.as_ref()).is_ok()
    }

    #[test_case("id.last_name")]
    #[test_case("fp_id_1.id.ssn9 |")]
    #[test_case("fp_id_1.id.ssn9 | to_lowercase(4)")]
    #[test_case("fp_id_1.id.ssn9 | to_ascii |")]
    #[test_case("fp_id_1.id.ssn9 | to_uppercase | |")]
    fn test_proxy_parse_error(raw: &str) {
        ProxyToken::parse_global(raw, None).expect_err("expected to fail proxy token parsing");
    }
}
