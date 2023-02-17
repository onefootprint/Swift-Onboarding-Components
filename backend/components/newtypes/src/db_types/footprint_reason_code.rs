use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::SignalScope;

// yes one day we'll consolidate this and vendor_reason_code_enum into beautiful proc macros
macro_rules! footprint_reason_code_enum {
    (
        $(#[$macros:meta])*
        pub enum $name:ident {
            $(#[note = $note:literal, severity = $severity:expr, scopes = $scopes:expr, description = $description:literal] $item:ident),*
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

            /// Indicates the offending fields that created this signal
            pub fn scopes(&self) -> Vec<SignalScope> {
                match self {
                    $(Self::$item => $scopes),*,
                    Self::Other(_) => vec![]
                }
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
        #[note = "Potential watchlist hit", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Name, SignalScope::Dob], description = "A weak potential match on a governmental watchlist (OFAC, PEP or NonSDN Consolidated Sanctions (PLC, FSE, ISA, SSI)) was found"]
        PotentialWatchlistHit,

        #[note = "Watchlist hit", severity = SignalSeverity::High, scopes =  vec![SignalScope::Name, SignalScope::Dob], description = "A strong potential match on a governmental watchlist (OFAC, PEP or NonSDN Consolidated Sanctions (PLC, FSE, ISA, SSI))"]
        WatchlistHit,

        #[note = "Identity not located", severity = SignalSeverity::High, scopes =  vec![SignalScope::Name, SignalScope::Dob, SignalScope::Ssn, SignalScope::Address], description = "Identity could not be located with the information provided"]
        IdNotLocated,

        // ~~~~~~~~~ Address ~~~~~~~~~~~~~~~

        #[note = "Address does not match", severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Address located does not match address input."]
        AddressDoesNotMatch,

        #[note = "ZIP code does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "ZIP code located does not match the ZIP code input."]
        AddressZipCodeDoesNotMatch,

        #[note = "Street name does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::StreetAddress], description = "Street name located does not match input street name."]
        AddressStreetNameDoesNotMatch,

        #[note = "Street number does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::StreetAddress], description = "Street number located does not match input street number."]
        AddressStreetNumberDoesNotMatch,

        #[note = "State does not match", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "State located does not match state input."]
        AddressStateDoesNotMatch,

        #[note = "Address is not deliverable", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "The input address is not a deliverable address."]
        AddressInputIsNotDeliverable,

        #[note = "Address is PO box", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a PO Box."]
        AddressInputIsPoBox,

        #[note = "Address is correctional facility", severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Address is a correctional facility"]
        AddressInputIsCorrectionalFacility,

        #[note = "Input address input is campground", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a campground."]
        AddressInputIsNotStandardCampground,

        #[note = "Input address input is college", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a college."]
        AddressInputIsNotStandardCollege,

        #[note = "Input address input is general delivery", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a mail service for those without a permanent address."]
        AddressInputIsNotStandardGeneralDelivery,

        #[note = "Input address input is hospital", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a hospital."]
        AddressInputIsNotStandardHospital,

        #[note = "Input address input is hotel", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a hotel."]
        AddressInputIsNotStandardHotel,

        #[note = "Input address input is mail drop", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a mail drop."]
        AddressInputIsNotStandardMailDrop,

        #[note = "Input address input is prison", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a prison."]
        AddressInputIsNotStandardPrison,

        #[note = "Input address input is university", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a university."]
        AddressInputIsNotStandardUniversity,

        #[note = "Input address input is USPO", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a United States Postal Office."]
        AddressInputIsNotStandardUspo,

        #[note = "Located address is PO box", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a PO Box."]
        AddressLocatedIsPoBox,

        #[note = "Found address input is campground", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a campground."]
        AddressLocatedIsNotStandardCampground,

        #[note = "Found address input is college", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a college."]
        AddressLocatedIsNotStandardCollege,

        #[note = "Found address input is general delivery", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a mail service for those without a permanent address."]
        AddressLocatedIsNotStandardGeneralDelivery,

        #[note = "Found address input is hospital", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a hospital."]
        AddressLocatedIsNotStandardHospital,

        #[note = "Found address input is hotel", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a hotel."]
        AddressLocatedIsNotStandardHotel,

        #[note = "Found address input is mail drop", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a mail drop."]
        AddressLocatedIsNotStandardMailDrop,

        #[note = "Found address input is prison", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a prison."]
        AddressLocatedIsNotStandardPrison,

        #[note = "Found address input is university", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a university."]
        AddressLocatedIsNotStandardUniversity,

        #[note = "Found address input is USPO", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a United States Postal Office."]
        AddressLocatedIsNotStandardUspo,

        #[note = "Located address is high risk", severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "The located address has a known history of fraud activity."]
        AddressLocatedIsHighRiskAddress,

        #[note = "High velocity address", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The individual has a high number of addresses within a defined time period."]
        AddressAlertVelocity,

        #[note = "Address stability alert", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "The individual has changed addresses at a high frequency."]
        AddressAlertStability,

        #[note = "Address longevity alert", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "The individual has lived at their current address for a short time."]
        AddressAlertLongevity,

        #[note = "Single address located", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "Only a single address record was located for the individual."]
        AddressAlertSingleAddressInFile,

        #[note = "Newer address found", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "The individual was located at the address input, but a more recent record shows a different address for the individual."]
        NewerRecordFound,

        // ~~~~~~~~~ DOB ~~~~~~~~~~~~~~~

        #[note = "DOB year mismatch", severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "The year of birth located does not match the input."]
        DobYobDoesNotMatch,

        #[note = "DOB year mismatch by 1", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Dob], description = "A one year difference between the YOB input and the YOB located."]
        DobYobDoesNotMatchWithin1Year,

        #[note = "DOB month mismatch", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Dob], description = "Month of birth input does not match the month of birth located."]
        DobMobDoesNotMatch,

        #[note = "DOB month unavailable", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Dob], description = "No month of birth located."]
        DobMobNotAvailable,

        #[note = "DOB year unavailable", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Dob], description = "No year of birth located."]
        DobYobNotAvailable,

        #[note = "Age below minimum", severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "The person is below 18."]
        DobLocatedAgeBelowMinimum,

        #[note = "Age above maximum", severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "The person is above 85."]
        DobLocatedAgeAboveMaximum,

        #[note = "Age COPPA alert", severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "Customer is 13 or under. COPPA laws forbid conducting e-commerce with people under 14 years of age."]
        DobLocatedCoppaAlert,

        // ~~~~~~~~~~~~ SSN ~~~~~~~~~~~~

        #[note = "SSN not available", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "No SSN information located. "]
        SsnNotAvailable,

        #[note = "SSN does not match", severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "SSN located does not match SSN input."]
        SsnDoesNotMatch,

        #[note = "SSN off by one digit", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "Difference of one digit between the SSN input and the SSN located. "]
        SsnDoesNotMatchWithin1Digit,

        #[note = "Input SSN is ITIN", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "The input SSN is an ITIN (Individual Taxpayer Identification Number)."]
        SsnInputIsItin,

        #[note = "Located SSN is ITIN", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "The located SSN is an ITIN (Individual Taxpayer Identification Number)."]
        SsnLocatedIsItin,

        #[note = "SSN tied to multiple names", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Ssn], description = "The SSN input is tied to two or more individuals."]
        SsnInputTiedToMultipleNames,

        #[note = "Input SSN invalid", severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "The input SSN does not match the structure of a valid SSN."]
        SsnInputIsInvalid,

        #[note = "Located SSN invalid", severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "The located SSN does not match the structure of a valid SSN."]
        SsnLocatedIsInvalid,

        // ~~~~~~~~~~~~ Name ~~~~~~~~~~~~

        #[note = "Last name does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Name], description = "The located last name does not match the input last name."]
        NameLastDoesNotMatch,

        // ~~~~~~~~~~~~ IP Address ~~~~~~~~~~~~

        #[note = "IP state does not match", severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress, SignalScope::Address], description = "The located IP State does not match the input IP State."]
        IpStateDoesNotMatch,

        #[note = "Input IP invalid", severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress], description = "The IP address input does not fit the proper structure of an IP address and/or is located to be an unassigned IP address. "]
        IpInputInvalid,

        #[note = "IP not located", severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress], description = "The IP address could not be located within data sources."]
        IpNotLocated,

        #[note = "IP location unavailable", severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress], description = "The location of the IP address cannot be determined."]
        IpLocationNotAvailable,

        #[note = "IP high risk bot", severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "The IP address is part of a network of computers infected with malware."]
        IpAlertHighRiskBot,

        #[note = "IP high risk spam", severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "The IP address is associated with a device infected with malware."]
        IpAlertHighRiskSpam,

        #[note = "IP high risk TOR", severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "The IP address is associated with a TOR network."]
        IpAlertHighRiskTor,

        #[note = "IP high risk proxy", severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "The IP address is associated with an anonymizing proxy"]
        IpAlertHighRiskProxy,

        // ~~~~~~~~~~~~ Email ~~~~~~~~~~~~

        #[note = "Email address invalid", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address is invalid or does not have the proper syntax of an email address."]
        EmailAddressInvalid,

        #[note = "Email address does not exist", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address or domain does not exist."]
        EmailAddressOrDomainDoesNotExist,

        #[note = "Domain recently created", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Email], description = "The email domain has been recently created. "]
        EmailDomainRecentlyCreated,

        #[note = "Private email domain", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "The domain of the email address has been identified as belonging to a private individual."]
        EmailDomainPrivate,

        #[note = "Corporate email domain", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "The domain of the email address has been identified as belonging to a corporate entity."]
        EmailDomainCorporate,

        #[note = "Email recently verified", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "The email address is high risk because it was only recently verified in our databases."]
        EmailRecentlyVerified,

        #[note = "Email from high risk country", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address is located to be from a country that is set as restricted."]
        EmailHighRiskCountry,

        #[note = "High risk fraud email", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address has been reported as fraud or is potentially fraudulent. "]
        EmailHighRiskFraud,

        #[note = "High risk tumbled email", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address provided has been input with different variations that point to the same inbox."]
        EmailHighRiskTumbled,

        #[note = "High risk dispoable email", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address provided is a temporary email address."]
        EmailHighRiskDisposable,

        #[note = "High risk email domain", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "The domain has been reported as fraud or is potentially fraudulent."]
        EmailHighRiskDomain,

        // ~~~~~~~~~~~~ Phone Number ~~~~~~~~~~~~

        #[note = "Phone number does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "The phone number input does not match the located phone number."]
        PhoneNumberDoesNotMatch,

        #[note = "Phone number invalid", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The phone number input was not a valid phone number."]
        PhoneNumberInputInvalid,

        #[note = "VOIP phone number", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "The consumer's phone number could be tied to an answering service, page, or VoIP."]
        PhoneNumberLocatedIsVoip,

        #[note = "Postpaid phone number", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The type of mobile account is postpaid."]
        PhoneNumberMobileAccountTypePostpaid,

        #[note = "Prepaid phone number", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The type of mobile account is prepaid."]
        PhoneNumberMobileAccountTypePrepaid,

        #[note = "Mobile account unknown", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The type of mobile account is unknown."]
        PhoneNumberMobileAccountTypeUnknown,

        #[note = "Mobile account active", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The mobile account is active."]
        PhoneNumberMobileAccountStatusActive,

        #[note = "Mobile account deactivated", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The mobile account is deactivated."]
        PhoneNumberMobileAccountStatusDeactivated,

        #[note = "Mobile account suspended", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "The mobile account is suspended."]
        PhoneNumberMobileAccountStatusSuspended,

        #[note = "Mobile status absent", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The mobile account is absent."]
        PhoneNumberMobileAccountStatusAbsent,

        // ~~~~~~~~~~~~ Identity ~~~~~~~~~~~~

        #[note = "Multiple identities found", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Identity], description = "Several valid records exist containing conflicting identifying information."]
        MultipleRecordsFound,

        #[note = "Subject deceased", severity = SignalSeverity::High, scopes =  vec![SignalScope::Identity], description = "Records indicate that the subject in question is deceased."]
        SubjectDeceased,

        #[note = "SSN issued before DOB", severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn, SignalScope::Dob], description = "The SSN number was issued before the individual’s DOB."]
        SsnIssuedPriorToDob,

        #[note = "Thin file", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Identity], description = "The record located had very little information, specifically only name + address, and lacks sufficient information to strongly identify individual."]
        ThinFile,

        #[note = "Area code doesn't match state", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address, SignalScope::PhoneNumber], description = "The area code for the phone number input does not match the state input."]
        InputPhoneNumberDoesNotMatchInputState,

        #[note = "Area code doesn't match located state", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address, SignalScope::PhoneNumber], description = "The area code for the phone number input does not match any address in the located address history for the identity."]
        InputPhoneNumberDoesNotMatchLocatedStateHistory,

        #[note = "Area code doesn't match IP address state", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address, SignalScope::PhoneNumber], description = "IP address is not from the same state as the input phone number."]
        InputPhoneNumberDoesNotMatchIpState,

        // ~~~~~~~~~~~~ Document ~~~~~~~~~~~~

        #[note = "Document not verified", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "Unable to verify the document provided because either the front or back was unable to be read or because it failed the verification check."]
        DocumentNotVerified,

        #[note = "Document OCR not successful", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The OCR for the front of the document failed."]
        DocumentOcrNotSuccessful,

        #[note = "Document barcode illegible", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The reading and extracting of the barcode on the back of the document failed."]
        DocumentBarcodeCouldNotBeRead,

        #[note = "Document requires review", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Document], description = "Indicates that further review of the document is required."]
        DocumentRequiresReview,

        #[note = "Document expired", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Document], description = "The document is expired."]
        DocumentExpired,

        #[note = "Document from restricted country", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The document is from a high-risk country."]
        DocumentFromRestrictedCountry,

        #[note = "Document type restricted", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "Indicates that the template type identified for the document provided is restricted."]
        DocumentRestrictedTemplateType,

        #[note = "Document type not allowed", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The document type provided is not allowed."]
        DocumentTypeNotAllowed,

        #[note = "Document crosscheck failed", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "A field crosscheck (comparing data on the front of the document to the back) failed during the document authentication."]
        DocumentFieldCrosscheckFailed,

        #[note = "Document invalid issuance or expiration", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Document], description = "The Issuance Date, Expiration Date, or both do not align to the timeline of the identified document. The Issuance Date or the Expiration Date are not in a valid format."]
        DocumentInvalidIssuanceOrExpirationDate,

        #[note = "Document invalid template layout", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The layout, or relative positions of specifically identified features of the document, were not within the proper place, are missing, or show signs of tampering."]
        DocumentInvalidTemplateLayout,

        #[note = "Document image possible tampering", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The image of the document has evidence or appearances of being manipulated or tampered."]
        DocumentPossibleImageTampering,

        #[note = "Document low match with selfie", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document, SignalScope::Selfie], description = "The match score between the customer's captured selfie image and captured document was low."]
        DocumentLowMatchScoreWithSelfie
    }
}
crate::util::impl_enum_str_diesel!(FootprintReasonCode);

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum SignalSeverity {
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
        assert_eq!(vec![SignalScope::Identity], frc.scopes());
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
