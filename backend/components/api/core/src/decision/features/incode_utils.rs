use idv::incode::doc::response::FetchOCRResponse;
use itertools::Itertools;
use newtypes::PiiString;
use regex::Regex;

use super::incode_docv::IncodeOcrComparisonDataFields;

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

        // If we have both given_name_mrz and last_name_mrz, then we can populate fn/mn/ln entirely from these
        // this seems to only be the case for MEX style documents where there are "given names" + "surnames" rather than fn/ln
        if let (Some(given_name_mrz), Some(last_name_mrz)) = (name.given_name_mrz, name.last_name_mrz) {
            let last_name = last_name_mrz.leak_to_string().trim().into();

            // there is some ambiguity here in differentiating "first" vs "middle" names. In particular if this is indeed a MEX style case, there is no concept really of a middle name and we can't be totally sure how these folks will enter their names in across first_name vs middle_name. So for now, we just take the first token as first_name and the rest as middle_name and then when we produce match reason codes, we need to be careful to be robust to users entering in given names across first_name + middle_name in different ways
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
                    // we aren't quite sure if this is possible and if it is what it means. for eg: in MEX if your parents have the same last name, do have duplicate last names or do you consolidate into one? and would incode ever erronesouly populate both of these when the person in fact only has a singular "last name"? Some mysteries of the universe remain so, but if you ctrl+F'd this error string then today is your lucky day friend
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
            // if the mrz full name matches the Incode given first/middle/last breakdown, then we can just use Incode's name parsing here (which may be better if they use context of the doc or something more intelligent than splitting on strings?)
            let all = [
                first_name_from_first_name_field.clone(),
                middle_name_from_middle_name_field.clone(),
                last_name.clone(),
            ]
            .iter()
            .flatten()
            .map(|s| s.leak())
            .join(" ");
            let (first_name, middle_name, last_name) =
                if all.to_lowercase() == mrz_full_name.leak_to_string().to_lowercase() {
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
}

fn merge<'a>(a: Option<&'a PiiString>, b: Option<&'a PiiString>) -> Option<(&'a PiiString, &'a PiiString)> {
    a.and_then(|a| b.map(|b| (a, b)))
}

pub(crate) fn first_name_matches(parsed: &ParsedIncodeNames, vault: &IncodeOcrComparisonDataFields) -> Option<bool> {
    let parsed_first_middle: Option<PiiString> = merge(parsed.first_name.as_ref(), parsed.middle_name.as_ref()).map(|(f,m)| format!("{} {}", f.leak(), m.leak()).into());
    let vault_first_middle: Option<PiiString> = merge(vault.first_name.as_ref(), vault.middle_name.as_ref()).map(|(f,m)| format!("{} {}", f.leak(), m.leak()).into());

    let first_matches_first = merge(parsed.first_name.as_ref(), vault.first_name.as_ref()).map(|(a, b)| pii_strings_match_name_normalized(a, b));
    let first_matches_first_middle = merge(parsed.first_name.as_ref(), vault_first_middle.as_ref()).map(|(a, b)| pii_strings_match_name_normalized(a, b));
    // for eg: if a MEX user entered both their given names into first_name and left middle_name blank
    let first_middle_matches_first = merge(parsed_first_middle.as_ref(), vault.first_name.as_ref()).map(|(a, b)| pii_strings_match_name_normalized(a, b));
    // for eg: if you have many given names and split them across first_name/middle_name differently than our/Incode's parsing logic
    let first_middle_matches_first_middle = merge(parsed_first_middle.as_ref(), vault_first_middle.as_ref()).map(|(a, b)| pii_strings_match_name_normalized(a, b));

    [first_matches_first, first_matches_first_middle, first_middle_matches_first, first_middle_matches_first_middle].into_iter().flatten().max()
}

pub(crate) fn last_name_matches(parsed: &ParsedIncodeNames, vault_data: &IncodeOcrComparisonDataFields) -> Option<bool> {
    // surnames seem to be less ambiguous so let's just directly compare for now
    merge(parsed.last_name.as_ref(), vault_data.last_name.as_ref()).map(|(a, b)| pii_strings_match_name_normalized(a, b))
}

pub(crate) fn dob_matches(ocr: &FetchOCRResponse, vault_data: &IncodeOcrComparisonDataFields) -> Option<bool> {
    let dob_ocr: Option<PiiString> = ocr.dob().ok().map(|s| s.into());
    vault_data.dob.clone().and_then(|dob| dob_ocr.as_ref().map(|ocr_dob| pii_strings_match(ocr_dob, &dob)))
}

pub fn pii_strings_match_name_normalized(name1: &PiiString, name2: &PiiString) -> bool {
    // deunicode is guaranteed to only produce 0-127 ascii chars
    let normalized_name1 = convert_unicode_and_remove_non_alphabetic_chars(&deunicode::deunicode(name1.leak()).into());
    let normalized_name2 = convert_unicode_and_remove_non_alphabetic_chars(&deunicode::deunicode(name2.leak()).into());

    pii_strings_match(name1, name2) || pii_strings_match(&normalized_name1, &normalized_name2)
}


fn non_alphabetic_regex() -> Regex {
    #[allow(clippy::unwrap_used)]
    Regex::new(r"[^a-zA-Z]+").unwrap()
}

fn convert_unicode_and_remove_non_alphabetic_chars(s: &PiiString) -> PiiString {
    non_alphabetic_regex().replace_all(s.leak(), "").to_string().into()
}

fn pii_strings_match(p1: &PiiString, p2: &PiiString) -> bool {
    let normalized_p1 = normalize_pii(p1);
    let normalized_p2 = normalize_pii(p2);
    (normalized_p1.leak() == normalized_p2.leak()) && !(normalized_p1.leak().is_empty() || normalized_p2.leak().is_empty())
}


fn normalize_pii(p: &PiiString) -> PiiString {
    p.leak().trim().to_lowercase().into()
}


#[cfg(test)]
mod tests {
    use test_case::test_case;
    use super::*;
    use idv::incode::doc::response::OCRName;

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
    fn test_parse_names_from_incode(name: OCRName) ->  ParsedIncodeNames{
        ParsedIncodeNames::from_fetch_ocr_res(&FetchOCRResponse {
            name: Some(name),
            ..Default::default()
        })
    }
}