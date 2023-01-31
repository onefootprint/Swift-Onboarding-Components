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
    )]
    #[strum(serialize_all = "snake_case")]
    #[serde(rename_all = "snake_case")]
    #[diesel(sql_type = Text)]
    pub enum FootprintReasonCode {

        // ~~~~~~~~~ Address ~~~~~~~~~~~~~~~

        #[note = "Address does not match", severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Address found does not match address submitted. This can be due to a typo in the input information, typos or errors in the address located, or the address is actually incorrect, but the subject’s credentials are located in or near the target ZIP code, city, or metropolitan area."]
        AddressDoesNotMatch,

        #[note = "Zip code does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "ZIP code located does not match the ZIP code submitted."]
        AddressZipCodeDoesNotMatch,

        #[note = "Street name does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::StreetAddress], description = "The submitted street name does not match the located data. This can be due to a typo in the input or the located data. This note will always be accompanied by the resultcode.address.does.not.match ID Note."]
        AddressStreetNameDoesNotMatch,

        #[note = "Street number does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::StreetAddress], description = "The submitted street number does not match the located data. This can be due to a typo in the input or the located data. This note will always be accompanied by the resultcode.address.does.not.match ID Note."]
        AddressStreetNumberDoesNotMatch,

        #[note = "State does not match", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "This indicates that the State located does not match the state input as part of the address."]
        AddressStateDoesNotMatch,

        #[note = "Address is not deliverable", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "The input address provided is not a deliverable address. If the setting to return additional information in the API has been enabled for an enterprise by our Customer Success team, the following details may be returned in the  tag: • Address is Valid • Invalid Delivery Address • Address is a Deliverable Address • Address is Deliverable after dropping building number • Address is a military address • Address is a general delivery address • Address missing building number • Premise number invalid • Box number missing • Address is a post office box • Address is a rural route • Address is rural route but designator missing • Address is valid but does not receive USPS mail • Address matched to unique ZIP"]
        AddressInputIsNotDeliverable,

        #[note = "Address is PO box", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The input address is a PO Box."]
        AddressInputIsPoBox,

        #[note = "Address is correctional facility", severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Address is a correctional facility"]
        AddressInputIsCorrectionalFacility,

        #[note = "Warm address", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "This indicates that the input address provided by the consumer is a warm address. Warm addresses will be clarified further as to which type with the content of the <warm-address-list> value. Those are:  • mail drop • hospital  • hotel  • prison  • campground • college  • university  •    USPO  • General Delivery"]
        AddressInputIsWarm,

        #[note = "Located address not deliverable", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "The located address for the individual is not a deliverable address. If the setting to return additional information in the API has been enabled for an enterprise by our Customer Success team, the following details may be returned in the  tag: • Address is Valid • Invalid Delivery Address • Address is a Deliverable Address • Address is Deliverable after dropping building number • Address is a military address • Address is a general delivery address • Address missing building number • Premise number invalid •Box number missing • Address is a post office box • Address is a rural route • Address is rural route but designator missing • Address is valid but does not receive USPS mail • Address matched to unique ZIP"]
        AddressLocatedIsNotDeliverable,

        #[note = "Located address is PO box", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "The located address is a PO Box."]
        AddressLocatedIsPoBox,

        #[note = "Located address is warm", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "This indicates that the located address is a warm address. Warm addresses will be clarified further as to which type with the content of the <warm-address-list> value. Those are:  • mail drop • hospital  • hotel  • prison  • campground • college  • university  •   USPO  • General Delivery"]
        AddressLocatedIsWarm,

        #[note = "Located address is high risk", severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Identifies addresses with a known history of fraud activity."]
        AddressLocatedIsHighRiskAddress,

        #[note = "High velocity address", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Address], description = "Warns of the number of addresses someone has had within a defined time period."]
        AddressAlertVelocity,

        #[note = "Address stability alert", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "Indicates how often someone moves based on specific timeframe triggers."]
        AddressAlertStability,

        #[note = "Address longevity alert", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "Specifies how long someone has lived at their current address."]
        AddressAlertLongevity,

        #[note = "Single address located", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "This indicates that only a single address record was located for the individual."]
        AddressAlertSingleAddressInFile,

        #[note = "Newer address found", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "The subject of the search was found at the address submitted, but a more recent record shows a different address for the individual. If a customer intentionally provides an old address and a new one is located, this result will occur, but it also results from a customer providing a current “home” address and the search locating newer real estate, like a second/vacation home or an investment property. Additionally, if the customer provides the address of an inherited property or a relative’s (sibling, parent, etc.) address when signing up for services, then this note could be triggered. Note: Additional parameters to set the address First Seen Date can be enabled through the Additional Risk Settings menu in the IDCenter."]
        NewerRecordFound,

        // ~~~~~~~~~ DOB ~~~~~~~~~~~~~~~

        #[note = "DOB year mismatch", severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "The year of birth located does not match. If neither the month-of-birth nor the year-of-birth match, this ID Note is presented."]
        DobYobDoesNotMatch,

        #[note = "DOB year mismatch by 1", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Dob], description = "This indicates a discrepancy of one year between the YOB submitted and the YOB located. For example, if the YOB submitted is 1970 and the YOB located is 1971, this ID Note is presented."]
        DobYobDoesNotMatchWithin1Year,

        #[note = "DOB month mismatch", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Dob], description = "This indicates a discrepancy between the month of birth submitted and the month of birth located. This ID Note is only presented when the year-of-birth matches."]
        DobMobDoesNotMatch,

        #[note = "DOB month unavailable", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Dob], description = "This indicates that no month-of-birth was included in the records that were located."]
        DobMobNotAvailable,

        #[note = "DOB year unavailable", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Dob], description = "The individual was identified, but DOB information was not available in the records located. This does not mean the search failed. Numerous public-record data sources do not include DOB information in their records."]
        DobYobNotAvailable,

        #[note = "Age below minimum", severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "Indicates that the subject is below the minimum age specified in the enterprise configuration."]
        DobLocatedAgeBelowMinimum,

        #[note = "Age above maximum", severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "Indicates that the subject is above the maximum age specified in the enterprise configuration."]
        DobLocatedAgeAboveMaximum,

        #[note = "Age COPPA alert", severity = SignalSeverity::High, scopes =  vec![SignalScope::Dob], description = "Customer is 13 or under.  COPPA laws forbid conducting e-commerce with people under 14 years of age. When this result is encountered, the input information and located data will not be available in any record of the transaction due to the issues around storing data on children."]
        DobLocatedCoppaAlert,

        // ~~~~~~~~~~~~ SSN ~~~~~~~~~~~~

        #[note = "SSN not available", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "The individual was identified, but SSN information was not available. This does not mean the search failed. Numerous public-record data sources do not include SSN information in their records."]
        SsnNotAvailable,

        #[note = "SSN does not match", severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "SSN found does not match SSN submitted. This does not necessarily mean the ID Located is invalid, especially when the MOB+YOB or YOB was provided as well. There can be errors in the located SSN data."]
        SsnDoesNotMatch,

        #[note = "SSN off by one digit", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "This indicates a discrepancy of one digit between the SSN submitted and the SSN located. If the SSN submitted is off by one digit from the located SSN, the ID Note is presented."]
        SsnDoesNotMatchWithin1Digit,

        #[note = "Input SSN is ITIN", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "Indicates that the Input SSN is an ITIN (Individual Taxpayer Identification Number)."]
        SsnInputIsItin,

        #[note = "Located SSN is ITIN", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Ssn], description = "Indicates that the Located SSN is an ITIN (Individual Taxpayer Identification Number)."]
        SsnLocatedIsItin,

        #[note = "SSN tied to multiple names", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Ssn], description = "The SSN provided is tied to two or more individuals."]
        SsnInputTiedToMultipleNames,

        #[note = "Input SSN invalid", severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "The input SSN does not match the structure of a valid SSN."]
        SsnInputIsInvalid,

        #[note = "Located SSN invalid", severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "The located SSN does not match the structure of a valid SSN."]
        SsnLocatedIsInvalid,

        // ~~~~~~~~~~~~ Name ~~~~~~~~~~~~

        #[note = "First name does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Name], description = "This indicates that the located first name does not match the input first name. Note: This ID Note must be enabled by a Customer Success account manager for use in your enterprise."]
        NameFirstDoesNotMatch,

        #[note = "Last name does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Name], description = "This indicates that the located last name does not match the input last name."]
        NameLastDoesNotMatch,


        // ~~~~~~~~~~~~ IP Address ~~~~~~~~~~~~

        #[note = "IP state does not match", severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress, SignalScope::Address], description = "Indicates that the located IP State does not match the located State for the customer."]
        IpStateDoesNotMatch,

        #[note = "Input IP invalid", severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the IP address submitted does not fit the proper structure of an IP address and/or is found to be an unassigned IP address. This might also indicate that the IP address is a private or multicast address."]
        IpInputInvalid,

        #[note = "IP not located", severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the IP address could not be located within data sources."]
        IpNotLocated,

        #[note = "IP location unavailable", severity = SignalSeverity::Low, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the location of the IP address cannot be determined."]
        IpLocationNotAvailable,

        #[note = "IP high risk bot", severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the IP address is part of a network of computers infected with malware."]
        IpAlertHighRiskBot,

        #[note = "IP high risk spam", severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the IP address is associated with a device infected with malware."]
        IpAlertHighRiskSpam,

        #[note = "IP high risk TOR", severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the IP address is associated with a TOR network."]
        IpAlertHighRiskTor,

        #[note = "IP high risk proxy", severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "TODO"]
        IpAlertHighRiskProxy,

        // ~~~~~~~~~~~~ Email ~~~~~~~~~~~~
        #[note = "Email address invalid", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address is invalid or does not have the proper syntax of an email address."]
        EmailAddressInvalid,

        #[note = "Email address does not exist", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address or domain does not exist."]
        EmailAddressOrDomainDoesNotExist,

        #[note = "Domain recently created", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Email], description = "Indicates that the email domain has been recently created. *Note: The default for this IS Note is less than 90 days. This value may be customized in the IDCenter"]
        EmailDomainRecentlyCreated,

        #[note = "Private email domain", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "Indicates that the domain of the email address has been identified as belonging to a private individual."]
        EmailDomainPrivate,

        #[note = "Corporate email domain", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "Indicates that the domain of the email address has been identified as belonging to a corporate entity."]
        EmailDomainCorporate,

        #[note = "Email recently verified", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "The email address is high risk because it was only recently verified in our databases."]
        EmailRecentlyVerified,

        #[note = "Email from high risk country", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address is found to be from a country that is set as restricted within the Enterprise configuration."]
        EmailHighRiskCountry,

        #[note = "High risk fraud email", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "The email address has been reported as fraud or is potentially fraudulent. Possible fraud types that can be also be returned by the service include:  • Card Not Present Fraud  • Customer Dispute (Chargeback) • First Party Fraud • First Payment Default • Identity Theft (Fraud Application) • Identity Theft (Account Takeover) • Suspected Fraud (Not Confirmed) • Synthetic ID •Suspected Synthetic ID"]
        EmailHighRiskFraud,

        #[note = "High risk tumbled email", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "Indicates that the email address provided has been submitted with different variations that point to the same inbox (e.g. ab.c@gmail.com and abc@gmail.com) or the email is enumerated due to previous handle queries (e.g. abc123@gmail.com and abc43@gmail.com). This note will only be triggered for email addresses that display this pattern and also present significant risk based on our analysis to prevent false positives."]
        EmailHighRiskTumbled,

        #[note = "High risk dispoable email", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "Indicates that the email address provided is a temporary email address designed to self-destruct after a specific time period has passed."]
        EmailHighRiskDisposable,

        #[note = "High risk email domain", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "The domain has been reported as fraud or is potentially fraudulent."]
        EmailHighRiskDomain,

        // ~~~~~~~~~~~~ Phone Number ~~~~~~~~~~~~

        #[note = "Phone number does not match", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "The phone number submitted does not match the consumer's phone number."]
        PhoneNumberDoesNotMatch,

        #[note = "Phone number invalid", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The phone number submitted was not a valid phone number."]
        PhoneNumberInputInvalid,

        #[note = "VOIP phone number", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "The consumer's phone number could be tied to an answering service, page, or VoIP."]
        PhoneNumberLocatedIsVoip,

        #[note = "Low age phone number", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "The “age” of the mobile account (account creation date) falls within the specified time range that the Enterprise is configured to monitor."]
        PhoneNumberMobileAccountLowAge,

        #[note = "Recent phone number change", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Phone Number Change"]
        PhoneNumberMobileAccountEventPhoneNumberChange,

        #[note = "Recent phone network changed", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Network Status Change"]
        PhoneNumberMobileAccountEventNetworkStatusChange,

        #[note = "Recent phone number port", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Number was ported"]
        PhoneNumberMobileAccountEventNumberWasPorted,

        #[note = "Recent mobile account change", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Device Change"]
        PhoneNumberMobileAccountEventDeviceChange,

        #[note = "Recent SIM swap", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = SIM Swap"]
        PhoneNumberMobileAccountEventSimSwap,

        #[note = "Postpaid phone number", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the type of mobile account being used to create the mobile identity. Account Type = Postpaid"]
        PhoneNumberMobileAccountTypePostpaid,

        #[note = "Prepaid phone number", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the type of mobile account being used to create the mobile identity. Account Type = Prepaid"]
        PhoneNumberMobileAccountTypePrepaid,

        #[note = "Mobile account unknown", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the type of mobile account being used to create the mobile identity. Account Type = Unknown"]
        PhoneNumberMobileAccountTypeUnknown,

        #[note = "Mobile account active", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the status of the mobile account. Account Status = Active"]
        PhoneNumberMobileAccountStatusActive,

        #[note = "Mobile account deactivated", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the status of the mobile account. Account Status = Deactivated"]
        PhoneNumberMobileAccountStatusDeactivated,

        #[note = "Mobile account suspended", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the status of the mobile account. Account Status = Suspended"]
        PhoneNumberMobileAccountStatusSuspended,

        #[note = "Mobile status absent", severity = SignalSeverity::Low, scopes =  vec![SignalScope::PhoneNumber], description = "Determines the status of the mobile account. Account Status = Absent"]
        PhoneNumberMobileAccountStatusAbsent,

        // ~~~~~~~~~~~~ Identity ~~~~~~~~~~~~

        #[note = "Multiple identities found", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Identity], description = "Several valid records exist containing conflicting identifying information."]
        MultipleRecordsFound,

        #[note = "Subject deceased", severity = SignalSeverity::High, scopes =  vec![SignalScope::Identity], description = "Records indicate that the subject in question is deceased."]
        SubjectDeceased,

        #[note = "SSN issued before DOB", severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn, SignalScope::Dob], description = "This indicates that the SSN number was issued before the individual’s DOB, a serious fraud flag."]
        SsnIssuedPriorToDob,

        #[note = "Thin file", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Identity], description = "This indicates that the record located had very little information, specifically only name + address (Personal Info or “PI” only), and lacks any information that can be used to link to other records."]
        ThinFile,

        #[note = "Area code doesn't match state", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address, SignalScope::PhoneNumber], description = "The area code for the phone number provided does not match the input state provided."]
        InputPhoneNumberDoesNotMatchInputState,

        #[note = "Area code doesn't match located state", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address, SignalScope::PhoneNumber], description = "The area code for the phone number provided does not match any address is the located address history for the identity."]
        InputPhoneNumberDoesNotMatchLocatedStateHistory,

        #[note = "Are code doesn't match IP address state", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Address], description = "IP address is not from the same state as the input phone number"]
        InputPhoneNumberDoesNotMatchIpState,


        // ~~~~~~~~~~~~ Alert Lists ~~~~~~~~~~~~

        #[note = "SSN is on alert list", severity = SignalSeverity::High, scopes =  vec![SignalScope::Ssn], description = "Indicates that the input SSN9 was found on the Alert List for the Enterprise."]
        AlertListSsn,

        #[note = "Address is on alert list", severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Indicates that the input Address was found on the Alert List for the Enterprise."]
        AlertListAddress,

        #[note = "Address and zip on alert list", severity = SignalSeverity::High, scopes =  vec![SignalScope::Address], description = "Indicates that the input Address and Zip Code were found on the Alert List for the Enterprise."]
        AlertListAddressAndZip,

        #[note = "IP address on alert list", severity = SignalSeverity::High, scopes =  vec![SignalScope::IpAddress], description = "Indicates that the input IP Address was found on the Alert List for the Enterprise."]
        AlertListIpAddress,

        #[note = "Phone number on alert list", severity = SignalSeverity::High, scopes =  vec![SignalScope::PhoneNumber], description = "Indicates that the input Phone Number was found on the Alert List for the Enterprise."]
        AlertListPhoneNumber,

        #[note = "Email address on alert list", severity = SignalSeverity::High, scopes =  vec![SignalScope::Email], description = "Indicates that the input Email Address was found on the Alert List for the Enterprise."]
        AlertListEmailAddress,

        #[note = "Email domain on alert list", severity = SignalSeverity::Low, scopes =  vec![SignalScope::Email], description = "Indicates that the input Email Domain was found on the Alert List for the enterprise."]
        AlertListEmailDomain,

        #[note = "Document number on alert list", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "Indicates that the input Document Number was found on the Alert List for the enterprise."]
        AlertListDocumentNumber,

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

        #[note = "Document from restricted country", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The document is from a country that has been labeled as high-risk in the enterprise settings."]
        DocumentFromRestrictedCountry,

        #[note = "Document type restricted", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "Indicates that the template type identified for the document provided is restricted in the Enterprise settings."]
        DocumentRestrictedTemplateType,

        #[note = "Document type not allowed", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "Indicates that the document type provided is a not allowed for the Enterprise."]
        DocumentTypeNotAllowed,

        #[note = "Document crosscheck failed", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "A field crosscheck (comparing data  on the front of the document to the back) failed during the document authentication."]
        DocumentFieldCrosscheckFailed,

        #[note = "Document invalid issuance or expiration", severity = SignalSeverity::Medium, scopes =  vec![SignalScope::Document], description = "The Issuance Date, Expiration Date, or both do not align to the timeline of the identified document. The Issuance Date or the Expiration Date are not in a valid format."]
        DocumentInvalidIssuanceOrExpirationDate,

        #[note = "Document invalid template layout", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The layout, or relative positions of specifically identified features of the document, were not within the proper place, are missing, or show signs of tampering."]
        DocumentInvalidTemplateLayout,

        #[note = "Document image possible tampering", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document], description = "The image of the document has evidence or appearances of being manipulated or tampered."]
        DocumentPossibleImageTampering,

        #[note = "Document low match with selfie", severity = SignalSeverity::High, scopes =  vec![SignalScope::Document, SignalScope::Selfie], description = "Indicates that the match score between the customer's captured selfie image and captured document was low."]
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
