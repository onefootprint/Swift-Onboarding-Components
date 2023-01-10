use std::collections::HashMap;
use std::str::FromStr;

use crate::errors::proxy::VaultProxyError;

use crate::errors::ApiResult;

use itertools::Itertools;

use newtypes::DataIdentifier;
use newtypes::FootprintUserId;
use newtypes::PiiString;

/// The Proxy Token Parser finds and replaces
/// instances of ProxyTokens with their
pub(super) struct ProxyTokenParser<'a> {
    /// the original input
    body: &'a str,
    /// maps proxy tokens to their original string matches
    /// there may be multiple incantantions
    pub matches: HashMap<ProxyToken, Vec<String>>,
}

impl<'a> ProxyTokenParser<'a> {
    const TOKEN_MATCH_DELIMITER: &str = "::";

    /// parses a string into a single Proxy Token
    pub(super) fn parse(raw: &'a str) -> ApiResult<ProxyTokenParser> {
        let parsed: Vec<(String, ProxyToken)> = raw
            .split(Self::TOKEN_MATCH_DELIMITER)
            .map(|tok| {
                let tok_match = format!("{0}{1}{0}", Self::TOKEN_MATCH_DELIMITER, tok);
                ProxyToken::parse(tok).map(|token| (tok_match, token))
            })
            .flat_map(Result::ok)
            .collect();

        let mut matches: HashMap<ProxyToken, Vec<String>> = HashMap::new();
        for (tok_key, tok) in parsed {
            if let Some(existing) = matches.get_mut(&tok) {
                existing.push(tok_key.clone());
            } else {
                matches.insert(tok, vec![tok_key]);
            }
        }
        Ok(Self { body: raw, matches })
    }

    /// replace proxy tokens with their detokenized counterparts
    pub(super) fn detokenize_body(self, detokens: HashMap<ProxyToken, PiiString>) -> ApiResult<PiiString> {
        let mut detokenized_body = self.body.to_string();

        let mut not_found = vec![];

        for (token, matches) in self.matches {
            let Some(detoken) = detokens.get(&token) else {
                tracing::warn!(matches=?matches, "did not find detoken for token");
                not_found.push(token);
                continue;
            };

            for to_replace in matches {
                detokenized_body = detokenized_body.replace(&to_replace, detoken.leak());
            }
        }

        // Hard error if we were not able to decrypt some of the tokens
        if !not_found.is_empty() {
            let failed = not_found
                .into_iter()
                .map(|tok| format!("${}.{}", tok.fp_id, tok.data_kind))
                .join(", ");

            return Err(VaultProxyError::DataIdentifiersNotFound(failed))?;
        }

        Ok(PiiString::from(detokenized_body))
    }
}

///
/// The token format is as follows:
/// ::$<fp_id>.<data_kind>.<attribute_name>::
///
/// Example:
/// ::$fp_id_Gysdl9zxbBfrbSvfc0xCz.identity.ssn9::
///
/// Rules:
/// - Whitespaces are ignored
/// - Case SENSITIVE
///
///
/// Future work: support filters / transformations, i.e: :: $<fp_id>.identity.last_name | uppercase ::
///
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct ProxyToken {
    pub fp_id: FootprintUserId,
    pub data_kind: DataIdentifier,
}

impl ProxyToken {
    /// parses a string into a single Proxy Token
    fn parse(raw: &str) -> Result<Self, VaultProxyError> {
        let mut chars = raw.trim().chars();

        if chars.next() != Some('$') {
            return Err(VaultProxyError::InvalidTokenStart);
        }
        let token = chars.collect::<String>();
        let mut token = token.split('.');
        let Some(fp_id) = token.next() else {
            return Err(VaultProxyError::InvalidTokenComponents);
        };
        let data_identifier = token.join(".");

        Ok(Self {
            fp_id: FootprintUserId::from(fp_id.to_string()),
            data_kind: DataIdentifier::from_str(&data_identifier)?,
        })
    }
}

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests {
    //! Basic correctness tests for parsing
    //! TODO: add more edge cases here like:
    //!     - XML,
    //!     - raw string bodies,
    //!     - failure cases (invalid tokens)
    //!     - multiple fp_ids
    //!     - multiple matches
    use super::*;
    use newtypes::{DataIdentifier, DataLifetimeKind as DLK, KvDataKey};
    use test_case::test_case;
    use DataIdentifier as DI;

    fn custom(raw: &'static str) -> DataIdentifier {
        DI::Custom(KvDataKey::from_str(raw).unwrap())
    }

    fn token(fp_id: &str, data_kind: DataIdentifier) -> ProxyToken {
        ProxyToken {
            fp_id: FootprintUserId::from_str(fp_id).unwrap(),
            data_kind,
        }
    }

    const VALID_JSON_BODY: &str = r#"{
    "ssn": "::$fp_id_abcd.identity.ssn9::",
    "last_name": "::   $fp_id_abcd.identity.last_name ::",
    "credit_card": "::$fp_id_abcd.custom.credit_card ::",
    "full_name": "::$fp_id_abcd.identity.first_name:: ::$fp_id_abcd.identity.last_name::"
}"#;

    #[derive(serde::Deserialize, PartialEq, Eq, Debug, Clone)]
    struct TestData<'a> {
        ssn: &'a str,
        full_name: &'a str,
        credit_card: &'a str,
        last_name: &'a str,
    }

    #[test]
    fn test_correct_body_parser() {
        let result = ProxyTokenParser::parse(VALID_JSON_BODY).expect("failed to parse");
        assert!(result
            .matches
            .contains_key(&token("fp_id_abcd", DI::Identity(DLK::Ssn9))));
        assert!(result
            .matches
            .contains_key(&token("fp_id_abcd", DI::Identity(DLK::LastName))));
        assert!(result
            .matches
            .contains_key(&token("fp_id_abcd", custom("credit_card"))));
        assert!(result
            .matches
            .contains_key(&token("fp_id_abcd", DI::Identity(DLK::FirstName))));
        // test that we found two matches for this token
        assert_eq!(
            result
                .matches
                .get(&token("fp_id_abcd", DI::Identity(DLK::LastName)))
                .expect("missing token")
                .len(),
            2
        );
    }

    #[test]
    fn test_detokenize() {
        let result = ProxyTokenParser::parse(VALID_JSON_BODY).expect("failed to parse");
        let test = TestData {
            ssn: "12-121-1212",
            full_name: "Elon Musk",
            credit_card: "4242424242424242",
            last_name: "Musk",
        };

        let detokens = HashMap::from_iter(vec![
            (token("fp_id_abcd", DI::Identity(DLK::Ssn9)), test.ssn.into()),
            (
                token("fp_id_abcd", DI::Identity(DLK::LastName)),
                test.last_name.into(),
            ),
            (token("fp_id_abcd", DI::Identity(DLK::FirstName)), "Elon".into()),
            (
                token("fp_id_abcd", custom("credit_card")),
                test.credit_card.into(),
            ),
        ]);
        let detokenized = result.detokenize_body(detokens).expect("detokenize");
        let result: TestData =
            serde_json::from_str(detokenized.leak()).expect("failed json decode detokenized");

        assert_eq!(test, result);
    }

    #[test_case("$fp_id_abcd.identity.ssn9", "fp_id_abcd", DI::Identity(DLK::Ssn9) => true)]
    #[test_case("$fp_id_abcdsdfsdfs.identity.last_name", "fp_id_abcdsdfsdfs", DI::Identity(DLK::LastName) => true)]
    #[test_case("$fp_id_abcd.identity.ssn4", "fp_id_abcd", DI::Identity(DLK::Ssn9) => false)]
    #[test_case("$fp_id_abcd.identity.sdfb.ssn4", "fp_id_abcd", DI::Identity(DLK::Ssn4) => false)]
    #[test_case("$fp_id_abcd.custom.credit_card", "fp_id_abcd", custom("credit_card") => true)]
    #[test_case("$fp_id_abcd.custom.credit_card", "fp_id_abcd", custom("ach_account") => false)]
    fn test_proxy_parse_token(raw: &str, fp_id: &str, data_kind: DataIdentifier) -> bool {
        let expected = ProxyToken {
            fp_id: FootprintUserId::from_str(fp_id).unwrap(),
            data_kind,
        };
        let Ok(token) = ProxyToken::parse(raw) else {
        return false
    };
        token == expected
    }
}
