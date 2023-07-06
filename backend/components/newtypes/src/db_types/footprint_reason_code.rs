use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::{MatchLevel, SignalScope};

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
        JsonSchema,
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
        #[note = "PEP hit", severity = SignalSeverity::High,  description = "A strong potential match as a Politically Exposed Person"]
        WatchlistHitPep,

        #[scope = SignalScope::Name, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "Adverse media hit", severity = SignalSeverity::High,  description = "A strong potential match with adverse media found"]
        AdverseMediaHit,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Name, SignalScope::Dob, SignalScope::Address], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "Identity not located", severity = SignalSeverity::High,  description = "Identity could not be located with the information provided"]
        IdNotLocated,

        // ~~~~~~~~~ Address ~~~~~~~~~~~~~~~

        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Address does not match", severity = SignalSeverity::High,  description = "Address located does not match address input."]
        AddressDoesNotMatch,

 #[scope = SignalScope::Address, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
 #[note = "Address partially matches", severity = SignalSeverity::Medium,  description = "Address located partially matches address input."]
 AddressPartiallyMatches,

 #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::Zip], match_level = Some(MatchLevel::NoMatch)]
 #[note = "ZIP code does not match", severity = SignalSeverity::Medium,  description = "ZIP code located does not match the ZIP code input."]
 AddressZipCodeDoesNotMatch,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::City], match_level = Some(MatchLevel::NoMatch)]
        #[note = "City does not match", severity = SignalSeverity::Medium,  description = "City located does not match the city input."]
        AddressCityDoesNotMatch,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::City], match_level = Some(MatchLevel::Exact)]
        #[note = "City matches", severity = SignalSeverity::Info,  description = "City located matches the city input."]
        AddressCityMatches,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::StreetAddress], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Street name does not match", severity = SignalSeverity::Medium,  description = "Street name located does not match input street name."]
        AddressStreetNameDoesNotMatch,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::StreetAddress], match_level = Some(MatchLevel::Partial)]
        #[note = "Street name partially matches", severity = SignalSeverity::Low,  description = "Street name located partially matches input street name."]
        AddressStreetNamePartiallyMatches,

        #[scope = SignalScope::Address, additional_scopes = vec![SignalScope::StreetAddress], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Street number does not match", severity = SignalSeverity::Medium,  description = "Street number located does not match input street number."]
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
        #[note = "Address is correctional facility", severity = SignalSeverity::High,  description = "Address is a correctional facility"]
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
        #[note = "More recent address located", severity = SignalSeverity::Low,  description = "Address input is different from the consumer’s best, most current address."]
        AddressNewerRecordFound,


        #[scope = SignalScope::Address, additional_scopes = vec![], match_level = None]
        #[note = "Newer address found", severity = SignalSeverity::Low,  description = "The individual was located at the address input, but a more recent record shows a different address for the individual."]
        NewerRecordFound,

        // ~~~~~~~~~ DOB ~~~~~~~~~~~~~~~

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "DOB year mismatch", severity = SignalSeverity::High,  description = "The year of birth located does not match the input."]
        DobYobDoesNotMatch,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "DOB year mismatch by 1", severity = SignalSeverity::Medium,  description = "A one year difference between the YOB input and the YOB located."]
        DobYobDoesNotMatchWithin1Year,

        #[scope = SignalScope::Dob, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "DOB month mismatch", severity = SignalSeverity::Medium,  description = "Month of birth input does not match the month of birth located."]
        DobMobDoesNotMatch,

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
        #[note = "Age above maximum", severity = SignalSeverity::High,  description = "The person is above 85."]
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
        #[note = "Dob was not found on file", severity = SignalSeverity::Medium,  description = "No DOB was located for the individual"]
        DobNotOnFile,


        // ~~~~~~~~~~~~ SSN ~~~~~~~~~~~~

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "SSN not available", severity = SignalSeverity::Low,  description = "No SSN information located. "]
        SsnNotAvailable,


        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "SSN9 partial match", severity = SignalSeverity::Low,  description = "SSN 9 partially located matches SSN 9 input."]
        SsnPartiallyMatches,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "SSN does not match", severity = SignalSeverity::High,  description = "SSN located does not match SSN input."]
        SsnDoesNotMatch,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "SSN off by one digit", severity = SignalSeverity::Low,  description = "Difference of one digit between the SSN input and the SSN located. "]
        SsnDoesNotMatchWithin1Digit,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Input SSN is ITIN", severity = SignalSeverity::Low,  description = "The input SSN is an ITIN (Individual Taxpayer Identification Number)."]
        SsnInputIsItin,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Located SSN is ITIN", severity = SignalSeverity::Low,  description = "The located SSN is an ITIN (Individual Taxpayer Identification Number)."]
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

        // ~~~~~~~~~~~~ Name ~~~~~~~~~~~~

        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Last name does not match", severity = SignalSeverity::Medium,  description = "The located last name does not match the input last name."]
        NameLastDoesNotMatch,
        #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "Last name partially matches", severity = SignalSeverity::Low,  description = "The located last name partially matches the input last name."]
        NameLastPartiallyMatches,

 #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
 #[note = "Name matches", severity = SignalSeverity::Info,  description = "The located name matches the input name."]
 NameMatches,
 #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
 #[note = "Name does not matches", severity = SignalSeverity::Medium,  description = "The located name does not match the input name."]
 NameDoesNotMatch,
 #[scope = SignalScope::Name, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
 #[note = "Name partially matches", severity = SignalSeverity::Low,  description = "The located name partially matches the input name."]
 NamePartiallyMatches,

 // ~~~~~~~~~~~~ IP Address ~~~~~~~~~~~~

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

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = Some(MatchLevel::CouldNotMatch)]
        #[note = "Phone number does not match", severity = SignalSeverity::Medium,  description = "The phone number input does not match the located phone number."]
        PhoneNumberDoesNotMatch,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "Phone number invalid", severity = SignalSeverity::Low,  description = "The phone number input was not a valid phone number."]
        PhoneNumberInputInvalid,

        #[scope = SignalScope::PhoneNumber, additional_scopes = vec![], match_level = None]
        #[note = "VOIP phone number", severity = SignalSeverity::Medium,  description = "The consumer's phone number could be tied to an answering service, page, or VoIP."]
        PhoneNumberLocatedIsVoip,

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

        // ~~~~~~~~~~~~ Identity ~~~~~~~~~~~~

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Multiple identities found", severity = SignalSeverity::Low,  description = "Several valid records exist containing conflicting identifying information."]
        MultipleRecordsFound,

        #[scope = SignalScope::Ssn, additional_scopes = vec![], match_level = None]
        #[note = "Subject deceased", severity = SignalSeverity::High,  description = "Records indicate that the subject in question is deceased."]
        SubjectDeceased,

        #[scope = SignalScope::Ssn, additional_scopes = vec![SignalScope::Dob], match_level = None]
        #[note = "SSN issued before DOB", severity = SignalSeverity::High,  description = "The SSN number was issued before the individual’s DOB."]
        SsnIssuedPriorToDob,

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

        // ~~~~~~~~~~~~ Document ~~~~~~~~~~~~

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document not verified", severity = SignalSeverity::High,  description = "Unable to verify the document provided because either the front or back was unable to be read or because it failed the verification check."]
        DocumentNotVerified,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document verified", severity = SignalSeverity::Info,  description = "Document provided was verified"]
        DocumentVerified,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document OCR not successful", severity = SignalSeverity::High,  description = "The OCR for the document failed."]
        DocumentOcrNotSuccessful,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document OCR was successful", severity = SignalSeverity::Info,  description = "The OCR for the the document was successful."]
        DocumentOcrSuccessful,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document barcode illegible", severity = SignalSeverity::High,  description = "The reading and extracting of the barcode on the back of the document failed."]
        DocumentBarcodeCouldNotBeRead,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document barcode was read", severity = SignalSeverity::Info,  description = "The reading and extracting of the barcode on the back of the document succeeded."]
        DocumentBarcodeCouldBeRead,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document barcode content matches OCR data", severity = SignalSeverity::Info,  description = "Data extracted from the barcode matches. Information extracted from a barcode may include: name, address, DOB, eye color, SSN, etc"]
        DocumentBarcodeContentMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document barcode content does not match OCR data", severity = SignalSeverity::High,  description = "Data extracted from the barcode does not match. Information extracted from a barcode may include: name, address, DOB, eye color, SSN, etc"]
        DocumentBarcodeContentDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document requires review", severity = SignalSeverity::Medium,  description = "Indicates that further review of the document is required."]
        DocumentRequiresReview,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document expired", severity = SignalSeverity::Medium,  description = "The document is expired."]
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
        #[note = "Document crosscheck failed", severity = SignalSeverity::High,  description = "A field crosscheck (comparing data on the front of the document to the back) failed during the document authentication."]
        DocumentFieldCrosscheckFailed,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document invalid issuance or expiration", severity = SignalSeverity::Medium,  description = "The Issuance Date, Expiration Date, or both do not align to the timeline of the identified document. The Issuance Date or the Expiration Date are not in a valid format."]
        DocumentInvalidIssuanceOrExpirationDate,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document invalid template layout", severity = SignalSeverity::High,  description = "The layout, or relative positions of specifically identified features of the document, were not within the proper place, are missing, or show signs of tampering."]
        DocumentInvalidTemplateLayout,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image possible tampering", severity = SignalSeverity::High,  description = "The image of the document has evidence or appearances of being physically manipulated or tampered."]
        DocumentPossibleImageTampering,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document has no signs of physical tampering", severity = SignalSeverity::Info,  description = "The image of the document has no sign of being physically manipulated or tampered."]
        DocumentNoImageTampering,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image possible fake", severity = SignalSeverity::High,  description = "The image of the document has evidence or appearances of being a fake document. For example: slight difference in layout of the ID, different font or font size."]
        DocumentPossibleFakeImage,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image is not fake", severity = SignalSeverity::Info,  description = "The image of the document has no evidence or appearances of being a fake document."]
        DocumentNotFakeImage,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image is an image of a screen", severity = SignalSeverity::High,  description = "The image of the document is picture of a document on a screen"]
        DocumentPhotoIsScreenCapture,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document image is not an image of a screen", severity = SignalSeverity::Info,  description = "The image of the document is not a picture of a document on a screen"]
        DocumentPhotoIsNotScreenCapture,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document is printed on paper", severity = SignalSeverity::High,  description = "The image of the document is printed on paper"]
        DocumentPhotoIsPaperCapture,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document is not printed on paper", severity = SignalSeverity::Info,  description = "The image of the document is not printed on paper"]
        DocumentPhotoIsNotPaperCapture,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document visible photo features are not verified", severity = SignalSeverity::Medium,  description = "The visible photo features of the document were not verified"]
        DocumentVisiblePhotoFeaturesNotVerified,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = None]
        #[note = "Document visible photo features are verified", severity = SignalSeverity::Info,  description = "The visible photo features of the document were verified"]
        DocumentVisiblePhotoFeaturesVerified,

        #[scope = SignalScope::Document, additional_scopes = vec![SignalScope::Selfie], match_level = None]
        #[note = "Document low match with selfie", severity = SignalSeverity::High,  description = "The match score between the customer's captured selfie image and captured document was low."]
        DocumentLowMatchScoreWithSelfie,

        #[scope = SignalScope::Document, additional_scopes = vec![SignalScope::Selfie], match_level = Some(MatchLevel::Exact)]
        #[note = "Document image matches selfie", severity = SignalSeverity::High,  description = "The image on the document matches the captured selfie."]
        DocumentSelfieMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![SignalScope::Selfie], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document image does not match selfie", severity = SignalSeverity::High,  description = "The image on the document does not match the captured selfie."]
        DocumentSelfieDoesNotMatch,

        // OCR matching
        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document OCR name does not match input", severity = SignalSeverity::Medium,  description = "The OCR name does not match the name that was input."]
        DocumentOcrNameDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Document OCR name matches input", severity = SignalSeverity::Info,  description = "The OCR name matches the name that was input."]
        DocumentOcrNameMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document OCR first name does not match input", severity = SignalSeverity::Medium,  description = "The OCR first name does not match the name that was input."]
        DocumentOcrFirstNameDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Document OCR first name matches input", severity = SignalSeverity::Info,  description = "The OCR first name matches the name that was input."]
        DocumentOcrFirstNameMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document OCR last name does not match input", severity = SignalSeverity::Medium,  description = "The OCR last name does not match the name that was input."]
        DocumentOcrLastNameDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Document OCR last name matches input", severity = SignalSeverity::Info,  description = "The OCR last name matches the name that was input."]
        DocumentOcrLastNameMatches,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::NoMatch)]
        #[note = "Document OCR DOB does not match input", severity = SignalSeverity::Medium,  description = "The OCR DOB does not match the DOB that was input."]
        DocumentOcrDobDoesNotMatch,

        #[scope = SignalScope::Document, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Document OCR DOB matches input", severity = SignalSeverity::Info,  description = "The OCR DOB matches the DOB that was input."]
        DocumentOcrDobMatches,

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

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "DBA matches", severity = SignalSeverity::Info,  description = "The input business DBA (Doing Business As) matches the located business's DBA"]
        BusinessDbaMatch,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = Some(MatchLevel::Partial)]
        #[note = "DBA is similar", severity = SignalSeverity::Low,  description = "The input business DBA (Doing Business As) is similar to the located business's DBA"]
        BusinessDbaSimilarMatch,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "Alternate DBA found", severity = SignalSeverity::Medium,  description = "The located business goes by an alternate DBA (Doing Business As)"]
        BusinessDbaAlternateMatch,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = Some(MatchLevel::Exact)]
        #[note = "DBA name does not match", severity = SignalSeverity::Medium,  description = "The input business DBA (Doing Business As) did not match"]
        BusinessDbaDoesNotMatch,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = None]
        #[note = "No watchlist hits", severity = SignalSeverity::Info,  description = "No watchlist matches found for the business"]
        BusinessNameNoWatchlistHits,

        #[scope = SignalScope::BusinessName, additional_scopes = vec![], match_level = None]
        #[note = "Watchlist hit", severity = SignalSeverity::High,  description = "One or more potential watchlist matches found for the business"]
        BusinessNameWatchlistHit, // TODO: make a variant per list like we do with KYC watchlist hits

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

        #[scope = SignalScope::BusinessWebsite, additional_scopes = vec![], match_level = Some(MatchLevel::Verified)]
        #[note = "Website verified", severity = SignalSeverity::Info,  description = "Successfully found entity details on the input business website"]
        BusinessWebsiteVerified,

        #[scope = SignalScope::BusinessWebsite, additional_scopes = vec![], match_level = Some(MatchLevel::NotVerified)]
        #[note = "Website unverified", severity = SignalSeverity::Low,  description = "Unable to find entity details on the input business website"]
        BusinessWebsiteUnverified,

        #[scope = SignalScope::BusinessWebsite, additional_scopes = vec![], match_level = Some(MatchLevel::NotVerified)]
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
        SosBusinessAddressFilingNotFound
    }
}
crate::util::impl_enum_str_diesel!(FootprintReasonCode);

impl FootprintReasonCode {
    pub fn to_info_code(&self) -> Option<Self> {
        match self {
            FootprintReasonCode::AddressDoesNotMatch => Some(Self::AddressMatches),
            FootprintReasonCode::AddressZipCodeDoesNotMatch => Some(Self::AddressZipCodeMatches),
            FootprintReasonCode::AddressStreetNameDoesNotMatch => Some(Self::AddressStreetNameMatches),
            FootprintReasonCode::AddressStreetNumberDoesNotMatch => Some(Self::AddressStreetNumberMatches),
            FootprintReasonCode::AddressStateDoesNotMatch => Some(Self::AddressStateMatches),
            FootprintReasonCode::DobYobDoesNotMatch => Some(Self::DobYobMatches),
            FootprintReasonCode::DobMobDoesNotMatch => Some(Self::DobMobMatches),
            FootprintReasonCode::SsnDoesNotMatch => Some(Self::SsnMatches),
            FootprintReasonCode::NameLastDoesNotMatch => Some(Self::NameLastMatches),
            FootprintReasonCode::IpStateDoesNotMatch => Some(Self::IpStateMatches),
            FootprintReasonCode::PhoneNumberDoesNotMatch => Some(Self::PhoneNumberMatches),
            FootprintReasonCode::InputPhoneNumberDoesNotMatchInputState => {
                Some(Self::InputPhoneNumberMatchesInputState)
            }
            FootprintReasonCode::InputPhoneNumberDoesNotMatchLocatedStateHistory => {
                Some(Self::InputPhoneNumberMatchesLocatedStateHistory)
            }
            _ => None,
        }
    }
}

#[derive(
    Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize, Apiv2Schema, JsonSchema, Hash,
)]
#[serde(rename_all = "snake_case")]
pub enum SignalSeverity {
    Info,
    Low,
    Medium,
    High,
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use crate::IDologyReasonCode;
    use crate::SocureReasonCode;

    use super::FootprintReasonCode;
    use super::SignalScope;
    use super::SignalSeverity;
    use std::cmp::Ordering;
    use std::collections::HashMap;
    use strum::IntoEnumIterator;

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
    // Just a little script to dump our reason codes into CSV format for uploading to google docs so non-eng folks can work on them
    fn export_reason_codes_for_gdoc() {
        let mut frc_to_idology: HashMap<FootprintReasonCode, Vec<IDologyReasonCode>> = HashMap::new();
        IDologyReasonCode::iter()
            .flat_map(|r| Into::<Option<FootprintReasonCode>>::into(&r).map(|frc| (frc, r)))
            .for_each(|(frc, r)| {
                frc_to_idology.entry(frc).or_insert_with(Vec::new).push(r);
            });

        let mut frc_to_socure: HashMap<FootprintReasonCode, Vec<SocureReasonCode>> = HashMap::new();
        SocureReasonCode::iter()
            .flat_map(|r| Into::<Option<FootprintReasonCode>>::into(&r).map(|frc| (frc, r)))
            .for_each(|(frc, r)| {
                frc_to_socure.entry(frc).or_insert_with(Vec::new).push(r);
            });

        let mut rows: Vec<String> = Vec::new();
        rows.push(String::from(
            "footprint_reason_code,scopes,description,idology_reason_codes,socure_reason_codes",
        ));
        FootprintReasonCode::iter().for_each(|frc| {
            let idology_rc = frc_to_idology.get(&frc);
            let socure_rc = frc_to_socure.get(&frc);

            let scopes_str = frc
                .scopes()
                .iter()
                .map(|r| r.clone().to_string())
                .collect::<Vec<String>>()
                .join(",");
            let idology_str = idology_rc.map(|v| {
                v.iter()
                    .map(|r| r.clone().to_string())
                    .collect::<Vec<String>>()
                    .join(",")
            });
            let socure_str = socure_rc.map(|v| {
                v.iter()
                    .map(|r| r.clone().to_string())
                    .collect::<Vec<String>>()
                    .join(",")
            });

            let row = format!(
                "{},\"{}\",\"{}\",\"{}\",\"{}\"",
                frc,
                scopes_str,
                frc.description(),
                idology_str.unwrap_or_default(),
                socure_str.unwrap_or_default(),
            );
            rows.push(row);
        });
        println!("{}", rows.join("\n"));
    }
}
