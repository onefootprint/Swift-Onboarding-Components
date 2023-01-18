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
            $(#[severity = $severity:expr, scopes = $scopes:expr, description = $description:literal] $item:ident),*
        }
    ) => {
        $(#[$macros])*
        pub enum $name {
            $(#[doc=$description] $item,)*
            #[strum(default)]
            Other(String)
        }

        impl $name {
            pub fn severity(&self) -> SignalSeverity {
                match self {
                    $(Self::$item => $severity),*,
                    Self::Other(_) => SignalSeverity::Low
                }
            }

            pub fn scopes(&self) -> Vec<SignalScope> {
                match self {
                    $(Self::$item => $scopes),*,
                    Self::Other(_) => vec![]
                }
            }

            pub fn description(&self) -> String {
                match self {
                    $(Self::$item => String::from($description)),*,
                    Self::Other(_) => String::from("")
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
    )]
    #[strum(serialize_all = "snake_case")]
    #[serde(rename_all = "snake_case")]
    #[diesel(sql_type = Text)]
    pub enum FootprintReasonCode {

        // ~~~~~~~~~ Address ~~~~~~~~~~~~~~~

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Address found does not match address submitted. This can be due to a typo in the input information, typos or errors in the address located, or the address is actually incorrect, but the subject’s credentials are located in or near the target ZIP code, city, or metropolitan area."]
        AddressDoesNotMatch,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "ZIP code located does not match the ZIP code submitted."]
        AddressZipCodeDoesNotMatch,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::StreetAddress], description = "The submitted street name does not match the located data. This can be due to a typo in the input or the located data. This note will always be accompanied by the resultcode.address.does.not.match ID Note."]
        AddressStreetNameDoesNotMatch,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::StreetAddress], description = "The submitted street number does not match the located data. This can be due to a typo in the input or the located data. This note will always be accompanied by the resultcode.address.does.not.match ID Note."]
        AddressStreetNumberDoesNotMatch,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "This indicates that the State located does not match the state input as part of the address."]
        AddressStateDoesNotMatch,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "The input address provided is not a deliverable address. If the setting to return additional information in the API has been enabled for an enterprise by our Customer Success team, the following details may be returned in the  tag: • Address is Valid • Invalid Delivery Address • Address is a Deliverable Address • Address is Deliverable after dropping building number • Address is a military address • Address is a general delivery address • Address missing building number • Premise number invalid • Box number missing • Address is a post office box • Address is a rural route • Address is rural route but designator missing • Address is valid but does not receive USPS mail • Address matched to unique ZIP"]
        AddressInputIsNotDeliverable,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a PO Box."]
        AddressInputIsPoBox,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Address is a correctional facility"]
        AddressInputIsCorrectionalFacility,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "This indicates that the input address provided by the consumer is a warm address. Warm addresses will be clarified further as to which type with the content of the <warm-address-list> value. Those are:  • mail drop • hospital  • hotel  • prison  • campground • college  • university  •    USPO  • General Delivery"]
        AddressInputIsWarm,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "The located address for the individual is not a deliverable address. If the setting to return additional information in the API has been enabled for an enterprise by our Customer Success team, the following details may be returned in the  tag: • Address is Valid • Invalid Delivery Address • Address is a Deliverable Address • Address is Deliverable after dropping building number • Address is a military address • Address is a general delivery address • Address missing building number • Premise number invalid •Box number missing • Address is a post office box • Address is a rural route • Address is rural route but designator missing • Address is valid but does not receive USPS mail • Address matched to unique ZIP"]
        AddressLocatedIsNotDeliverable,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a PO Box."]
        AddressLocatedIsPoBox,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "This indicates that the located address is a warm address. Warm addresses will be clarified further as to which type with the content of the <warm-address-list> value. Those are:  • mail drop • hospital  • hotel  • prison  • campground • college  • university  •   USPO  • General Delivery"]
        AddressLocatedIsWarm,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Identifies addresses with a known history of fraud activity."]
        AddressLocatedIsHighRiskAddress,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "Warns of the number of addresses someone has had within a defined time period."]
        AddressAlertVelocity,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "Indicates how often someone moves based on specific timeframe triggers."]
        AddressAlertStability,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "Specifies how long someone has lived at their current address."]
        AddressAlertLongevity,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "This indicates that only a single address record was located for the individual."]
        AddressAlertSingleAddressInFile,

        // ~~~~~~~~~ DOB ~~~~~~~~~~~~~~~

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "The year of birth located does not match. If neither the month-of-birth nor the year-of-birth match, this ID Note is presented."]
        DobYobDoesNotMatch,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Dob], description = "This indicates a discrepancy of one year between the YOB submitted and the YOB located. For example, if the YOB submitted is 1970 and the YOB located is 1971, this ID Note is presented."]
        DobYobDoesNotMatchWithin1Year,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Dob], description = "This indicates a discrepancy between the month of birth submitted and the month of birth located. This ID Note is only presented when the year-of-birth matches."]
        DobMobDoesNotMatch,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Dob], description = "This indicates that no month-of-birth was included in the records that were located."]
        DobMobNotAvailable,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Dob], description = "The individual was identified, but DOB information was not available in the records located. This does not mean the search failed. Numerous public-record data sources do not include DOB information in their records."]
        DobYobNotAvailable,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "Indicates that the subject is below the minimum age specified in the enterprise configuration."]
        DobLocatedAgeBelowMinimum,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "Indicates that the subject is above the maximum age specified in the enterprise configuration."]
        DobLocatedAgeAboveMaximum,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "Customer is 13 or under.  COPPA laws forbid conducting e-commerce with people under 14 years of age. When this result is encountered, the input information and located data will not be available in any record of the transaction due to the issues around storing data on children."]
        DobLocatedCoppaAlert,

        // ~~~~~~~~~~~~ SSN ~~~~~~~~~~~~

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "The individual was identified, but SSN information was not available. This does not mean the search failed. Numerous public-record data sources do not include SSN information in their records."]
        SsnNotAvailable,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "SSN found does not match SSN submitted. This does not necessarily mean the ID Located is invalid, especially when the MOB+YOB or YOB was provided as well. There can be errors in the located SSN data."]
        SsnDoesNotMatch,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "This indicates a discrepancy of one digit between the SSN submitted and the SSN located. If the SSN submitted is off by one digit from the located SSN, the ID Note is presented."]
        SsnDoesNotMatchWithin1Digit,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "Indicates that the Input SSN is an ITIN (Individual Taxpayer Identification Number)."]
        SsnInputIsItin,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "Indicates that the Located SSN is an ITIN (Individual Taxpayer Identification Number)."]
        SsnLocatedIsItin,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Ssn], description = "The SSN provided is tied to two or more individuals."]
        SsnInputTiedToMultipleNames,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "The input SSN does not match the structure of a valid SSN."]
        SsnInputIsInvalid,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "The located SSN does not match the structure of a valid SSN."]
        SsnLocatedIsInvalid,

        // ~~~~~~~~~~~~ Name ~~~~~~~~~~~~

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Name], description = "This indicates that the located first name does not match the input first name. Note: This ID Note must be enabled by a Customer Success account manager for use in your enterprise."]
        NameFirstDoesNotMatch,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Name], description = "This indicates that the located last name does not match the input last name."]
        NameLastDoesNotMatch,


        // ~~~~~~~~~~~~ IP Address ~~~~~~~~~~~~

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress, SignalScope::Address], description = "Indicates that the located IP State does not match the located State for the customer."]
        IpStateDoesNotMatch,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the IP address submitted does not fit the proper structure of an IP address and/or is found to be an unassigned IP address. This might also indicate that the IP address is a private or multicast address."]
        IpInputInvalid,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the IP address could not be located within data sources."]
        IpNotLocated,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the location of the IP address cannot be determined."]
        IpLocationNotAvailable,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the IP address is part of a network of computers infected with malware."]
        IpAlertHighRiskBot,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the IP address is associated with a device infected with malware."]
        IpAlertHighRiskSpam,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the IP address is associated with a TOR network."]
        IpAlertHighRiskTor,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "TODO"]
        IpAlertHighRiskProxy,

        // ~~~~~~~~~~~~ Email ~~~~~~~~~~~~
        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address is invalid or does not have the proper syntax of an email address."]
        EmailAddressInvalid,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address or domain does not exist."]
        EmailAddressOrDomainDoesNotExist,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Email], description = "Indicates that the email domain has been recently created. *Note: The default for this IS Note is less than 90 days. This value may be customized in the IDCenter"]
        EmailDomainRecentlyCreated,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "Indicates that the domain of the email address has been identified as belonging to a private individual."]
        EmailDomainPrivate,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "Indicates that the domain of the email address has been identified as belonging to a corporate entity."]
        EmailDomainCorporate,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "The email address is high risk because it was only recently verified in our databases."]
        EmailRecentlyVerified,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address is found to be from a country that is set as restricted within the Enterprise configuration."]
        EmailHighRiskCountry,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address has been reported as fraud or is potentially fraudulent. Possible fraud types that can be also be returned by the service include:  • Card Not Present Fraud  • Customer Dispute (Chargeback) • First Party Fraud • First Payment Default • Identity Theft (Fraud Application) • Identity Theft (Account Takeover) • Suspected Fraud (Not Confirmed) • Synthetic ID •Suspected Synthetic ID"]
        EmailHighRiskFraud,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "Indicates that the email address provided has been submitted with different variations that point to the same inbox (e.g. ab.c@gmail.com and abc@gmail.com) or the email is enumerated due to previous handle queries (e.g. abc123@gmail.com and abc43@gmail.com). This note will only be triggered for email addresses that display this pattern and also present significant risk based on our analysis to prevent false positives."]
        EmailHighRiskTumbled,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "Indicates that the email address provided is a temporary email address designed to self-destruct after a specific time period has passed."]
        EmailHighRiskDisposable,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "The domain has been reported as fraud or is potentially fraudulent."]
        EmailHighRiskDomain,

        // ~~~~~~~~~~~~ Phone Number ~~~~~~~~~~~~

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "The phone number submitted does not match the consumer's phone number."]
        PhoneNumberDoesNotMatch,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The phone number submitted was not a valid phone number."]
        PhoneNumberInputInvalid,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "The consumer's phone number could be tied to an answering service, page, or VoIP."]
        PhoneNumberLocatedIsVoip,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The “age” of the mobile account (account creation date) falls within the specified time range that the Enterprise is configured to monitor."]
        PhoneNumberMobileAccountLowAge,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Phone Number Change"]
        PhoneNumberMobileAccountEventPhoneNumberChange,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Network Status Change"]
        PhoneNumberMobileAccountEventNetworkStatusChange,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Number was ported"]
        PhoneNumberMobileAccountEventNumberWasPorted,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Device Change"]
        PhoneNumberMobileAccountEventDeviceChange,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = SIM Swap"]
        PhoneNumberMobileAccountEventSimSwap,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the type of mobile account being used to create the mobile identity. Account Type = Postpaid"]
        PhoneNumberMobileAccountTypePostpaid,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the type of mobile account being used to create the mobile identity. Account Type = Prepaid"]
        PhoneNumberMobileAccountTypePrepaid,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the type of mobile account being used to create the mobile identity. Account Type = Unknown"]
        PhoneNumberMobileAccountTypeUnknown,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the status of the mobile account. Account Status = Active"]
        PhoneNumberMobileAccountStatusActive,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the status of the mobile account. Account Status = Deactivated"]
        PhoneNumberMobileAccountStatusDeactivated,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the status of the mobile account. Account Status = Suspended"]
        PhoneNumberMobileAccountStatusSuspended,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the status of the mobile account. Account Status = Absent"]
        PhoneNumberMobileAccountStatusAbsent,

        // ~~~~~~~~~~~~ Identity ~~~~~~~~~~~~

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Identity], description = "Several valid records exist containing conflicting identifying information."]
        MultipleRecordsFound,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Identity], description = "The subject of the search was found at the address submitted, but a more recent record shows a different address for the individual. If a customer intentionally provides an old address and a new one is located, this result will occur, but it also results from a customer providing a current “home” address and the search locating newer real estate, like a second/vacation home or an investment property. Additionally, if the customer provides the address of an inherited property or a relative’s (sibling, parent, etc.) address when signing up for services, then this note could be triggered. Note: Additional parameters to set the address First Seen Date can be enabled through the Additional Risk Settings menu in the IDCenter."]
        NewerRecordFound,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Identity], description = "Records indicate that the subject in question is deceased."]
        SubjectDeceased,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn, SignalScope::Dob], description = "This indicates that the SSN number was issued before the individual’s DOB, a serious fraud flag."]
        SsnIssuedPriorToDob,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Identity], description = "This indicates that the record located had very little information, specifically only name + address (Personal Info or “PI” only), and lacks any information that can be used to link to other records."]
        ThinFile,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address, SignalScope::PhoneNumber], description = "The area code for the phone number provided does not match the input state provided."]
        InputPhoneNumberDoesNotMatchInputState,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address, SignalScope::PhoneNumber], description = "The area code for the phone number provided does not match any address is the located address history for the identity."]
        InputPhoneNumberDoesNotMatchLocatedStateHistory,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "IP address is not from the same state as the input phone number"]
        InputPhoneNumberDoesNotMatchIpState,


        // ~~~~~~~~~~~~ Alert Lists ~~~~~~~~~~~~

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "Indicates that the input SSN9 was found on the Alert List for the Enterprise."]
        AlertListSsn,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Indicates that the input Address was found on the Alert List for the Enterprise."]
        AlertListAddress,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Indicates that the input Address and Zip Code were found on the Alert List for the Enterprise."]
        AlertListAddressAndZip,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the input IP Address was found on the Alert List for the Enterprise."]
        AlertListIpAddress,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::PhoneNumber], description = "Indicates that the input Phone Number was found on the Alert List for the Enterprise."]
        AlertListPhoneNumber,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "Indicates that the input Email Address was found on the Alert List for the Enterprise."]
        AlertListEmailAddress,

        #[severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "Indicates that the input Email Domain was found on the Alert List for the enterprise."]
        AlertListEmailDomain,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "Indicates that the input Document Number was found on the Alert List for the enterprise."]
        AlertListDocumentNumber,

        // ~~~~~~~~~~~~ Document ~~~~~~~~~~~~

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "Unable to verify the document provided because either the front or back was unable to be read or because it failed the verification check."]
        DocumentNotVerified,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The OCR for the front of the document failed."]
        DocumentOcrNotSuccessful,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The reading and extracting of the barcode on the back of the document failed."]
        DocumentBarcodeCouldNotBeRead,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Document], description = "Indicates that further review of the document is required."]
        DocumentRequiresReview,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Document], description = "The document is expired."]
        DocumentExpired,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The document is from a country that has been labeled as high-risk in the enterprise settings."]
        DocumentFromRestrictedCountry,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "Indicates that the template type identified for the document provided is restricted in the Enterprise settings."]
        DocumentRestrictedTemplateType,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "Indicates that the document type provided is a not allowed for the Enterprise."]
        DocumentTypeNotAllowed,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "A field crosscheck (comparing data  on the front of the document to the back) failed during the document authentication."]
        DocumentFieldCrosscheckFailed,

        #[severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Document], description = "The Issuance Date, Expiration Date, or both do not align to the timeline of the identified document. The Issuance Date or the Expiration Date are not in a valid format."]
        DocumentInvalidIssuanceOrExpirationDate,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The layout, or relative positions of specifically identified features of the document, were not within the proper place, are missing, or show signs of tampering."]
        DocumentInvalidTemplateLayout,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The image of the document has evidence or appearances of being manipulated or tampered."]
        DocumentPossibleImageTampering,

        #[severity = SignalSeverity::High, scopes =  vec![SignalScope::Document, SignalScope::Selfie], description = "Indicates that the match score between the customer's captured selfie image and captured document was low."]
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

    use super::FootprintReasonCode;
    use super::SignalScope;
    use super::SignalSeverity;
    use std::cmp::Ordering;

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
}
