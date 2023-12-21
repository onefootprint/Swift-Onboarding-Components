use idv::lexis::response::FlexIdResponse;
use itertools::Itertools;
use newtypes::FootprintReasonCode;
use std::convert::Into;

#[allow(dead_code)]
fn footprint_reason_codes(res: FlexIdResponse) -> Vec<FootprintReasonCode> {
    let phone_codes = Into::<Vec<FootprintReasonCode>>::into(&res.name_address_phone_summary());
    let name_address_ssn_codes = Into::<Vec<FootprintReasonCode>>::into(&res.name_address_ssn_summary());

    phone_codes
        .into_iter()
        .chain(name_address_ssn_codes)
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
            ],
            super::footprint_reason_codes(res),
        );
    }
}
