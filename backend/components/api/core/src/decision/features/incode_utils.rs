use super::incode_docv::IncodeOcrAddress;
use super::incode_docv::IncodeOcrComparisonDataFields;
use super::incode_ocr_fields::IncodeOcrField;
use idv::incode::doc::response::FetchOCRResponse;
use itertools::Itertools;
use levenshtein::levenshtein;
use newtypes::FootprintReasonCode;
use newtypes::IdentityDataKind;
use newtypes::OcrDataKind;
use newtypes::PiiString;
use newtypes::ScrubbedPiiString;
use regex::Regex;
use strum::IntoEnumIterator;

#[derive(Debug, Clone)]
pub struct ParsedIncodeField {
    pub field: IncodeOcrField,
    pub confidence: Option<f32>,
    pub value: PiiString,
}

#[derive(Debug, Clone)]
pub struct ParsedIncodeFields(pub Vec<ParsedIncodeField>);
impl ParsedIncodeFields {
    /// Given something that can be converted from an IncodeOcrField, return the corresponding
    /// ParsedIncodeField (this is ODKs and IDKs)
    pub fn get<T>(&self, di: T) -> Option<&ParsedIncodeField>
    where
        T: TryFrom<IncodeOcrField> + Eq + PartialEq,
    {
        self.0
            .iter()
            .filter_map(|p| {
                let d = T::try_from(p.field).ok()?;
                if di == d {
                    Some(p)
                } else {
                    None
                }
            })
            .next()
    }

    pub fn ocr_data_kinds(&self) -> Vec<(OcrDataKind, PiiString)> {
        self.0
            .iter()
            .filter_map(|p| OcrDataKind::try_from(p.field).ok().map(|o| (o, p.value.clone())))
            .collect()
    }

    pub fn identity_data_kinds(&self) -> Vec<(IdentityDataKind, PiiString)> {
        self.0
            .iter()
            .filter_map(|p| {
                IdentityDataKind::try_from(p.field)
                    .ok()
                    .map(|o| (o, p.value.clone()))
            })
            .collect()
    }
}

impl ParsedIncodeFields {
    pub fn from_fetch_ocr_res(r: &FetchOCRResponse) -> ParsedIncodeFields {
        let fields = IncodeOcrField::iter()
            .filter_map(|f| f.build_parsed_incode_field_from_response(r))
            .collect();
        ParsedIncodeFields(fields)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsedIncodeNames {
    pub first_name: Option<PiiString>,
    pub middle_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
    pub full_name: Option<PiiString>,
}

impl ParsedIncodeNames {
    fn new(
        first_name: Option<PiiString>,
        middle_name: Option<PiiString>,
        last_name: Option<PiiString>,
    ) -> Self {
        let full_name = vec![first_name.clone(), middle_name.clone(), last_name.clone()]
            .into_iter()
            .flatten()
            .map(|s| s.leak_to_string())
            .join(" ");
        let full_name = if full_name.is_empty() {
            None
        } else {
            Some(full_name.into())
        };

        Self {
            first_name,
            middle_name,
            last_name,
            full_name,
        }
    }

    pub fn from_fetch_ocr_res(ocr: &FetchOCRResponse) -> ParsedIncodeNames {
        let Some(name) = ocr.name.clone() else {
            return ParsedIncodeNames::new(None, None, None);
        };

        // If we have both given_name_mrz and last_name_mrz, then we can populate fn/mn/ln entirely from
        // these this seems to only be the case for MEX style documents where there are "given
        // names" + "surnames" rather than fn/ln
        if let (Some(given_name_mrz), Some(last_name_mrz)) = (name.given_name_mrz, name.last_name_mrz) {
            let last_name = last_name_mrz.leak_to_string().trim().into();

            // there is some ambiguity here in differentiating "first" vs "middle" names. In particular if
            // this is indeed a MEX style case, there is no concept really of a middle name and we can't be
            // totally sure how these folks will enter their names in across first_name vs middle_name. So for
            // now, we just take the first token as first_name and the rest as middle_name and then when we
            // produce match reason codes, we need to be careful to be robust to users entering in given names
            // across first_name + middle_name in different ways
            let (first_name, middle_name) =
                Self::parse_into_first_middle(given_name_mrz.leak_to_string().trim().into());

            return ParsedIncodeNames::new(first_name, middle_name, Some(last_name));
        }

        let last_name: Option<PiiString> = match (name.paternal_last_name, name.maternal_last_name) {
            (None, None) => None,
            (None, Some(m)) => Some(m.leak_to_string().trim().to_owned().into()),
            (Some(p), None) => Some(p.leak_to_string().trim().to_owned().into()),
            (Some(p), Some(m)) => {
                let p = p.leak().trim();
                let m = m.leak().trim();
                if p == m {
                    // we aren't quite sure if this is possible and if it is what it means. for eg: in MEX if
                    // your parents have the same last name, do have duplicate last names or do you
                    // consolidate into one? and would incode ever erronesouly populate both of these when the
                    // person in fact only has a singular "last name"? Some mysteries of the universe remain
                    // so, but if you ctrl+F'd this error string then today is your lucky day friend
                    tracing::error!("Incode response seen with paternal_last_name = maternal_last_name");
                }
                Some(format!("{} {}", p, m).into())
            }
        };
        let first_name_from_first_name_field: Option<PiiString> = name
            .first_name
            .map(|f| f.leak_to_string().trim().to_owned().into());
        let middle_name_from_middle_name_field: Option<PiiString> = name
            .middle_name
            .map(|m| m.leak_to_string().trim().to_owned().into());

        // the alternative mrz format is full_name_mrz, so we parse this into first + middle + last
        if let Some(mrz_full_name) = name.machine_readable_full_name {
            let mrz_full_name: PiiString = mrz_full_name.leak_to_string().trim().to_owned().into();
            // if the mrz full name matches the Incode given first/middle/last breakdown, then we can just use
            // Incode's name parsing here (which may be better if they use context of the doc or something
            // more intelligent than splitting on strings?)
            let mrz_name_components: Vec<PiiString> = mrz_full_name
                .leak_to_string()
                .split(' ')
                .map(|s| s.to_lowercase().into())
                .collect_vec();

            let incode_parsed_name_components: Vec<PiiString> = [
                first_name_from_first_name_field
                    .as_ref()
                    .map(|s| s.leak_to_string().split(' ').map(|s| s.to_owned()).collect_vec()),
                middle_name_from_middle_name_field
                    .as_ref()
                    .map(|s| s.leak_to_string().split(' ').map(|s| s.to_owned()).collect_vec()),
                last_name
                    .as_ref()
                    .map(|s| s.leak_to_string().split(' ').map(|s| s.to_owned()).collect_vec()),
            ]
            .into_iter()
            .flatten()
            .flatten()
            .map(|s| {
                Self::remove_hyphens_and_apostrophes(&s.to_owned().into())
                    .leak_to_string()
                    .to_lowercase()
                    .into()
            })
            .collect_vec();

            // We have to compare this way because sometimes Incode is giving us mrz names that are jumbled
            // eg: name is Alice Bob Cook but mrz_full_name = Cook Alice Bob (even though the non mrz fields
            // are parsed in the right order)
            let mrz_and_incode_parsed_match =
                Self::name_components_match(&mrz_name_components, &incode_parsed_name_components);

            let (first_name, middle_name, last_name) = if mrz_and_incode_parsed_match {
                (
                    first_name_from_first_name_field,
                    middle_name_from_middle_name_field,
                    last_name,
                )
            } else {
                // we need to parse into first/middle/last components ourself
                Self::parse_into_first_middle_last(mrz_full_name)
            };

            return ParsedIncodeNames::new(first_name, middle_name, last_name);
        }

        // we (probably) don't have a MRZ name, so we fall back to the (probably) OCR fields
        let (first_name, middle_name) = if let (Some(first_name), Some(middle_name)) = (
            first_name_from_first_name_field,
            middle_name_from_middle_name_field,
        ) {
            // if we have first + middle, then just use those
            (Some(first_name), Some(middle_name))
        } else if let Some(given_name) = name.given_name {
            // else we parse from given_name
            Self::parse_into_first_middle(given_name.into())
        } else {
            (None, None)
        };

        ParsedIncodeNames::new(first_name, middle_name, last_name)
    }

    fn name_components_match(v1: &[PiiString], v2: &[PiiString]) -> bool {
        // Checks if any permutation of concatenating the components of the mrz name (v1) matches any
        // permutation of concatenating the components of the non-mrz names (v2) This is dumb as
        // hell I know but I couldn't really figure out a better way to handle all combinations of
        // apostrophes/hyphens/trailing white spaces + name jumblings
        let v1_name_permutations = v1
            .iter()
            .permutations(v1.len())
            .map(|p| p.into_iter().map(|s| s.leak_to_string()).join(""))
            .collect_vec();
        let v2_name_permutations = v2
            .iter()
            .permutations(v2.len())
            .map(|p| p.into_iter().map(|s| s.leak_to_string()).join(""))
            .collect_vec();

        v1_name_permutations
            .iter()
            .any(|v1p| v2_name_permutations.contains(v1p))
    }

    // take first token as first name and remaining (if present) as middle name
    fn parse_into_first_middle(s: PiiString) -> (Option<PiiString>, Option<PiiString>) {
        let s = s.leak_to_string();
        let mut comps = s.trim().split(' ').collect::<Vec<_>>();
        let first_name = if comps.is_empty() {
            // not really possible but extra safe
            None
        } else {
            Some(comps.remove(0).into())
        };

        let middle_name = if comps.is_empty() {
            None
        } else {
            Some(comps.join(" ").into())
        };

        (first_name, middle_name)
    }

    fn parse_into_first_middle_last(
        s: PiiString,
    ) -> (Option<PiiString>, Option<PiiString>, Option<PiiString>) {
        let s = s.leak_to_string();
        let mut comps = s.trim().split(' ').collect::<Vec<_>>();
        let first_name = if comps.is_empty() {
            // not really possible but extra safe
            None
        } else {
            Some(comps.remove(0).into())
        };

        let last_name = if comps.is_empty() {
            None
        } else {
            Some(comps.remove(comps.len() - 1).into())
        };

        let middle_name = if comps.is_empty() {
            None
        } else {
            Some(comps.join(" ").into())
        };

        (first_name, middle_name, last_name)
    }

    // unclear if its safe to remove all non-letter characters, so for now just remove hyphens and
    // apostrophes
    fn remove_hyphens_and_apostrophes(s: &PiiString) -> PiiString {
        match Regex::new(r#"[-'\"]\s*"#) {
            Ok(re) => re.replace_all(s.leak(), "").into_owned().into(),
            Err(err) => {
                tracing::error!(?err, "Regex error");
                s.clone()
            }
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsedIncodeAddress {
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub zip: Option<PiiString>,
    pub street: Option<PiiString>,
    pub full_address: Option<PiiString>,
}

impl ParsedIncodeAddress {
    pub fn new(
        city: Option<PiiString>,
        state: Option<PiiString>,
        zip: Option<PiiString>,
        street: Option<PiiString>,
        full_address: Option<PiiString>,
    ) -> Self {
        let full_derived = vec![street.clone(), city.clone(), state.clone(), zip.clone()]
            .into_iter()
            .flatten()
            .map(|s| s.leak_to_string())
            .join(" ");

        let full_address = if let Some(a) = full_address {
            a
        } else {
            full_derived.into()
        };

        Self {
            city,
            state,
            zip,
            street,
            full_address: Some(full_address),
        }
    }

    fn normalize_zip(z: PiiString) -> PiiString {
        z.map(|x| if x.len() >= 5 { x[..5].to_string() } else { x })
    }

    pub fn from_fetch_ocr_res(ocr: &FetchOCRResponse) -> ParsedIncodeAddress {
        // first check broken out fields
        let (city, state, zip, street) =
            match ocr.address_fields.as_ref().or(ocr.checked_address_bean.as_ref()) {
                Some(a) => {
                    // fields, full address
                    let city = scrubbed_to_pii(a.city.as_ref());
                    let state = scrubbed_to_pii(a.state.as_ref());
                    // Incode sometimes returns zips in Zip9 format
                    let zip = scrubbed_to_pii(a.postal_code.as_ref()).map(Self::normalize_zip);
                    let street = scrubbed_to_pii(a.street.as_ref());

                    (city, state, zip, street)
                }
                None => (None, None, None, None),
            };

        ParsedIncodeAddress::new(city, state, zip, street, scrubbed_to_pii(ocr.address.as_ref()))
    }
}

fn merge<'a>(a: Option<&'a PiiString>, b: Option<&'a PiiString>) -> Option<(&'a PiiString, &'a PiiString)> {
    a.and_then(|a| b.map(|b| (a, b)))
}

pub(crate) fn first_name_matches(
    parsed: &ParsedIncodeNames,
    vault: &IncodeOcrComparisonDataFields,
) -> Option<bool> {
    let parsed_first_middle: Option<PiiString> =
        merge(parsed.first_name.as_ref(), parsed.middle_name.as_ref())
            .map(|(f, m)| format!("{} {}", f.leak(), m.leak()).into());
    let vault_first_middle: Option<PiiString> = merge(vault.first_name.as_ref(), vault.middle_name.as_ref())
        .map(|(f, m)| format!("{} {}", f.leak(), m.leak()).into());

    let first_matches_first = merge(parsed.first_name.as_ref(), vault.first_name.as_ref())
        .map(|(a, b)| pii_strings_match_name_normalized(a, b));
    let first_matches_first_middle = merge(parsed.first_name.as_ref(), vault_first_middle.as_ref())
        .map(|(a, b)| pii_strings_match_name_normalized(a, b));
    // for eg: if a MEX user entered both their given names into first_name and left middle_name blank
    let first_middle_matches_first = merge(parsed_first_middle.as_ref(), vault.first_name.as_ref())
        .map(|(a, b)| pii_strings_match_name_normalized(a, b));
    // for eg: if you have many given names and split them across first_name/middle_name differently
    // than our/Incode's parsing logic
    let first_middle_matches_first_middle = merge(parsed_first_middle.as_ref(), vault_first_middle.as_ref())
        .map(|(a, b)| pii_strings_match_name_normalized(a, b));

    [
        first_matches_first,
        first_matches_first_middle,
        first_middle_matches_first,
        first_middle_matches_first_middle,
    ]
    .into_iter()
    .flatten()
    .max()
}

pub(crate) fn last_name_matches(
    parsed: &ParsedIncodeNames,
    vault_data: &IncodeOcrComparisonDataFields,
) -> Option<bool> {
    // surnames seem to be less ambiguous so let's just directly compare for now
    merge(parsed.last_name.as_ref(), vault_data.last_name.as_ref())
        .map(|(a, b)| pii_strings_match_name_normalized(a, b))
}

pub(crate) fn dob_matches(
    ocr: &FetchOCRResponse,
    vault_data: &IncodeOcrComparisonDataFields,
) -> Option<bool> {
    let dob_ocr: Option<PiiString> = ocr.dob().ok().map(|s| s.into());
    vault_data
        .dob
        .clone()
        .and_then(|dob| dob_ocr.as_ref().map(|ocr_dob| pii_strings_match(ocr_dob, &dob)))
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct AddressMatchResult {
    pub did_not_match: Vec<IdentityDataKind>,
    pub matched: Vec<IdentityDataKind>,
    pub could_not_match: Vec<IdentityDataKind>,
}
impl AddressMatchResult {
    pub fn matched(&self) -> Option<bool> {
        if !self.could_not_match.is_empty() {
            None
        } else if !self.did_not_match.is_empty() {
            Some(false)
        } else if !self.matched.is_empty() {
            Some(true)
        } else {
            None
        }
    }
}

pub fn address_matches(ocr: &ParsedIncodeAddress, vault_data: &IncodeOcrAddress) -> AddressMatchResult {
    let city_matches = (IdentityDataKind::City, city_matches(ocr, vault_data));
    let state_matches = (IdentityDataKind::State, state_matches(ocr, vault_data));
    let zip_matches = (IdentityDataKind::Zip, zip_matches(ocr, vault_data));
    let street_matches = (IdentityDataKind::AddressLine1, street_matches(ocr, vault_data));

    let (could_not_match, rest): (Vec<_>, Vec<_>) =
        vec![city_matches, state_matches, zip_matches, street_matches]
            .into_iter()
            .partition(|(_, res)| res.is_none());

    let (matched, did_not_match): (Vec<_>, Vec<_>) =
        rest.into_iter().partition(|(_, res)| res.unwrap_or(false));

    AddressMatchResult {
        did_not_match: did_not_match.into_iter().map(|(idk, _)| idk).collect(),
        matched: matched.into_iter().map(|(idk, _)| idk).collect(),
        could_not_match: could_not_match.into_iter().map(|(idk, _)| idk).collect(),
    }
}

// Match city w/i edit distance
fn city_matches(ocr: &ParsedIncodeAddress, vault_data: &IncodeOcrAddress) -> Option<bool> {
    merge(vault_data.city.as_ref(), ocr.city.as_ref())
        .map(|(a, b)| pii_strings_match_normalized(a, b, levinstein_distance_matches(2)))
}

// state exact matches
fn state_matches(ocr: &ParsedIncodeAddress, vault_data: &IncodeOcrAddress) -> Option<bool> {
    merge(vault_data.state.as_ref(), ocr.state.as_ref())
        .map(|(a, b)| pii_strings_match_normalized(a, b, pii_strings_match))
}

// zip5 exact match
fn zip_matches(ocr: &ParsedIncodeAddress, vault_data: &IncodeOcrAddress) -> Option<bool> {
    merge(vault_data.zip.as_ref(), ocr.zip.as_ref())
        .map(|(a, b)| pii_strings_match_normalized(a, b, pii_strings_match))
}

// street match w/i edit distance
// TODO: handle address line 2
fn street_matches(ocr: &ParsedIncodeAddress, vault_data: &IncodeOcrAddress) -> Option<bool> {
    merge(vault_data.street.as_ref(), ocr.street.as_ref())
        .map(|(a, b)| pii_strings_match_normalized(a, b, levinstein_distance_matches(4)))
}

pub fn pii_strings_match_name_normalized(name1: &PiiString, name2: &PiiString) -> bool {
    // deunicode is guaranteed to only produce 0-127 ascii chars
    let normalized_name1 =
        convert_unicode_and_remove_chars(&deunicode::deunicode(name1.leak()).into(), non_alphabetic_regex());
    let normalized_name2 =
        convert_unicode_and_remove_chars(&deunicode::deunicode(name2.leak()).into(), non_alphabetic_regex());

    pii_strings_match(name1, name2) || pii_strings_match(&normalized_name1, &normalized_name2)
}

pub fn pii_strings_match_normalized(
    s1: &PiiString,
    s2: &PiiString,
    f_match: impl Fn(&PiiString, &PiiString) -> bool,
) -> bool {
    // deunicode is guaranteed to only produce 0-127 ascii chars
    let normalized_s1 =
        convert_unicode_and_remove_chars(&deunicode::deunicode(s1.leak()).into(), non_alphanumeric_regex());
    let normalized_s2 =
        convert_unicode_and_remove_chars(&deunicode::deunicode(s2.leak()).into(), non_alphanumeric_regex());

    f_match(s1, s2) || f_match(&normalized_s1, &normalized_s2)
}

fn levinstein_distance_matches(threshold: usize) -> impl Fn(&PiiString, &PiiString) -> bool {
    move |p1: &PiiString, p2: &PiiString| -> bool { levenshtein(p1.leak(), p2.leak()) <= threshold }
}

fn non_alphabetic_regex() -> Regex {
    #[allow(clippy::unwrap_used)]
    Regex::new(r"[^a-zA-Z]+").unwrap()
}

fn non_alphanumeric_regex() -> Regex {
    #[allow(clippy::unwrap_used)]
    Regex::new(r"[^a-zA-Z0-9]+").unwrap()
}

fn scrubbed_to_pii(s: Option<&ScrubbedPiiString>) -> Option<PiiString> {
    s.map(|p| p.leak_to_string().trim().into())
}

fn convert_unicode_and_remove_chars(s: &PiiString, regex: Regex) -> PiiString {
    regex
        .replace_all(s.leak(), "")
        .to_string()
        .trim()
        .to_lowercase()
        .into()
}

fn pii_strings_match(p1: &PiiString, p2: &PiiString) -> bool {
    let normalized_p1 = normalize_pii(p1);
    let normalized_p2 = normalize_pii(p2);
    (normalized_p1.leak() == normalized_p2.leak())
        && !(normalized_p1.leak().is_empty() || normalized_p2.leak().is_empty())
}

fn normalize_pii(p: &PiiString) -> PiiString {
    p.leak().trim().to_lowercase().into()
}

pub enum IncodeMatchField {
    FirstName,
    LastName,
    Name,
    Address,
    Dob,
}
pub fn reason_codes_from_match_field(
    field: IncodeMatchField,
    matches: Option<bool>,
) -> Vec<FootprintReasonCode> {
    match (field, matches) {
        (IncodeMatchField::FirstName, None) => vec![],
        (IncodeMatchField::FirstName, Some(m)) => {
            if m {
                vec![FootprintReasonCode::DocumentOcrFirstNameMatches]
            } else {
                vec![FootprintReasonCode::DocumentOcrFirstNameDoesNotMatch]
            }
        }
        (IncodeMatchField::LastName, None) => vec![],
        (IncodeMatchField::LastName, Some(m)) => {
            if m {
                vec![FootprintReasonCode::DocumentOcrLastNameMatches]
            } else {
                vec![FootprintReasonCode::DocumentOcrLastNameDoesNotMatch]
            }
        }
        (IncodeMatchField::Name, None) => {
            vec![
                FootprintReasonCode::DocumentOcrNameDoesNotMatch,
                FootprintReasonCode::DocumentOcrNameCouldNotMatch,
            ]
        }
        (IncodeMatchField::Name, Some(m)) => {
            if m {
                vec![FootprintReasonCode::DocumentOcrNameMatches]
            } else {
                vec![FootprintReasonCode::DocumentOcrNameDoesNotMatch]
            }
        }
        (IncodeMatchField::Address, None) => {
            vec![
                FootprintReasonCode::DocumentOcrAddressDoesNotMatch,
                FootprintReasonCode::DocumentOcrAddressCouldNotMatch,
            ]
        }
        (IncodeMatchField::Address, Some(m)) => {
            if m {
                vec![FootprintReasonCode::DocumentOcrAddressMatches]
            } else {
                vec![FootprintReasonCode::DocumentOcrAddressDoesNotMatch]
            }
        }
        (IncodeMatchField::Dob, None) => {
            vec![
                FootprintReasonCode::DocumentOcrDobDoesNotMatch,
                FootprintReasonCode::DocumentOcrDobCouldNotMatch,
            ]
        }
        (IncodeMatchField::Dob, Some(m)) => {
            if m {
                vec![FootprintReasonCode::DocumentOcrDobMatches]
            } else {
                vec![FootprintReasonCode::DocumentOcrDobDoesNotMatch]
            }
        }
    }
}

pub enum IncodeOcrFields {}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::decision::features::incode_docv::IncodeOcrAddress;
    use idv::incode::doc::response::OCRAddress;
    use idv::incode::doc::response::OCRName;
    use newtypes::IdentityDataKind as IDK;
    use test_case::test_case;

    #[test_case(
        OCRName {

            full_name: Some("JIM BOB COLLINS".into()),
            first_name: Some("JIM".into()),
            paternal_last_name: Some("COLLINS".into()),
            given_name: Some("JIM BOB".into()),
            middle_name: Some("BOB".into()),
            machine_readable_full_name: Some("JIM BOB COLLINS".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("JIM".into()),
            middle_name: Some("BOB".into()),
            last_name: Some("COLLINS".into()),
            full_name: Some("JIM BOB COLLINS".into())
        } ; "US style DL"
    )]
    #[test_case(
        OCRName {

            full_name: Some("SALLY TERRENCE LONG CARMACK".into()),
            first_name: Some("SALLY".into()),
            paternal_last_name: Some("CARMACK".into()),
            given_name: Some("SALLY TERRENCE LONG".into()),
            middle_name: Some("TERRENCE LONG".into()),
            machine_readable_full_name: Some("SALLY TERRENCE LONG CARMACK".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("SALLY".into()),
            middle_name: Some("TERRENCE LONG".into()),
            last_name: Some("CARMACK".into()),
            full_name: Some("SALLY TERRENCE LONG CARMACK".into())
        } ; "US style DL, multiple middle names"
    )]
    #[test_case(
        OCRName {
            full_name: Some("ALLEN YU CARMACK".into()),
            first_name: Some("ALLEN".into()),
            paternal_last_name: Some("YU".into()),
            maternal_last_name: Some("CARMACK".into()),
            given_name: Some("ALLEN".into()),
            machine_readable_full_name: Some("ALLEN YU CARMACK".into()),
            given_name_mrz: Some("ALLEN".into()),
            last_name_mrz: Some("YU CARMACK".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("ALLEN".into()),
            middle_name: None,
            last_name: Some("YU CARMACK".into()),
            full_name: Some("ALLEN YU CARMACK".into())
        } ; "MEX style, 3 parts"
    )]
    #[test_case(
        OCRName {
            full_name: Some("DAVID ALLEN POTTER HENRY BILL".into()),
            first_name: Some("DAVID ALLEN".into()),
            paternal_last_name: Some("POTTER HENRY".into()),
            maternal_last_name: Some("BILL".into()),
            given_name: Some("DAVID ALLEN".into()),
            machine_readable_full_name: Some("DAVID ALLEN POTTER HENRY BILL".into()),
            given_name_mrz: Some("DAVID ALLEN".into()),
            last_name_mrz: Some("POTTER HENRY BILL".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("DAVID".into()),
            middle_name: Some("ALLEN".into()),
            last_name: Some("POTTER HENRY BILL".into()),
            full_name: Some("DAVID ALLEN POTTER HENRY BILL".into())
        } ; "MEX style, 5 parts"
    )]
    #[test_case(
        // text on doc = SALLY BART JONES
        // barcode = DAN SMITH
        OCRName {
            full_name: Some("DAN SMITH".into()),
            first_name: Some("DAN".into()),
            middle_name: Some("BART".into()), // OCR'd from front, but not part of the barcode name!!!
            paternal_last_name: Some("SMITH".into()),
            given_name: Some("DAN".into()),
            machine_readable_full_name: Some("DAN SMITH".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("DAN".into()),
            middle_name: None,
            last_name: Some("SMITH".into()),
            full_name: Some("DAN SMITH".into())
        } ; "spoofed doc"
    )]
    #[test_case(
        //text on doc = ANDRE JONES
        //spoofed barcode = JOHN SMITH
        OCRName {
            full_name: Some("JOHN SMITH".into()),
            first_name: Some("ANDRE".into()),
            paternal_last_name: Some("JONES".into()),
            given_name: Some("JOHN".into()),
            machine_readable_full_name: Some("JOHN SMITH".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("JOHN".into()),
            middle_name: None,
            last_name: Some("SMITH".into()),
            full_name: Some("JOHN SMITH".into())
        } ; "spoofed doc, no middle name"
    )]
    #[test_case(
        OCRName {
            full_name: Some("DANIEL SMITH".into()),
            first_name: Some("DANIEL".into()),
            paternal_last_name: Some("SMITH".into()),
            given_name: Some("DANIEL".into()),
            machine_readable_full_name: Some("DANIEL SMITH".into()),
            given_name_mrz: Some("DANIEL".into()),
            last_name_mrz: Some("SMITH".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("DANIEL".into()),
            middle_name: None,
            last_name: Some("SMITH".into()),
            full_name: Some("DANIEL SMITH".into())
        } ; "foreign passport"
    )]
    #[test_case(
        OCRName {
            full_name: Some("JOHN RAY NEWTON".into()),
            first_name: Some("JOHN".into()),
            middle_name: Some("RAY".into()),
            given_name: Some("JOHN RAY".into()),
            paternal_last_name: Some("NEWTON".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("JOHN".into()),
            middle_name: Some("RAY".into()),
            last_name: Some("NEWTON".into()),
            full_name: Some("JOHN RAY NEWTON".into())
        } ; "MRZ failure"
    )]
    #[test_case(
        OCRName {
            full_name: Some("CHRIS JR LEMON".into()),
            first_name: Some("CHRIS".into()),
            given_name: Some("CHRIS".into()),
            name_suffix: Some("JR".into()),
            paternal_last_name: Some("LEMON".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("CHRIS".into()),
            middle_name: None,
            last_name: Some("LEMON".into()),
            full_name: Some("CHRIS LEMON".into())
        } ; "MRZ failure + generational suffix"
    )]
    #[test_case(
        OCRName {
            full_name: Some("KARL LOGAN PETERS- WHITE".into()),
            machine_readable_full_name: Some("KARL LOGAN PETERS WHITE".into()),
            first_name: Some("KARL".into()),
            middle_name: Some("LOGAN".into()),
            given_name: Some("KARL LOGAN".into()),
            paternal_last_name: Some("PETERS- WHITE".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("KARL".into()),
            middle_name: Some("LOGAN".into()),
            last_name: Some("PETERS- WHITE".into()),
            full_name: Some("KARL LOGAN PETERS- WHITE".into())
        } ; "hyphen (with trailing space) in OCR names but not MRZ name"
    )]
    #[test_case(
        OCRName {
            full_name: Some("KARL LOGAN PETERS-WHITE".into()),
            machine_readable_full_name: Some("KARL LOGAN PETERS WHITE".into()),
            first_name: Some("KARL".into()),
            middle_name: Some("LOGAN".into()),
            given_name: Some("KARL LOGAN".into()),
            paternal_last_name: Some("PETERS-WHITE".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("KARL".into()),
            middle_name: Some("LOGAN".into()),
            last_name: Some("PETERS-WHITE".into()),
            full_name: Some("KARL LOGAN PETERS-WHITE".into())
        } ; "hyphen (without trailing space) in OCR names but not MRZ name"
    )]
    #[test_case(
        OCRName {
            full_name: Some("LOGAN J HILTON-BERNS".into()),
            machine_readable_full_name: Some("LOGAN J HILTONBERNS".into()),
            first_name: Some("LOGAN".into()),
            middle_name: Some("J".into()),
            given_name: Some("LOGAN J".into()),
            paternal_last_name: Some("HILTON-BERNS".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("LOGAN".into()),
            middle_name: Some("J".into()),
            last_name: Some("HILTON-BERNS".into()),
            full_name: Some("LOGAN J HILTON-BERNS".into())
        } ; "hyphen in OCR names and MRZ name collapses hyphenated name into one"
    )]
    #[test_case(
        OCRName {
            full_name: Some("BOB O'BERTO".into()),
            machine_readable_full_name: Some("BOB OBERTO".into()),
            first_name: Some("BOB".into()),
            given_name: Some("BOB".into()),
            paternal_last_name: Some("O'BERTO".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("BOB".into()),
            middle_name: None,
            last_name: Some("O'BERTO".into()),
            full_name: Some("BOB O'BERTO".into())
        } ; "apostrophe in OCR names but not MRZ name"
    )]
    #[test_case(
        OCRName {
            full_name: Some("BOB O'BERTO".into()),
            machine_readable_full_name: Some("BOB O BERTO".into()),
            first_name: Some("BOB".into()),
            given_name: Some("BOB".into()),
            paternal_last_name: Some("O'BERTO".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("BOB".into()),
            middle_name: None,
            last_name: Some("O'BERTO".into()),
            full_name: Some("BOB O'BERTO".into())
        } ; "apostrophe in OCR names but not MRZ name, with trailing space in MRZ"
    )]
    #[test_case(
        OCRName {
            full_name: Some("AUSTIN WALLACE HOOK".into()),
            machine_readable_full_name: Some("HOOK AUSTIN WALLACE".into()),
            first_name: Some("AUSTIN".into()),
            middle_name: Some("WALLACE".into()),
            given_name: Some("AUSTIN WALLACE".into()),
            paternal_last_name: Some("HOOK".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("AUSTIN".into()),
            middle_name: Some("WALLACE".into()),
            last_name: Some("HOOK".into()),
            full_name: Some("AUSTIN WALLACE HOOK".into())
        } ; "comma in barcode/mrz name but Incode is dropping it so name ordering is ambiguous"
    )]
    #[test_case(
        OCRName {
            full_name: Some("MILES RODGER ALTA".into()),
            machine_readable_full_name: Some("MILES RODGER ALTA".into()),
            first_name: Some("MILES".into()),
            given_name: Some("MILES".into()),
            paternal_last_name: Some("RODGER ALTA".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("MILES".into()),
            middle_name: None,
            last_name: Some("RODGER ALTA".into()),
            full_name: Some("MILES RODGER ALTA".into())
        } ; "dont parse middle name from paternal last"
    )]
    fn test_parse_names_from_incode(name: OCRName) -> ParsedIncodeNames {
        ParsedIncodeNames::from_fetch_ocr_res(&FetchOCRResponse {
            name: Some(name),
            ..Default::default()
        })
    }

    //
    // ZIP
    //
    #[test_case(
        OCRAddress {
            postal_code: Some("12345".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            zip: Some("12345".into()),
            ..Default::default()
        } => Some(true) ; "matches"
    )]
    #[test_case(
        OCRAddress {
            postal_code: Some("123456789".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            zip: Some("12345".into()),
            ..Default::default()
        } => Some(true) ; "matches zip5"
    )]
    #[test_case(
        OCRAddress {
            postal_code: Some("67891".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            zip: Some("12345".into()),
            ..Default::default()
        } => Some(false) ; "does not match"
    )]
    #[test_case(
        OCRAddress {
            postal_code: Some("123".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            zip: Some("12345".into()),
            ..Default::default()
        } => Some(false) ; "does not match <5"
    )]
    #[test_case(
        OCRAddress {
            postal_code: None,
            ..Default::default()

        }, IncodeOcrAddress {
            zip: Some("12345".into()),
            ..Default::default()
        } => None ; "does not match missing OCR"
    )]
    #[test_case(
        OCRAddress {
            postal_code: Some("12345".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            zip: None,
            ..Default::default()
        } => None ; "does not match missing Vault"
    )]
    fn test_zip_matching(ocr_address: OCRAddress, vault_address: IncodeOcrAddress) -> Option<bool> {
        let ocr = FetchOCRResponse {
            address_fields: Some(ocr_address),
            ..Default::default()
        };
        let parsed_address = ParsedIncodeAddress::from_fetch_ocr_res(&ocr);
        zip_matches(&parsed_address, &vault_address)
    }

    //
    // CITY
    //
    #[test_case(
        OCRAddress {
            city: Some("Bobtown".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            city: Some("BOBTOWN".into()),
            ..Default::default()
        } => Some(true) ; "matches"
    )]
    #[test_case(
        OCRAddress {
            city: Some("bobtown".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            city: Some("bobtow".into()),
            ..Default::default()
        } => Some(true) ; "matches close city"
    )]
    #[test_case(
        OCRAddress {
            city: Some("Bobtown".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            city: Some("Northport".into()),
            ..Default::default()
        } => Some(false) ; "does not match"
    )]
    #[test_case(
        OCRAddress {
            city: Some("Bobtown".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            city: Some("Bob".into()),
            ..Default::default()
        } => Some(false) ; "does not too high edit distance"
    )]
    #[test_case(
        OCRAddress {
            city: None,
            ..Default::default()

        }, IncodeOcrAddress {
            city: Some("bob".into()),
            ..Default::default()
        } => None ; "does not match missing OCR"
    )]
    #[test_case(
        OCRAddress {
            city: Some("bob".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            city: None,
            ..Default::default()
        } => None ; "does not match missing Vault"
    )]
    fn test_city_matching(ocr_address: OCRAddress, vault_address: IncodeOcrAddress) -> Option<bool> {
        let ocr = FetchOCRResponse {
            address_fields: Some(ocr_address),
            ..Default::default()
        };
        let parsed_address = ParsedIncodeAddress::from_fetch_ocr_res(&ocr);
        city_matches(&parsed_address, &vault_address)
    }

    //
    // STATE
    //
    #[test_case(
        OCRAddress {
            state: Some("NY".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            state: Some("NY".into()),
            ..Default::default()
        } => Some(true) ; "matches"
    )]
    #[test_case(
        OCRAddress {
            state: Some("GA".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            state: Some("NY".into()),
            ..Default::default()
        } => Some(false) ; "does not match"
    )]
    #[test_case(
        OCRAddress {
            state: None,
            ..Default::default()

        }, IncodeOcrAddress {
            state: Some("NY".into()),
            ..Default::default()
        } => None ; "does not match missing ocr"
    )]
    #[test_case(
        OCRAddress {
            state: Some("GA".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            state: None,
            ..Default::default()
        } => None ; "does not match missing vault"
    )]
    fn test_state_matching(ocr_address: OCRAddress, vault_address: IncodeOcrAddress) -> Option<bool> {
        let ocr = FetchOCRResponse {
            address_fields: Some(ocr_address),
            ..Default::default()
        };
        let parsed_address = ParsedIncodeAddress::from_fetch_ocr_res(&ocr);
        state_matches(&parsed_address, &vault_address)
    }

    //
    // STREET
    //
    #[test_case(
        OCRAddress {
            street: Some("1 main St".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("1 MAIN St.".into()),
            ..Default::default()
        } => Some(true) ; "matches"
    )]
    #[test_case(
        OCRAddress {
            street: Some("1 main St".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("    1 MAIN st           %@%@".into()),
            ..Default::default()
        } => Some(true)
    )]
    #[test_case(
        OCRAddress {
            street: Some("1 Main Street".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("1 MAIN St.".into()),
            ..Default::default()
        } => Some(true) ; "matches street, close match"
    )]
    #[test_case(
        OCRAddress {
            street: Some("1 Main Street".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("11 Main Street".into()),
            ..Default::default()
        } => Some(true) ; "matches different number"
    )]
    #[test_case(
        OCRAddress {
            street: Some("1 Street".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("1 Main St".into()),
            ..Default::default()
        } => Some(false) ; "does not match"
    )]
    #[test_case(
        OCRAddress {
            street: None,
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("main".into()),
            ..Default::default()
        } => None ; "does not match missing OCR"
    )]
    #[test_case(
        OCRAddress {
            street: Some("main".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: None,
            ..Default::default()
        } => None ; "does not match missing Vault"
    )]
    fn test_street_matching(ocr_address: OCRAddress, vault_address: IncodeOcrAddress) -> Option<bool> {
        let ocr = FetchOCRResponse {
            address_fields: Some(ocr_address),
            ..Default::default()
        };
        let parsed_address = ParsedIncodeAddress::from_fetch_ocr_res(&ocr);
        street_matches(&parsed_address, &vault_address)
    }

    fn address_mr(
        matched: Vec<IDK>,
        did_not_match: Vec<IDK>,
        could_not_match: Vec<IDK>,
    ) -> AddressMatchResult {
        AddressMatchResult {
            matched,
            did_not_match,
            could_not_match,
        }
    }
    #[test_case(
        OCRAddress {
            street: Some("13 Main St.".into()),
            postal_code: Some("12345".into()),
            city: Some("Boston".into()),
            state: Some("MA".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("13 Main St.".into()),
            zip: Some("12345".into()),
            city: Some("BOSTON".into()),
            state: Some("MA".into()),
        }, (address_mr(vec![IDK::City, IDK::State, IDK::Zip, IDK::AddressLine1], vec![], vec![]), Some(true)) ; "address matches"
    )]
    #[test_case(
        OCRAddress {
            // slight mispelling + strange character
            street: Some("13 Mane St.@".into()),
            // zip>5
            postal_code: Some("123456789".into()),
            // off by 1
            city: Some("Bosto".into()),
            state: Some("MA".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("13 Main St.".into()),
            zip: Some("12345".into()),
            city: Some("BOSTON".into()),
            state: Some("MA".into()),
        }, (address_mr(vec![IDK::City, IDK::State, IDK::Zip, IDK::AddressLine1], vec![], vec![]), Some(true)); "address normalized matches"
    )]
    #[test_case(
        OCRAddress {
            // slight mispelling +
            street: Some("13 Mane St.+".into()),
            // zip>5
            postal_code: Some("123456789".into()),
            // off by 1
            city: Some("Bosto".into()),
            // Wrong city though
            state: Some("GA".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("13 Main St.".into()),
            zip: Some("12345".into()),
            city: Some("BOSTON".into()),
            state: Some("MA".into()),
        }, (address_mr(vec![IDK::City, IDK::Zip, IDK::AddressLine1], vec![IDK::State], vec![]), Some(false)) ; "address normalized does not match"
    )]
    #[test_case(
        OCRAddress {
            street: Some("567 Brain street".into()),
            postal_code: Some("555".into()),
            city: Some("Camptown".into()),
            // Wrong city though
            state: Some("GA".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("13 Main St.".into()),
            zip: Some("12345".into()),
            city: Some("BOSTON".into()),
            state: Some("MA".into()),
        }, (address_mr(vec![], vec![IDK::City, IDK::State, IDK::Zip, IDK::AddressLine1], vec![]), Some(false)) ; "nothing matches"
    )]
    #[test_case(
        OCRAddress {
            street: Some("567 Brain street".into()),
            postal_code: Some("555".into()),
            ..Default::default()

        }, IncodeOcrAddress {
            street: Some("13 Main St.".into()),
            zip: Some("12345".into()),
            city: Some("BOSTON".into()),
            state: Some("MA".into()),
        }, (address_mr(vec![], vec![IDK::Zip, IDK::AddressLine1], vec![IDK::City, IDK::State]), None) ; "missing a few fields, so match returns None"
    )]
    fn test_address_matching(
        ocr_address: OCRAddress,
        vault_address: IncodeOcrAddress,
        result: (AddressMatchResult, Option<bool>),
    ) {
        // let (expected_res, expected_match) = result;

        let ocr = FetchOCRResponse {
            address_fields: Some(ocr_address.clone()),
            ..Default::default()
        };
        let ocr2 = FetchOCRResponse {
            checked_address_bean: Some(ocr_address),
            ..Default::default()
        };

        let parsed_address = ParsedIncodeAddress::from_fetch_ocr_res(&ocr);
        let parsed_address2 = ParsedIncodeAddress::from_fetch_ocr_res(&ocr2);
        let res = address_matches(&parsed_address, &vault_address);
        let res2 = address_matches(&parsed_address2, &vault_address);
        let matched = res.matched();
        let matched2 = res.matched();
        assert_eq!((res, matched), result.clone());
        assert_eq!((res2, matched2), result.clone());
    }
}
