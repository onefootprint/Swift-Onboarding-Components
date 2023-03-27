//! Parses tokens on the EGRESS and detokenizes

use std::collections::HashMap;

use crate::errors::proxy::VaultProxyError;

use crate::errors::ApiResult;

use itertools::Itertools;

use newtypes::FootprintUserId;
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
    const DELIMITER_START: [char; 2] = ['{', '{'];
    const DELIMITER_END: [char; 2] = ['}', '}'];

    /// produces the find-and-replaceable text match of the token string
    fn text_match(token: &str) -> String {
        format!(
            "{}{}{}{}{}",
            Self::DELIMITER_START[0],
            Self::DELIMITER_START[1],
            token,
            Self::DELIMITER_END[0],
            Self::DELIMITER_END[1],
        )
    }

    fn is_delimiter_char(c: &char) -> bool {
        Self::DELIMITER_START.contains(c) || Self::DELIMITER_END.contains(c)
    }

    /// parses a string into a single Proxy Token
    pub fn parse(raw: &'a str, global_fp_id: Option<FootprintUserId>) -> ApiResult<ProxyTokenParser> {
        let mut parsed: Vec<(String, ProxyToken)> = vec![];
        let mut chars = raw.chars().peekable();
        let mut current_token: Option<String> = None;

        let mut current_char = chars.next();
        let mut next_char = chars.peek();

        while let (Some(c1), Some(c2)) = (current_char, next_char) {
            match &mut current_token {
                // if we found the start of a token, reset our state
                _ if [c1, *c2] == Self::DELIMITER_START => {
                    current_char = chars.next();
                    next_char = chars.peek();

                    // before changing state, make sure the next character is not a delimiter
                    if next_char.map(Self::is_delimiter_char) != Some(false) {
                        continue;
                    }

                    current_token = Some(String::new());
                }
                // if we reached the end of the token
                Some(current) if [c1, *c2] == Self::DELIMITER_END => {
                    let text_match = Self::text_match(current.as_ref());

                    // parse and add the found token if it's acceptable
                    if let Ok(token) = ProxyToken::parse_global(current, global_fp_id.clone())
                        .map(|token| (text_match, token))
                    {
                        parsed.push(token);
                    }

                    // reset state
                    current_token = None;
                }
                // we're in a token, so build up our token contents
                Some(current) => {
                    current.push(c1);
                }
                // we're not in a match
                None => {}
            }
            current_char = chars.next();
            next_char = chars.peek();
        }

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
            let failed = not_found.into_iter().map(|tok| tok.to_string()).join(", ");

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
    use newtypes::{DataIdentifier, FootprintUserId, IdentityDataKind as IDK, KvDataKey};
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
    "ssn": "{{ fp_id_abcd.id.ssn9 }}",
    "last_name": "{{   fp_id_abcd.id.last_name }}",
    "credit_card": "{{ fp_id_abcd.custom.credit_card }}",
    "full_name": "{{ fp_id_abcd.id.first_name}} {{fp_id_abcd.id.last_name }}",
    "dob": "{{ id.dob }}"
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
        let global = FootprintUserId::from("fp_id_xyz".to_string());
        let result = ProxyTokenParser::parse(VALID_JSON_BODY, Some(global)).expect("failed to parse");

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

        assert!(result.matches.contains_key(&token("fp_id_xyz", DI::Id(IDK::Dob))));

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
        let result = ProxyTokenParser::parse(VALID_JSON_BODY, None).expect("failed to parse");
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

    #[test_case("fp_id_abcd.id.ssn9", "fp_id_abcd", None , DI::Id(IDK::Ssn9) => true)]
    #[test_case("fp_id_abcdsdfsdfs.id.last_name", "fp_id_abcdsdfsdfs", None, DI::Id(IDK::LastName) => true)]
    #[test_case("fp_id_abcd.id.ssn4", "fp_id_abcd",  None, DI::Id(IDK::Ssn9) => false)]
    #[test_case("fp_id_abcd.id.sdfb.ssn4", "fp_id_abcd",  None, DI::Id(IDK::Ssn4) => false)]
    #[test_case("fp_id_abcd.custom.credit_card", "fp_id_abcd",  None, custom("credit_card") => true)]
    #[test_case("fp_id_abcd.custom.credit_card", "fp_id_abcd",  None, custom("ach_account") => false)]
    #[test_case("custom.credit_card", "fp_id_abcd",  Some("fp_id_abcd"), custom("credit_card") => true)]
    #[test_case("id.ssn9", "fp_id_abcd",  Some("fp_id_abcd"), DI::Id(IDK::Ssn9) => true)]
    #[test_case("id.ssn9", "fp_id_xyz",  Some("fp_id_abcd"), DI::Id(IDK::Ssn9) => false)]
    fn test_proxy_parse_token(
        raw: &str,
        fp_id: &str,
        global: Option<&str>,
        identifier: DataIdentifier,
    ) -> bool {
        let expected = ProxyToken {
            fp_id: FootprintUserId::from_str(fp_id).unwrap(),
            identifier,
        };
        let global = global.map(|s| FootprintUserId::from(s.to_string()));

        let Ok(token) = ProxyToken::parse_global(raw, global) else {
            return false
        };
        token == expected
    }

    const B_1: &str = r#"{ blah blah blah {{ id.ssn9 }} sdfsdf sd {{ custom.cc4 }} }} {{ blah {{ }} {{"#;
    const B_2: &str = r#"{ blah blah blah {{ id.ssn9 }} sdfsdf sd {{  }} }} {{ blah {{ custom.cc4 }} {{"#;
    const B_3: &str = r#"{{ {{ {{ }} {{id.dob}} }}"#;
    const B_4: &str = r#"{{ custom.ach}"#;
    const B_5: &str =
        r#"{{ fp_id_x.custom.ach}} {{{fp_id_y.id.ssn9}} sdf {{ custom.ach2}}} {{fp_id_y.id.ssn9}}"#;
    const B_6: &str = r#"{ { {{{ fp_id_1.custom.ach     }}"#;

    #[test_case(B_1, Some("fp_id_xyz"), &[
        (token("fp_id_xyz", DI::Id(IDK::Ssn9)), 1),
        (token("fp_id_xyz", custom("cc4")), 1)
    ])]
    #[test_case(B_2, Some("fp_id_xyz"), &[
        (token("fp_id_xyz", DI::Id(IDK::Ssn9)), 1),
        (token("fp_id_xyz", custom("cc4")), 1)
    ])]
    #[test_case(B_3, Some("fp_id_xyz"), &[
        (token("fp_id_xyz", DI::Id(IDK::Dob)), 1),
    ])]
    #[test_case(B_4, Some("fp_id_xyz"), &[])]
    #[test_case(B_5, Some("fp_id_xyz"), &[
        (token("fp_id_x", custom("ach")), 1),
        (token("fp_id_y", DI::Id(IDK::Ssn9)), 2),
        (token("fp_id_xyz", custom("ach2")), 1),
    ])]
    #[test_case(B_6, Some("fp_id_xyz"), &[
        (token("fp_id_1", custom("ach")), 1),
    ])]
    fn test_edge_case_parsing(body: &str, global_fp_id: Option<&str>, expected: &[(ProxyToken, usize)]) {
        let global_fp_id = global_fp_id.map(|s| FootprintUserId::from(s.to_string()));
        let result = ProxyTokenParser::parse(body, global_fp_id).expect("failed to parse");
        for (tok, num) in expected {
            assert!(result.matches.contains_key(tok));
            assert_eq!(result.matches.get(tok).unwrap().len(), *num);
        }

        let total_matches: usize = result.matches.values().map(|m| m.len()).sum();
        let total_expected: usize = expected.iter().map(|(_, n)| *n).sum();
        assert_eq!(total_matches, total_expected);
    }
}
