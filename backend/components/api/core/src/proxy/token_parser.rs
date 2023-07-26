//! Parses tokens on the EGRESS and detokenizes

use std::collections::HashMap;

use crate::errors::proxy::VaultProxyError;

use crate::errors::ApiResult;

use itertools::Itertools;

use newtypes::FpId;
use newtypes::PiiString;
use newtypes::ProxyToken;

/// The Proxy Token Parser finds proxy tokens in a body
/// and stores the string matches for future replacement
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

    /// parses a string into a map of Proxy Tokens
    #[tracing::instrument("ProxyTokenParser::parse", skip_all)]
    pub fn parse(raw: &'a str, global_fp_id: Option<FpId>) -> ApiResult<ProxyTokenParser> {
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
    #[tracing::instrument("ProxyTokenParser::detokenize_body", skip_all)]
    pub fn detokenize_body(self, detokens: HashMap<ProxyToken, PiiString>) -> ApiResult<PiiString> {
        let mut detokenized_body = self.body.to_string();

        let mut not_found = vec![];

        for (token, matches) in self.matches {
            let Some(detoken) = detokens.get(&token) else {
                tracing::warn!(matches=?matches, "did not find detoken for token");
                not_found.push(token);
                continue;
            };

            // TODO this is taking multiple seconds for large bodies. Should do some more efficient
            // string processing
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
    use newtypes::{DataIdentifier, FilterFunction, FpId, IdentityDataKind as IDK, KvDataKey};
    use test_case::test_case;
    use DataIdentifier as DI;
    use FilterFunction::*;

    fn custom(raw: &'static str) -> DataIdentifier {
        DI::Custom(KvDataKey::from_str(raw).unwrap())
    }

    fn tok1(fp_id: &str, data_kind: DataIdentifier) -> ProxyToken {
        ProxyToken {
            fp_id: FpId::from_str(fp_id).unwrap(),
            identifier: data_kind,
            filter_functions: vec![],
        }
    }

    fn tok2<D: Into<DataIdentifier>>(
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

    const VALID_JSON_BODY: &str = r#"{
    "ssn": "{{ fp_id_abcd.id.ssn9 }}",
    "last_name": "{{   fp_id_abcd.id.last_name }}",
    "credit_card": "{{ fp_id_abcd.custom.credit_card }}",
    "full_name": "{{ fp_id_abcd.id.first_name}} {{fp_id_abcd.id.last_name }}",
    "dob": "{{ id.dob }}",
    "name_transform": "{{ fp_id_abcd.id.first_name | to_uppercase }}{{ fp_id_abcd.id.last_name | prefix(2) | to_uppercase }}"
}"#;

    #[derive(serde::Deserialize, PartialEq, Eq, Debug, Clone)]
    struct TestData<'a> {
        ssn: &'a str,
        full_name: &'a str,
        credit_card: &'a str,
        last_name: &'a str,
        name_transform: &'a str,
    }

    #[test]
    fn test_correct_body_parser() {
        let global = FpId::from("fp_id_abcd".to_string());
        let result = ProxyTokenParser::parse(VALID_JSON_BODY, Some(global)).expect("failed to parse");

        assert!(result
            .matches
            .contains_key(&tok1("fp_id_abcd", DI::Id(IDK::Ssn9))));
        assert!(result
            .matches
            .contains_key(&tok1("fp_id_abcd", DI::Id(IDK::LastName))));
        assert!(result
            .matches
            .contains_key(&tok1("fp_id_abcd", custom("credit_card"))));
        assert!(result
            .matches
            .contains_key(&tok1("fp_id_abcd", DI::Id(IDK::FirstName))));

        assert!(result
            .matches
            .contains_key(&tok2("fp_id_abcd", IDK::FirstName, vec![ToUppercase])));

        assert!(result.matches.contains_key(&tok2(
            "fp_id_abcd",
            IDK::LastName,
            vec![Prefix { count: 2 }, ToUppercase]
        )));

        assert!(result.matches.contains_key(&tok1("fp_id_abcd", DI::Id(IDK::Dob))));

        // test that we found two matches for this token
        assert_eq!(
            result
                .matches
                .get(&tok1("fp_id_abcd", DI::Id(IDK::LastName)))
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
            name_transform: "ELONMU",
        };

        let detokens = HashMap::from_iter(vec![
            (tok1("fp_id_abcd", DI::Id(IDK::Ssn9)), test.ssn.into()),
            (tok1("fp_id_abcd", DI::Id(IDK::LastName)), test.last_name.into()),
            (tok1("fp_id_abcd", DI::Id(IDK::FirstName)), "Elon".into()),
            (tok1("fp_id_abcd", custom("credit_card")), test.credit_card.into()),
            (
                tok2("fp_id_abcd", IDK::FirstName, vec![ToUppercase]),
                "ELON".into(),
            ),
            (
                tok2(
                    "fp_id_abcd",
                    IDK::LastName,
                    vec![Prefix { count: 2 }, ToUppercase],
                ),
                "MU".into(),
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
            fp_id: FpId::from_str(fp_id).unwrap(),
            identifier,
            filter_functions: vec![],
        };
        let global = global.map(|s| FpId::from(s.to_string()));

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
        r#"{{ fp_id_x.custom.ach}} {{{fp_id_y.id.ssn9}} sdf {{ fp_id_z.custom.ach2}}} {{fp_id_y.id.ssn9}}"#;
    const B_6: &str = r#"{ { {{{ fp_id_1.custom.ach     }}"#;

    #[test_case(B_1, Some("fp_id_xyz"), &[
        (tok1("fp_id_xyz", DI::Id(IDK::Ssn9)), 1),
        (tok1("fp_id_xyz", custom("cc4")), 1)
    ])]
    #[test_case(B_2, Some("fp_id_xyz"), &[
        (tok1("fp_id_xyz", DI::Id(IDK::Ssn9)), 1),
        (tok1("fp_id_xyz", custom("cc4")), 1)
    ])]
    #[test_case(B_3, Some("fp_id_xyz"), &[
        (tok1("fp_id_xyz", DI::Id(IDK::Dob)), 1),
    ])]
    #[test_case(B_4, Some("fp_id_xyz"), &[])]
    #[test_case(B_5, None, &[
        (tok1("fp_id_x", custom("ach")), 1),
        (tok1("fp_id_y", DI::Id(IDK::Ssn9)), 2),
        (tok1("fp_id_z", custom("ach2")), 1),
    ])]
    #[test_case(B_6, None, &[
        (tok1("fp_id_1", custom("ach")), 1),
    ])]
    fn test_edge_case_parsing(body: &str, global_fp_id: Option<&str>, expected: &[(ProxyToken, usize)]) {
        let global_fp_id = global_fp_id.map(|s| FpId::from(s.to_string()));
        let result = ProxyTokenParser::parse(body, global_fp_id).expect("failed to parse");
        for (tok, num) in expected {
            assert!(result.matches.contains_key(tok));
            assert_eq!(result.matches.get(tok).unwrap().len(), *num);
        }

        let total_matches: usize = result.matches.values().map(|m| m.len()).sum();
        let total_expected: usize = expected.iter().map(|(_, n)| *n).sum();
        assert_eq!(total_matches, total_expected);
    }

    const B7_FP_ID: &str = "fp_id_1";

    const B_7: &str = r#"{
        "ssn": "{{ id.ssn9 | suffix(4) }}",
        "last_name": "{{  id.last_name | prefix(4) | to_uppercase }}",
        "last_name2": "{{  id.last_name | to_lowercase }}"
    }"#;

    #[test_case(B_7, &[
        (tok2(B7_FP_ID, IDK::Ssn9, vec![Suffix { count: 4 }]), 1),
        (tok2(B7_FP_ID, IDK::LastName, vec![Prefix { count: 4 }, ToUppercase ]), 1),
        (tok2(B7_FP_ID, IDK::LastName, vec![ToLowercase]), 1),
    ])]
    fn test_with_filters(body: &str, expected: &[(ProxyToken, usize)]) {
        let result =
            ProxyTokenParser::parse(body, Some(FpId::from(B7_FP_ID.to_string()))).expect("failed to parse");
        for (tok, num) in expected {
            assert!(result.matches.contains_key(tok));
            assert_eq!(result.matches.get(tok).unwrap().len(), *num);
        }

        let total_matches: usize = result.matches.values().map(|m| m.len()).sum();
        let total_expected: usize = expected.iter().map(|(_, n)| *n).sum();
        assert_eq!(total_matches, total_expected);
    }
}
