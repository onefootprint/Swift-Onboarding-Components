#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(untagged)]
pub enum ReasonCode {
    IDology(IDologyReasonCode),
    Other(String),
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Serialize, serde::Deserialize)]
pub enum IDologyReasonCode {
    #[serde(rename = "resultcode.coppa.alert")]
    #[doc = "Customer is 13 or under.  COPPA laws forbid conducting e-commerce with people under 14 years of age. When this result is encountered, the input information and located data will not be available in any record of the transaction due to the issues around storing data on children."]
    CoppaAlert,

    #[serde(rename = "resultcode.address.does.not.match")]
    #[doc = "Address found does not match address submitted. This can be due to a typo in the input information, typos or errors in the address located, or the address is actually incorrect, but the subject’s credentials are located in or near the target ZIP code, city, or metropolitan area."]
    AddressDoesNotMatch,

    #[serde(rename = "resultcode.street.name.does.not.match")]
    #[doc = "The submitted street name does not match the located data. This can be due to a typo in the input or the located data. This note will always be accompanied by the resultcode.address.does.not.match ID Note."]
    StreetNameDoesNotMatch,

    #[serde(rename = "resultcode.street.number.does.not.match")]
    #[doc = "The submitted street number does not match the located data. This can be due to a typo in the input or the located data. This note will always be accompanied by the resultcode.address.does.not.match ID Note."]
    StreetNumberDoesNotMatch,

    #[serde(rename = "resultcode.input.address.is.po.box")]
    #[doc = "The input address is a PO Box."]
    InputAddressIsPoBox,

    #[serde(rename = "resultcode.located.address.is.po.box")]
    #[doc = "The located address is a PO Box."]
    LocatedAddressIsPoBox,

    #[serde(rename = "resultcode.warm.input.address.alert")]
    #[doc = "This indicates that the input address provided by the consumer is a warm address. Warm addresses will be clarified further as to which type with the content of the <warm-address-list> value. Those are:  • mail drop • hospital  • hotel  • prison  • campground • college  • university  •    USPO  • General Delivery"]
    WarmInputAddressAlert,

    #[serde(rename = "resultcode.warm.address.alert")]
    #[doc = "This indicates that the located address is a warm address. Warm addresses will be clarified further as to which type with the content of the <warm-address-list> value. Those are:  • mail drop • hospital  • hotel  • prison  • campground • college  • university  •   USPO  • General Delivery"]
    WarmAddressAlert,

    #[serde(rename = "resultcode.zip.does.not.match")]
    #[doc = "ZIP code located does not match the ZIP code submitted."]
    ZipCodeDoesNotMatch,

    #[serde(rename = "resultcode.input.address.is.not.deliverable")]
    #[doc = "The input address provided is not a deliverable address. If the setting to return additional information in the API has been enabled for an enterprise by our Customer Success team, the following details may be returned in the  tag: • Address is Valid • Invalid Delivery Address • Address is a Deliverable Address • Address is Deliverable after dropping building number • Address is a military address • Address is a general delivery address • Address missing building number • Premise number invalid • Box number missing • Address is a post office box • Address is a rural route • Address is rural route but designator missing • Address is valid but does not receive USPS mail • Address matched to unique ZIP"]
    InputAddressIsNotDeliverable,

    #[serde(rename = "resultcode.located.address.is.not.deliverable")]
    #[doc = "The located address for the individual is not a deliverable address. If the setting to return additional information in the API has been enabled for an enterprise by our Customer Success team, the following details may be returned in the  tag: • Address is Valid • Invalid Delivery Address • Address is a Deliverable Address • Address is Deliverable after dropping building number • Address is a military address • Address is a general delivery address • Address missing building number • Premise number invalid •Box number missing • Address is a post office box • Address is a rural route • Address is rural route but designator missing • Address is valid but does not receive USPS mail • Address matched to unique ZIP"]
    LocatedAddressIsNotDeliverable,

    #[serde(rename = "resultcode.yob.does.not.match")]
    #[doc = "The year of birth located does not match. If neither the month-of-birth nor the year-of-birth match, this ID Note is presented."]
    YobDoesNotMatch,

    #[serde(rename = "resultcode.yob.within.one.year")]
    #[doc = "This indicates a discrepancy of one year between the YOB submitted and the YOB located. For example, if the YOB submitted is 1970 and the YOB located is 1971, this ID Note is presented."]
    YobDoesNotMatchWithin1YearTolerance,

    #[serde(rename = "resultcode.mob.does.not.match")]
    #[doc = "This indicates a discrepancy between the month of birth submitted and the month of birth located. This ID Note is only presented when the year-of-birth matches."]
    MobDoesNotMatch,

    #[serde(rename = "resultcode.no.mob.available")]
    #[doc = "This indicates that no month-of-birth was included in the records that were located."]
    MobNotAvailable,

    #[serde(rename = "resultcode.multiple.records.found")]
    #[doc = "Several valid records exist containing conflicting identifying information."]
    MultipleRecordsFound,

    #[serde(rename = "resultcode.newer.record.found")]
    #[doc = "The subject of the search was found at the address submitted, but a more recent record shows a different address for the individual. If a customer intentionally provides an old address and a new one is located, this result will occur, but it also results from a customer providing a current “home” address and the IDology search locating newer real estate, like a second/vacation home or an investment property. Additionally, if the customer provides the address of an inherited property or a relative’s (sibling, parent, etc.) address when signing up for services, then this note could be triggered. Note: Additional parameters to set the address First Seen Date can be enabled through the Additional Risk Settings menu in the IDCenter."]
    NewerRecordFound,

    #[serde(rename = "resultcode.high.risk.address.alert")]
    #[doc = "Identifies addresses with a known history of fraud activity."]
    HighRiskAddress,

    #[serde(rename = "resultcode.address.velocity.alert")]
    #[doc = "Warns of the number of addresses someone has had within a defined time period."]
    AddressVelocityAlert,

    #[serde(rename = "resultcode.address.stability.alert")]
    #[doc = "Indicates how often someone moves based on specific timeframe triggers."]
    AddressStabilityAlert,

    #[serde(rename = "resultcode.address.longevity.alert")]
    #[doc = "Specifies how long someone has lived at their current address."]
    AddressLongevityAlert,

    #[serde(rename = "resultcode.address.location.alert")]
    #[doc = "A location-based alert that advises when the located ZIP Code exceeds the Enterprise’s Permitted Distance Radius rule."]
    AddressLocationAlert,

    #[serde(rename = "resultcode.alternate.address.alert")]
    #[doc = "Indicates that the Alternate Address could not be verified for the customer. The Alert will be clarified further as to which type with the value of the <alternate-address-type> value.  Those are: • Street Number •   Street Name • State • ZIP Code"]
    AlternateAddressAlert,

    #[serde(rename = "resultcode.no.dob.available")]
    #[doc = "The individual was identified, but DOB information was not available in the records located. This does not mean the search failed. Numerous public-record data sources do not include DOB information in their records."]
    DobyobNotAvailable,

    #[serde(rename = "resultcode.ssn.not.available")]
    #[doc = "The individual was identified, but SSN information was not available. This does not mean the search failed. Numerous public-record data sources do not include SSN information in their records."]
    SsnNotAvailable,

    #[serde(rename = "resultcode.ssn.does.not.match")]
    #[doc = "SSN found does not match SSN submitted. This does not necessarily mean the ID Located is invalid, especially when the MOB+YOB or YOB was provided as well. There can be errors in the located SSN data."]
    SsnDoesNotMatch,

    #[serde(rename = "resultcode.ssn.within.one.digit")]
    #[doc = "This indicates a discrepancy of one digit between the SSN submitted and the SSN located. If the SSN submitted is off by one digit from the located SSN, the ID Note is presented."]
    SsnDoesNotMatchWithinTolerance,

    #[serde(rename = "resultcode.input.ssn.is.itin")]
    #[doc = "Indicates that the Input SSN is an ITIN (Individual Taxpayer Identification Number)."]
    InputSsnIsItin,

    #[serde(rename = "resultcode.located.itin")]
    #[doc = "Indicates that the Located SSN is an ITIN (Individual Taxpayer Identification Number)."]
    ItinLocated,

    #[serde(rename = "resultcode.ssn.tied.to.multiple.names")]
    #[doc = "The SSN provided is tied to two or more individuals."]
    SsnTiedToMultipleNames,

    #[serde(rename = "resultcode.subject.deceased")]
    #[doc = "Records indicate that the subject in question is deceased."]
    SubjectDeceased,

    #[serde(rename = "resultcode.state.does.not.match")]
    #[doc = "This indicates that the State located does not match the state input as part of the address. This ID Note is a very specialized response and is only available if configured by IDology."]
    StateDoesNotMatch,

    #[serde(rename = "resultcode.ssn.issued.prior.to.dob")]
    #[doc = "This indicates that the SSN number was issued before the individual’s DOB, a serious fraud flag."]
    SsnIssuedPriorToDob,

    #[serde(rename = "resultcode.ssn.not.valid")]
    #[doc = "The located SSN does not match the structure of a valid SSN."]
    SsnIsInvalid,

    #[serde(rename = "resultcode.single.address.in.file")]
    #[doc = "This indicates that only a single address record was located for the individual."]
    SingleAddressInFile,

    #[serde(rename = "resultcode.data.strength.alert")]
    #[doc = "Examines how long someone has been in the public record system and how much data is available."]
    DataStrengthAlert,

    #[serde(rename = "resultcode.activation.date.alert")]
    #[doc = "This indicates that the provided Purchase Date of the card is a particular set of days after the Activation Date."]
    ActivationDateAlert,

    #[serde(rename = "resultcode.last.name.does.not.match")]
    #[doc = "This indicates that the located last name does not match the input last name."]
    LastNameDoesNotMatch,

    #[serde(rename = "resultcode.thin.file")]
    #[doc = "This indicates that the record located had very little information, specifically only name + address (Personal Info or “PI” only), and lacks any information that can be used to link to other records."]
    ThinFile,

    #[serde(rename = "resultcode.bankruptcy")]
    #[doc = "This indicates that the subject of the search has a chapter 7 or 13 bankruptcy in their public record."]
    BankruptcyFound,

    #[serde(rename = "resultcode.age.below.minimum")]
    #[doc = "Indicates that the subject is below the minimum age specified in the enterprise configuration."]
    AgeBelowMinimum,

    #[serde(rename = "resultcode.age.above.maximum")]
    #[doc = "Indicates that the subject is above the maximum age specified in the enterprise configuration."]
    AgeAboveMaximum,

    #[serde(rename = "resultcode.blacklist.alert.ssn")]
    #[doc = "Indicates that the input SSN9 was found on the Alert List for the Enterprise."]
    AlertListAlertSsn,

    #[serde(rename = "resultcode.blacklist.alert.address")]
    #[doc = "Indicates that the input Address was found on the Alert List for the Enterprise."]
    AlertListAlertAddress,

    #[serde(rename = "resultcode.blacklist.alert.address.zip")]
    #[doc = "Indicates that the input Address and Zip Code were found on the Alert List for the Enterprise."]
    AlertListAlertAddressAndZip,

    #[serde(rename = "resultcode.blacklist.alert.ip")]
    #[doc = "Indicates that the input IP Address was found on the Alert List for the Enterprise."]
    AlertListAlertIpAddress,

    #[serde(rename = "resultcode.blacklist.alert.phone")]
    #[doc = "Indicates that the input Phone Number was found on the Alert List for the Enterprise."]
    AlertListAlertPhoneNumber,

    #[serde(rename = "resultcode.blacklist.alert.email")]
    #[doc = "Indicates that the input Email Address was found on the Alert List for the Enterprise."]
    AlertListAlertEmailAddress,

    #[serde(rename = "resultcode.blacklist.alert.domain")]
    #[doc = "Indicates that the input Email Domain was found on the Alert List for the enterprise."]
    AlertListAlertEmailDomain,

    #[serde(rename = "resultcode.blacklist.alert.document.number")]
    #[doc = "Indicates that the input Document Number was found on the Alert List for the enterprise."]
    AlertListAlertDocumentNumber,

    #[serde(rename = "resultcode.network.alert.ssn")]
    #[doc = "Indicates that the input SSN9 was found on the Network Alert List."]
    NetworkAlertSsn,

    #[serde(rename = "resultcode.network.alert.address")]
    #[doc = "Indicates that the input Address was found on the Network Alert List."]
    NetworkAlertAddress,

    #[serde(rename = "resultcode.network.alert.address.zip")]
    #[doc = "Indicates that the input Address and Zip Code were found on the Network Alert List."]
    NetworkAlertAddressAndZip,

    #[serde(rename = "resultcode.network.alert.ip")]
    #[doc = "Indicates that the input IP Address was found on the Network Alert List."]
    NetworkAlertIpAddress,

    #[serde(rename = "resultcode.network.alert.email")]
    #[doc = "Indicates that the input email address was found on the Network Alert List."]
    NetworkAlertEmail,

    #[serde(rename = "resultcode.network.alert.phone")]
    #[doc = "Indicates that the input phone number was found on the Network Alert List."]
    NetworkAlertPhoneNumber,

    #[serde(rename = "resultcode.network.alert.domain")]
    #[doc = "Indicates that the input email domain was found on the Network Alert List."]
    NetworkAlertEmailDomain,

    #[serde(rename = "resultcode.network.alert.document.number")]
    #[doc = "Indicates that the input document number was found on the network alert list for the Enterprise."]
    NetworkAlertDocumentNumber,

    #[serde(rename = "resultcode.ip.state.does.not.match")]
    #[doc = "Indicates that the located IP State does not match the located State for the customer."]
    IpStateDoesNotMatch,

    #[serde(rename = "resultcode.ip.invalid")]
    #[doc = "Indicates that the IP address submitted does not fit the proper structure of an IP address and/or is found to be an unassigned IP address. This might also indicate that the IP address is a private or multicast address."]
    InvalidIp,

    #[serde(rename = "resultcode.ip.not.located")]
    #[doc = "Indicates that the IP address could not be located within IDology data sources."]
    IpNotLocated,

    #[serde(rename = "resultcode.high.risk.ip.bot")]
    #[doc = "Indicates that the IP address is part of a network of computers infected with malware."]
    HighRiskIpBot,

    #[serde(rename = "resultcode.high.risk.ip.spam")]
    #[doc = "Indicates that the IP address is associated with a device infected with malware."]
    HighRiskIpSpam,

    #[serde(rename = "resultcode.high.risk.ip.tor")]
    #[doc = "Indicates that the IP address is associated with a TOR network."]
    HighRiskIpTor,

    #[serde(rename = "resultcode.ip.location.not.available")]
    #[doc = "Indicates that the location of the IP address cannot be determined."]
    IpLocationNotAvailable,

    #[serde(rename = "resultcode.low.risk")]
    #[doc = "Triggered when the total ID Score is less than or equal to the value entered for the Low Risk threshold."]
    LowRisk,

    #[serde(rename = "resultcode.medium.risk")]
    #[doc = "Triggered when the total ID Score is between the values entered for the Low and High Risk threshold."]
    MediumRisk,

    #[serde(rename = "resultcode.high.risk")]
    #[doc = "Triggered when the total ID Score is greater than or equal to the value entered for the High Risk threshold."]
    HighRisk,

    #[serde(rename = "resultcode.pa.dob.match")]
    #[doc = "Indicates that the input DOB matches the located DOB on the PA Watch List record."]
    PaDobMatch,

    #[serde(rename = "resultcode.pa.dob.does.not.match")]
    #[doc = "Indicates that the input DOB does not match the located DOB on the PA Watch List record."]
    PaDobDoesNotMatch,

    #[serde(rename = "resultcode.pa.dob.not.available")]
    #[doc = "Indicates that there is no located DOB on the PA Watch List record to match against the input DOB."]
    PaDobNotAvailable,

    #[serde(rename = "resultcode.email.domain.does.not.exist")]
    #[doc = "The email address or domain does not exist."]
    EmailOrDomainDoesNotExist,

    #[serde(rename = "resultcode.domain.recently.verified")]
    #[doc = "Indicates that the email domain has been recently created. *Note: The default for this IS Note is less than 90 days. This value may be customized in the IDCenter"]
    DomainRecentlyVerified,

    #[serde(rename = "resultcode.private.email.domain")]
    #[doc = "Indicates that the domain of the email address has been identified as belonging to a private individual."]
    PrivateEmailDomain,

    #[serde(rename = "resultcode.corporate.email.domain")]
    #[doc = "Indicates that the domain of the email address has been identified as belonging to a corporate entity."]
    CorporateEmailDomain,

    #[serde(rename = "resultcode.high.risk.email.recently.verified")]
    #[doc = "The email address is high risk because it was only recently verified in our databases."]
    EmailRecentlyVerified,

    #[serde(rename = "resultcode.high.risk.email.country")]
    #[doc = "The email address is found to be from a country that is set as restricted within the Enterprise configuration."]
    HighRiskEmailCountry,

    #[serde(rename = "resultcode.high.risk.email.fraud")]
    #[doc = "The email address has been reported as fraud or is potentially fraudulent. Possible fraud types that can be also be returned by the service include:  • Card Not Present Fraud  • Customer Dispute (Chargeback) • First Party Fraud • First Payment Default • Identity Theft (Fraud Application) • Identity Theft (Account Takeover) • Suspected Fraud (Not Confirmed) • Synthetic ID •Suspected Synthetic ID"]
    HighRiskEmailFraud,

    #[serde(rename = "resultcode.high.risk.email.tumbled")]
    #[doc = "Indicates that the email address provided has been submitted with different variations that point to the same inbox (e.g. ab.c@gmail.com and abc@gmail.com) or the email is enumerated due to previous handle queries (e.g. abc123@gmail.com and abc43@gmail.com). This note will only be triggered for email addresses that display this pattern and also present significant risk based on our analysis to prevent false positives."]
    HighRiskEmailTumbled,

    #[serde(rename = "resultcode.high.risk.email.disposable")]
    #[doc = "Indicates that the email address provided is a temporary email address designed to self-destruct after a specific time period has passed."]
    HighRiskEmailDisposable,

    #[serde(rename = "resultcode.high.risk.email.domain")]
    #[doc = "The domain has been reported as fraud or is potentially fraudulent."]
    HighRiskEmailDomain,

    #[serde(rename = "resultcode.invalid.email.address")]
    #[doc = "The email address is invalid or does not have the proper syntax of an email address."]
    InvalidEmailAddress,

    #[serde(rename = "resultcode.mobile.id.age.alert")]
    #[doc = "The “age” of the mobile account (account creation date) falls within the specified time range that the Enterprise is configured to monitor."]
    MobileIdAgeAlert,

    #[serde(rename = "resultcode.mobile.change.event.[event]")]
    #[doc = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Possible Events: • Phone Number Change: resultcode.mobile.change.event.number  • Network Status Change: resultcode.mobile.change.event.status •   Number was ported: resultcode.mobile.change.event.ported •   Device Change: resultcode.mobile.change.event.device •   SIM Swap: resultcode.mobile.change.event.simswap"]
    MobileChangeEventevent,

    #[serde(rename = "resultcode.mobile.account.type.[account type]")]
    #[doc = "Determines the type of mobile account being used to create the mobile identity. Possible Account Types: • Postpaid: resultcode.mobile.account.type.postpaid •  Prepaid: resultcode.mobile.account.type.prepaid •    Unknown: resultcode.mobile.account.type.unknown"]
    MobileAccountTypeaccountType,

    #[serde(rename = "resultcode.mobile.account.status.[status]")]
    #[doc = "Determines the status of the mobile account. Possible Account Statuses: • Active: resultcode.mobile.account.status.active  •   Deactivated: resultcode.mobile.account.status.deactivated •  Suspended: resultcode.mobile.account.status.suspended •  Absent: resultcode.mobile.account.status.absent"]
    MobileAccountStatusstatus,

    #[serde(rename = "resultcode.invalid.phone.number")]
    #[doc = "The phone number submitted was not a valid phone number."]
    InvalidPhoneNumber,

    #[serde(rename = "idphone.match")]
    #[doc = "The phone number submitted matches the phone number for the consumer."]
    PhoneNumberMatch,

    #[serde(rename = "idphone.does.not.match")]
    #[doc = "The phone number submitted does not match the consumer's phone number."]
    PhoneNumberDoesNotMatch,

    #[serde(rename = "idphone.not.available")]
    #[doc = "The consumer's phone number is not available because it is unpublished, a mobile number, or is not on file."]
    PhoneNumberIsUnlistedOrUnavailable,

    #[serde(rename = "idphone.wireless")]
    #[doc = "The consumer's phone number is possibly a wireless mobile number."]
    MobileNumber,

    #[serde(rename = "idphone.pager")]
    #[doc = "The consumer's phone number could be tied to an answering service, page, or VoIP."]
    VoipNumber,

    #[serde(rename = "resultcode.input.phone.number.does.not.match.input.state")]
    #[doc = "The area code for the phone number provided does not match the input state provided."]
    InputPhoneNumberDoesNotMatchInputState,

    #[serde(rename = "resultcode.input.phone.number.does.not.match.located.state")]
    #[doc = "The area code for the phone number provided does not match any address is the located address history for the identity."]
    InputPhoneNumberDoesNotMatchLocatedStateHistory,

    #[serde(rename = "resultcode.input.phone.number.does.not.match.ip.state")]
    #[doc = "The area code for the phone number provided does not match the state detected through the IP Address provided."]
    InputPhoneNumberDoesNotMatchIpState,
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use super::*;

    #[test_case(r#""idphone.not.available""# => ReasonCode::IDology(IDologyReasonCode::PhoneNumberIsUnlistedOrUnavailable))]
    #[test_case(r#""resultcode.coppa.alert""# => ReasonCode::IDology(IDologyReasonCode::CoppaAlert))]
    #[test_case(r#""flerpderp""# => ReasonCode::Other("flerpderp".to_owned()))]
    fn test_deserialize(input: &str) -> ReasonCode {
        serde_json::de::from_str(input).unwrap()
    }

    #[test_case(ReasonCode::IDology(IDologyReasonCode::PhoneNumberIsUnlistedOrUnavailable) => r#""idphone.not.available""#)]
    #[test_case(ReasonCode::IDology(IDologyReasonCode::CoppaAlert) => r#""resultcode.coppa.alert""#)]
    #[test_case(ReasonCode::Other("flerpderp".to_owned()) => r#""flerpderp""#)]
    fn test_serialize(input: ReasonCode) -> String {
        serde_json::ser::to_string(&input).unwrap()
    }
}
