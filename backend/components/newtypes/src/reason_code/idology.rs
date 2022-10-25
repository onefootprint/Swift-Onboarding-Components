use super::{OldSignalSeverity, Signal, SignalScope};
use strum_macros::EnumString;

#[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString)]
#[serde(try_from = "&str")]
pub enum IDologyReasonCode {
    #[strum(to_string = "resultcode.coppa.alert")]
    #[doc = "Customer is 13 or under.  COPPA laws forbid conducting e-commerce with people under 14 years of age. When this result is encountered, the input information and located data will not be available in any record of the transaction due to the issues around storing data on children."]
    CoppaAlert,

    #[strum(to_string = "resultcode.address.does.not.match")]
    #[doc = "Address found does not match address submitted. This can be due to a typo in the input information, typos or errors in the address located, or the address is actually incorrect, but the subject’s credentials are located in or near the target ZIP code, city, or metropolitan area."]
    AddressDoesNotMatch,

    #[strum(to_string = "resultcode.street.name.does.not.match")]
    #[doc = "The submitted street name does not match the located data. This can be due to a typo in the input or the located data. This note will always be accompanied by the resultcode.address.does.not.match ID Note."]
    StreetNameDoesNotMatch,

    #[strum(to_string = "resultcode.street.number.does.not.match")]
    #[doc = "The submitted street number does not match the located data. This can be due to a typo in the input or the located data. This note will always be accompanied by the resultcode.address.does.not.match ID Note."]
    StreetNumberDoesNotMatch,

    #[strum(to_string = "resultcode.input.address.is.po.box")]
    #[doc = "The input address is a PO Box."]
    InputAddressIsPoBox,

    #[strum(to_string = "resultcode.located.address.is.po.box")]
    #[doc = "The located address is a PO Box."]
    LocatedAddressIsPoBox,

    #[strum(to_string = "resultcode.warm.input.address.alert")]
    #[doc = "This indicates that the input address provided by the consumer is a warm address. Warm addresses will be clarified further as to which type with the content of the <warm-address-list> value. Those are:  • mail drop • hospital  • hotel  • prison  • campground • college  • university  •    USPO  • General Delivery"]
    WarmInputAddressAlert,

    #[strum(to_string = "resultcode.warm.address.alert")]
    #[doc = "This indicates that the located address is a warm address. Warm addresses will be clarified further as to which type with the content of the <warm-address-list> value. Those are:  • mail drop • hospital  • hotel  • prison  • campground • college  • university  •   USPO  • General Delivery"]
    WarmAddressAlert,

    #[strum(to_string = "resultcode.zip.does.not.match")]
    #[doc = "ZIP code located does not match the ZIP code submitted."]
    ZipCodeDoesNotMatch,

    #[strum(to_string = "resultcode.input.address.is.not.deliverable")]
    #[doc = "The input address provided is not a deliverable address. If the setting to return additional information in the API has been enabled for an enterprise by our Customer Success team, the following details may be returned in the  tag: • Address is Valid • Invalid Delivery Address • Address is a Deliverable Address • Address is Deliverable after dropping building number • Address is a military address • Address is a general delivery address • Address missing building number • Premise number invalid • Box number missing • Address is a post office box • Address is a rural route • Address is rural route but designator missing • Address is valid but does not receive USPS mail • Address matched to unique ZIP"]
    InputAddressIsNotDeliverable,

    #[strum(to_string = "resultcode.located.address.is.not.deliverable")]
    #[doc = "The located address for the individual is not a deliverable address. If the setting to return additional information in the API has been enabled for an enterprise by our Customer Success team, the following details may be returned in the  tag: • Address is Valid • Invalid Delivery Address • Address is a Deliverable Address • Address is Deliverable after dropping building number • Address is a military address • Address is a general delivery address • Address missing building number • Premise number invalid •Box number missing • Address is a post office box • Address is a rural route • Address is rural route but designator missing • Address is valid but does not receive USPS mail • Address matched to unique ZIP"]
    LocatedAddressIsNotDeliverable,

    #[strum(to_string = "resultcode.yob.does.not.match")]
    #[doc = "The year of birth located does not match. If neither the month-of-birth nor the year-of-birth match, this ID Note is presented."]
    YobDoesNotMatch,

    #[strum(to_string = "resultcode.yob.within.one.year")]
    #[doc = "This indicates a discrepancy of one year between the YOB submitted and the YOB located. For example, if the YOB submitted is 1970 and the YOB located is 1971, this ID Note is presented."]
    YobDoesNotMatchWithin1YearTolerance,

    #[strum(to_string = "resultcode.mob.does.not.match")]
    #[doc = "This indicates a discrepancy between the month of birth submitted and the month of birth located. This ID Note is only presented when the year-of-birth matches."]
    MobDoesNotMatch,

    #[strum(to_string = "resultcode.no.mob.available")]
    #[doc = "This indicates that no month-of-birth was included in the records that were located."]
    MobNotAvailable,

    #[strum(to_string = "resultcode.multiple.records.found")]
    #[doc = "Several valid records exist containing conflicting identifying information."]
    MultipleRecordsFound,

    #[strum(to_string = "resultcode.newer.record.found")]
    #[doc = "The subject of the search was found at the address submitted, but a more recent record shows a different address for the individual. If a customer intentionally provides an old address and a new one is located, this result will occur, but it also results from a customer providing a current “home” address and the IDology search locating newer real estate, like a second/vacation home or an investment property. Additionally, if the customer provides the address of an inherited property or a relative’s (sibling, parent, etc.) address when signing up for services, then this note could be triggered. Note: Additional parameters to set the address First Seen Date can be enabled through the Additional Risk Settings menu in the IDCenter."]
    NewerRecordFound,

    #[strum(to_string = "resultcode.high.risk.address.alert")]
    #[doc = "Identifies addresses with a known history of fraud activity."]
    HighRiskAddress,

    #[strum(to_string = "resultcode.address.velocity.alert")]
    #[doc = "Warns of the number of addresses someone has had within a defined time period."]
    AddressVelocityAlert,

    #[strum(to_string = "resultcode.address.stability.alert")]
    #[doc = "Indicates how often someone moves based on specific timeframe triggers."]
    AddressStabilityAlert,

    #[strum(to_string = "resultcode.address.longevity.alert")]
    #[doc = "Specifies how long someone has lived at their current address."]
    AddressLongevityAlert,

    #[strum(to_string = "resultcode.address.location.alert")]
    #[doc = "A location-based alert that advises when the located ZIP Code exceeds the Enterprise’s Permitted Distance Radius rule."]
    AddressLocationAlert,

    #[strum(to_string = "resultcode.alternate.address.alert")]
    #[doc = "Indicates that the Alternate Address could not be verified for the customer. The Alert will be clarified further as to which type with the value of the <alternate-address-type> value.  Those are: • Street Number •   Street Name • State • ZIP Code"]
    AlternateAddressAlert,

    #[strum(to_string = "resultcode.no.dob.available")]
    #[doc = "The individual was identified, but DOB information was not available in the records located. This does not mean the search failed. Numerous public-record data sources do not include DOB information in their records."]
    DobyobNotAvailable,

    #[strum(to_string = "resultcode.ssn.not.available")]
    #[doc = "The individual was identified, but SSN information was not available. This does not mean the search failed. Numerous public-record data sources do not include SSN information in their records."]
    SsnNotAvailable,

    #[strum(to_string = "resultcode.ssn.does.not.match")]
    #[doc = "SSN found does not match SSN submitted. This does not necessarily mean the ID Located is invalid, especially when the MOB+YOB or YOB was provided as well. There can be errors in the located SSN data."]
    SsnDoesNotMatch,

    #[strum(to_string = "resultcode.ssn.within.one.digit")]
    #[doc = "This indicates a discrepancy of one digit between the SSN submitted and the SSN located. If the SSN submitted is off by one digit from the located SSN, the ID Note is presented."]
    SsnDoesNotMatchWithinTolerance,

    #[strum(to_string = "resultcode.input.ssn.is.itin")]
    #[doc = "Indicates that the Input SSN is an ITIN (Individual Taxpayer Identification Number)."]
    InputSsnIsItin,

    #[strum(to_string = "resultcode.located.itin")]
    #[doc = "Indicates that the Located SSN is an ITIN (Individual Taxpayer Identification Number)."]
    ItinLocated,

    #[strum(to_string = "resultcode.ssn.tied.to.multiple.names")]
    #[doc = "The SSN provided is tied to two or more individuals."]
    SsnTiedToMultipleNames,

    #[strum(to_string = "resultcode.subject.deceased")]
    #[doc = "Records indicate that the subject in question is deceased."]
    SubjectDeceased,

    #[strum(to_string = "resultcode.state.does.not.match")]
    #[doc = "This indicates that the State located does not match the state input as part of the address. This ID Note is a very specialized response and is only available if configured by IDology."]
    StateDoesNotMatch,

    #[strum(to_string = "resultcode.ssn.issued.prior.to.dob")]
    #[doc = "This indicates that the SSN number was issued before the individual’s DOB, a serious fraud flag."]
    SsnIssuedPriorToDob,

    #[strum(to_string = "resultcode.ssn.not.valid")]
    #[doc = "The located SSN does not match the structure of a valid SSN."]
    SsnIsInvalid,

    #[strum(to_string = "resultcode.single.address.in.file")]
    #[doc = "This indicates that only a single address record was located for the individual."]
    SingleAddressInFile,

    #[strum(to_string = "resultcode.data.strength.alert")]
    #[doc = "Examines how long someone has been in the public record system and how much data is available."]
    DataStrengthAlert,

    #[strum(to_string = "resultcode.activation.date.alert")]
    #[doc = "This indicates that the provided Purchase Date of the card is a particular set of days after the Activation Date."]
    ActivationDateAlert,

    #[strum(to_string = "resultcode.last.name.does.not.match")]
    #[doc = "This indicates that the located last name does not match the input last name."]
    LastNameDoesNotMatch,

    #[strum(to_string = "resultcode.thin.file")]
    #[doc = "This indicates that the record located had very little information, specifically only name + address (Personal Info or “PI” only), and lacks any information that can be used to link to other records."]
    ThinFile,

    #[strum(to_string = "resultcode.bankruptcy")]
    #[doc = "This indicates that the subject of the search has a chapter 7 or 13 bankruptcy in their public record."]
    BankruptcyFound,

    #[strum(to_string = "resultcode.age.below.minimum")]
    #[doc = "Indicates that the subject is below the minimum age specified in the enterprise configuration."]
    AgeBelowMinimum,

    #[strum(to_string = "resultcode.age.above.maximum")]
    #[doc = "Indicates that the subject is above the maximum age specified in the enterprise configuration."]
    AgeAboveMaximum,

    #[strum(to_string = "resultcode.blacklist.alert.ssn")]
    #[doc = "Indicates that the input SSN9 was found on the Alert List for the Enterprise."]
    AlertListAlertSsn,

    #[strum(to_string = "resultcode.blacklist.alert.address")]
    #[doc = "Indicates that the input Address was found on the Alert List for the Enterprise."]
    AlertListAlertAddress,

    #[strum(to_string = "resultcode.blacklist.alert.address.zip")]
    #[doc = "Indicates that the input Address and Zip Code were found on the Alert List for the Enterprise."]
    AlertListAlertAddressAndZip,

    #[strum(to_string = "resultcode.blacklist.alert.ip")]
    #[doc = "Indicates that the input IP Address was found on the Alert List for the Enterprise."]
    AlertListAlertIpAddress,

    #[strum(to_string = "resultcode.blacklist.alert.phone")]
    #[doc = "Indicates that the input Phone Number was found on the Alert List for the Enterprise."]
    AlertListAlertPhoneNumber,

    #[strum(to_string = "resultcode.blacklist.alert.email")]
    #[doc = "Indicates that the input Email Address was found on the Alert List for the Enterprise."]
    AlertListAlertEmailAddress,

    #[strum(to_string = "resultcode.blacklist.alert.domain")]
    #[doc = "Indicates that the input Email Domain was found on the Alert List for the enterprise."]
    AlertListAlertEmailDomain,

    #[strum(to_string = "resultcode.blacklist.alert.document.number")]
    #[doc = "Indicates that the input Document Number was found on the Alert List for the enterprise."]
    AlertListAlertDocumentNumber,

    #[strum(to_string = "resultcode.network.alert.ssn")]
    #[doc = "Indicates that the input SSN9 was found on the Network Alert List."]
    NetworkAlertSsn,

    #[strum(to_string = "resultcode.network.alert.address")]
    #[doc = "Indicates that the input Address was found on the Network Alert List."]
    NetworkAlertAddress,

    #[strum(to_string = "resultcode.network.alert.address.zip")]
    #[doc = "Indicates that the input Address and Zip Code were found on the Network Alert List."]
    NetworkAlertAddressAndZip,

    #[strum(to_string = "resultcode.network.alert.ip")]
    #[doc = "Indicates that the input IP Address was found on the Network Alert List."]
    NetworkAlertIpAddress,

    #[strum(to_string = "resultcode.network.alert.email")]
    #[doc = "Indicates that the input email address was found on the Network Alert List."]
    NetworkAlertEmail,

    #[strum(to_string = "resultcode.network.alert.phone")]
    #[doc = "Indicates that the input phone number was found on the Network Alert List."]
    NetworkAlertPhoneNumber,

    #[strum(to_string = "resultcode.network.alert.domain")]
    #[doc = "Indicates that the input email domain was found on the Network Alert List."]
    NetworkAlertEmailDomain,

    #[strum(to_string = "resultcode.network.alert.document.number")]
    #[doc = "Indicates that the input document number was found on the network alert list for the Enterprise."]
    NetworkAlertDocumentNumber,

    #[strum(to_string = "resultcode.ip.state.does.not.match")]
    #[doc = "Indicates that the located IP State does not match the located State for the customer."]
    IpStateDoesNotMatch,

    #[strum(to_string = "resultcode.ip.invalid")]
    #[doc = "Indicates that the IP address submitted does not fit the proper structure of an IP address and/or is found to be an unassigned IP address. This might also indicate that the IP address is a private or multicast address."]
    InvalidIp,

    #[strum(to_string = "resultcode.ip.not.located")]
    #[doc = "Indicates that the IP address could not be located within IDology data sources."]
    IpNotLocated,

    #[strum(to_string = "resultcode.high.risk.ip.bot")]
    #[doc = "Indicates that the IP address is part of a network of computers infected with malware."]
    HighRiskIpBot,

    #[strum(to_string = "resultcode.high.risk.ip.spam")]
    #[doc = "Indicates that the IP address is associated with a device infected with malware."]
    HighRiskIpSpam,

    #[strum(to_string = "resultcode.high.risk.ip.tor")]
    #[doc = "Indicates that the IP address is associated with a TOR network."]
    HighRiskIpTor,

    #[strum(to_string = "resultcode.ip.location.not.available")]
    #[doc = "Indicates that the location of the IP address cannot be determined."]
    IpLocationNotAvailable,

    #[strum(to_string = "resultcode.low.risk")]
    #[doc = "Triggered when the total ID Score is less than or equal to the value entered for the Low Risk threshold."]
    LowRisk,

    #[strum(to_string = "resultcode.medium.risk")]
    #[doc = "Triggered when the total ID Score is between the values entered for the Low and High Risk threshold."]
    MediumRisk,

    #[strum(to_string = "resultcode.high.risk")]
    #[doc = "Triggered when the total ID Score is greater than or equal to the value entered for the High Risk threshold."]
    HighRisk,

    #[strum(to_string = "resultcode.pa.dob.match")]
    #[doc = "Indicates that the input DOB matches the located DOB on the PA Watch List record."]
    PaDobMatch,

    #[strum(to_string = "resultcode.pa.dob.does.not.match")]
    #[doc = "Indicates that the input DOB does not match the located DOB on the PA Watch List record."]
    PaDobDoesNotMatch,

    #[strum(to_string = "resultcode.pa.dob.not.available")]
    #[doc = "Indicates that there is no located DOB on the PA Watch List record to match against the input DOB."]
    PaDobNotAvailable,

    #[strum(to_string = "resultcode.email.domain.does.not.exist")]
    #[doc = "The email address or domain does not exist."]
    EmailOrDomainDoesNotExist,

    #[strum(to_string = "resultcode.domain.recently.verified")]
    #[doc = "Indicates that the email domain has been recently created. *Note: The default for this IS Note is less than 90 days. This value may be customized in the IDCenter"]
    DomainRecentlyVerified,

    #[strum(to_string = "resultcode.private.email.domain")]
    #[doc = "Indicates that the domain of the email address has been identified as belonging to a private individual."]
    PrivateEmailDomain,

    #[strum(to_string = "resultcode.corporate.email.domain")]
    #[doc = "Indicates that the domain of the email address has been identified as belonging to a corporate entity."]
    CorporateEmailDomain,

    #[strum(to_string = "resultcode.high.risk.email.recently.verified")]
    #[doc = "The email address is high risk because it was only recently verified in our databases."]
    EmailRecentlyVerified,

    #[strum(to_string = "resultcode.high.risk.email.country")]
    #[doc = "The email address is found to be from a country that is set as restricted within the Enterprise configuration."]
    HighRiskEmailCountry,

    #[strum(to_string = "resultcode.high.risk.email.fraud")]
    #[doc = "The email address has been reported as fraud or is potentially fraudulent. Possible fraud types that can be also be returned by the service include:  • Card Not Present Fraud  • Customer Dispute (Chargeback) • First Party Fraud • First Payment Default • Identity Theft (Fraud Application) • Identity Theft (Account Takeover) • Suspected Fraud (Not Confirmed) • Synthetic ID •Suspected Synthetic ID"]
    HighRiskEmailFraud,

    #[strum(to_string = "resultcode.high.risk.email.tumbled")]
    #[doc = "Indicates that the email address provided has been submitted with different variations that point to the same inbox (e.g. ab.c@gmail.com and abc@gmail.com) or the email is enumerated due to previous handle queries (e.g. abc123@gmail.com and abc43@gmail.com). This note will only be triggered for email addresses that display this pattern and also present significant risk based on our analysis to prevent false positives."]
    HighRiskEmailTumbled,

    #[strum(to_string = "resultcode.high.risk.email.disposable")]
    #[doc = "Indicates that the email address provided is a temporary email address designed to self-destruct after a specific time period has passed."]
    HighRiskEmailDisposable,

    #[strum(to_string = "resultcode.high.risk.email.domain")]
    #[doc = "The domain has been reported as fraud or is potentially fraudulent."]
    HighRiskEmailDomain,

    #[strum(to_string = "resultcode.invalid.email.address")]
    #[doc = "The email address is invalid or does not have the proper syntax of an email address."]
    InvalidEmailAddress,

    #[strum(to_string = "resultcode.mobile.id.age.alert")]
    #[doc = "The “age” of the mobile account (account creation date) falls within the specified time range that the Enterprise is configured to monitor."]
    MobileIdAgeAlert,

    // TODO better parse these reason codes
    #[strum(to_string = "resultcode.mobile.change.event.[event]")]
    #[doc = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Possible Events: • Phone Number Change: resultcode.mobile.change.event.number  • Network Status Change: resultcode.mobile.change.event.status •   Number was ported: resultcode.mobile.change.event.ported •   Device Change: resultcode.mobile.change.event.device •   SIM Swap: resultcode.mobile.change.event.simswap"]
    MobileChangeEventevent,

    #[strum(to_string = "resultcode.mobile.account.type.[account type]")]
    #[doc = "Determines the type of mobile account being used to create the mobile identity. Possible Account Types: • Postpaid: resultcode.mobile.account.type.postpaid •  Prepaid: resultcode.mobile.account.type.prepaid •    Unknown: resultcode.mobile.account.type.unknown"]
    MobileAccountTypeaccountType,

    #[strum(to_string = "resultcode.mobile.account.status.[status]")]
    #[doc = "Determines the status of the mobile account. Possible Account Statuses: • Active: resultcode.mobile.account.status.active  •   Deactivated: resultcode.mobile.account.status.deactivated •  Suspended: resultcode.mobile.account.status.suspended •  Absent: resultcode.mobile.account.status.absent"]
    MobileAccountStatusstatus,

    #[strum(to_string = "resultcode.invalid.phone.number")]
    #[doc = "The phone number submitted was not a valid phone number."]
    InvalidPhoneNumber,

    #[strum(to_string = "idphone.match")]
    #[doc = "The phone number submitted matches the phone number for the consumer."]
    PhoneNumberMatch,

    #[strum(to_string = "idphone.does.not.match")]
    #[doc = "The phone number submitted does not match the consumer's phone number."]
    PhoneNumberDoesNotMatch,

    #[strum(to_string = "idphone.not.available")]
    #[doc = "The consumer's phone number is not available because it is unpublished, a mobile number, or is not on file."]
    PhoneNumberIsUnlistedOrUnavailable,

    #[strum(to_string = "idphone.wireless")]
    #[doc = "The consumer's phone number is possibly a wireless mobile number."]
    MobileNumber,

    #[strum(to_string = "idphone.pager")]
    #[doc = "The consumer's phone number could be tied to an answering service, page, or VoIP."]
    VoipNumber,

    #[strum(to_string = "resultcode.input.phone.number.does.not.match.input.state")]
    #[doc = "The area code for the phone number provided does not match the input state provided."]
    InputPhoneNumberDoesNotMatchInputState,

    #[strum(to_string = "resultcode.input.phone.number.does.not.match.located.state")]
    #[doc = "The area code for the phone number provided does not match any address is the located address history for the identity."]
    InputPhoneNumberDoesNotMatchLocatedStateHistory,

    #[strum(to_string = "resultcode.input.phone.number.does.not.match.ip.state")]
    #[doc = "The area code for the phone number provided does not match the state detected through the IP Address provided."]
    InputPhoneNumberDoesNotMatchIpState,
}

impl serde::Serialize for IDologyReasonCode {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.collect_str(self)
    }
}

// Tries to assign some gauge of risk to each reason code. Some are purely info that have no risk,
// others are high fraud signals.
// You could imagine a simple risk algorithm starts from a score of 100 and subtracts out for risky reason codes.
// Perhaps we take the max risk score (ie Alert(3) > Alert(2) per field/signal attribute, sum them up, and subtract from 100.
impl IDologyReasonCode {
    pub fn signal(self) -> Signal {
        use IDologyReasonCode::*;
        use OldSignalSeverity::*;
        use SignalScope::*;
        // These are frequent signal kinds and signal attributes that we may need to create
        let enterprise_blocked = Alert(5);
        let network_alert = Alert(10);

        let (kind, attributes) = match self {
            CoppaAlert => (Alert(10), vec![Dob]),
            AddressDoesNotMatch => (Alert(3), vec![StreetAddress]),
            StreetNameDoesNotMatch => (Alert(2), vec![StreetAddress]),
            StreetNumberDoesNotMatch => (Alert(2), vec![StreetAddress]),
            // Entered or found PO box is sketchy
            InputAddressIsPoBox => (Alert(4), vec![Address]),
            LocatedAddressIsPoBox => (Alert(5), vec![Address]),
            // TODO parse warm-address-list value
            WarmInputAddressAlert => (Alert(3), vec![Address]),
            WarmAddressAlert => (Alert(3), vec![Address]),
            ZipCodeDoesNotMatch => (Alert(1), vec![Zip]),
            InputAddressIsNotDeliverable => (Alert(1), vec![Address]),
            LocatedAddressIsNotDeliverable => (Alert(1), vec![Address]),
            YobDoesNotMatch => (Alert(3), vec![Dob]),
            YobDoesNotMatchWithin1YearTolerance => (Alert(2), vec![Dob]),
            MobDoesNotMatch => (Alert(3), vec![Dob]),
            MobNotAvailable => (NotFound, vec![Dob]),
            // TODO how do we handle this?
            //   Idology docs recommend sending KBA questions
            MultipleRecordsFound => (TODO, vec![]),
            NewerRecordFound => (Alert(1), vec![Address]),
            HighRiskAddress => (Fraud(2), vec![Address]),
            AddressVelocityAlert => (Alert(3), vec![Identity]),
            AddressStabilityAlert => (Alert(1), vec![Identity]),
            // TODO: This seems like more than a binary signal?
            AddressLongevityAlert => (TODO, vec![Identity]),
            AddressLocationAlert => (NotImportant, vec![Zip]),
            // TODO i don't think we provide this
            AlternateAddressAlert => (NotImportant, vec![Address]),
            DobyobNotAvailable => (NotFound, vec![Dob]),
            SsnNotAvailable => (NotFound, vec![Ssn]), // TODO how to treat Ssn?
            SsnDoesNotMatch => (Alert(3), vec![Ssn]),
            SsnDoesNotMatchWithinTolerance => (Alert(1), vec![Ssn]),
            InputSsnIsItin => (Info, vec![Ssn]), // I think ITIN is fine? what is an ITIN?
            ItinLocated => (Info, vec![Ssn]),
            SsnTiedToMultipleNames => (Alert(3), vec![Ssn]),
            SubjectDeceased => (Fraud(1), vec![Identity]), // Is this a strong fraud signal? Seems sketchy
            StateDoesNotMatch => (Alert(1), vec![State]),
            SsnIssuedPriorToDob => (Fraud(5), vec![Ssn]), // IDology notes specifically this is a serious fraud signal
            SsnIsInvalid => (InvalidRequest, vec![Ssn]),
            SingleAddressInFile => (Info, vec![Address]),
            // TODO doesn't seem like a binary signal
            DataStrengthAlert => (TODO, vec![Identity]),
            ActivationDateAlert => (NotImportant, vec![]),
            LastNameDoesNotMatch => (Alert(1), vec![Name]),
            ThinFile => (Alert(1), vec![Identity]),
            BankruptcyFound => (Info, vec![Identity]),
            // Only matters if we set in the enterprise config
            // TODO: do we want some signals to be an instant -> manual review?
            AgeBelowMinimum => (enterprise_blocked, vec![Dob]),
            AgeAboveMaximum => (enterprise_blocked, vec![Dob]),
            AlertListAlertSsn => (enterprise_blocked, vec![Ssn]),
            AlertListAlertAddress => (enterprise_blocked, vec![Address]),
            AlertListAlertAddressAndZip => (enterprise_blocked, vec![Address]),
            AlertListAlertIpAddress => (enterprise_blocked, vec![IpAddress]),
            AlertListAlertPhoneNumber => (enterprise_blocked, vec![PhoneNumber]),
            AlertListAlertEmailAddress => (enterprise_blocked, vec![Email]),
            AlertListAlertEmailDomain => (enterprise_blocked, vec![Email]),
            AlertListAlertDocumentNumber => (enterprise_blocked, vec![Document]),
            // TODO: how serious are these "network alert lists"?
            NetworkAlertSsn => (network_alert, vec![Ssn]),
            NetworkAlertAddress => (network_alert, vec![Address]),
            NetworkAlertAddressAndZip => (network_alert, vec![Address]),
            NetworkAlertIpAddress => (network_alert, vec![IpAddress]),
            NetworkAlertEmail => (network_alert, vec![Email]),
            NetworkAlertPhoneNumber => (network_alert, vec![PhoneNumber]),
            NetworkAlertEmailDomain => (network_alert, vec![Email]),
            NetworkAlertDocumentNumber => (network_alert, vec![Document]),

            IpStateDoesNotMatch => (Alert(1), vec![IpAddress]),
            InvalidIp => (InvalidRequest, vec![IpAddress]),
            IpNotLocated => (NotFound, vec![IpAddress]),
            HighRiskIpBot => (Fraud(3), vec![IpAddress]),
            HighRiskIpSpam => (Fraud(3), vec![IpAddress]),
            HighRiskIpTor => (Fraud(3), vec![IpAddress]),
            IpLocationNotAvailable => (Alert(1), vec![IpAddress]),
            // Only matters if set via enterprise configuration
            LowRisk => (Alert(2), vec![Identity]),
            MediumRisk => (Alert(4), vec![Identity]),
            HighRisk => (Alert(6), vec![Identity]),
            // TODO how serious is this?
            PaDobMatch => (Alert(2), vec![Dob]),
            // Do these even matter? idgi
            PaDobDoesNotMatch => (Info, vec![Dob]),
            PaDobNotAvailable => (Info, vec![]),

            EmailOrDomainDoesNotExist => (Alert(1), vec![Email]),
            DomainRecentlyVerified => (Alert(1), vec![Email]),
            PrivateEmailDomain => (Info, vec![Email]), // Don't think this is a fraud signal
            CorporateEmailDomain => (Info, vec![Email]),
            EmailRecentlyVerified => (Alert(3), vec![Email]),
            HighRiskEmailCountry => (Alert(5), vec![Email]),
            HighRiskEmailFraud => (Fraud(5), vec![Email]),
            HighRiskEmailTumbled => (Fraud(1), vec![Email]), // IDology notes they only send this for high risk emails
            HighRiskEmailDisposable => (Alert(1), vec![Email]),
            HighRiskEmailDomain => (Fraud(3), vec![Email]),
            InvalidEmailAddress => (InvalidRequest, vec![Email]),
            // TODO: Enterprise-specific
            MobileIdAgeAlert => (enterprise_blocked, vec![Dob]),
            // TODO not parsing these properly
            MobileChangeEventevent => (TODO, vec![]),
            MobileAccountTypeaccountType => (TODO, vec![]),
            MobileAccountStatusstatus => (TODO, vec![]),
            InvalidPhoneNumber => (InvalidRequest, vec![PhoneNumber]),
            PhoneNumberMatch => (Info, vec![PhoneNumber]), // TODO should we have negative scores?
            PhoneNumberDoesNotMatch => (Alert(2), vec![PhoneNumber]),
            PhoneNumberIsUnlistedOrUnavailable => (NotFound, vec![PhoneNumber]),
            MobileNumber => (Info, vec![PhoneNumber]),
            VoipNumber => (Info, vec![PhoneNumber]),
            // How bad are these?
            InputPhoneNumberDoesNotMatchInputState => (Info, vec![PhoneNumber, State]),
            InputPhoneNumberDoesNotMatchLocatedStateHistory => (Info, vec![PhoneNumber, State]),
            InputPhoneNumberDoesNotMatchIpState => (Alert(1), vec![PhoneNumber, IpAddress]),
        };
        Signal {
            kind,
            scopes: attributes,
            note: self.to_string(),
        }
    }
}
