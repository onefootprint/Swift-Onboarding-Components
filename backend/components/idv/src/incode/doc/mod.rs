use newtypes::{
    vendor_credentials::IncodeCredentialsWithToken, DocVData, IncodeVerificationSessionId,
    IncodeVerificationSessionKind,
};

pub mod request;
pub mod response;

pub struct IncodeAddFrontRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub docv_data: DocVData,
}
pub struct IncodeAddBackRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub docv_data: DocVData,
}

pub struct IncodeAddSelfieRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub docv_data: DocVData,
}
pub struct IncodeProcessFaceRequest {
    pub credentials: IncodeCredentialsWithToken,
}

pub struct IncodeGetOnboardingStatusRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub session_kind: IncodeVerificationSessionKind,
    pub incode_verification_session_id: IncodeVerificationSessionId,
    pub wait_for_selfie: bool,
}

pub struct IncodeProcessIdRequest {
    pub credentials: IncodeCredentialsWithToken,
}

pub struct IncodeFetchScoresRequest {
    pub credentials: IncodeCredentialsWithToken,
}

pub struct IncodeAddPrivacyConsentRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub title: String,
    pub content: String,
}

pub struct IncodeAddMLConsentRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub status: bool,
}

pub struct IncodeFetchOCRRequest {
    pub credentials: IncodeCredentialsWithToken,
}

// From https://onefootprint.slack.com/archives/C0514LEFUCS/p1692979980826089
pub(crate) fn normalize_issuing_state(raw_state: String) -> String {
    let state = raw_state.trim();
    match state {
        "BAJA_CALIFORNIA_SUR" => "BAJA_CALIFORNIA".into(),
        "VIRGIN ISLANDS (U.S.)" => "VIRGIN_ISLANDS".into(),
        s => s.replace(' ', "_"),
    }
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    #[test_case("AGUASCALIENTES" => "AGUASCALIENTES"; "test for AGUASCALIENTES (rand_suffix_181)")]
    #[test_case("ALABAMA" => "ALABAMA"; "test for ALABAMA (rand_suffix_742)")]
    #[test_case("ALASKA" => "ALASKA"; "test for ALASKA (rand_suffix_385)")]
    #[test_case("ALBERTA" => "ALBERTA"; "test for ALBERTA (rand_suffix_324)")]
    #[test_case("ALL" => "ALL"; "test for ALL (rand_suffix_157)")]
    #[test_case("AMERICAN SAMOA" => "AMERICAN_SAMOA"; "test for AMERICAN SAMOA (rand_suffix_508)")]
    #[test_case("AMERICAN_SAMOA" => "AMERICAN_SAMOA"; "test for AMERICAN_SAMOA (rand_suffix_035)")]
    #[test_case("ANDHRA_PRADESH" => "ANDHRA_PRADESH"; "test for ANDHRA_PRADESH (rand_suffix_744)")]
    #[test_case("ARIZONA" => "ARIZONA"; "test for ARIZONA (rand_suffix_756)")]
    #[test_case("ARKANSAS" => "ARKANSAS"; "test for ARKANSAS (rand_suffix_220)")]
    #[test_case("ASSAM" => "ASSAM"; "test for ASSAM (rand_suffix_764)")]
    #[test_case("BAJA_CALIFORNIA" => "BAJA_CALIFORNIA"; "test for BAJA_CALIFORNIA (rand_suffix_445)")]
    #[test_case("BAJA_CALIFORNIA_SUR" => "BAJA_CALIFORNIA"; "test for BAJA_CALIFORNIA_SUR (rand_suffix_753)")]
    #[test_case("BRITISH_COLUMBIA" => "BRITISH_COLUMBIA"; "test for BRITISH_COLUMBIA (rand_suffix_584)")]
    #[test_case("CALIFORNIA" => "CALIFORNIA"; "test for CALIFORNIA (rand_suffix_769)")]
    #[test_case("CDMX" => "CDMX"; "test for CDMX (rand_suffix_367)")]
    #[test_case("CHIHUAHUA" => "CHIHUAHUA"; "test for CHIHUAHUA (rand_suffix_687)")]
    #[test_case("COAHUILA" => "COAHUILA"; "test for COAHUILA (rand_suffix_916)")]
    #[test_case("COLIMA" => "COLIMA"; "test for COLIMA (rand_suffix_600)")]
    #[test_case("COLORADO" => "COLORADO"; "test for COLORADO (rand_suffix_692)")]
    #[test_case("CONNECTICUT" => "CONNECTICUT"; "test for CONNECTICUT (rand_suffix_294)")]
    #[test_case("DELAWARE" => "DELAWARE"; "test for DELAWARE (rand_suffix_358)")]
    #[test_case("DELHI" => "DELHI"; "test for DELHI (rand_suffix_934)")]
    #[test_case("DISTRICT OF COLUMBIA" => "DISTRICT_OF_COLUMBIA"; "test for DISTRICT OF COLUMBIA (rand_suffix_126)")]
    #[test_case("DISTRICT_OF_COLUMBIA" => "DISTRICT_OF_COLUMBIA"; "test for DISTRICT_OF_COLUMBIA (rand_suffix_358)")]
    #[test_case("FLORIDA" => "FLORIDA"; "test for FLORIDA (rand_suffix_149)")]
    #[test_case("GEORGIA" => "GEORGIA"; "test for GEORGIA (rand_suffix_159)")]
    #[test_case("GOA" => "GOA"; "test for GOA (rand_suffix_312)")]
    #[test_case("GUAM" => "GUAM"; "test for GUAM (rand_suffix_509)")]
    #[test_case("GUANAJUATO" => "GUANAJUATO"; "test for GUANAJUATO (rand_suffix_097)")]
    #[test_case("GUERRERO" => "GUERRERO"; "test for GUERRERO (rand_suffix_509)")]
    #[test_case("HARYANA" => "HARYANA"; "test for HARYANA (rand_suffix_745)")]
    #[test_case("HAWAII" => "HAWAII"; "test for HAWAII (rand_suffix_651)")]
    #[test_case("HIDALGO" => "HIDALGO"; "test for HIDALGO (rand_suffix_144)")]
    #[test_case("IDAHO" => "IDAHO"; "test for IDAHO (rand_suffix_697)")]
    #[test_case("ILLINOIS" => "ILLINOIS"; "test for ILLINOIS (rand_suffix_532)")]
    #[test_case("INDIA" => "INDIA"; "test for INDIA (rand_suffix_223)")]
    #[test_case("INDIANA" => "INDIANA"; "test for INDIANA (rand_suffix_370)")]
    #[test_case("IOWA" => "IOWA"; "test for IOWA (rand_suffix_154)")]
    #[test_case("JALISCO" => "JALISCO"; "test for JALISCO (rand_suffix_504)")]
    #[test_case("JHARKHAND" => "JHARKHAND"; "test for JHARKHAND (rand_suffix_500)")]
    #[test_case("KANSAS" => "KANSAS"; "test for KANSAS (rand_suffix_868)")]
    #[test_case("KARNATAKA" => "KARNATAKA"; "test for KARNATAKA (rand_suffix_984)")]
    #[test_case("KENTUCKY" => "KENTUCKY"; "test for KENTUCKY (rand_suffix_449)")]
    #[test_case("LOUISIANA" => "LOUISIANA"; "test for LOUISIANA (rand_suffix_469)")]
    #[test_case("MACAU" => "MACAU"; "test for MACAU (rand_suffix_663)")]
    #[test_case("MAINE" => "MAINE"; "test for MAINE (rand_suffix_720)")]
    #[test_case("MANITOBA" => "MANITOBA"; "test for MANITOBA (rand_suffix_713)")]
    #[test_case("MARIANA_ISLANDS" => "MARIANA_ISLANDS"; "test for MARIANA_ISLANDS (rand_suffix_588)")]
    #[test_case("MARYLAND" => "MARYLAND"; "test for MARYLAND (rand_suffix_261)")]
    #[test_case("MASSACHUSETTS" => "MASSACHUSETTS"; "test for MASSACHUSETTS (rand_suffix_780)")]
    #[test_case("MEXICO" => "MEXICO"; "test for MEXICO (rand_suffix_002)")]
    #[test_case("MICHIGAN" => "MICHIGAN"; "test for MICHIGAN (rand_suffix_946)")]
    #[test_case("MICHOACAN" => "MICHOACAN"; "test for MICHOACAN (rand_suffix_467)")]
    #[test_case("MINNESOTA" => "MINNESOTA"; "test for MINNESOTA (rand_suffix_310)")]
    #[test_case("MISSISSIPPI" => "MISSISSIPPI"; "test for MISSISSIPPI (rand_suffix_997)")]
    #[test_case("MISSOURI" => "MISSOURI"; "test for MISSOURI (rand_suffix_874)")]
    #[test_case("MONTANA" => "MONTANA"; "test for MONTANA (rand_suffix_827)")]
    #[test_case("MUNICIPAL" => "MUNICIPAL"; "test for MUNICIPAL (rand_suffix_745)")]
    #[test_case("NEBRASKA" => "NEBRASKA"; "test for NEBRASKA (rand_suffix_297)")]
    #[test_case("NEVADA" => "NEVADA"; "test for NEVADA (rand_suffix_096)")]
    #[test_case("NEW HAMPSHIRE" => "NEW_HAMPSHIRE"; "test for NEW HAMPSHIRE (rand_suffix_423)")]
    #[test_case("NEW JERSEY" => "NEW_JERSEY"; "test for NEW JERSEY (rand_suffix_980)")]
    #[test_case("NEW MEXICO" => "NEW_MEXICO"; "test for NEW MEXICO (rand_suffix_294)")]
    #[test_case("NEW YORK" => "NEW_YORK"; "test for NEW YORK (rand_suffix_867)")]
    #[test_case("NEWFOUNDLAND" => "NEWFOUNDLAND"; "test for NEWFOUNDLAND (rand_suffix_784)")]
    #[test_case("NEWFOUNDLAND_AND_LABRADOR" => "NEWFOUNDLAND_AND_LABRADOR"; "test for NEWFOUNDLAND_AND_LABRADOR (rand_suffix_534)")]
    #[test_case("NEW_HAMPSHIRE" => "NEW_HAMPSHIRE"; "test for NEW_HAMPSHIRE (rand_suffix_808)")]
    #[test_case("NEW_JERSEY" => "NEW_JERSEY"; "test for NEW_JERSEY (rand_suffix_369)")]
    #[test_case("NEW_MEXICO" => "NEW_MEXICO"; "test for NEW_MEXICO (rand_suffix_344)")]
    #[test_case("NEW_YORK" => "NEW_YORK"; "test for NEW_YORK (rand_suffix_461)")]
    #[test_case("NORTH CAROLINA" => "NORTH_CAROLINA"; "test for NORTH CAROLINA (rand_suffix_699)")]
    #[test_case("NORTH DAKOTA" => "NORTH_DAKOTA"; "test for NORTH DAKOTA (rand_suffix_831)")]
    #[test_case("NORTHERN MARIANA ISLANDS" => "NORTHERN_MARIANA_ISLANDS"; "test for NORTHERN MARIANA ISLANDS (rand_suffix_240)")]
    #[test_case("NORTH_CAROLINA" => "NORTH_CAROLINA"; "test for NORTH_CAROLINA (rand_suffix_046)")]
    #[test_case("NORTH_DAKOTA" => "NORTH_DAKOTA"; "test for NORTH_DAKOTA (rand_suffix_217)")]
    #[test_case("NUEVO_LEON" => "NUEVO_LEON"; "test for NUEVO_LEON (rand_suffix_468)")]
    #[test_case("NUNAVUT" => "NUNAVUT"; "test for NUNAVUT (rand_suffix_216)")]
    #[test_case("ODISHA" => "ODISHA"; "test for ODISHA (rand_suffix_513)")]
    #[test_case("OHIO" => "OHIO"; "test for OHIO (rand_suffix_554)")]
    #[test_case("OKLAHOMA" => "OKLAHOMA"; "test for OKLAHOMA (rand_suffix_334)")]
    #[test_case("ONTARIO" => "ONTARIO"; "test for ONTARIO (rand_suffix_088)")]
    #[test_case("OREGON" => "OREGON"; "test for OREGON (rand_suffix_090)")]
    #[test_case("PENNSYLVANIA" => "PENNSYLVANIA"; "test for PENNSYLVANIA (rand_suffix_914)")]
    #[test_case("PUEBLA" => "PUEBLA"; "test for PUEBLA (rand_suffix_630)")]
    #[test_case("PUERTO RICO" => "PUERTO_RICO"; "test for PUERTO RICO (rand_suffix_485)")]
    #[test_case("PUERTO_RICO" => "PUERTO_RICO"; "test for PUERTO_RICO (rand_suffix_758)")]
    #[test_case("PUNJAB" => "PUNJAB"; "test for PUNJAB (rand_suffix_431)")]
    #[test_case("QUEBEC" => "QUEBEC"; "test for QUEBEC (rand_suffix_831)")]
    #[test_case("QUEENSLAND" => "QUEENSLAND"; "test for QUEENSLAND (rand_suffix_597)")]
    #[test_case("RHODE ISLAND" => "RHODE_ISLAND"; "test for RHODE ISLAND (rand_suffix_930)")]
    #[test_case("RHODE_ISLAND" => "RHODE_ISLAND"; "test for RHODE_ISLAND (rand_suffix_436)")]
    #[test_case("SINALOA" => "SINALOA"; "test for SINALOA (rand_suffix_238)")]
    #[test_case("SONORA" => "SONORA"; "test for SONORA (rand_suffix_242)")]
    #[test_case("SOUTH CAROLINA" => "SOUTH_CAROLINA"; "test for SOUTH CAROLINA (rand_suffix_133)")]
    #[test_case("SOUTH DAKOTA" => "SOUTH_DAKOTA"; "test for SOUTH DAKOTA (rand_suffix_899)")]
    #[test_case("SOUTH_CAROLINA" => "SOUTH_CAROLINA"; "test for SOUTH_CAROLINA (rand_suffix_201)")]
    #[test_case("SOUTH_DAKOTA" => "SOUTH_DAKOTA"; "test for SOUTH_DAKOTA (rand_suffix_881)")]
    #[test_case("TAMAULIPAS" => "TAMAULIPAS"; "test for TAMAULIPAS (rand_suffix_471)")]
    #[test_case("TAMIL_NADU" => "TAMIL_NADU"; "test for TAMIL_NADU (rand_suffix_349)")]
    #[test_case("TASMANIA" => "TASMANIA"; "test for TASMANIA (rand_suffix_325)")]
    #[test_case("TELANGANA" => "TELANGANA"; "test for TELANGANA (rand_suffix_104)")]
    #[test_case("TENNESSEE" => "TENNESSEE"; "test for TENNESSEE (rand_suffix_300)")]
    #[test_case("TEXAS" => "TEXAS"; "test for TEXAS (rand_suffix_220)")]
    #[test_case("UNITED STATES" => "UNITED_STATES"; "test for UNITED STATES (rand_suffix_408)")]
    #[test_case("USCIS" => "USCIS"; "test for USCIS (rand_suffix_730)")]
    #[test_case("US_COAST_GUARD" => "US_COAST_GUARD"; "test for US_COAST_GUARD (rand_suffix_055)")]
    #[test_case("US_DEPARTMENT_OF_DEFENSE" => "US_DEPARTMENT_OF_DEFENSE"; "test for US_DEPARTMENT_OF_DEFENSE (rand_suffix_356)")]
    #[test_case("US_DEPARTMENT_OF_STATE" => "US_DEPARTMENT_OF_STATE"; "test for US_DEPARTMENT_OF_STATE (rand_suffix_750)")]
    #[test_case("US_VIRGIN_ISLANDS" => "US_VIRGIN_ISLANDS"; "test for US_VIRGIN_ISLANDS (rand_suffix_906)")]
    #[test_case("UTAH" => "UTAH"; "test for UTAH (rand_suffix_642)")]
    #[test_case("UTTARAKHAND" => "UTTARAKHAND"; "test for UTTARAKHAND (rand_suffix_369)")]
    #[test_case("UTTAR_PRADESH" => "UTTAR_PRADESH"; "test for UTTAR_PRADESH (rand_suffix_717)")]
    #[test_case("VERMONT" => "VERMONT"; "test for VERMONT (rand_suffix_484)")]
    #[test_case("VICTORIA" => "VICTORIA"; "test for VICTORIA (rand_suffix_121)")]
    #[test_case("VIRGIN ISLANDS" => "VIRGIN_ISLANDS"; "test for VIRGIN ISLANDS (rand_suffix_640)")]
    #[test_case("VIRGIN ISLANDS (U.S.)" => "VIRGIN_ISLANDS"; "test for VIRGIN ISLANDS (U.S.) (rand_suffix_130)")]
    #[test_case("VIRGINIA" => "VIRGINIA"; "test for VIRGINIA (rand_suffix_513)")]
    #[test_case("WASHINGTON" => "WASHINGTON"; "test for WASHINGTON (rand_suffix_702)")]
    #[test_case("WEST VIRGINIA" => "WEST_VIRGINIA"; "test for WEST VIRGINIA (rand_suffix_024)")]
    #[test_case("WEST_BENGAL" => "WEST_BENGAL"; "test for WEST_BENGAL (rand_suffix_150)")]
    #[test_case("WEST_VIRGINIA" => "WEST_VIRGINIA"; "test for WEST_VIRGINIA (rand_suffix_928)")]
    #[test_case("WISCONSIN" => "WISCONSIN"; "test for WISCONSIN (rand_suffix_200)")]
    #[test_case("WYOMING" => "WYOMING"; "test for WYOMING (rand_suffix_725)")]
    #[test_case("YUKON" => "YUKON"; "test for YUKON (rand_suffix_789)")]
    #[test_case("ZACATECAS" => "ZACATECAS"; "test for ZACATECAS (rand_suffix_340)")]
    fn test_normalize_issuing_state(s: &str) -> String {
        super::normalize_issuing_state(s.into())
    }
}
