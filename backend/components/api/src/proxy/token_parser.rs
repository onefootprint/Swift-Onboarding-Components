//! Parses tokens on the EGRESS and detokenizes

use std::collections::HashMap;



use crate::errors::proxy::VaultProxyError;

use crate::errors::ApiResult;

use itertools::Itertools;



use newtypes::PiiString;
use newtypes::ProxyToken;

/// The Proxy Token Parser finds and replaces
/// instances of ProxyTokens with their
pub struct ProxyTokenParser<'a> {
    /// the original input
    body: &'a str,
    /// maps proxy tokens to their original string matches
    /// there may be multiple incantantions
    pub matches: HashMap<ProxyToken, Vec<String>>,
}

impl<'a> ProxyTokenParser<'a> {
    const TOKEN_MATCH_DELIMITER: &str = "::";

    /// parses a string into a single Proxy Token
    pub fn parse(raw: &'a str) -> ApiResult<ProxyTokenParser> {
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
    pub fn detokenize_body(self, detokens: HashMap<ProxyToken, PiiString>) -> ApiResult<PiiString> {
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
                .map(|tok| format!("${}.{}", tok.fp_id, tok.identifier))
                .join(", ");

            return Err(VaultProxyError::DataIdentifiersNotFound(failed))?;
        }

        Ok(PiiString::from(detokenized_body))
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
    use std::str::FromStr;

    use super::*;
    use newtypes::{DataIdentifier, IdentityDataKind as IDK, KvDataKey, FootprintUserId};
    use test_case::test_case;
    use DataIdentifier as DI;

    fn custom(raw: &'static str) -> DataIdentifier {
        DI::Custom(KvDataKey::from_str(raw).unwrap())
    }

    fn token(fp_id: &str, data_kind: DataIdentifier) -> ProxyToken {
        ProxyToken {
            fp_id: FootprintUserId::from_str(fp_id).unwrap(),
            identifier: data_kind,
        }
    }

    const VALID_JSON_BODY: &str = r#"{
    "ssn": "::$fp_id_abcd.id.ssn9::",
    "last_name": "::   $fp_id_abcd.id.last_name ::",
    "credit_card": "::$fp_id_abcd.custom.credit_card ::",
    "full_name": "::$fp_id_abcd.id.first_name:: ::$fp_id_abcd.id.last_name::"
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
            .contains_key(&token("fp_id_abcd", DI::Id(IDK::Ssn9))));
        assert!(result
            .matches
            .contains_key(&token("fp_id_abcd", DI::Id(IDK::LastName))));
        assert!(result
            .matches
            .contains_key(&token("fp_id_abcd", custom("credit_card"))));
        assert!(result
            .matches
            .contains_key(&token("fp_id_abcd", DI::Id(IDK::FirstName))));
        // test that we found two matches for this token
        assert_eq!(
            result
                .matches
                .get(&token("fp_id_abcd", DI::Id(IDK::LastName)))
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
            (token("fp_id_abcd", DI::Id(IDK::Ssn9)), test.ssn.into()),
            (token("fp_id_abcd", DI::Id(IDK::LastName)), test.last_name.into()),
            (token("fp_id_abcd", DI::Id(IDK::FirstName)), "Elon".into()),
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

    #[test_case("$fp_id_abcd.id.ssn9", "fp_id_abcd", DI::Id(IDK::Ssn9) => true)]
    #[test_case("$fp_id_abcdsdfsdfs.id.last_name", "fp_id_abcdsdfsdfs", DI::Id(IDK::LastName) => true)]
    #[test_case("$fp_id_abcd.id.ssn4", "fp_id_abcd", DI::Id(IDK::Ssn9) => false)]
    #[test_case("$fp_id_abcd.id.sdfb.ssn4", "fp_id_abcd", DI::Id(IDK::Ssn4) => false)]
    #[test_case("$fp_id_abcd.custom.credit_card", "fp_id_abcd", custom("credit_card") => true)]
    #[test_case("$fp_id_abcd.custom.credit_card", "fp_id_abcd", custom("ach_account") => false)]
    fn test_proxy_parse_token(raw: &str, fp_id: &str, identifier: DataIdentifier) -> bool {
        let expected = ProxyToken {
            fp_id: FootprintUserId::from_str(fp_id).unwrap(),
            identifier,
        };
        let Ok(token) = ProxyToken::parse(raw) else {
        return false
    };
        token == expected
    }
}
