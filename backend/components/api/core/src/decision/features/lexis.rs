use idv::lexis::response::FlexIdResponse;
use newtypes::FootprintReasonCode;

#[allow(dead_code)]
fn footprint_reason_codes(res: FlexIdResponse) -> Vec<FootprintReasonCode> {
    std::convert::Into::<Vec<FootprintReasonCode>>::into(&res.name_address_phone_summary())
}

#[cfg(test)]
mod tests {
    use db::test_helpers::assert_have_same_elements;
    use newtypes::FootprintReasonCode::*;

    #[test]
    fn test_reason_codes() {
        let res = idv::lexis::parse_response(idv::test_fixtures::passing_lexis_flex_id_response()).unwrap();
        assert_have_same_elements(vec![PhoneLocatedMatches], super::footprint_reason_codes(res));
    }
}
