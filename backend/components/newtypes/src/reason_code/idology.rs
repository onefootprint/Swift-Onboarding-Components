use crate::vendor_reason_code_enum;
use crate::FootprintReasonCode;
use strum::EnumIter;
use strum_macros::EnumString;

pub mod idology_match_codes {
    use crate::FootprintReasonCode;

    pub const ADDRESS_DOES_NOT_MATCH_CODES: [FootprintReasonCode; 1] =
        [FootprintReasonCode::AddressDoesNotMatch];
    pub const ADDRESS_PARTIALLY_MATCHES_CODES: [FootprintReasonCode; 4] = [
        FootprintReasonCode::AddressZipCodeDoesNotMatch,
        FootprintReasonCode::AddressStreetNameDoesNotMatch,
        FootprintReasonCode::AddressStreetNumberDoesNotMatch,
        FootprintReasonCode::AddressStateDoesNotMatch,
    ];
    pub const DOB_YOB_CODES: [FootprintReasonCode; 2] = [
        FootprintReasonCode::DobYobDoesNotMatch,
        FootprintReasonCode::DobYobDoesNotMatchWithin1Year,
    ];
    pub const DOB_MOB_CODES: [FootprintReasonCode; 2] = [
        FootprintReasonCode::DobMobDoesNotMatch,
        FootprintReasonCode::DobMobNotAvailable,
    ];
    pub const SSN_DOES_NOT_MATCH_CODES: [FootprintReasonCode; 5] = [
        FootprintReasonCode::SsnDoesNotMatch,
        FootprintReasonCode::SsnNotOnFile,
        FootprintReasonCode::SsnInputIsItin,
        FootprintReasonCode::SsnLocatedIsInvalid,
        FootprintReasonCode::SsnLocatedIsItin,
    ];
    pub const SSN_PARTIALLY_MATCHES_CODES: [FootprintReasonCode; 1] =
        [FootprintReasonCode::SsnDoesNotMatchWithin1Digit];
    pub const NAME_DOES_NOT_MATCH_CODES: [FootprintReasonCode; 2] = [
        FootprintReasonCode::NameLastDoesNotMatch,
        FootprintReasonCode::NameFirstDoesNotMatch,
    ];
}

vendor_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    #[serde(try_from = "&str")]
    pub enum IDologyReasonCode {
        #[ser = "resultcode.coppa.alert", description = "Customer is 13 or under.  COPPA laws forbid conducting e-commerce with people under 14 years of age. When this result is encountered, the input information and located data will not be available in any record of the transaction due to the issues around storing data on children."]
        #[footprint_reason_code = Some(FootprintReasonCode::DobLocatedCoppaAlert)]
        CoppaAlert,

        #[ser = "resultcode.address.does.not.match", description = "Address found does not match address submitted. This can be due to a typo in the input information, typos or errors in the address located, or the address is actually incorrect, but the subject’s credentials are located in or near the target ZIP code, city, or metropolitan area."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressDoesNotMatch)]
        AddressDoesNotMatch,

        #[ser = "resultcode.street.name.does.not.match", description = "The submitted street name does not match the located data. This can be due to a typo in the input or the located data. This note will always be accompanied by the resultcode.address.does.not.match ID Note."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressStreetNameDoesNotMatch)]
        StreetNameDoesNotMatch,

        #[ser = "resultcode.street.number.does.not.match", description = "The submitted street number does not match the located data. This can be due to a typo in the input or the located data. This note will always be accompanied by the resultcode.address.does.not.match ID Note."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressStreetNumberDoesNotMatch)]
        StreetNumberDoesNotMatch,

        #[ser = "resultcode.input.address.is.po.box", description = "The input address is a PO Box."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressInputIsPoBox)]
        InputAddressIsPoBox,

        #[ser = "resultcode.located.address.is.po.box", description = "The located address is a PO Box."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressLocatedIsPoBox)]
        LocatedAddressIsPoBox,

        #[ser = "resultcode.warm.input.address.alert", description = "This indicates that the input address provided by the consumer is a warm address. Warm addresses will be clarified further as to which type with the content of the <warm-address-list> value. Those are:  • mail drop • hospital  • hotel  • prison  • campground • college  • university  •    USPO  • General Delivery"]
        #[footprint_reason_code = None] //We manually map these based on the specific type of address
        WarmInputAddressAlert,

        #[ser = "resultcode.warm.address.alert", description = "This indicates that the located address is a warm address. Warm addresses will be clarified further as to which type with the content of the <warm-address-list> value. Those are:  • mail drop • hospital  • hotel  • prison  • campground • college  • university  •   USPO  • General Delivery"]
        #[footprint_reason_code = None] //We manually map these based on the specific type of address
        WarmAddressAlert,

        #[ser = "resultcode.zip.does.not.match", description = "ZIP code located does not match the ZIP code submitted."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressZipCodeDoesNotMatch)]
        ZipCodeDoesNotMatch,

        #[ser = "resultcode.input.address.is.not.deliverable", description = "The input address provided is not a deliverable address. If the setting to return additional information in the API has been enabled for an enterprise by our Customer Success team, the following details may be returned in the  tag: • Address is Valid • Invalid Delivery Address • Address is a Deliverable Address • Address is Deliverable after dropping building number • Address is a military address • Address is a general delivery address • Address missing building number • Premise number invalid • Box number missing • Address is a post office box • Address is a rural route • Address is rural route but designator missing • Address is valid but does not receive USPS mail • Address matched to unique ZIP"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressInputIsNotDeliverable)]
        InputAddressIsNotDeliverable,

        #[ser = "resultcode.located.address.is.not.deliverable", description = "The located address for the individual is not a deliverable address. If the setting to return additional information in the API has been enabled for an enterprise by our Customer Success team, the following details may be returned in the  tag: • Address is Valid • Invalid Delivery Address • Address is a Deliverable Address • Address is Deliverable after dropping building number • Address is a military address • Address is a general delivery address • Address missing building number • Premise number invalid •Box number missing • Address is a post office box • Address is a rural route • Address is rural route but designator missing • Address is valid but does not receive USPS mail • Address matched to unique ZIP"]
        #[footprint_reason_code = None]
        LocatedAddressIsNotDeliverable,

        #[ser = "resultcode.yob.does.not.match", description = "The year of birth located does not match. If neither the month-of-birth nor the year-of-birth match, this ID Note is presented."]
        #[footprint_reason_code = Some(FootprintReasonCode::DobYobDoesNotMatch)]
        YobDoesNotMatch,

        #[ser = "resultcode.yob.within.one.year", description = "This indicates a discrepancy of one year between the YOB submitted and the YOB located. For example, if the YOB submitted is 1970 and the YOB located is 1971, this ID Note is presented."]
        #[footprint_reason_code = Some(FootprintReasonCode::DobYobDoesNotMatchWithin1Year)]
        YobDoesNotMatchWithin1YearTolerance,

        #[ser = "resultcode.mob.does.not.match", description = "This indicates a discrepancy between the month of birth submitted and the month of birth located. This ID Note is only presented when the year-of-birth matches."]
        #[footprint_reason_code = Some(FootprintReasonCode::DobMobDoesNotMatch)]
        MobDoesNotMatch,

        #[ser = "resultcode.no.mob.available", description = "This indicates that no month-of-birth was included in the records that were located."]
        #[footprint_reason_code = Some(FootprintReasonCode::DobMobNotAvailable)]
        MobNotAvailable,

        #[ser = "resultcode.multiple.records.found", description = "Several valid records exist containing conflicting identifying information."]
        #[footprint_reason_code = Some(FootprintReasonCode::MultipleRecordsFound)]
        MultipleRecordsFound,

        #[ser = "resultcode.newer.record.found", description = "The subject of the search was found at the address submitted, but a more recent record shows a different address for the individual. If a customer intentionally provides an old address and a new one is located, this result will occur, but it also results from a customer providing a current “home” address and the IDology search locating newer real estate, like a second/vacation home or an investment property. Additionally, if the customer provides the address of an inherited property or a relative’s (sibling, parent, etc.) address when signing up for services, then this note could be triggered. Note: Additional parameters to set the address First Seen Date can be enabled through the Additional Risk Settings menu in the IDCenter."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressNewerRecordFound)]
        NewerRecordFound,

        #[ser = "resultcode.high.risk.address.alert", description = "Identifies addresses with a known history of fraud activity."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressLocatedIsHighRiskAddress)]
        HighRiskAddress,

        #[ser = "resultcode.address.velocity.alert", description = "Warns of the number of addresses someone has had within a defined time period."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressAlertVelocity)]
        AddressVelocityAlert,

        #[ser = "resultcode.address.stability.alert", description = "Indicates how often someone moves based on specific timeframe triggers."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressAlertStability)]
        AddressStabilityAlert,

        #[ser = "resultcode.address.longevity.alert", description = "Specifies how long someone has lived at their current address."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressAlertLongevity)]
        AddressLongevityAlert,

        #[ser = "resultcode.address.location.alert", description = "A location-based alert that advises when the located ZIP Code exceeds the Enterprise’s Permitted Distance Radius rule."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressZipCodeDoesNotMatch)]
        AddressLocationAlert,

        #[ser = "resultcode.alternate.address.alert", description = "Indicates that the Alternate Address could not be verified for the customer. The Alert will be clarified further as to which type with the value of the <alternate-address-type> value.  Those are: • Street Number •   Street Name • State • ZIP Code"]
        #[footprint_reason_code = None]
        AlternateAddressAlert,

        #[ser = "resultcode.no.dob.available", description = "The individual was identified, but DOB information was not available in the records located. This does not mean the search failed. Numerous public-record data sources do not include DOB information in their records."]
        #[footprint_reason_code = Some(FootprintReasonCode::DobCouldNotMatch)]
        NoDobAvailable,

        #[ser = "resultcode.ssn.not.available", description = "The individual was identified, but SSN information was not available. This does not mean the search failed. Numerous public-record data sources do not include SSN information in their records."]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnNotOnFile)]
        SsnNotAvailable,

        #[ser = "resultcode.ssn.does.not.match", description = "SSN found does not match SSN submitted. This does not necessarily mean the ID Located is invalid, especially when the MOB+YOB or YOB was provided as well. There can be errors in the located SSN data."]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnDoesNotMatch)]
        SsnDoesNotMatch,

        #[ser = "resultcode.ssn.within.one.digit", description = "This indicates a discrepancy of one digit between the SSN submitted and the SSN located. If the SSN submitted is off by one digit from the located SSN, the ID Note is presented."]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnDoesNotMatchWithin1Digit)]
        SsnDoesNotMatchWithinTolerance,

        #[ser = "resultcode.input.ssn.is.itin", description = "Indicates that the Input SSN is an ITIN (Individual Taxpayer Identification Number)."]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnInputIsItin)]
        InputSsnIsItin,

        #[ser = "resultcode.located.itin", description = "Indicates that the Located SSN is an ITIN (Individual Taxpayer Identification Number)."]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnLocatedIsItin)]
        ItinLocated,

        #[ser = "resultcode.ssn.tied.to.multiple.names", description = "The SSN provided is tied to two or more individuals."]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnInputTiedToMultipleNames)]
        SsnTiedToMultipleNames,

        #[ser = "resultcode.subject.deceased", description = "Records indicate that the subject in question is deceased."]
        #[footprint_reason_code = Some(FootprintReasonCode::SubjectDeceased)]
        SubjectDeceased,

        #[ser = "resultcode.state.does.not.match", description = "This indicates that the State located does not match the state input as part of the address. This ID Note is a very specialized response and is only available if configured by IDology."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressStateDoesNotMatch)]
        StateDoesNotMatch,

        #[ser = "resultcode.ssn.issued.prior.to.dob", description = "This indicates that the SSN number was issued before the individual’s DOB, a serious fraud flag."]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnIssuedPriorToDob)]
        SsnIssuedPriorToDob,

        #[ser = "resultcode.ssn.not.valid", description = "The located SSN does not match the structure of a valid SSN."]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnLocatedIsInvalid)]
        SsnIsInvalid,

        #[ser = "resultcode.single.address.in.file", description = "This indicates that only a single address record was located for the individual."]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressAlertSingleAddressInFile)]
        SingleAddressInFile,

        #[ser = "resultcode.data.strength.alert", description = "Examines how long someone has been in the public record system and how much data is available."]
        #[footprint_reason_code = None]
        DataStrengthAlert,

        #[ser = "resultcode.activation.date.alert", description = "This indicates that the provided Purchase Date of the card is a particular set of days after the Activation Date."]
        #[footprint_reason_code = None]
        ActivationDateAlert,

        #[ser = "resultcode.first.name.does.not.match", description = "This indicates that the located first name does not match the input first name. Note: This ID Note must be enabled by a Customer Success account manager for use in your enterprise."]
        #[footprint_reason_code = Some(FootprintReasonCode::NameFirstDoesNotMatch)]
        FirstNameDoesNotMatch,

        #[ser = "resultcode.last.name.does.not.match", description = "This indicates that the located last name does not match the input last name."]
        #[footprint_reason_code = Some(FootprintReasonCode::NameLastDoesNotMatch)]
        LastNameDoesNotMatch,

        #[ser = "resultcode.thin.file", description = "This indicates that the record located had very little information, specifically only name + address (Personal Info or “PI” only), and lacks any information that can be used to link to other records."]
        #[footprint_reason_code = Some(FootprintReasonCode::ThinFile)]
        ThinFile,

        #[ser = "resultcode.bankruptcy", description = "This indicates that the subject of the search has a chapter 7 or 13 bankruptcy in their public record."]
        #[footprint_reason_code = None]
        BankruptcyFound,

        #[ser = "resultcode.age.below.minimum", description = "Indicates that the subject is below the minimum age specified in the enterprise configuration."]
        #[footprint_reason_code = Some(FootprintReasonCode::DobLocatedAgeBelowMinimum)]
        AgeBelowMinimum,

        #[ser = "resultcode.age.above.maximum", description = "Indicates that the subject is above the maximum age specified in the enterprise configuration."]
        #[footprint_reason_code = Some(FootprintReasonCode::DobLocatedAgeAboveMaximum)]
        AgeAboveMaximum,

        #[ser = "resultcode.blacklist.alert.ssn", description = "Indicates that the input SSN9 was found on the Alert List for the Enterprise."]
        #[footprint_reason_code = None]
        AlertListAlertSsn,

        #[ser = "resultcode.blacklist.alert.address", description = "Indicates that the input Address was found on the Alert List for the Enterprise."]
        #[footprint_reason_code = None]
        AlertListAlertAddress,

        #[ser = "resultcode.blacklist.alert.address.zip", description = "Indicates that the input Address and Zip Code were found on the Alert List for the Enterprise."]
        #[footprint_reason_code = None]
        AlertListAlertAddressAndZip,

        #[ser = "resultcode.blacklist.alert.ip", description = "Indicates that the input IP Address was found on the Alert List for the Enterprise."]
        #[footprint_reason_code = None]
        AlertListAlertIpAddress,

        #[ser = "resultcode.blacklist.alert.phone", description = "Indicates that the input Phone Number was found on the Alert List for the Enterprise."]
        #[footprint_reason_code = None]
        AlertListAlertPhoneNumber,

        #[ser = "resultcode.blacklist.alert.email", description = "Indicates that the input Email Address was found on the Alert List for the Enterprise."]
        #[footprint_reason_code = None]
        AlertListAlertEmailAddress,

        #[ser = "resultcode.blacklist.alert.domain", description = "Indicates that the input Email Domain was found on the Alert List for the enterprise."]
        #[footprint_reason_code = None]
        AlertListAlertEmailDomain,

        #[ser = "resultcode.blacklist.alert.document.number", description = "Indicates that the input Document Number was found on the Alert List for the enterprise."]
        #[footprint_reason_code = None]
        AlertListAlertDocumentNumber,

        #[ser = "resultcode.network.alert.ssn", description = "Indicates that the input SSN9 was found on the Network Alert List."]
        #[footprint_reason_code = None] // For this and the below NetworkAlert reason codes, we chose not to map to FootprintReasonCode. These are alerts based on Idology's "Consortium" where other Idology customers can report input data. We don't want to generate risk signals from this data (at least for now)
        NetworkAlertSsn,

        #[ser = "resultcode.network.alert.address", description = "Indicates that the input Address was found on the Network Alert List."]
        #[footprint_reason_code = None]
        NetworkAlertAddress,

        #[ser = "resultcode.network.alert.address.zip", description = "Indicates that the input Address and Zip Code were found on the Network Alert List."]
        #[footprint_reason_code = None]
        NetworkAlertAddressAndZip,

        #[ser = "resultcode.network.alert.ip", description = "Indicates that the input IP Address was found on the Network Alert List."]
        #[footprint_reason_code = None]
        NetworkAlertIpAddress,

        #[ser = "resultcode.network.alert.email", description = "Indicates that the input email address was found on the Network Alert List."]
        #[footprint_reason_code = None]
        NetworkAlertEmail,

        #[ser = "resultcode.network.alert.phone", description = "Indicates that the input phone number was found on the Network Alert List."]
        #[footprint_reason_code = None]
        NetworkAlertPhoneNumber,

        #[ser = "resultcode.network.alert.domain", description = "Indicates that the input email domain was found on the Network Alert List."]
        #[footprint_reason_code = None]
        NetworkAlertEmailDomain,

        #[ser = "resultcode.network.alert.document.number", description = "Indicates that the input document number was found on the network alert list for the Enterprise."]
        #[footprint_reason_code = None]
        NetworkAlertDocumentNumber,

        #[ser = "resultcode.ip.state.does.not.match", description = "Indicates that the located IP State does not match the located State for the customer."]
        #[footprint_reason_code = None]
        IpStateDoesNotMatch,

        #[ser = "resultcode.ip.invalid", description = "Indicates that the IP address submitted does not fit the proper structure of an IP address and/or is found to be an unassigned IP address. This might also indicate that the IP address is a private or multicast address."]
        #[footprint_reason_code = None]
        InvalidIp,

        #[ser = "resultcode.ip.not.located", description = "Indicates that the IP address could not be located within IDology data sources."]
        #[footprint_reason_code = None]
        IpNotLocated,

        #[ser = "resultcode.high.risk.ip.bot", description = "Indicates that the IP address is part of a network of computers infected with malware."]
        #[footprint_reason_code = None]
        HighRiskIpBot,

        #[ser = "resultcode.high.risk.ip.spam", description = "Indicates that the IP address is associated with a device infected with malware."]
        #[footprint_reason_code = None]
        HighRiskIpSpam,

        #[ser = "resultcode.high.risk.ip.tor", description = "Indicates that the IP address is associated with a TOR network."]
        #[footprint_reason_code = Some(FootprintReasonCode::IpTorExitNode)]
        HighRiskIpTor,

        #[ser = "resultcode.ip.location.not.available", description = "Indicates that the location of the IP address cannot be determined."]
        #[footprint_reason_code = None]
        IpLocationNotAvailable,

        #[ser = "resultcode.low.risk", description = "Triggered when the total ID Score is less than or equal to the value entered for the Low Risk threshold."]
        #[footprint_reason_code = None] // These LowRisk, MediumRisk, and HighRisk reason codes are not generalizable piece of information about the identity so we are currently chosing to not map these to FootprintReasonCode's
        LowRisk,

        #[ser = "resultcode.medium.risk", description = "Triggered when the total ID Score is between the values entered for the Low and High Risk threshold."]
        #[footprint_reason_code = None]
        MediumRisk,

        #[ser = "resultcode.high.risk", description = "Triggered when the total ID Score is greater than or equal to the value entered for the High Risk threshold."]
        #[footprint_reason_code = None]
        HighRisk,

        #[ser = "resultcode.pa.dob.match", description = "Indicates that the input DOB matches the located DOB on the PA Watch List record."]
        #[footprint_reason_code = None]
        PaDobMatch,

        // 2023-01-31 I (argoff) don't know what these 2 mean. From the description it sounds like we shouldn't fail an OB because of them, but will ask idology
        #[ser = "resultcode.pa.dob.does.not.match", description = "Indicates that the input DOB does not match the located DOB on the PA Watch List record."]
        #[footprint_reason_code = None]
        PaDobDoesNotMatch,

        #[ser = "resultcode.pa.dob.not.available", description = "Indicates that there is no located DOB on the PA Watch List record to match against the input DOB."]
        #[footprint_reason_code = None]
        PaDobNotAvailable,

        #[ser = "resultcode.email.domain.does.not.exist", description = "The email address or domain does not exist."]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailAddressOrDomainDoesNotExist)]
        EmailOrDomainDoesNotExist,

        #[ser = "resultcode.domain.recently.verified", description = "Indicates that the email domain has been recently created. *Note: The default for this IS Note is less than 90 days. This value may be customized in the IDCenter"]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailDomainRecentlyCreated)]
        DomainRecentlyVerified,

        #[ser = "resultcode.private.email.domain", description = "Indicates that the domain of the email address has been identified as belonging to a private individual."]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailDomainPrivate)]
        PrivateEmailDomain,

        #[ser = "resultcode.corporate.email.domain", description = "Indicates that the domain of the email address has been identified as belonging to a corporate entity."]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailDomainCorporate)]
        CorporateEmailDomain,

        #[ser = "resultcode.high.risk.email.recently.verified", description = "The email address is high risk because it was only recently verified in our databases."]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailRecentlyVerified)]
        EmailRecentlyVerified,

        #[ser = "resultcode.high.risk.email.country", description = "The email address is found to be from a country that is set as restricted within the Enterprise configuration."]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailHighRiskCountry)]
        HighRiskEmailCountry,

        #[ser = "resultcode.high.risk.email.fraud", description = "The email address has been reported as fraud or is potentially fraudulent. Possible fraud types that can be also be returned by the service include:  • Card Not Present Fraud  • Customer Dispute (Chargeback) • First Party Fraud • First Payment Default • Identity Theft (Fraud Application) • Identity Theft (Account Takeover) • Suspected Fraud (Not Confirmed) • Synthetic ID •Suspected Synthetic ID"]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailHighRiskFraud)]
        HighRiskEmailFraud,

        #[ser = "resultcode.high.risk.email.tumbled", description = "Indicates that the email address provided has been submitted with different variations that point to the same inbox (e.g. ab.c@gmail.com and abc@gmail.com) or the email is enumerated due to previous handle queries (e.g. abc123@gmail.com and abc43@gmail.com). This note will only be triggered for email addresses that display this pattern and also present significant risk based on our analysis to prevent false positives."]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailHighRiskTumbled)]
        HighRiskEmailTumbled,

        #[ser = "resultcode.high.risk.email.disposable", description = "Indicates that the email address provided is a temporary email address designed to self-destruct after a specific time period has passed."]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailHighRiskDisposable)]
        HighRiskEmailDisposable,

        #[ser = "resultcode.high.risk.email.domain", description = "The domain has been reported as fraud or is potentially fraudulent."]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailHighRiskDomain)]
        HighRiskEmailDomain,

        #[ser = "resultcode.invalid.email.address", description = "The email address is invalid or does not have the proper syntax of an email address."]
        #[footprint_reason_code = Some(FootprintReasonCode::EmailAddressInvalid)]
        InvalidEmailAddress,

        #[ser = "resultcode.mobile.id.age.alert", description = "The “age” of the mobile account (account creation date) falls within the specified time range that the Enterprise is configured to monitor."]
        #[footprint_reason_code = None]
        MobileIdAgeAlert,

        #[ser = "resultcode.mobile.change.event.number", description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Phone Number Change"]
        #[footprint_reason_code = None]
        MobileChangeEventNumber,

        #[ser = "resultcode.mobile.change.event.status", description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Network Status Change"]
        #[footprint_reason_code = None]
        MobileChangeEventStatus,

        #[ser = "resultcode.mobile.change.event.ported", description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Number was ported"]
        #[footprint_reason_code = None]
        MobileChangeEventPorted,

        #[ser = "resultcode.mobile.change.event.device", description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = Device Change"]
        #[footprint_reason_code = None]
        MobileChangeEventDevice,

        #[ser = "resultcode.mobile.change.event.simswap", description = "A change event has occurred on the mobile account within the specified time range that the Enterprise is configured to monitor. Event = SIM Swap"]
        #[footprint_reason_code = None]
        MobileChangeEventSimswap,

        #[ser = "resultcode.mobile.account.type.postpaid", description = "Determines the type of mobile account being used to create the mobile identity. Account Type = Postpaid"]
        #[footprint_reason_code = None]
        MobileAccountTypePostpaid,

        #[ser = "resultcode.mobile.account.type.prepaid", description = "Determines the type of mobile account being used to create the mobile identity. Account Type = Prepaid"]
        #[footprint_reason_code = None]
        MobileAccountTypePrepaid,

        #[ser = "resultcode.mobile.account.type.unknown", description = "Determines the type of mobile account being used to create the mobile identity. Account Type = Unknown"]
        #[footprint_reason_code = None]
        MobileAccountTypeUnknown,

        #[ser = "resultcode.mobile.account.status.active", description = "Determines the status of the mobile account. Account Status = Active"]
        #[footprint_reason_code = None]
        MobileAccountStatusActive,

        #[ser = "resultcode.mobile.account.status.deactivated", description = "Determines the status of the mobile account. Account Status = Deactivated"]
        #[footprint_reason_code = None]
        MobileAccountStatusDeactivated,

        #[ser = "resultcode.mobile.account.status.suspended", description = "Determines the status of the mobile account. Account Status = Suspended"]
        #[footprint_reason_code = None]
        MobileAccountStatusSuspended,

        #[ser = "resultcode.mobile.account.status.absent", description = "Determines the status of the mobile account. Account Status = Absent"]
        #[footprint_reason_code = None]
        MobileAccountStatusAbsent,

        #[ser = "resultcode.invalid.phone.number", description = "The phone number submitted was not a valid phone number."]
        #[footprint_reason_code = None]
        InvalidPhoneNumber,

        #[ser = "idphone.match", description = "The phone number submitted matches the phone number for the consumer."]
        #[footprint_reason_code = Some(FootprintReasonCode::PhoneLocatedMatches)]
        PhoneNumberMatch,

        #[ser = "idphone.does.not.match", description = "The phone number submitted does not match the consumer's phone number."]
        #[footprint_reason_code = Some(FootprintReasonCode::PhoneLocatedDoesNotMatch)]
        PhoneNumberDoesNotMatch,

        #[ser = "idphone.not.available", description = "The consumer's phone number is not available because it is unpublished, a mobile number, or is not on file."]
        #[footprint_reason_code = None]
        PhoneNumberIsUnlistedOrUnavailable,

        #[ser = "idphone.wireless", description = "The consumer's phone number is possibly a wireless mobile number."]
        #[footprint_reason_code = None]
        MobileNumber,

        #[ser = "idphone.pager", description = "The consumer's phone number could be tied to an answering service, page, or VoIP."]
        #[footprint_reason_code = Some(FootprintReasonCode::PhoneNumberLocatedIsVoip)]
        VoipNumber,

        #[ser = "resultcode.input.phone.number.does.not.match.input.state", description = "The area code for the phone number provided does not match the input state provided."]
        #[footprint_reason_code = Some(FootprintReasonCode::InputPhoneNumberDoesNotMatchInputState)]
        InputPhoneNumberDoesNotMatchInputState,

        #[ser = "resultcode.input.phone.number.does.not.match.located.state", description = "The area code for the phone number provided does not match any address is the located address history for the identity."]
        #[footprint_reason_code = Some(FootprintReasonCode::InputPhoneNumberDoesNotMatchLocatedStateHistory)]
        InputPhoneNumberDoesNotMatchLocatedStateHistory,

        #[ser = "resultcode.input.phone.number.does.not.match.ip.state", description = "The area code for the phone number provided does not match the state detected through the IP Address provided."]
        #[footprint_reason_code =  None]
        InputPhoneNumberDoesNotMatchIpState,

        #[ser = "resultcode.scan.capture.document.not.verified", description = "IDology was unable to verify the document provided because either the front or back was unable to be read or because it failed the verification check."]
        #[footprint_reason_code =  None]
        DocumentNotVerified,

        #[ser = "resultcode.scan.capture.ocr.not.successful", description = "The OCR for the front of the document failed."]
        #[footprint_reason_code =  None]
        OcrNotSuccessful,

        #[ser = "resultcode.scan.capture.barcode.not.read", description = "The reading and extracting of the barcode on the back of the document failed."]
        #[footprint_reason_code =  None]
        BarcodeNotRead,

        #[ser = "resultcode.scan.capture.review.document", description = "Indicates that further review of the document is required."]
        #[footprint_reason_code = None]
        ReviewDocument,

        #[ser = "resultcode.scan.capture.document.expired", description = "The document is expired."]
        #[footprint_reason_code =  None]
        DocumentExpired,

        #[ser = "resultcode.scan.capture.restricted.country", description = "The document is from a country that has been labeled as high-risk in the enterprise settings."]
        #[footprint_reason_code =  None]
        DocumentFromRestrictedCountry,

        #[ser = "resultcode.scan.capture.restricted.template", description = "Indicates that the template type identified for the document provided is restricted in the Enterprise settings."]
        #[footprint_reason_code =  None]
        RestrictedTemplateType,

        #[ser = "resultcode.scan.capture.document.type.not.allowed", description = "Indicates that the document type provided is a not allowed for the Enterprise."]
        #[footprint_reason_code = None]
        DocumentTypeNotAllowed,

        #[ser = "resultcode.scan.field.crosscheck.failed", description = "A field crosscheck (comparing data  on the front of the document to the back) failed during the document authentication."]
        #[footprint_reason_code =  None]
        FieldCrosscheckFailed,

        #[ser = "resultcode.scan.invalid.issuance.expiration.date", description = "The Issuance Date, Expiration Date, or both do not align to the timeline of the identified document. The Issuance Date or the Expiration Date are not in a valid format."]
        #[footprint_reason_code =  None]
        InvalidIssuanceOrExpirationDate,

        #[ser = "resultcode.scan.invalid.template.layout", description = "The layout, or relative positions of specifically identified features of the document, were not within the proper place, are missing, or show signs of tampering."]
        #[footprint_reason_code =  None]
        InvalidTemplateLayout,

        #[ser = "resultcode.scan.possible.image.tampering", description = "The image of the document has evidence or appearances of being manipulated or tampered."]
        #[footprint_reason_code =  None]
        PossibleImageTampering,

        #[ser = "resultcode.scan.capture.face.compare.alert", description = "Indicates that the customer's Face Compare Score is beneath the Facial Match Score allowed by the enterprise."]
        #[footprint_reason_code =  None]
        FaceCompareAlert
    }
}

impl serde::Serialize for IDologyReasonCode {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.collect_str(self)
    }
}

#[cfg(test)]
mod tests {
    use crate::db_types::FootprintReasonCode;
    use crate::idology_match_codes;
    use crate::reason_code::idology::IDologyReasonCode;
    use strum::IntoEnumIterator;

    #[test]
    fn test_vendor_reason_code_enum_use() {
        let reason_code1 = IDologyReasonCode::try_from("resultcode.coppa.alert").unwrap();
        assert_eq!(IDologyReasonCode::CoppaAlert, reason_code1);
        assert_eq!(
            "Customer is 13 or under.  COPPA laws forbid conducting e-commerce with people under 14 years of age. When this result is encountered, the input information and located data will not be available in any record of the transaction due to the issues around storing data on children.",
            reason_code1.description()
        );
        assert_eq!(
            Some(FootprintReasonCode::DobLocatedCoppaAlert),
            Into::<Option<FootprintReasonCode>>::into(&reason_code1)
        );

        let reason_code2 = IDologyReasonCode::try_from("resultcode.network.alert.ssn").unwrap();
        assert_eq!(IDologyReasonCode::NetworkAlertSsn, reason_code2);
        assert_eq!(
            "Indicates that the input SSN9 was found on the Network Alert List.",
            reason_code2.description()
        );
        assert_eq!(None, Into::<Option<FootprintReasonCode>>::into(&reason_code2));

        IDologyReasonCode::try_from("resultcode.keagan.is.a.beast").expect_err("should err");
    }

    #[test]
    fn test_match_codes_being_produced() {
        let footprint_reason_codes: Vec<FootprintReasonCode> = IDologyReasonCode::iter()
            .filter_map(|i| Into::<Option<FootprintReasonCode>>::into(&i))
            .collect();

        assert!(idology_match_codes::ADDRESS_DOES_NOT_MATCH_CODES
            .iter()
            .all(|r| footprint_reason_codes.contains(r)));
        assert!(idology_match_codes::ADDRESS_PARTIALLY_MATCHES_CODES
            .iter()
            .all(|r| footprint_reason_codes.contains(r)));
        assert!(idology_match_codes::DOB_YOB_CODES
            .iter()
            .all(|r| footprint_reason_codes.contains(r)));
        assert!(idology_match_codes::DOB_MOB_CODES
            .iter()
            .all(|r| footprint_reason_codes.contains(r)));
        assert!(idology_match_codes::SSN_DOES_NOT_MATCH_CODES
            .iter()
            .all(|r| footprint_reason_codes.contains(r)));
        assert!(idology_match_codes::SSN_PARTIALLY_MATCHES_CODES
            .iter()
            .all(|r| footprint_reason_codes.contains(r)));
        assert!(idology_match_codes::NAME_DOES_NOT_MATCH_CODES
            .iter()
            .all(|r| footprint_reason_codes.contains(r)));
    }
}
