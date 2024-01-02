use idv::lexis::response::{FlexIdResponse, ValidElementSummary};
use itertools::Itertools;
use newtypes::FootprintReasonCode as FRC;
use std::convert::Into;

#[allow(dead_code)]
fn footprint_reason_codes(res: FlexIdResponse) -> Vec<FRC> {
    let phone_codes = Into::<Vec<FRC>>::into(&res.name_address_phone_summary());
    let name_address_ssn_codes = Into::<Vec<FRC>>::into(&res.name_address_ssn_summary());
    let dob_codes = Into::<Vec<FRC>>::into(&res.dob_match_level());

    let valid_element_summary_codes = if let Some(ves) = res.valid_element_summary() {
        let mut codes = vec![];

        let ValidElementSummary {
            ssn_valid,
            ssn_deceased,
            // we dont send dl to lexis
            dl_valid: _,
            // we dont send passport to lexis
            passport_valid: _,
            address_po_box,
            address_cmra,
            // TODO: do we need to use this? Need to clarify with Lexis what exactly this means
            // potentially we should produce SsnNotAvailable here?
            ssn_found_for_lex_id: _,
        } = ves;

        if ssn_valid.map(|s| !s).unwrap_or(false) {
            codes.push(FRC::SsnInputIsInvalid);
        }
        if ssn_deceased.unwrap_or(false) {
            codes.push(FRC::SubjectDeceased);
        }
        if address_po_box.unwrap_or(false) || address_cmra.unwrap_or(false) {
            // CRMA is technically different from a PO Box but I think it's fine to keep the same single risk signal here?
            codes.push(FRC::AddressInputIsPoBox);
            codes.push(FRC::AddressInputIsNonResidential);
        }

        codes
    } else {
        vec![]
    };

    let mut misc_codes = vec![];
    // TODO: ask lexis what address_secondary_range_mismatch is and if we should use

    if res.bureau_deleted().unwrap_or(false) {
        // TODO: Ask Lexis to give more deets on what situations this would happens
        misc_codes.push(FRC::BureauDeletedRecord);
    }

    if res.itin_expired().unwrap_or(false) {
        misc_codes.push(FRC::ItinIsExpired);
    }

    phone_codes
        .into_iter()
        .chain(name_address_ssn_codes)
        .chain(dob_codes)
        .chain(valid_element_summary_codes)
        .chain(misc_codes)
        .unique()
        .collect()
}

#[cfg(test)]
mod tests {
    use db::test_helpers::assert_have_same_elements;
    use newtypes::FootprintReasonCode::*;

    #[test]
    fn test_reason_codes() {
        let res = idv::lexis::parse_response(idv::test_fixtures::passing_lexis_flex_id_response()).unwrap();
        assert_have_same_elements(
            vec![
                PhoneLocatedMatches,
                NameMatches,
                NameFirstMatches,
                NameLastMatches,
                AddressMatches,
                SsnMatches,
                DobMatches,
            ],
            super::footprint_reason_codes(res),
        );
    }
}
