use crate::vendor_reason_codes_enum;
use crate::FootprintReasonCode;
use crate::FootprintReasonCode::*;
use strum_macros::EnumIter;
use strum_macros::EnumString;

vendor_reason_codes_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum DobMatchLevel {

        // (No DOB found or no DOB submitted)
        #[ser = "0"]
        #[footprint_reason_codes = vec![DobCouldNotMatch]]
        NoDobFoundOrSubmitted,

        // (Nothing matches)
        #[ser = "1"]
        #[footprint_reason_codes = vec![DobDoesNotMatch]]
        NothingMatches,

        // (Only Day matches)
        #[ser = "2"]
        #[footprint_reason_codes = vec![DobDoesNotMatch]]
        OnlyDayMatches,

        // (Only Month matches)
        #[ser = "3"]
        #[footprint_reason_codes = vec![DobDoesNotMatch]]
        OnlyMonthMatches,

        // (Only Day and Month match)
        #[ser = "4"]
        #[footprint_reason_codes = vec![DobPartialMatch, DobYobDoesNotMatch]]
        OnlyDayMonthMatch,

        // (Only Day and Year match)
        #[ser = "5"]
        #[footprint_reason_codes = vec![DobPartialMatch, DobMobDoesNotMatch]]
        OnlyDayYearMatch,

        // (Only Year matches)
        #[ser = "6"]
        #[footprint_reason_codes = vec![DobDoesNotMatch]]
        OnlyYearMatches,

        // (Only Month and Year match)
        #[ser = "7"]
        #[footprint_reason_codes = vec![DobPartialMatch, DobDayDoesNotMatch]]
        OnlyMonthYearMatch,

        // (Month, Day, and Year match)
        #[ser = "8"]
        #[footprint_reason_codes = vec![DobMatches]]
        MonthDayYearMatch

    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::FootprintReasonCode;
    use test_case::test_case;

    #[test_case(DobMatchLevel::NoDobFoundOrSubmitted => vec![DobCouldNotMatch])]
    #[test_case(DobMatchLevel::OnlyMonthYearMatch => vec![DobPartialMatch, DobDayDoesNotMatch])]
    fn test(dml: DobMatchLevel) -> Vec<FootprintReasonCode> {
        (&dml).into()
    }
}
