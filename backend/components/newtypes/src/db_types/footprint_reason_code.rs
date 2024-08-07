use crate::MatchLevel;
use crate::SignalScope;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use strum::IntoEnumIterator;
use strum_macros::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumIter;
use strum_macros::EnumString;

// yes one day we'll consolidate this and vendor_reason_code_enum into beautiful proc macros
macro_rules! footprint_reason_code_enum {
    (
        $(#[$macros:meta])*
        pub enum $name:ident {
            $(#[scope = $scope:expr, additional_scopes = $additional_scopes:expr, match_level = $match_level:expr] #[note = $note:literal, severity = $severity:expr,  description = $description:literal] $item:ident),*
        }
    ) => {
        $(#[$macros])*
        pub enum $name {
            $(#[doc=$description] $item,)*
            #[strum(default)]
            Other(String)
        }

        impl $name {
            /// Short-format title of the risk signal
            pub fn note(&self) -> String {
                match self {
                    $(Self::$item => String::from($note)),*,
                    Self::Other(_) => String::from("Other")
                }
            }

            /// Indicates the level of severity for the risk signal
            pub fn severity(&self) -> SignalSeverity {
                match self {
                    $(Self::$item => $severity),*,
                    Self::Other(_) => SignalSeverity::Low
                }
            }

            pub fn match_level(&self) -> Option<MatchLevel> {
                match self {
                    $(Self::$item => $match_level),*,
                    Self::Other(_) => None,
                }
            }

            /// Primary scope of the signal
            pub fn scope(&self) -> Option<SignalScope> {
                match self {
                    $(Self::$item => Some($scope)),*,
                    Self::Other(_) => None
                }
            }

             /// Additional scopes
             pub fn additional_scopes(&self) -> Vec<SignalScope> {
                match self {
                    $(Self::$item => $additional_scopes),*,
                    Self::Other(_) => vec![]
                }
            }

            pub fn scopes(&self) -> Vec<SignalScope> {
                let mut scopes = self.additional_scopes();

                if let Some(s) = self.scope() {
                    scopes.insert(0, s);
                }

                scopes
            }



            /// Long-format description of the risk signal
            pub fn description(&self) -> String {
                match self {
                    $(Self::$item => String::from($description)),*,
                    Self::Other(_) => String::from("Other")
                }
            }
        }
    }
}

footprint_reason_code_enum! {
    #[derive(
        Debug,
        Display,
        Clone,
        Deserialize,
        Serialize,
        Apiv2Schema,
        EnumIter,
        EnumString,
        AsExpression,
        FromSqlRow,
        AsRefStr,
        PartialEq,
        Eq,
        Ord,
        PartialOrd,
        Hash
    )]
    #[strum(serialize_all = "snake_case")]
    #[serde(rename_all = "snake_case")]
    #[diesel(sql_type = Text)]
    pub enum FootprintReasonCode {

        // ~~~~~~~~~ Identity ~~~~~~~~~~~~~~~
        #[scope = SignalScope::Name, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "OFAC watchlist hit", severity = SignalSeverity::High, description = "A strong potential match on a governmental OFAC watchlist"]
        WatchlistHitOfac,

        #[scope = SignalScope::Name, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "Non-SDN watchlist hit", severity = SignalSeverity::High,  description = "A strong potential match on a governmental NonSDN watchlist (Consolidated Sanctions (PLC, FSE, ISA, SSI))"]
        WatchlistHitNonSdn,

        #[scope = SignalScope::Name, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "Warning list hit", severity = SignalSeverity::High,  description = "A potential match on a non-sanction warning list. Entities on such lists are either involved in law-breaking activities at international level or in particular jurisdictions, under investigation or found guilty of regulatory breaches in their operating industry, which may indicate a significant financial, compliance, or reputational risk."]
        WatchlistHitWarning,

        #[scope = SignalScope::Name, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "PEP hit", severity = SignalSeverity::High,  description = "A strong potential match as a Politically Exposed Person"]
        WatchlistHitPep,

        #[scope = SignalScope::Name, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "Adverse media hit", severity = SignalSeverity::High,  description = "A strong potential match with adverse media found"]
        AdverseMediaHit,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Name, SignalScope::Dob, SignalScope::Address], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "Identity not located", severity = SignalSeverity::High,  description = "Identity could not be located with the information provided"]
        IdNotLocated,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Name, SignalScope::Dob, SignalScope::Address], match_level = None]
        #[note = "Identity flagged for elevated risk", severity = SignalSeverity::High,  description = "Either the located identity was flagged for elevated risk, or a confident match for the identity could not be found"]
        IdFlagged,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Name, SignalScope::Dob, SignalScope::Address], match_level = None]
        #[note = "High activity reported for consumer", severity = SignalSeverity::Low,  description = "More than 3 credit inquiries have been posted to the consumer’s account within the last 30 days"]
        CreditMoreThan3InquiriesInLast30Days,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Name, SignalScope::Dob, SignalScope::Address], match_level = None]
        #[note = "Credit established before SSN issue date", severity = SignalSeverity::Low,  description = "Credit was established for this consumer before the input SSN's issue date"]
        CreditEstablishedBeforeSSNDate,

        // ~~~~~~~~~ Address ~~~~~~~~~~~~~~~
        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Address input is not residential", severity = SignalSeverity::Medium,  description = "Address input is not a residential address"]
        AddressInputIsNonResidential,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Address located is not residential", severity = SignalSeverity::Medium,  description = "Address located is not a residential address"]
        AddressLocatedIsNonResidential,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Address does not match", severity = SignalSeverity::High,  description = "Address located does not match address input."]
        AddressDoesNotMatch,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Address partially matches", severity = SignalSeverity::Low,  description = "Address located partially matches address input."]
        AddressPartiallyMatches,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::Zip], match_level = Some(MatchLevel::NoMatch)]
        #[note = "ZIP code does not match", severity = SignalSeverity::Low,  description = "ZIP code located does not match the ZIP code input."]
        AddressZipCodeDoesNotMatch,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::City], match_level = Some(MatchLevel::NoMatch)]
        #[note = "City does not match", severity = SignalSeverity::Low,  description = "City located does not match the city input."]
        AddressCityDoesNotMatch,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::City], match_level = Some(MatchLevel::Exact)]
        #[note = "City matches", severity = SignalSeverity::Info,  description = "City located matches the city input."]
        AddressCityMatches,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::StreetAddress], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Street name does not match", severity = SignalSeverity::Low,  description = "Street name located does not match input street name."]
        AddressStreetNameDoesNotMatch,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::StreetAddress], match_level = Some(MatchLevel::Partial)]
        #[note = "Street name partially matches", severity = SignalSeverity::Low,  description = "Street name located partially matches input street name."]
        AddressStreetNamePartiallyMatches,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::StreetAddress], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Street number does not match", severity = SignalSeverity::Low,  description = "Street number located does not match input street number."]
        AddressStreetNumberDoesNotMatch,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::State], match_level = Some(MatchLevel::NoMatch)]
        #[note = "State does not match", severity = SignalSeverity::Low,  description = "State located does not match state input."]
        AddressStateDoesNotMatch,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Address is not deliverable", severity = SignalSeverity::Low,  description = "The input address is not a deliverable address."]
        AddressInputIsNotDeliverable,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Address is PO box", severity = SignalSeverity::Medium,  description = "The input address is a PO Box."]
        AddressInputIsPoBox,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Address is correctional facility", severity = SignalSeverity::Medium,  description = "Address is a correctional facility"]
        AddressInputIsCorrectionalFacility,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Input address input is campground", severity = SignalSeverity::Medium,  description = "The input address is a campground."]
        AddressInputIsNotStandardCampground,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Input address input is college", severity = SignalSeverity::Medium,  description = "The input address is a college."]
        AddressInputIsNotStandardCollege,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Input address input is general delivery", severity = SignalSeverity::Medium,  description = "The input address is a mail service for those without a permanent address."]
        AddressInputIsNotStandardGeneralDelivery,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Input address input is hospital", severity = SignalSeverity::Medium,  description = "The input address is a hospital."]
        AddressInputIsNotStandardHospital,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Input address input is hotel", severity = SignalSeverity::Medium,  description = "The input address is a hotel."]
        AddressInputIsNotStandardHotel,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Input address input is mail drop", severity = SignalSeverity::Medium,  description = "The input address is a mail drop."]
        AddressInputIsNotStandardMailDrop,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Input address input is prison", severity = SignalSeverity::Medium,  description = "The input address is a prison."]
        AddressInputIsNotStandardPrison,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Input address input is university", severity = SignalSeverity::Medium,  description = "The input address is a university."]
        AddressInputIsNotStandardUniversity,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Input address input is USPO", severity = SignalSeverity::Medium,  description = "The input address is a United States Postal Office."]
        AddressInputIsNotStandardUspo,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Input address is not on file", severity = SignalSeverity::Medium,  description = "The input address is not on file at a credit Bureau"]
        AddressInputNotOnFile,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Located address is PO box", severity = SignalSeverity::Medium,  description = "The located address is a PO Box."]
        AddressLocatedIsPoBox,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Found address input is campground", severity = SignalSeverity::Medium,  description = "The located address is a campground."]
        AddressLocatedIsNotStandardCampground,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Found address input is college", severity = SignalSeverity::Medium,  description = "The located address is a college."]
        AddressLocatedIsNotStandardCollege,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Found address input is general delivery", severity = SignalSeverity::Medium,  description = "The located address is a mail service for those without a permanent address."]
        AddressLocatedIsNotStandardGeneralDelivery,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Found address input is hospital", severity = SignalSeverity::Medium,  description = "The located address is a hospital."]
        AddressLocatedIsNotStandardHospital,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Found address input is hotel", severity = SignalSeverity::Medium,  description = "The located address is a hotel."]
        AddressLocatedIsNotStandardHotel,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Found address input is mail drop", severity = SignalSeverity::Medium,  description = "The located address is a mail drop."]
        AddressLocatedIsNotStandardMailDrop,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Found address input is prison", severity = SignalSeverity::Medium,  description = "The located address is a prison."]
        AddressLocatedIsNotStandardPrison,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Found address input is university", severity = SignalSeverity::Medium,  description = "The located address is a university."]
        AddressLocatedIsNotStandardUniversity,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Found address input is USPO", severity = SignalSeverity::Medium,  description = "The located address is a United States Postal Office."]
        AddressLocatedIsNotStandardUspo,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Located address is high risk", severity = SignalSeverity::High,  description = "The located address has a known history of fraud activity."]
        AddressLocatedIsHighRiskAddress,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Potential fraudulent activity on the address provided", severity = SignalSeverity::Medium,  description = "The input address has had potentially fraudulent activity reported on it."]
        AddressRiskAlert,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "High velocity address", severity = SignalSeverity::Medium,  description = "The individual has a high number of addresses within a defined time period."]
        AddressAlertVelocity,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Address stability alert", severity = SignalSeverity::Low,  description = "The individual has changed addresses at a high frequency."]
        AddressAlertStability,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Address longevity alert", severity = SignalSeverity::Low,  description = "The individual has lived at their current address for a short time."]
        AddressAlertLongevity,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Single address located", severity = SignalSeverity::Low,  description = "Only a single address record was located for the individual."]
        AddressAlertSingleAddressInFile,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)] // not sure what this really should be, it's a match but not the _best_ match
        #[note = "More recent address located", severity = SignalSeverity::Medium,  description = "Address input is different from the consumer’s best, most current address."]
        AddressNewerRecordFound,


        // ~~~~~~~~~ DOB ~~~~~~~~~~~~~~~

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "DOB year mismatch", severity = SignalSeverity::Low,  description = "The year of birth located does not match the input."]
        DobYobDoesNotMatch,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "DOB year mismatch by 1", severity = SignalSeverity::Low,  description = "A one year difference between the YOB input and the YOB located."]
        DobYobDoesNotMatchWithin1Year,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "DOB month mismatch", severity = SignalSeverity::Low,  description = "Month of birth input does not match the month of birth located."]
        DobMobDoesNotMatch,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "DOB day mismatch", severity = SignalSeverity::Low,  description = "Day of birth input does not match the day of birth located."]
        DobDayDoesNotMatch,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "DOB month unavailable", severity = SignalSeverity::Low,  description = "No month of birth located."]
        DobMobNotAvailable,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "DOB year unavailable", severity = SignalSeverity::Low,  description = "No year of birth located."]
        DobYobNotAvailable,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = None]
        #[note = "Age below minimum", severity = SignalSeverity::High,  description = "The person is below 18."]
        DobLocatedAgeBelowMinimum,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = None]
        #[note = "Age above maximum", severity = SignalSeverity::Medium,  description = "The person is above 85."]
        DobLocatedAgeAboveMaximum,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = None]
        #[note = "Age COPPA alert", severity = SignalSeverity::High,  description = "Customer is 13 or under. COPPA laws forbid conducting e-commerce with people under 14 years of age."]
        DobLocatedCoppaAlert,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Dob does not match", severity = SignalSeverity::High,  description = "DOB located does not match input"]
        DobDoesNotMatch,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Dob partial match", severity = SignalSeverity::Medium,  description = "DOB located partially matches input"]
        DobPartialMatch,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "Dob was not found on file", severity = SignalSeverity::High,  description = "No DOB was located for the individual"]
        DobNotOnFile,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "Dob could not be matched", severity = SignalSeverity::High,  description = "DOB could not be matched"]
        DobCouldNotMatch,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = None]
        #[note = "Dob input age is less than 18", severity = SignalSeverity::High,  description = "Dob input corresponds to an age less than 18 years old. This doesn't necessarily mean the DOB was verified or not, just that the user entered an age less than 18."]
        DobInputAgeLessThan18,


        // ~~~~~~~~~~~~ SSN ~~~~~~~~~~~~
        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "SSN not available", severity = SignalSeverity::High,  description = "No SSN information located. "]
        SsnNotAvailable,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "SSN was not found on file", severity = SignalSeverity::High,  description = "No SSN was located for the individual."]
        SsnNotOnFile,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "SSN9 partial match", severity = SignalSeverity::Medium,  description = "SSN 9 partially located matches SSN 9 input."]
        SsnPartiallyMatches,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "SSN does not match", severity = SignalSeverity::High,  description = "SSN located does not match SSN input."]
        SsnDoesNotMatch,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "SSN off by one digit", severity = SignalSeverity::Low,  description = "Difference of one digit between the SSN input and the SSN located. "]
        SsnDoesNotMatchWithin1Digit,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Input SSN is ITIN", severity = SignalSeverity::Medium,  description = "The input SSN is an ITIN (Individual Taxpayer Identification Number)."]
        SsnInputIsItin,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Located SSN is ITIN", severity = SignalSeverity::Medium,  description = "The located SSN is an ITIN (Individual Taxpayer Identification Number)."]
        SsnLocatedIsItin,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "SSN tied to multiple names", severity = SignalSeverity::Medium,  description = "The SSN input is tied to two or more individuals."]
        SsnInputTiedToMultipleNames,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Input SSN invalid", severity = SignalSeverity::High,  description = "The input SSN does not match the structure of a valid SSN."]
        SsnInputIsInvalid,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Located SSN invalid", severity = SignalSeverity::High,  description = "The located SSN does not match the structure of a valid SSN."]
        SsnLocatedIsInvalid,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "SSN not provided", severity = SignalSeverity::High,  description = "The user indicated they do not have an SSN."]
        SsnNotProvided,

        // ~~~~~~~~~~~~ ITIN ~~~~~~~~~~~~
        #[scope = SignalScope::Itin, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "US Tax ID is ITIN", severity = SignalSeverity::Low,  description = "The user provided an ITIN as their US Tax ID."]
        UsTaxIdIsItin,

        #[scope = SignalScope::Itin, additional_scopes = vec![], match_level = None]
        #[note = "ITIN expired", severity = SignalSeverity::Medium,  description = "The input ITIN is potentially expired."]
        ItinIsExpired,


        // ~~~~~~~~~~~~ Name ~~~~~~~~~~~~

        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Last name does not match", severity = SignalSeverity::Low,  description = "The located last name does not match the input last name."]
        NameLastDoesNotMatch,
        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Last name partially matches", severity = SignalSeverity::Low,  description = "The located last name partially matches the input last name."]
        NameLastPartiallyMatches,

        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Name matches", severity = SignalSeverity::Info,  description = "The located name matches the input name."]
        NameMatches,
        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Name does not match", severity = SignalSeverity::High,  description = "The located name does not match the input name."]
        NameDoesNotMatch,
        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Name partially matches", severity = SignalSeverity::Low,  description = "The located name partially matches the input name."]
        NamePartiallyMatches,

        // ~~~~~~~~~~~~ IP Address ~~~~~~~~~~~~
        // TODO: we aren't currently sending ip_address to Idology so these are unused. We possibly want to just remove these and just use Stytch
        // to replace these. Alternatively, we could still get these from Idology but then we need to think about how to combine those vs Stytch

        #[scope = SignalScope::IpAddress, additional_scopes = vec![SignalScope::State], match_level = None]
        #[note = "IP state does not match", severity = SignalSeverity::Low,  description = "The located IP State does not match the input IP State."]
        IpStateDoesNotMatch,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![], match_level = None]
        #[note = "Input IP invalid", severity = SignalSeverity::Low,  description = "The IP address input does not fit the proper structure of an IP address and/or is located to be an unassigned IP address. "]
        IpInputInvalid,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "IP not located", severity = SignalSeverity::Low,  description = "The IP address could not be located within data sources."]
        IpNotLocated,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "IP location unavailable", severity = SignalSeverity::Low,  description = "The location of the IP address cannot be determined."]
        IpLocationNotAvailable,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![], match_level = None]
        #[note = "IP high risk bot", severity = SignalSeverity::High,  description = "The IP address is part of a network of computers infected with malware."]
        IpAlertHighRiskBot,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![], match_level = None]
        #[note = "IP high risk spam", severity = SignalSeverity::High,  description = "The IP address is associated with a device infected with malware."]
        IpAlertHighRiskSpam,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![], match_level = None]
        #[note = "IP high risk TOR", severity = SignalSeverity::High,  description = "The IP address is associated with a TOR network."]
        IpAlertHighRiskTor,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![], match_level = None]
        #[note = "IP high risk proxy", severity = SignalSeverity::High,  description = "The IP address is associated with an anonymizing proxy"]
        IpAlertHighRiskProxy,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![], match_level = None]
        #[note = "IP proxy", severity = SignalSeverity::Medium,  description = "The IP address is associated with an anonymizing public proxy"]
        IpProxy,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![], match_level = None]
        #[note = "IP from data center", severity = SignalSeverity::Medium,  description = "The IP address is from a known data center"]
        IpDataCenter,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![], match_level = None]
        #[note = "IP from data center", severity = SignalSeverity::Medium,  description = "The IP address is from a known data center"]
        IpAlertDataCenter, // DEPRECATED USE IpIsDataCenter instead!!!

        // ~~~~~~~~~~~~ Email ~~~~~~~~~~~~

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "Email address invalid", severity = SignalSeverity::High,  description = "The email address is invalid or does not have the proper syntax of an email address."]
        EmailAddressInvalid,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "Email address does not exist", severity = SignalSeverity::High,  description = "The email address or domain does not exist."]
        EmailAddressOrDomainDoesNotExist,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "Domain recently created", severity = SignalSeverity::Medium,  description = "The email domain has been recently created. "]
        EmailDomainRecentlyCreated,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "Private email domain", severity = SignalSeverity::Low,  description = "The domain of the email address has been identified as belonging to a private individual."]
        EmailDomainPrivate,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "Corporate email domain", severity = SignalSeverity::Low,  description = "The domain of the email address has been identified as belonging to a corporate entity."]
        EmailDomainCorporate,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "Email recently verified", severity = SignalSeverity::Low,  description = "The email address is high risk because it was only recently verified in our databases."]
        EmailRecentlyVerified,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "Email was found on file.", severity = SignalSeverity::Info,  description = "The email address was found on file associated with the user."]
        EmailFoundOnFile,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "Email was not found on file.", severity = SignalSeverity::Low,  description = "The email address provided was not found on file associated with the user."]
        EmailNotFoundOnFile,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "Email from high risk country", severity = SignalSeverity::High,  description = "The email address is located to be from a country that is set as restricted."]
        EmailHighRiskCountry,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "High risk fraud email", severity = SignalSeverity::High,  description = "The email address has been reported as fraud or is potentially fraudulent. "]
        EmailHighRiskFraud,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "High risk tumbled email", severity = SignalSeverity::High,  description = "The email address provided has been input with different variations that point to the same inbox."]
        EmailHighRiskTumbled,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "High risk dispoable email", severity = SignalSeverity::High,  description = "The email address provided is a temporary email address."]
        EmailHighRiskDisposable,

        #[scope = SignalScope::Email, additional_scopes = vec![], match_level = None]
        #[note = "High risk email domain", severity = SignalSeverity::Low,  description = "The domain has been reported as fraud or is potentially fraudulent."]
        EmailHighRiskDomain,

        // ~~~~~~~~~~~~ Phone Number ~~~~~~~~~~~~

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "Phone number invalid", severity = SignalSeverity::Low,  description = "The phone number input was not a valid phone number."]
        PhoneNumberInputInvalid,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "VOIP phone number", severity = SignalSeverity::Medium,  description = "The consumer's phone number could be tied to an answering service, page, or VoIP."]
        PhoneNumberLocatedIsVoip,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "VOIP phone number", severity = SignalSeverity::Medium,  description = "The user's provided phone number is associated with VoIP."]
        PhoneNumberIsVoip,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "Postpaid phone number", severity = SignalSeverity::Low,  description = "The type of mobile account is postpaid."]
        PhoneNumberMobileAccountTypePostpaid,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "Prepaid phone number", severity = SignalSeverity::Low,  description = "The type of mobile account is prepaid."]
        PhoneNumberMobileAccountTypePrepaid,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "Mobile account unknown", severity = SignalSeverity::Low,  description = "The type of mobile account is unknown."]
        PhoneNumberMobileAccountTypeUnknown,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "Mobile account active", severity = SignalSeverity::Low,  description = "The mobile account is active."]
        PhoneNumberMobileAccountStatusActive,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "Mobile account deactivated", severity = SignalSeverity::Low,  description = "The mobile account is deactivated."]
        PhoneNumberMobileAccountStatusDeactivated,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "Mobile account suspended", severity = SignalSeverity::Medium,  description = "The mobile account is suspended."]
        PhoneNumberMobileAccountStatusSuspended,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "Mobile status absent", severity = SignalSeverity::Low,  description = "The mobile account is absent."]
        PhoneNumberMobileAccountStatusAbsent,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Phone located matches phone number provided", severity = SignalSeverity::Info,  description = "The phone number provided matches the phone number on file."]
        PhoneLocatedMatches,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Phone located partially matches phone number provided", severity = SignalSeverity::Low,  description = "The phone number provided partially matches the phone number on file."]
        PhoneLocatedPartiallyMatches,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Phone located does not match phone number provided", severity = SignalSeverity::Low,  description = "The phone number provided does not match the phone number on file."]
        PhoneLocatedDoesNotMatch,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Name associated with the phone number matches input", severity = SignalSeverity::Info,  description = "The name associated with the phone number is the same as the name provided"]
        PhoneLocatedNameMatches,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Name associated with the phone number partially matches input name", severity = SignalSeverity::Low,  description = "The name associated with the phone number partially matches the name provided"]
        PhoneLocatedNamePartiallyMatches,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Name associated with the phone number does not match input name", severity = SignalSeverity::Low,  description = "The name associated with the phone number does not match the name provided"]
        PhoneLocatedNameDoesNotMatch,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Address associated with the phone number matches input", severity = SignalSeverity::Info,  description = "The address associated with the phone number is the same as the address provided"]
        PhoneLocatedAddressMatches,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Address associated with the phone number partially matches input address", severity = SignalSeverity::Info,  description = "The address associated with the phone number partially matches the address provided"]
        PhoneLocatedAddressPartiallyMatches,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Address associated with the phone number does not match input address", severity = SignalSeverity::Low,  description = "The address associated with the phone number does not match the address provided"]
        PhoneLocatedAddressDoesNotMatch,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Phone number provided associated with different name and address", severity = SignalSeverity::Low,  description = "The phone number provided is associated with a different name and address than the one provided"]
        PhoneInputLikelyBelongsToAnother,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "Phone not provided", severity = SignalSeverity::Medium,  description = "The user indicated they do not have a phone."]
        PhoneNotProvided,

        // ~~~~~~~~~~~~ Identity ~~~~~~~~~~~~

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Multiple identities found", severity = SignalSeverity::Medium,  description = "Several valid records exist containing conflicting identifying information."]
        MultipleRecordsFound,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = None]
        #[note = "Subject deceased", severity = SignalSeverity::High,  description = "Records indicate that the subject in question is deceased."]
        SubjectDeceased,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = None]
        #[note = "Bureau deleted", severity = SignalSeverity::Medium,  description = "Indicates that the bureau deleted the found identity record, and SSN could not be verified."]
        BureauDeletedRecord,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "SSN issued before DOB", severity = SignalSeverity::High,  description = "The SSN number was issued before the individual’s DOB."]
        SsnIssuedPriorToDob,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "SSN issue date cannot be verified", severity = SignalSeverity::Medium,  description = "The issues date of the SSN provided on cannot be verified by the Social Security Administration (SSA). This will be the case for any SSN issued after 2011, so this is common for person who immigrated to the US after 2011 or persons who are young."]
        SsnIssueDateCannotBeVerified,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "The issue date for the SSN located for this consumer cannot be verified", severity = SignalSeverity::Medium,  description = "The issue date of the best on-file SSN cannot be verified by the Social Security Administration (SSA). This will be the case for any SSN issued after 2011, so this is common for person who immigrated to the US after 2011 or persons who are young."]
        SsnLocatedIssueDateCannotBeVerified,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "The SSN provided has been associated more often with another consumer", severity = SignalSeverity::Medium,  description = "The SSN input is more frequently reported for another consumer"]
        SsnPotentiallyBelongsToAnother,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "The SSN provided has been strongly associated more often with another consumer", severity = SignalSeverity::High,  description = "There is a high probability the SSN provided belongs to another consumer."]
        SsnLikelyBelongsToAnother,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Thin file", severity = SignalSeverity::Low,  description = "The record located had very little information, specifically only name + address, and lacks sufficient information to strongly identify individual."]
        ThinFile,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![SignalScope::State], match_level = None]
        #[note = "Area code doesn't match state", severity = SignalSeverity::Low,  description = "The area code for the phone number input does not match the state input."]
        InputPhoneNumberDoesNotMatchInputState,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![SignalScope::State], match_level = None]
        #[note = "Area code doesn't match located state", severity = SignalSeverity::Low,  description = "The area code for the phone number input does not match any address in the located address history for the identity."]
        InputPhoneNumberDoesNotMatchLocatedStateHistory,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![SignalScope::State], match_level = None]
        #[note = "Area code doesn't match IP address state", severity = SignalSeverity::Low,  description = "IP address is not from the same state as the input phone number."]
        InputPhoneNumberDoesNotMatchIpState,

        // ~~~~~~~~~~~~ Driver's License Number ~~~~~~~~~~~~
        #[scope = SignalScope::DriversLicenseNumber, additional_scopes = vec![], match_level = None]
        #[note = "Different license number found", severity = SignalSeverity::Medium,  description = "A different driver's license number was found for the user."]
        DriversLicenseNumberDifferentNumberFound,

        #[scope = SignalScope::DriversLicenseNumber, additional_scopes = vec![], match_level = None]
        #[note = "License number valid but not on record", severity = SignalSeverity::Low,  description = "The driver's license number is valid, but is not on record."]
        DriversLicenseNumberNotOnRecord,

        #[scope = SignalScope::DriversLicenseNumber, additional_scopes = vec![], match_level = None]
        #[note = "License number is not valid", severity = SignalSeverity::Medium,  description = "The driver's license number was not valid for the state"]
        DriversLicenseNumberNotValid,

        #[scope = SignalScope::DriversLicenseNumber, additional_scopes = vec![], match_level = None]
        #[note = "License number is valid", severity = SignalSeverity::Info,  description = "The driver's license number is valid"]
        DriversLicenseNumberIsValid,

        // ~~~~~~~~~~~~ Document ~~~~~~~~~~~~

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document upload failed", severity = SignalSeverity::High,  description = "User failed to successfully upload a document."]
        DocumentUploadFailed,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document not verified", severity = SignalSeverity::High,  description = "Unable to verify the document provided because either the front or back was unable to be read or because it failed the verification check."]
        DocumentNotVerified,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document verified", severity = SignalSeverity::Info,  description = "Document provided was verified"]
        DocumentVerified,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document OCR not successful", severity = SignalSeverity::Low,  description = "The OCR for the document failed."]
        DocumentOcrNotSuccessful,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document OCR was successful", severity = SignalSeverity::Info,  description = "The OCR for the the document was successful."]
        DocumentOcrSuccessful,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document barcode could not be read", severity = SignalSeverity::Medium,  description = "The reading and extracting of the barcode on the back of the document failed."]
        DocumentBarcodeCouldNotBeRead,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document barcode was read", severity = SignalSeverity::Info,  description = "The reading and extracting of the barcode on the back of the document succeeded."]
        DocumentBarcodeCouldBeRead,


        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document barcode content matches OCR data", severity = SignalSeverity::Info,  description = "Data extracted from the barcode matches. Information extracted from a barcode may include: name, address, DOB, eye color, SSN, etc"]
        DocumentBarcodeContentMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document barcode content does not match OCR data", severity = SignalSeverity::Medium,  description = "Data extracted from the barcode does not match. Information extracted from a barcode may include: name, address, DOB, eye color, SSN, etc"]
        DocumentBarcodeContentDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document barcode was detected", severity = SignalSeverity::Info,  description = "Barcode was detected on the document"]
        DocumentBarcodeDetected,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document barcode was not detected", severity = SignalSeverity::Medium,  description = "Barcode could not be detected on the document, perhaps because the image captured was low quality."]
        DocumentBarcodeCouldNotBeDetected,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document requires review", severity = SignalSeverity::Medium,  description = "Indicates that further review of the document is required."]
        DocumentRequiresReview,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document expired", severity = SignalSeverity::High,  description = "The document is expired."]
        DocumentExpired,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document not expired", severity = SignalSeverity::Info,  description = "The document is not expired."]
        DocumentNotExpired,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document from restricted country", severity = SignalSeverity::High,  description = "The document is from a high-risk country."]
        DocumentFromRestrictedCountry,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document type restricted", severity = SignalSeverity::High,  description = "Indicates that the template type identified for the document provided is restricted."]
        DocumentRestrictedTemplateType,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document type not allowed", severity = SignalSeverity::High,  description = "The document type provided is not allowed."]
        DocumentTypeNotAllowed,

        // Crosschecks
        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document crosscheck failed", severity = SignalSeverity::Medium,  description = "A field crosscheck (comparing data on the front of the document to the back) failed during the document authentication."]
        DocumentFieldCrosscheckFailed,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document invalid issuance or expiration", severity = SignalSeverity::Medium,  description = "The Issuance Date, Expiration Date, or both do not align to the timeline of the identified document. The Issuance Date or the Expiration Date are not in a valid format."]
        DocumentInvalidIssuanceOrExpirationDate,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document invalid template layout", severity = SignalSeverity::High,  description = "The layout, or relative positions of specifically identified features of the document, were not within the proper place, are missing, or show signs of tampering."]
        DocumentInvalidTemplateLayout,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image possible physical tampering", severity = SignalSeverity::Medium,  description = "The image of the document has evidence or appearances of being physically manipulated or tampered."]
        DocumentPossibleImageTampering,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document has no signs of physical tampering", severity = SignalSeverity::Info,  description = "The image of the document has no sign of being physically manipulated or tampered."]
        DocumentNoImageTampering,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Front of document has no signs of digital alteration", severity = SignalSeverity::Info,  description = "The front of the document has no sign of being digitally manipulated or altered."]
        DocumentNoImageAlterationFront,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Back of document has no signs of digital alteration", severity = SignalSeverity::Info,  description = "The back of the document has no sign of being digitally manipulated or altered."]
        DocumentNoImageAlterationBack,


        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Front of document has signs of digital alteration", severity = SignalSeverity::Medium,  description = "The front of the document has signs of being digitally manipulated or altered."]
        DocumentPossibleImageAlterationFront,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Back of document has signs of digital alteration", severity = SignalSeverity::Medium,  description = "The back of the document has signs of being digitally manipulated or altered."]
        DocumentPossibleImageAlterationBack,

        // TODO: 2024-07-08 getting more clarity from incode on this one, but changing severity since it comes up a bit
        // https://onefootprint.slack.com/archives/C0514LEFUCS/p1720456393010729
        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document has signs of alteration", severity = SignalSeverity::Medium,  description = "Document potentially has foreign objects obscuring parts of the document, or has been manipulated."]
        DocumentPossibleImageAlteration,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document has signs of digital manipulation", severity = SignalSeverity::Medium,  description = "Document potentially has discrepancies in the layout, fonts, or other signs of fraud."]
        DocumentPossibleDigitalFraud,

        #[scope = SignalScope::Selfie, additional_scopes = vec![SignalScope::Document], match_level = None]
        #[note = "Selfie used with different information", severity = SignalSeverity::Medium,  description = "The face from the selfie image has been used with different information across Footprint's network."]
        DocumentSelfieUsedWithDifferentInformation,

        #[scope = SignalScope::Selfie, additional_scopes = vec![SignalScope::Document], match_level = None]
        #[note = "Selfie not used with different information", severity = SignalSeverity::Info,  description = "The face from the selfie image not been used with different information across Footprint's network."]
        DocumentSelfieNotUsedWithDifferentInformation,

        #[scope = SignalScope::Selfie, additional_scopes = vec![SignalScope::Document], match_level = None]
        #[note = "Selfie was taken wearing a mask", severity = SignalSeverity::Low,  description = "The selfie may have been captured with the person wearing a mask. This could have potentially impacted the comparison with the document image."]
        DocumentSelfieMask,

        #[scope = SignalScope::Selfie, additional_scopes = vec![SignalScope::Document], match_level = None]
        #[note = "Selfie was taken wearing glasses", severity = SignalSeverity::Low,  description = "The selfie may have been captured with the person wearing glasses. This could have potentially impacted the comparison with the document image."]
        DocumentSelfieGlasses,

        #[scope = SignalScope::Selfie, additional_scopes = vec![SignalScope::Document], match_level = None]
        #[note = "Selfie was not captured live", severity = SignalSeverity::High,  description = "The selfie has appearances of not being a live captured image, such as a spoofed input feed or a picture of a picture of a face."]
        DocumentSelfieNotLiveImage,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image possible fake", severity = SignalSeverity::Medium,  description = "The image of the document has evidence or appearances of being a fake document. For example: slight difference in layout of the ID, different font or font size."]
        DocumentPossibleFakeImage,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image is not fake", severity = SignalSeverity::Info,  description = "The image of the document has no evidence or appearances of being a fake document."]
        DocumentNotFakeImage,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document PDF417 data validation passed", severity = SignalSeverity::Info,  description = "Information decoded from the barcode was valid and matched information from OCR."]
        DocumentPdf417DataIsValid,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document PDF417 data validation failed", severity = SignalSeverity::Medium,  description = "Information decoded from the barcode was not valid, did not match information from OCR, or was incorrect for the version or state"]
        DocumentPdf417DataIsNotValid,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image possibly an image of a screen", severity = SignalSeverity::High,  description = "The image of the document has evidence or appearances of being a picture of a document on a screen"]
        DocumentPhotoIsScreenCapture,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image is not an image of a screen", severity = SignalSeverity::Info,  description = "The image of the document has no evidence or appearances of being a picture of a document on a screen"]
        DocumentPhotoIsNotScreenCapture,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document possibly printed on paper", severity = SignalSeverity::High,  description = "The image of the document has evidence or appearances of being printed on paper"]
        DocumentPhotoIsPaperCapture,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document is not printed on paper", severity = SignalSeverity::Info,  description = "The image of the document has no evidence or appearances of being printed on paper"]
        DocumentPhotoIsNotPaperCapture,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image is badly aligned", severity = SignalSeverity::High,  description = "Document image alignment was unable to be corrected and image tamper checks were unable to be processed."]
        DocumentAlignmentFailed,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document visible photo features are not verified", severity = SignalSeverity::Medium,  description = "The visible photo features of the document were not verified"]
        DocumentVisiblePhotoFeaturesNotVerified,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document MRZ line formatting check fail", severity = SignalSeverity::Low,  description = "The MRZ of the document was not in the correct format. This check looks at whether the MRZ lines are correct length and whether we can parse the data in the MRZ."]
        DocumentMrzLineFormatCheck,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document QR validation failed", severity = SignalSeverity::Low,  description = "The check digit extracted from the QR code does not match the OCR value from the MRZ or the URL of the QR code is incorrect, or the QR code was unable to be read due to a poor quality image captured."]
        DocumentQrCodeCheck,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document classification failed", severity = SignalSeverity::High,  description = "We could not automatically classify the document, and therefore it could not be fully authenticated."]
        DocumentCouldNotClassify,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document visible photo features are verified", severity = SignalSeverity::Info,  description = "The visible photo features of the document were verified"]
        DocumentVisiblePhotoFeaturesVerified,

        #[scope = SignalScope::Document, additional_scopes = vec![SignalScope::Selfie], match_level = None]
        #[note = "Document low match with selfie", severity = SignalSeverity::High,  description = "The match score between the customer's captured selfie image and captured document was low."]
        DocumentLowMatchScoreWithSelfie,

        #[scope = SignalScope::Document, additional_scopes = vec![SignalScope::Selfie], match_level = Some(MatchLevel::Exact)]
        #[note = "Document image matches selfie", severity = SignalSeverity::Info,  description = "The image on the document matches the captured selfie."]
        DocumentSelfieMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![SignalScope::Selfie], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document image does not match selfie", severity = SignalSeverity::High,  description = "The image on the document does not match the captured selfie."]
        DocumentSelfieDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![SignalScope::Selfie], match_level = None]
        #[note = "Selfie image bad quality", severity = SignalSeverity::Medium,  description = "The selfie submitted was not good quality, which may impact verification checks."]
        DocumentSelfieBadQuality,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Unexpected document type provided", severity = SignalSeverity::High,  description = "The document uploaded was classified as a different type of document than was selected to be uploaded by the user."]
        DocumentTypeMismatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Unknown document country code", severity = SignalSeverity::High,  description = "We aren't able to determine the origin country of the uploaded document."]
        DocumentUnknownCountryCode,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Unexpected document country code", severity = SignalSeverity::High,  description = "The country issuing the uploaded document does not match the selected country."]
        DocumentCountryCodeMismatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document is a learner's permit or provisional driver's license", severity = SignalSeverity::Medium,  description = "The document provided was a provisional license or learner's permit"]
        DocumentIsPermitOrProvisionalLicense,

        #[scope = SignalScope::Selfie, additional_scopes = vec![], match_level = None]
        #[note = "Selfie was skipped", severity = SignalSeverity::Medium,  description = "Although requested, selfie image was not captured because the user completed the onboarding on a device that did not have a camera available"]
        DocumentSelfieWasSkipped,

        #[scope = SignalScope::Selfie, additional_scopes = vec![], match_level = None]
        #[note = "Document was collected on a desktop device", severity = SignalSeverity::Medium,  description = "Document was collected on a desktop device"]
        DocumentCollectedViaDesktop,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document upload was not a live capture", severity = SignalSeverity::Medium,  description = "User manually uploaded an image instead of taking a live image with their camera"]
        DocumentNotLiveCapture,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document live capture failed", severity = SignalSeverity::Medium,  description = "User's device camera could not capture or experienced an error while capturing documents so they were uploaded."]
        DocumentLiveCaptureFailed,

        // OCR matching
        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document name does not match input", severity = SignalSeverity::Medium,  description = "The document name does not match the name that was input."]
        DocumentOcrNameDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "Document name could not be matched to input", severity = SignalSeverity::Medium,  description = "The document name could not be matched to input. This is likely because we did not receive a confident OCR result."]
        DocumentOcrNameCouldNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Document name matches input", severity = SignalSeverity::Info,  description = "The document name matches the name that was input."]
        DocumentOcrNameMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document address does not match input", severity = SignalSeverity::Low,  description = "The document address does not match the address that was input."]
        DocumentOcrAddressDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "Document address could not be matched to input", severity = SignalSeverity::Medium,  description = "The document address could not be matched to input. This is likely because we did not receive a confident OCR result"]
        DocumentOcrAddressCouldNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Document address matches input", severity = SignalSeverity::Info,  description = "The document address matches the address that was input."]
        DocumentOcrAddressMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document first name does not match input", severity = SignalSeverity::Medium,  description = "The document first name does not match the name that was input."]
        DocumentOcrFirstNameDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Document first name matches input", severity = SignalSeverity::Info,  description = "The document first name matches the name that was input."]
        DocumentOcrFirstNameMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document last name does not match input", severity = SignalSeverity::Medium,  description = "The document last name does not match the name that was input."]
        DocumentOcrLastNameDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Document last name matches input", severity = SignalSeverity::Info,  description = "The document last name matches the name that was input."]
        DocumentOcrLastNameMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document DOB does not match input", severity = SignalSeverity::Medium,  description = "The document DOB does not match the DOB that was input."]
        DocumentOcrDobDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "Document DOB could not be matched to input", severity = SignalSeverity::Medium,  description = "The document DOB could not be matched to input. This is likely because we did not receive a confident OCR result"]
        DocumentOcrDobCouldNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Document DOB matches input", severity = SignalSeverity::Info,  description = "The document DOB matches the DOB that was input."]
        DocumentOcrDobMatches,

        // Cross Checks
        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "OCR DOB matches barcode DOB", severity = SignalSeverity::Info,  description = "The OCR DOB matches the DOB extracted from the barcode or MRZ"]
        DocumentDobCrosscheckMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR DOB does not match barcode DOB", severity = SignalSeverity::Medium,  description = "The OCR DOB does not match the DOB extracted from the barcode or MRZ"]
        DocumentDobCrosscheckDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR expiration date matches barcode expiration date", severity = SignalSeverity::Info,  description = "The OCR expiration date matches the expiration date extracted from the barcode or MRZ"]
        DocumentExpirationDateCrosscheckMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR expiration date does not match barcode expiration date", severity = SignalSeverity::Medium,  description = "The OCR expiration date does not match the expiration date extracted from the barcode or MRZ"]
        DocumentExpirationDateCrosscheckDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR sex matches barcode sex", severity = SignalSeverity::Info,  description = "The OCR sex matches the sex extracted from the barcode or MRZ"]
        DocumentSexCrosscheckMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR sex does not match barcode sex", severity = SignalSeverity::Medium,  description = "The OCR sex does not match the sex extracted from the barcode or MRZ"]
        DocumentSexCrosscheckDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR full name matches barcode full name", severity = SignalSeverity::Info,  description = "The OCR full name matches the full name extracted from the barcode or MRZ"]
        DocumentFullNameCrosscheckMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR full name does not match barcode full name", severity = SignalSeverity::Medium,  description = "The OCR full name does not match the full name extracted from the barcode or MRZ"]
        DocumentFullNameCrosscheckDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR document number matches barcode document number", severity = SignalSeverity::Info,  description = "The OCR document number matches the document number extracted from the barcode or MRZ"]
        DocumentNumberCrosscheckMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR document number does not match barcode or QR code document number", severity = SignalSeverity::Medium,  description = "The OCR document number does not match the document number extracted from the barcode or QR code"]
        DocumentNumberCrosscheckDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR Expiration check digit matches barcode check digit", severity = SignalSeverity::Info,  description = "The expiration check digit from the MRZ matches what was in the expiration date OCR result"]
        DocumentExpirationCheckDigitMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR expiration check digit does not match barcode", severity = SignalSeverity::Medium,  description = "The expiration check digit from the MRZ does not match what was in the expiration date OCR result"]
        DocumentExpirationCheckDigitDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR DOB check digit matches barcode", severity = SignalSeverity::Info,  description = "The DOB check digit from the MRZ matches what was in the DOB OCR result"]
        DocumentDobCheckDigitMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR DOB check digit does not match barcoe", severity = SignalSeverity::Medium,  description = "The DOB check digit from the MRZ does not match what was in the DOB OCR result"]
        DocumentDobCheckDigitDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR number check digit matches barcode", severity = SignalSeverity::Info,  description = "The document number check digit from the MRZ matches what was in the document number OCR result"]
        DocumentNumberCheckDigitMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "OCR number check digit does not match barcode", severity = SignalSeverity::Medium,  description = "The document number check digit from the MRZ does not match what was in the document number OCR result"]
        DocumentNumberCheckDigitDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "CURP is not valid", severity = SignalSeverity::High,  description = "CURP was not validated"]
        CurpNotValid,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "CURP not found", severity = SignalSeverity::High,  description = "CURP was not found in the renapo database"]
        CurpNotFound,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "CURP is valid", severity = SignalSeverity::Info,  description = "CURP was validated"]
        CurpValid,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "String provided was not a valid CURP", severity = SignalSeverity::High,  description = "The string provided was not a valid CURP"]
        CurpInputCurpInvalid,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "CURP could not be validate", severity = SignalSeverity::Medium,  description = "CURP could not be validated"]
        CurpCouldNotValidate,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "More than one individual associated with CURP", severity = SignalSeverity::Medium,  description = "More than 1 CURP in RENAPO is associated with this data"]
        CurpMultipleResultsForData,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Renapo service unavailable", severity = SignalSeverity::Info,  description = "RENAPO service unavailable."]
        CurpServiceNotAvailable,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "The CURP was incorrectly formatted", severity = SignalSeverity::Low,  description = "Incorrect format for a CURP, possibly due to OCR issues."]
        CurpMalformed,

        // ~~~~~ Info ~~~~~~~~
        // These are present if:
        //   !IdNotLocated && specific other reason codes are not present
        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Address matches", severity = SignalSeverity::Info,  description = "Address located matches address input."]
        AddressMatches,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "ZIP code matches", severity = SignalSeverity::Info,  description = "ZIP code located matches the ZIP code input."]
        AddressZipCodeMatches,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Street name matches", severity = SignalSeverity::Info,  description = "Street name located matches input street name."]
        AddressStreetNameMatches,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Street number matches", severity = SignalSeverity::Info,  description = "Street number located matches input street number."]
        AddressStreetNumberMatches,

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "State matches", severity = SignalSeverity::Info,  description = "State located matches state input."]
        AddressStateMatches,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "DOB match", severity = SignalSeverity::Info,  description = "The DOB located matches the input."]
        DobMatches,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "DOB year match", severity = SignalSeverity::Info,  description = "The year of birth located matches the input."]
        DobYobMatches,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "DOB month match", severity = SignalSeverity::Info,  description = "Month of birth input matches the month of birth located."]
        DobMobMatches,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "SSN matches", severity = SignalSeverity::Info,  description = "SSN located matches SSN input."]
        SsnMatches,

        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Last name matches", severity = SignalSeverity::Info,  description = "The located last name matches the input last name."]
        NameLastMatches,

        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "First name matches", severity = SignalSeverity::Info,  description = "The located first name matches the input first name."]
        NameFirstMatches,

        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "First name does not match", severity = SignalSeverity::Low,  description = "The located first name does not match the input first name."]
        NameFirstDoesNotMatch,

        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "First name partially matches", severity = SignalSeverity::Low,  description = "The located first name partially matches the input first name."]
        NameFirstPartiallyMatches,

        #[scope = SignalScope::IpAddress, additional_scopes = vec![SignalScope::State], match_level = Some(MatchLevel::Exact)]
        #[note = "IP state matches", severity = SignalSeverity::Info,  description = "The located IP State matches the input IP State."]
        IpStateMatches,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Phone number matches", severity = SignalSeverity::Info,  description = "The phone number input matches the located phone number."]
        PhoneNumberMatches,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![SignalScope::State], match_level = Some(MatchLevel::Exact)]
        #[note = "Area code matches state", severity = SignalSeverity::Info,  description = "The area code for the phone number input matches the state input."]
        InputPhoneNumberMatchesInputState,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![SignalScope::State], match_level = Some(MatchLevel::Exact)]
        #[note = "Area code matches located state", severity = SignalSeverity::Info,  description = "The area code for the phone number input matches any address in the located address history for the identity."]
        InputPhoneNumberMatchesLocatedStateHistory,

        // ~~~~~~~~~ "User Input" ~~~~~~~~~~
        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = None]
        #[note = "User associated with US Broker or FINRA", severity = SignalSeverity::High,  description = "The user reported that they are affiliated with a US Broker or FINRA."]
        AffiliatedWithBrokerOrFinra,

        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = None]
        #[note = "Visa type is Other", severity = SignalSeverity::High,  description = "The user reported that they have a US Visa of type 'Other'"]
        VisaIsOther,
        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = None]
        #[note = "Visa is expiring soon or has expired", severity = SignalSeverity::High,  description = "The user's visa expires within 90 days or has already expired"]
        VisaExpiredOrExpiringSoon,
        //
        //
        // ~~~~~~~~~ KYB ~~~~~~~~~~~
        //
        //

        // ~~~~~~~~~ Business Name ~~~~~~~~~~~

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Business name matches", severity = SignalSeverity::Info,  description = "The input business name matches the located business's name"]
        BusinessNameMatch,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Business name is similar", severity = SignalSeverity::Low,  description = "The input business name is similar to the located business's name"]
        BusinessNameSimilarMatch,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Alternate business name found", severity = SignalSeverity::Medium,  description = "The located business goes by an alternate name"]
        BusinessNameAlternateMatch,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Business name does not match", severity = SignalSeverity::High,  description = "The input business name did not match"]
        BusinessNameDoesNotMatch,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = None]
        #[note = "No watchlist hits", severity = SignalSeverity::Info,  description = "No watchlist matches found for the business"]
        BusinessNameNoWatchlistHits,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = None]
        #[note = "Watchlist hit", severity = SignalSeverity::High,  description = "One or more potential watchlist matches found for the business"]
        BusinessNameWatchlistHit, // TODO: make a variant per list like we do with KYC watchlist hits

        // ~~~~~~~~ Business DBA ~~~~~~~~~~~~~~
        #[scope = SignalScope::BusinessDba, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "DBA matches", severity = SignalSeverity::Info,  description = "The input business DBA (Doing Business As) matches the located business's DBA"]
        BusinessDbaMatch,

        #[scope = SignalScope::BusinessDba, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "DBA is similar", severity = SignalSeverity::Low,  description = "The input business DBA (Doing Business As) is similar to the located business's DBA"]
        BusinessDbaSimilarMatch,

        #[scope = SignalScope::BusinessDba, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Alternate DBA found", severity = SignalSeverity::Medium,  description = "The located business goes by an alternate DBA (Doing Business As)"]
        BusinessDbaAlternateMatch,

        #[scope = SignalScope::BusinessDba, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "DBA name does not match", severity = SignalSeverity::Medium,  description = "The input business DBA (Doing Business As) did not match"]
        BusinessDbaDoesNotMatch,

        // ~~~~~~~~ Business Phone Number ~~~~~~~~~~~~~~

        #[scope = SignalScope::BusinessPhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Phone number matches", severity = SignalSeverity::Info,  description = "The input business phone number matches the located business's phone number"]
        BusinessPhoneNumberMatch,

        #[scope = SignalScope::BusinessPhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Phone number does not match", severity = SignalSeverity::Low,  description = "The input business phone number did not match"]
        BusinessPhoneNumberDoesNotMatch,

        // ~~~~~~~~ Business Website ~~~~~~~~~~~~~~

        #[scope = SignalScope::BusinessWebsite, additional_scopes = vec![], match_level = None]
        #[note = "Website online", severity = SignalSeverity::Info,  description = "The input business website was online"]
        BusinessWebsiteOnline,

        #[scope = SignalScope::BusinessWebsite, additional_scopes = vec![], match_level = None]
        #[note = "Website offline", severity = SignalSeverity::Medium,  description = "The input business website was offline"]
        BusinessWebsiteOffline,

        #[scope = SignalScope::BusinessWebsite, additional_scopes = vec![], match_level = None]
        #[note = "Website verified", severity = SignalSeverity::Info,  description = "Successfully found entity details on the input business website"]
        BusinessWebsiteVerified,

        #[scope = SignalScope::BusinessWebsite, additional_scopes = vec![], match_level = None]
        #[note = "Website unverified", severity = SignalSeverity::Low,  description = "Unable to find entity details on the input business website"]
        BusinessWebsiteUnverified,

        #[scope = SignalScope::BusinessWebsite, additional_scopes = vec![], match_level = None]
        #[note = "Website is parking page", severity = SignalSeverity::Medium,  description = "The input business website has been purchased but has no content"]
        BusinessWebsiteParkingPage,

        // ~~~~~~~~~ TIN ~~~~~~~~~~~
        #[scope = SignalScope::BusinessTin, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "TIN matches", severity = SignalSeverity::Info,  description = "The intput TIN and business name match IRS records"]
        TinMatch,

        #[scope = SignalScope::BusinessTin, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "TIN not found", severity = SignalSeverity::High,  description = "IRS does not have a record of the input TIN"]
        TinNotFound,

        #[scope = SignalScope::BusinessTin, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "TIN invalid", severity = SignalSeverity::High,  description = "TIN is invalid"]
        TinInvalid,

        #[scope = SignalScope::BusinessTin, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "TIN does not match", severity = SignalSeverity::High,  description = "The input TIN is associated with a different business name"]
        TinDoesNotMatch,

        // ~~~~~~~~~ BusinessAddress ~~~~~~~~~~~

        #[scope = SignalScope::BusinessAddress, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Business address matches", severity = SignalSeverity::Info,  description = "The input business address matches the located business's address"]
        BusinessAddressMatch,

        #[scope = SignalScope::BusinessAddress, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Business address is close", severity = SignalSeverity::Low,  description = "The input business address is within close proximity to the located business's address"]
        BusinessAddressCloseMatch,

        #[scope = SignalScope::BusinessAddress, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Business address is similar", severity = SignalSeverity::Low,  description = "The input business address is similar to the located business's address"]
        BusinessAddressSimilarMatch,

        #[scope = SignalScope::BusinessAddress, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Business address incompletely matches", severity = SignalSeverity::Low,  description = "The input business address partially matches the located business's address"]
        BusinessAddressIncompleteMatch,

        #[scope = SignalScope::BusinessAddress, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Business address does not match", severity = SignalSeverity::High,  description = "The input business address did not match"]
        BusinessAddressDoesNotMatch,

        #[scope = SignalScope::BusinessAddress, additional_scopes = vec![], match_level = None]
        #[note = "Business address is commercial", severity = SignalSeverity::Info,  description = "The input business address is commercial"]
        BusinessAddressCommercial,

        #[scope = SignalScope::BusinessAddress, additional_scopes = vec![], match_level = None]
        #[note = "Business address is a Commercial Mail Receiving Agency", severity = SignalSeverity::High,  description = "The input business address is zoned by the USPS as a Commercial Mail Receiving Agency"]
        BusinessAddressCommercialMailReceivingAgency,

        #[scope = SignalScope::BusinessAddress, additional_scopes = vec![], match_level = None]
        #[note = "Business address is residential", severity = SignalSeverity::Low,  description = "The input business address is residential"]
        BusinessAddressResidential,

        #[scope = SignalScope::BusinessAddress, additional_scopes = vec![], match_level = None]
        #[note = "Business address is deliverable", severity = SignalSeverity::Info,  description = "The USPS is able to deliver mail to the input business address"]
        BusinessAddressDeliverable,

        #[scope = SignalScope::BusinessAddress, additional_scopes = vec![], match_level = None]
        #[note = "Business address is undeliverable", severity = SignalSeverity::Low,  description = "The USPS is unable to deliver mail to the input business address"]
        BusinessAddressNotDeliverable,

        // ~~~~~~~~~ Business Owners ~~~~~~~~~~~

        #[scope = SignalScope::BeneficialOwners, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Beneficial owners match", severity = SignalSeverity::Info,  description = "The input beneficial owners match the located business"]
        BeneficialOwnersMatch,

        #[scope = SignalScope::BeneficialOwners, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Beneficial owners partially match", severity = SignalSeverity::Medium,  description = "The input beneficial owners partially match the located business"]
        BeneficialOwnersPartialMatch,

        #[scope = SignalScope::BeneficialOwners, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Beneficial owners do not match", severity = SignalSeverity::High,  description = "The input beneficial owners do not match"]
        BeneficialOwnersDoNotMatch,

        #[scope = SignalScope::BeneficialOwners, additional_scopes = vec![], match_level = None]
        #[note = "Beneficial owner failed KYC", severity = SignalSeverity::Info,  description = "One or more Benificial Owners failed KYC"]
        BeneficialOwnerFailedKyc,

        // ~~~~~~~~~ Secretary of State Filings ~~~~~~~~~~~
        // TODO match since I didn't understand these checks
        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Found active SOS filing", severity = SignalSeverity::Info,  description = "An active Secretary of State filing was found for the business"]
        SosActiveFilingFound,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Found SOS filing with no status", severity = SignalSeverity::Low,  description = "A Secretary of State filing with no status provided was found for the business"]
        SosFilingNoStatus,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Found inactive SOS filing", severity = SignalSeverity::Low,  description = "An inactive Secretary of State filing was found for the business"]
        SosFilingPartiallyActive,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "No active SOS filing", severity = SignalSeverity::Medium,  description = "No active Secretary of State filing was found for the business"]
        SosFilingNoActiveFound,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "No SOS filing found", severity = SignalSeverity::Medium,  description = "No Secretary of State filing was found for the business"]
        SosFilingNotFound,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Found active domestic SOS filing", severity = SignalSeverity::Info,  description = "An active domestic Secretary of State filing was found for the business"]
        SosDomesticActiveFilingFound,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Found domestic SOS filing with no status", severity = SignalSeverity::Low,  description = "A domestic Secretary of State filing with no status provided was found for the business"]
        SosDomesticFilingNoStatus,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Found inactive domestic SOS filing", severity = SignalSeverity::Medium,  description = "An inactive domestic Secretary of State filing was found for the business"]
        SosDomesticFilingPartiallyActive,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "No domestic SOS filings found", severity = SignalSeverity::Medium,  description = "No domestic Secretary of State filing was found for the business"]
        SosDomesticFilingNotFound,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Domestic SOS status is Good Standing", severity = SignalSeverity::Info,  description = "The domestic Secretary of State filing found for the business has status Good Standing"]
        SosDomesticFilingStatusGoodStanding,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Domestic SOS status is Pending Active", severity = SignalSeverity::Low,  description = "The domestic Secretary of State filing found for the business has status Pending Active"]
        SosDomesticFilingStatusPendingActive,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Domestic SOS status is Pending Inactive", severity = SignalSeverity::Low,  description = "The domestic Secretary of State filing found for the business has status Pending Inactive"]
        SosDomesticFilingStatusPendingInactive,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Domestic SOS status is Not Provided by State", severity = SignalSeverity::Low,  description = "The domestic Secretary of State filing found for the business has status Not Provided by State"]
        SosDomesticFilingStatusNotProvidedByState,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Domestic SOS status is Not in Good Standing", severity = SignalSeverity::Medium,  description = "The domestic Secretary of State filing found for the business has status Not in Good Standing"]
        SosDomesticFilingStatusNotInGoodStanding,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Domestic SOS status is Dissolved", severity = SignalSeverity::Medium,  description = "The domestic Secretary of State filing found for the business has status Dissolved"]
        SosDomesticFilingStatusDissolved,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Found active SOS filing in business's state", severity = SignalSeverity::Info,  description = "An active Secretary of State filing was found for the business in the state of the input business address"]
        SosBusinessAddressActiveFilingFound,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "SOS filing status unavailable in business's state", severity = SignalSeverity::Low,  description = "The state of the input business address does not make Secretary of State filing status available"]
        SosBusinessAddressFilingStatusNotAvailable,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "Found inactive SOS filing in business's state", severity = SignalSeverity::Medium,  description = "An inactive Secretary of State filing was found for the business in the state of the input business address"]
        SosBusinessAddressInactiveFilingFound,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![SignalScope::BusinessAddress, SignalScope::BeneficialOwners], match_level = None]
        #[note = "No SOS filing found in business's state", severity = SignalSeverity::Medium,  description = "No Secretary of State filing was found for the business in the state of the input business address"]
        SosBusinessAddressFilingNotFound,

        //
        // ~~~~~~~~~ Device ~~~~~~~~~~~
        //
        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "Low Risk Device", severity = SignalSeverity::Info,  description = "Device exhibits properties typical of low risk populations"]
        DeviceLowRisk,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "Medium Risk Device", severity = SignalSeverity::Low,  description = "Device exhibits properties typical of medium risk populations"]
        DeviceMediumRisk,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "High Risk Device", severity = SignalSeverity::Medium,  description = "Device exhibits properties typical of high risk populations"]
        DeviceHighRisk,
        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "Device factory reset", severity = SignalSeverity::Medium,  description = "Device is an iOS device that has been reset to the default factory settings"]
        DeviceFactoryReset,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "Device GPS location spoofing", severity = SignalSeverity::High,  description = "The location of a mobile device shows evidence of spoofing. Location spoofing is a common practice among fraudsters to fool fraud detection systems"]
        DeviceGpsSpoofing,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "IP address is associated with a VPN", severity = SignalSeverity::Medium,  description = "The public IP address of the the device is associated with a VPN (Virtual Private Network)"]
        IpVpn,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "IP address is a known TOR exit node", severity = SignalSeverity::High,  description = "The IP address of the the device is associated with a TOR exit node"]
        IpTorExitNode,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "Device bot automation risk", severity = SignalSeverity::High,  description = "The device has properties that are typically associated with automation tools."]
        DeviceBotRisk,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "Device bot activity risk", severity = SignalSeverity::High,  description = "The device has properties that suggest the device has been modified in a way that indicates the device is being used for fraudulent or bot activity, such as being jailbroken, using an emulator or Frida."]
        DeviceSuspicious,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "High device velocity", severity = SignalSeverity::High,  description = "The device has a high number of recent sessions in the last day"]
        DeviceVelocity,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "High users per device", severity = SignalSeverity::High,  description = "The device has a high number of distinct users associated with it in the last day"]
        DeviceMultipleUsers,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "Bad device reputation", severity = SignalSeverity::High,  description = "The device used was located on a list of known bad devices."]
        DeviceReputation,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "Browser is incognito", severity = SignalSeverity::Medium,  description = "Browser was identified as being in incognito or private browsing mode."]
        BrowserIncognito,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "Browser tampering", severity = SignalSeverity::Medium,  description = "Analysis indicates the user may have been tampering with aspects of their browser (user agent, javascript runtime, network calls) to circumvent or disrupt our collection of device insights. Often a sign of abuse."]
        BrowserTampering,

        #[scope = SignalScope::Device, additional_scopes = vec![], match_level = None]
        #[note = "Browser automation", severity = SignalSeverity::Medium,  description = "User's device was using browser automation which is often a sign of abuse."]
        BrowserAutomation,

        //
        // ~~~~~~~~~ Native Device ~~~~~~~~~~~
        //
        #[scope = SignalScope::NativeDevice, additional_scopes = vec![], match_level = None]
        #[note = "Attested Apple device", severity = SignalSeverity::Info,  description = "Apple device is attested to be authentic and shows no signs of tampering/jailbreaks."]
        AttestedDeviceApple,

        #[scope = SignalScope::NativeDevice, additional_scopes = vec![], match_level = None]
        #[note = "Attested Android device", severity = SignalSeverity::Info,  description = "Android device is attested to be authentic and shows no signs of tampering/jailbreaks."]
        AttestedDeviceAndroid,

        #[scope = SignalScope::NativeDevice, additional_scopes = vec![], match_level = None]
        #[note = "Android device has strong integrity", severity = SignalSeverity::Info,  description = "Android device powered by Google Play services and has a strong guarantee of system integrity such as a hardware-backed proof of boot integrity. The device passes system integrity checks."]
        AttestedDeviceAndroidStrongIntegrity,

        #[scope = SignalScope::NativeDevice, additional_scopes = vec![], match_level = None]
        #[note = "Android device running unlicensed code", severity = SignalSeverity::Medium,  description = "Android device code source could not be determined. The device is either not trustworthy enough, the version of app code on the device is unknown to Google Play, or the user is on a device not signed in to Google Play."]
        AttestedDeviceAndroidUnlicensed,

        #[scope = SignalScope::NativeDevice, additional_scopes = vec![], match_level = None]
        #[note = "Weak Android device attestation", severity = SignalSeverity::Medium,  description = "Android device is attested and meets basic integrity checks, but does not meet stronger compatibility requirements. The device may be running an unrecognized version of Android, may have an unlocked bootloader, or may not have been certified by the manufacturer."]
        AttestedDeviceAndroidRisky,

        #[scope = SignalScope::NativeDevice, additional_scopes = vec![], match_level = None]
        #[note = "Android device could not be evaluated", severity = SignalSeverity::High,  description = "Android device failed integrity evaluation because requirement was missed, such as the device not being trustworthy enough."]
        AttestedDeviceAndroidFailedEvaluation,


        #[scope = SignalScope::NativeDevice, additional_scopes = vec![], match_level = None]
        #[note = "Attested Device Unique", severity = SignalSeverity::Info,  description = "User's attested device indicates no duplicate associated identities."]
        AttestedDeviceNoFraudDuplicateRisk,

        #[scope = SignalScope::NativeDevice, additional_scopes = vec![], match_level = None]
        #[note = "Attested Device Low Duplicate Risk", severity = SignalSeverity::Low,  description = "User's attested device indicates low duplicate identity risk."]
        AttestedDeviceFraudDuplicateRiskLow,

        #[scope = SignalScope::NativeDevice, additional_scopes = vec![], match_level = None]
        #[note = "Attested Device Medium Duplicate Risk", severity = SignalSeverity::Medium,  description = "User's attested device indicates medium duplicate identity risk. Device may be associated with more than one identity."]
        AttestedDeviceFraudDuplicateRiskMedium,

        #[scope = SignalScope::NativeDevice, additional_scopes = vec![], match_level = None]
        #[note = "Attested Device High Duplicate Risk", severity = SignalSeverity::High,  description = "User's attested device indicates high duplicate identity risk. Device may be associated with multiple identities."]
        AttestedDeviceFraudDuplicateRiskHigh,

        //
        // ~~~~~~~~~ Behavior ~~~~~~~~~~~
        //

        #[scope = SignalScope::Behavior, additional_scopes = vec![], match_level = None]
        #[note = "Behavior is associated with fraud ring activities", severity = SignalSeverity::High,  description = "User's behavior is associated with fraud ring activities"]
        BehaviorFraudRingRisk,

        #[scope = SignalScope::Behavior, additional_scopes = vec![], match_level = None]
        #[note = "Behavior is high risk", severity = SignalSeverity::High,  description = "User's behavior is high risk"]
        BehaviorHighRisk,

        #[scope = SignalScope::Behavior, additional_scopes = vec![], match_level = None]
        #[note = "Behavior is low risk", severity = SignalSeverity::Low,  description = "User's behavior is low risk"]
        BehaviorLowRisk,

        #[scope = SignalScope::Behavior, additional_scopes = vec![], match_level = None]
        #[note = "Behavior is associated with automated activities", severity = SignalSeverity::High,  description = "User's behavior is associated with automated activities"]
        BehaviorAutomaticActivity
    }
}
crate::util::impl_enum_str_diesel!(FootprintReasonCode);

impl FootprintReasonCode {
    // 2023-09-25: Removing these
    pub fn to_be_deprecated(&self) -> bool {
        matches!(
            self,
            Self::PhoneNumberMobileAccountTypePostpaid
                | Self::PhoneNumberMobileAccountTypePrepaid
                | Self::PhoneNumberMobileAccountTypeUnknown
                | Self::PhoneNumberMobileAccountStatusActive
                | Self::PhoneNumberMobileAccountStatusDeactivated
                | Self::PhoneNumberMobileAccountStatusSuspended
                | Self::PhoneNumberMobileAccountStatusAbsent
                | Self::IpNotLocated
                | Self::IpStateDoesNotMatch
                | Self::IpLocationNotAvailable
                | Self::IpInputInvalid
                | Self::IpAlertHighRiskBot
                | Self::IpAlertHighRiskSpam
                | Self::InputPhoneNumberDoesNotMatchIpState
                | Self::DocumentRequiresReview
                | Self::DocumentLowMatchScoreWithSelfie
                | Self::IpTorExitNode // 2024-04-12 new naming for this one
        )
    }
}

impl FootprintReasonCode {
    pub fn is_watchlist(&self) -> bool {
        matches!(
            self,
            FootprintReasonCode::WatchlistHitOfac
                | FootprintReasonCode::WatchlistHitNonSdn
                | FootprintReasonCode::WatchlistHitWarning
        )
    }

    pub fn is_pep(&self) -> bool {
        matches!(self, FootprintReasonCode::WatchlistHitPep)
    }

    pub fn is_adverse_media(&self) -> bool {
        matches!(self, FootprintReasonCode::AdverseMediaHit)
    }

    pub fn is_aml(&self) -> bool {
        self.is_watchlist() || self.is_pep() || self.is_adverse_media()
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize, Apiv2Schema, Hash)]
#[serde(rename_all = "snake_case")]
pub enum SignalSeverity {
    Info,
    Low,
    Medium,
    High,
}

pub fn export_reason_codes() {
    let mut rows: Vec<String> = Vec::new();
    rows.push(String::from("footprint_reason_code,scopes,description,severity"));
    FootprintReasonCode::iter().for_each(|frc| {
        let scopes_str = frc
            .scopes()
            .iter()
            .map(|r| r.clone().to_string())
            .collect::<Vec<String>>()
            .join(",");

        let row = format!(
            "{},\"{}\",\"{}\",\"{:?}\"",
            frc,
            scopes_str,
            frc.description(),
            frc.severity(),
        );
        rows.push(row);
    });
    println!("{}", rows.join("\n"));
}

#[cfg(test)]
mod tests {
    use super::FootprintReasonCode;
    use super::SignalScope;
    use super::SignalSeverity;
    use std::cmp::Ordering;
    use strum::IntoEnumIterator;
    use test_case::test_case;

    #[test_case(SignalSeverity::Low, SignalSeverity::High => Ordering::Less)]
    #[test_case(SignalSeverity::Info, SignalSeverity::Low => Ordering::Less)]
    #[test_case(SignalSeverity::Low, SignalSeverity::Medium => Ordering::Less)]
    #[test_case(SignalSeverity::Medium, SignalSeverity::High => Ordering::Less)]
    fn test_cmp_signal_severity(s1: SignalSeverity, s2: SignalSeverity) -> Ordering {
        // Test ordering since we rely on it to sort risk signals
        s1.cmp(&s2)
    }

    #[test]
    fn test_footprint_reason_code_enum_use() {
        let frc = FootprintReasonCode::SubjectDeceased;
        assert_eq!(SignalSeverity::High, frc.severity());
        assert_eq!(vec![SignalScope::Ssn], frc.scopes());
        assert_eq!(
            "Records indicate that the subject in question is deceased.",
            frc.description()
        );
    }

    #[test]
    #[ignore]
    // Just a little script to dump our reason codes into CSV format for uploading to google docs so
    // non-eng folks can work on them
    fn test_export_reason_codes() {
        super::export_reason_codes()
    }

    #[test]
    fn test_scopes_are_ordered() {
        FootprintReasonCode::iter().for_each(|frc| assert_eq!(frc.scopes().first().cloned(), frc.scope()));
    }
}
