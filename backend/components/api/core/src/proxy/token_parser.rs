//! Parses tokens on the EGRESS and detokenizes

use std::collections::HashMap;

use crate::{errors::proxy::VaultProxyError, telemetry::RootSpan};

use crate::errors::ApiResult;

use itertools::Itertools;

use newtypes::{FpId, PiiString, ProxyToken};

/// The Proxy Token Parser finds proxy tokens in a body
/// and stores the string matches for future replacement
pub struct ProxyTokenParser<'a> {
    /// the original input
    body: &'a str,
    /// maps proxy tokens to their original string matches
    /// there may be multiple incantantions
    pub matches: HashMap<ProxyToken, Vec<String>>,
    global_fp_id: Option<FpId>,
}

const DELIMITER_START: [char; 2] = ['{', '{'];
const DELIMITER_END: [char; 2] = ['}', '}'];

impl<'a> ProxyTokenParser<'a> {
    /// produces the find-and-replaceable text match of the token string
    fn text_match(token: &str) -> String {
        format!(
            "{}{}{}{}{}",
            DELIMITER_START[0], DELIMITER_START[1], token, DELIMITER_END[0], DELIMITER_END[1],
        )
    }

    /// parses a string into a map of Proxy Tokens
    #[tracing::instrument("ProxyTokenParser::parse", skip_all)]
    pub fn parse(body: &'a str, global_fp_id: Option<FpId>) -> ApiResult<ProxyTokenParser> {
        let mut parsed: Vec<_> = vec![];

        process_tokens(body, |token| -> ApiResult<Option<&PiiString>> {
            // Every time a token is encountered, parse it and add it
            let text_match = Self::text_match(token);
            parsed.push((
                ProxyToken::parse_global(token, global_fp_id.as_ref())?,
                text_match,
            ));
            Ok(None)
        })?;

        let matches = parsed.into_iter().into_group_map();
        Ok(Self {
            body,
            matches,
            global_fp_id,
        })
    }

    /// If the proxy request is only for one user, log it in the root span for more easy tracking
    pub fn log_fp_id(&self, root_span: RootSpan) {
        let fp_ids = self.matches.keys().map(|pt| &pt.fp_id).unique().collect_vec();
        if fp_ids.len() == 1 {
            if let Some(fp_id) = fp_ids.first() {
                root_span.record("fp_id", fp_id.to_string());
            }
        }
    }

    #[tracing::instrument("ProxyTokenParser::detokenize_body_new", skip_all)]
    pub fn detokenize_body_new(&self, detokens: &HashMap<ProxyToken, PiiString>) -> ApiResult<PiiString> {
        // Approximate the capacity of the new string we're going to build
        let mut not_found = vec![];

        let detokenized_body = process_tokens(self.body, |token_str| -> ApiResult<Option<&PiiString>> {
            // Every time a token is encountered, parse it and add it
            let token = ProxyToken::parse_global(token_str, self.global_fp_id.as_ref())?;
            let Some(detoken) = detokens.get(&token) else {
                tracing::warn!(token=%token, "did not find detoken for token");
                not_found.push(token);
                return Ok(None);
            };
            Ok(Some(detoken))
        })?;

        // Hard error if we were not able to decrypt some of the tokens
        if !not_found.is_empty() {
            let failed = not_found.into_iter().map(|tok| tok.to_string()).join(", ");

            return Err(VaultProxyError::DataIdentifiersNotFound(failed))?;
        }

        Ok(detokenized_body)
    }

    #[tracing::instrument("ProxyTokenParser::detokenize_body_old", skip_all)]
    pub fn detokenize_body_old(self, detokens: HashMap<ProxyToken, PiiString>) -> ApiResult<PiiString> {
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

    /// replace proxy tokens with their detokenized counterparts
    #[tracing::instrument("ProxyTokenParser::detokenize_body", skip_all)]
    pub fn detokenize_body(self, detokens: HashMap<ProxyToken, PiiString>) -> ApiResult<PiiString> {
        let new = self.detokenize_body_new(&detokens)?;
        let old = self.detokenize_body_old(detokens)?;
        if new.leak() != old.leak() {
            tracing::error!(new_len=%new.len(), old_len=old.len(), "Mismatch in new detokenize");
        } else {
            tracing::info!("Old and new detokenize implementations match");
        }
        Ok(old)
    }
}

/// A util to iterate through the raw body in linear time. The callback is called with each token
/// and allows replacing the token with a detokenized value.
/// This returns the raw body with tokens replaced with the return value of the callback.
/// - `detokenize` is called for each complete token in the body that is extracted. Its return
///   value is used to replace the token in the return value.
fn process_tokens<'a, F>(raw: &str, mut detokenize: F) -> ApiResult<PiiString>
where
    F: FnMut(&str) -> ApiResult<Option<&'a PiiString>>,
{
    // Approximate the capacity of the new string we're going to build
    let mut detokenized_body = String::with_capacity(raw.len());

    let mut chars = raw.chars().peekable();
    let mut current_token: Option<String> = None;

    let mut current_char = chars.next();
    let mut next_char = chars.peek();

    while let (Some(c1), Some(c2)) = (current_char, next_char) {
        match &mut current_token {
            // If we found the start of a token, reset our state
            _ if [c1, *c2] == DELIMITER_START => {
                // Proceed to the next character since the delimiter is 2 characters
                chars.next();
                next_char = chars.peek();

                // Two checks that preserve the invariant that we take tokens of the minimal length

                if let Some(current_token) = current_token {
                    // We've encountered another DELIMITER_START while already inside a token.
                    // So the current_token contents aren't actually a token, they're part of the
                    // detokenized_body.
                    detokenized_body.push_str(&DELIMITER_START.iter().collect::<String>());
                    detokenized_body.push_str(&current_token);
                }

                while next_char.is_some_and(|c| c == &DELIMITER_START[1]) {
                    // We've encountered more than two `{`. Treat the braces as not part of the token
                    detokenized_body.push(DELIMITER_START[0]);
                    // Proceed to the next character
                    chars.next();
                    next_char = chars.peek();
                }

                current_token = Some(String::new());
            }
            // If we reached the end of the token
            Some(current) if [c1, *c2] == DELIMITER_END => {
                // Proceed to the next character since the delimiter is 2 characters
                chars.next();

                let detokenized = detokenize(current)?;
                if let Some(detokenized) = detokenized {
                    detokenized_body.push_str(detokenized.leak());
                }

                // reset state
                current_token = None;
            }
            // We're in a token, so build up our token contents
            Some(current) => {
                current.push(c1);
            }
            // We're not in a token
            None => {
                detokenized_body.push(c1);
            }
        }
        current_char = chars.next();
        next_char = chars.peek();
    }
    if let Some(current_token) = current_token {
        // We were in the middle of parsing what we thought was a token, add it to the end of the response
        detokenized_body.push_str(&DELIMITER_START.iter().collect::<String>());
        detokenized_body.push_str(&current_token);
    }
    if let Some(current_char) = current_char {
        // Add the last character to the response
        detokenized_body.push(current_char)
    }
    Ok(PiiString::new(detokenized_body))
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
    use newtypes::{
        pii, CountArgs, DataIdentifier, FilterFunction, FpId, IdentityDataKind as IDK, KvDataKey,
    };
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

    #[test]
    fn test_process_tokens() {
        // This tests the innards of the process_tokens method because it could be very dangerous
        // for this logic to change.
        // The main constraint is that process_tokens should be extracting only the minimal set of
        // tokens.
        let mut tokens = vec![];
        let raw = 
            "{{token1}} This is a nice string. }} It has {{ with-spaces     }} some tokens inside of it. And {{{ extra-opening-brace  }} another token. And also {{ extra-closing-brace  }}} some {{ text-before-an-extra-opening-brace {{{ double-opening-braces-is-minimal }} more tokens.{{ {{ end-of-string-is-token }}";
        let expected_non_token_str = 
            "*** This is a nice string. }} It has *** some tokens inside of it. And {*** another token. And also ***} some {{ text-before-an-extra-opening-brace {*** more tokens.{{ ***";
        let token_replacement = PiiString::new("***".into());
        let non_token_str = process_tokens(raw, |token| -> ApiResult<Option<&PiiString>> {
            tokens.push(token.to_string());
            Ok(Some(&token_replacement))
        })
        .unwrap();
        assert_eq!(
            tokens,
            vec![
                "token1",
                " with-spaces     ",
                " extra-opening-brace  ",
                " extra-closing-brace  ",
                " double-opening-braces-is-minimal ",
                " end-of-string-is-token ",
            ]
        );
        // And all the remaining characters are left
        assert_eq!(non_token_str.leak(), expected_non_token_str);
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
            vec![Prefix(CountArgs { count: 2 }), ToUppercase]
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
        let global = FpId::from("fp_id_abcd".to_string());
        let result = ProxyTokenParser::parse(VALID_JSON_BODY, Some(global)).expect("failed to parse");
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
                    vec![Prefix(CountArgs { count: 2 }), ToUppercase],
                ),
                "MU".into(),
            ),
            (tok1("fp_id_abcd", DI::Id(IDK::Dob)), pii!("1999-09-09")),
        ]);
        let detokenized = result.detokenize_body(detokens).expect("detokenize");
        let result: TestData =
            serde_json::from_str(detokenized.leak()).expect("failed json decode detokenized");

        assert_eq!(test, result);
    }

    #[test_case("{{id.first_name}}{" => "Hayes{"; "test1")]
    #[test_case("{{{{id.first_name}}}}" => "{{Hayes}}"; "test2")]
    #[test_case("{{{{{id.first_name}}}}}" => "{{{Hayes}}}"; "test3")]
    #[test_case("{{{id.first_name}}}" => "{Hayes}"; "test4")]
    #[test_case("}}{{id.first_name}}{{" => "}}Hayes{{"; "test5")]
    #[test_case("{{id.first_name}} {}}" => "Hayes {}}"; "test6")]
    #[test_case("{{id.first_name}} {}" => "Hayes {}"; "test7")]
    #[test_case("{{id.first_name}} {{}" => "Hayes {{}"; "test8")]
    #[test_case("{{id.first_name}}{{{{" => "Hayes{{{{"; "test9")]
    #[test_case("{{id.first_name}}{{ id.first_name" => "Hayes{{ id.first_name"; "test10")]
    #[test_case("{{id.first_name{{ id.first_name }}" => "{{id.first_nameHayes"; "test11")]
    #[test_case("{{id.first_name{{ id.first_name " => "{{id.first_name{{ id.first_name "; "test12")]
    fn test_detokenize_complex(body: &str) -> String {
        let global = FpId::from("fp_id_abcd".to_string());
        let result = ProxyTokenParser::parse(body, Some(global)).unwrap();
        let detokens = HashMap::from_iter(vec![(
            tok1("fp_id_abcd", DI::Id(IDK::FirstName)),
            PiiString::from("Hayes"),
        )]);
        let detokenized = result.detokenize_body(detokens).expect("detokenize");
        detokenized.leak_to_string()
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

        let Ok(token) = ProxyToken::parse_global(raw, global.as_ref()) else {
            return false;
        };
        token == expected
    }

    const B_0: &str = r#"{{ {{ fp_id_1.custom.ach }} }}"#;
    const B_1: &str = r#"{ blah blah blah {{ id.ssn9 }} sdfsdf sd {{ custom.cc4 }} }} {{ blah { {{"#;
    const B_2: &str = r#"{ blah blah blah {{ id.ssn9 }} sdfsdf sd {}  }} }} {{ blah {{ custom.cc4 }} {{"#;
    const B_3: &str = r#"{{ {{ {{ {{id.dob}} }}"#;
    const B_4: &str = r#"{{ custom.ach}"#;
    const B_5: &str =
        r#"{{ fp_id_x.custom.ach}} {{{fp_id_y.id.ssn9}} sdf {{ fp_id_z.custom.ach2}}} {{fp_id_y.id.ssn9}}"#;
    const B_6: &str = r#"{ { {{{ fp_id_1.custom.ach     }}"#;

    #[test_case(B_0, None, &[
        (tok1("fp_id_1", custom("ach")), 1),
    ])]
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
        (tok2(B7_FP_ID, IDK::Ssn9, vec![Suffix(CountArgs { count: 4 })]), 1),
        (tok2(B7_FP_ID, IDK::LastName, vec![Prefix(CountArgs { count: 4 }), ToUppercase ]), 1),
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
