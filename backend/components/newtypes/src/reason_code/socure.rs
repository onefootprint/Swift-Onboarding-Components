use crate::db_types::FootprintReasonCode;
use crate::vendor_reason_code_enum;
use strum::{
    Display,
    EnumIter,
};
use strum_macros::EnumString;

vendor_reason_code_enum! {
    #[derive(Debug, Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, Hash, EnumIter)]
    #[serde(try_from = "&str")]
    pub enum SocureReasonCode {
        #[ser = "I121", description = "Social networks match"]
        #[footprint_reason_code = None]
        I121,

        #[ser = "I127", description = "Online sources are representative of a broader digital footprint than just social networks"]
        #[footprint_reason_code = None]
        I127,

        #[ser = "I196", description = "Global Watchlist sources selected are not correlated with the input identifiers"]
        #[footprint_reason_code = None]
        I196,

        #[ser = "I201", description = "Name, address and SSN match"]
        #[footprint_reason_code = None]
        I201,

        #[ser = "I202", description = "The input SSN is an ITIN"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnInputIsItin)]
        I202,

        #[ser = "I203", description = "SSN was first seen in credit header records between 5 to 10 years ago"]
        #[footprint_reason_code = None]
        I203,

        #[ser = "I204", description = "SSN is first seen in credit header records more than 10 years ago"]
        #[footprint_reason_code = None]
        I204,

        #[ser = "I205", description = "SSN is found to be inquired once every 2 to 3 months"]
        #[footprint_reason_code = None]
        I205,

        #[ser = "I206", description = "SSN is found to be inquired once every 3 to 6 months"]
        #[footprint_reason_code = None]
        I206,

        #[ser = "I207", description = "SSN is found to be inquired once every 6 to 12 months"]
        #[footprint_reason_code = None]
        I207,

        #[ser = "I208", description = "SSN is found to be inquired less than once a year"]
        #[footprint_reason_code = None]
        I208,

        #[ser = "I401", description = "Device token previously encountered"]
        #[footprint_reason_code = None]
        I401,

        #[ser = "I402", description = "Multiple users associated with device"]
        #[footprint_reason_code = None]
        I402,

        #[ser = "I403", description = "Identity may not be primary device user"]
        #[footprint_reason_code = None]
        I403,

        #[ser = "I404", description = "Identity associated with primary device owner"]
        #[footprint_reason_code = None]
        I404,

        #[ser = "I405", description = "Device token previously associated with phone number"]
        #[footprint_reason_code = None]
        I405,

        #[ser = "I406", description = "Device token previously associated with email address"]
        #[footprint_reason_code = None]
        I406,

        #[ser = "I407", description = "Device token previously associated with first name"]
        #[footprint_reason_code = None]
        I407,

        #[ser = "I408", description = "Device token previously associated with last name"]
        #[footprint_reason_code = None]
        I408,

        #[ser = "I409", description = "Device token not encountered within the past 5 days"]
        #[footprint_reason_code = None]
        I409,

        #[ser = "I410", description = "Device session is associated with more than 2 phone numbers"]
        #[footprint_reason_code = None]
        I410,

        #[ser = "I411", description = "Device session is associated with more than 2 emails"]
        #[footprint_reason_code = None]
        I411,

        #[ser = "I412", description = "Device session is associated with more than 2 first names"]
        #[footprint_reason_code = None]
        I412,

        #[ser = "I413", description = "Device session is associated with more than 2 last names"]
        #[footprint_reason_code = None]
        I413,

        #[ser = "I414", description = "Session connected using a proxy"]
        #[footprint_reason_code = None]
        I414,

        #[ser = "I415", description = "Session connected using an IP located more than 100 miles from the address"]
        #[footprint_reason_code = None]
        I415,

        #[ser = "I416", description = "Session IP originates from within the United States"]
        #[footprint_reason_code = None]
        I416,

        #[ser = "I417", description = "Session IP originates from outside the United States"]
        #[footprint_reason_code = None]
        I417,

        #[ser = "I419", description = "Session connected using a residential IP address"]
        #[footprint_reason_code = None]
        I419,

        #[ser = "I420", description = "Session connected using a commercial IP address"]
        #[footprint_reason_code = None]
        I420,

        #[ser = "I421", description = "Session connected using a mobile IP address"]
        #[footprint_reason_code = None]
        I421,

        #[ser = "I423", description = "Device is a physical device"]
        #[footprint_reason_code = None]
        I423,

        #[ser = "I424", description = "The device type is a desktop or laptop computer"]
        #[footprint_reason_code = None]
        I424,

        #[ser = "I425", description = "The device type is mobile, tablet or wearable"]
        #[footprint_reason_code = None]
        I425,

        #[ser = "I520", description = "Emailrisk score represents low risk"]
        #[footprint_reason_code = None]
        I520,

        #[ser = "I550", description = "Email address is more than 180 days and less than 1 year old"]
        #[footprint_reason_code = None]
        I550,

        #[ser = "I551", description = "Email address is more than 1 year and less than 2 years old"]
        #[footprint_reason_code = None]
        I551,

        #[ser = "I553", description = "Email address is more than 2 years old"]
        #[footprint_reason_code = None]
        I553,

        #[ser = "I554", description = "Exact match between email and first name"]
        #[footprint_reason_code = None]
        I554,

        #[ser = "I555", description = "Email address domain is more than 180 days old"]
        #[footprint_reason_code = None]
        I555,

        #[ser = "I556", description = "Email address can be resolved to the individual"]
        #[footprint_reason_code = None]
        I556,

        #[ser = "I557", description = "Email is correlated with the first name"]
        #[footprint_reason_code = None]
        I557,

        #[ser = "I558", description = "Email is correlated with the last name"]
        #[footprint_reason_code = None]
        I558,

        #[ser = "I559", description = "Exact match between email and last name"]
        #[footprint_reason_code = None]
        I559,

        #[ser = "I560", description = "Email address domain represents a Fortune 500 company"]
        #[footprint_reason_code = None]
        I560,

        #[ser = "I561", description = "Email address domain represents a US College/University"]
        #[footprint_reason_code = None]
        I561,

        #[ser = "I562", description = "Email username contains ZIP code of current application"]
        #[footprint_reason_code = None]
        I562,

        #[ser = "I563", description = "Email address domain contains a special use domain (RFC, arpa, example, invalid, local, onion, etc.)"]
        #[footprint_reason_code = None]
        I563,

        #[ser = "I564", description = "Special characters which are not periods or underscores found in email alias"]
        #[footprint_reason_code = None]
        I564,

        #[ser = "I565", description = "Email username contains a role-level alias (employees, support, info, postmaster, admin, user, noreply, etc.)"]
        #[footprint_reason_code = None]
        I565,

        #[ser = "I566", description = "Email address provider is found in Public Web Source"]
        #[footprint_reason_code = None]
        I566,

        #[ser = "I567", description = "Email username contains five or more alphabetic sections"]
        #[footprint_reason_code = None]
        I567,

        #[ser = "I568", description = "Email handle contains a name"]
        #[footprint_reason_code = None]
        I568,

        #[ser = "I569", description = "Email handle contains input first name"]
        #[footprint_reason_code = None]
        I569,

        #[ser = "I570", description = "Email handle contains input surname"]
        #[footprint_reason_code = None]
        I570,

        #[ser = "I601", description = "Phone number is a landline"]
        #[footprint_reason_code = None]
        I601,

        #[ser = "I602", description = "Phone number is a mobile line"]
        #[footprint_reason_code = None]
        I602,

        #[ser = "I605", description = "Phone number is a premium-rate line"]
        #[footprint_reason_code = None]
        I605,

        #[ser = "I608", description = "Phone number is commercial or dual-purpose"]
        #[footprint_reason_code = None]
        I608,

        #[ser = "I609", description = "Phone number is consumer or residential"]
        #[footprint_reason_code = None]
        I609,

        #[ser = "I610", description = "Phone number is correlated with the address"]
        #[footprint_reason_code = None]
        I610,

        #[ser = "I611", description = "Phone number is associated with a major US carrier"]
        #[footprint_reason_code = None]
        I611,

        #[ser = "I614", description = "Phone number has been in service more than 365 days"]
        #[footprint_reason_code = None]
        I614,

        #[ser = "I616", description = "Phone number is associated with a Mobile Virtual Network Operator"]
        #[footprint_reason_code = None]
        I616,

        #[ser = "I618", description = "Phone number can be resolved to the individual"]
        #[footprint_reason_code = None]
        I618,

        #[ser = "I620", description = "Phonerisk score represents low risk"]
        #[footprint_reason_code = None]
        I620,

        #[ser = "I621", description = "Phone is correlated with the first name"]
        #[footprint_reason_code = None]
        I621,

        #[ser = "I622", description = "Phone is correlated with the last name"]
        #[footprint_reason_code = None]
        I622,

        #[ser = "I623", description = "Exact match between phone and first name"]
        #[footprint_reason_code = None]
        I623,

        #[ser = "I624", description = "Exact match between phone and last name"]
        #[footprint_reason_code = None]
        I624,

        #[ser = "I625", description = "Phone number has never been ported"]
        #[footprint_reason_code = None]
        I625,

        #[ser = "I626", description = "Phone number was ported at least 60 days ago"]
        #[footprint_reason_code = None]
        I626,

        #[ser = "I630", description = "Phone subscriber has been correlated with the input phone number for more than 365 days"]
        #[footprint_reason_code = None]
        I630,

        #[ser = "I631", description = "IP address is provided by a mobile carrier"]
        #[footprint_reason_code = None]
        I631,

        #[ser = "I632", description = "IP Connection is consumer"]
        #[footprint_reason_code = None]
        I632,

        #[ser = "I633", description = "IP Connection is business"]
        #[footprint_reason_code = None]
        I633,

        #[ser = "I634", description = "Proxy is an educational institution"]
        #[footprint_reason_code = None]
        I634,

        #[ser = "I635", description = "Proxy is registered to a corporation"]
        #[footprint_reason_code = None]
        I635,

        #[ser = "I636", description = "IP address originates from the US or US territories"]
        #[footprint_reason_code = None]
        I636,

        #[ser = "I637", description = "Email address is associated with the input phone number"]
        #[footprint_reason_code = None]
        I637,

        #[ser = "I638", description = "IP proxy is originating from Google or Apple consumer privacy networks"]
        #[footprint_reason_code = None]
        I638,

        #[ser = "I639", description = "IP address is a consumer privacy network proxy"]
        #[footprint_reason_code = None]
        I639,

        #[ser = "I704", description = "Address is multi-unit or high rise"]
        #[footprint_reason_code = None]
        I704,

        #[ser = "I705", description = "Address is single unit"]
        #[footprint_reason_code = None]
        I705,

        #[ser = "I706", description = "Address is an accredited college or university"]
        #[footprint_reason_code = None]
        I706,

        #[ser = "I707", description = "Address is residential"]
        #[footprint_reason_code = None]
        I707,

        #[ser = "I708", description = "Address can be resolved to the individual"]
        #[footprint_reason_code = None]
        I708,

        #[ser = "I709", description = "Address is correlated with the first name"]
        #[footprint_reason_code = None]
        I709,

        #[ser = "I710", description = "Address is correlated with the last name"]
        #[footprint_reason_code = None]
        I710,

        #[ser = "I711", description = "Address is confirmed as deliverable"]
        #[footprint_reason_code = None]
        I711,

        #[ser = "I712", description = "Address is confirmed deliverable by dropping secondary information (apartment, unit, etc.)"]
        #[footprint_reason_code = None]
        I712,

        #[ser = "I713", description = "Address is confirmed deliverable but was missing secondary information (apartment, unit, etc.)"]
        #[footprint_reason_code = None]
        I713,

        #[ser = "I714", description = "Address is valid but doesn't currently receive US Postal Service street delivery"]
        #[footprint_reason_code = None]
        I714,

        #[ser = "I715", description = "Address is correlated with a past address"]
        #[footprint_reason_code = None]
        I715,

        #[ser = "I716", description = "Address is a Small Office/Home Office (SOHO)"]
        #[footprint_reason_code = None]
        I716,

        #[ser = "I718", description = "Exact match between address and first name"]
        #[footprint_reason_code = None]
        I718,

        #[ser = "I719", description = "Exact match between address and last name"]
        #[footprint_reason_code = None]
        I719,

        #[ser = "I720", description = "Addressrisk score represents low risk"]
        #[footprint_reason_code = None]
        I720,

        #[ser = "I721", description = "Email address is correlated with the input physical address"]
        #[footprint_reason_code = None]
        I721,

        #[ser = "I722", description = "Email address is partially correlated with the input physical address"]
        #[footprint_reason_code = None]
        I722,

        #[ser = "I805", description = "Document resolutions insufficient for detailed analysis"]
        #[footprint_reason_code = None]
        I805,

        #[ser = "I808", description = "Document image resolution is insufficient"]
        #[footprint_reason_code = None]
        I808,

        #[ser = "I820", description = "Headshot passes integrity checks"]
        #[footprint_reason_code = None]
        I820,

        #[ser = "I822", description = "First name extracted from document correlates with input name"]
        #[footprint_reason_code = None]
        I822,

        #[ser = "I823", description = "Last name extracted from document correlates with input name"]
        #[footprint_reason_code = None]
        I823,

        #[ser = "I824", description = "Address extracted from document correlates with input address"]
        #[footprint_reason_code = None]
        I824,

        #[ser = "I825", description = "DOB extracted from document correlates with input DOB"]
        #[footprint_reason_code = None]
        I825,

        #[ser = "I826", description = "Document number extracted from document correlates with input number"]
        #[footprint_reason_code = None]
        I826,

        #[ser = "I831", description = "Minimum required information extracted from document Barcode"]
        #[footprint_reason_code = None]
        I831,

        #[ser = "I832", description = "Document number extracted from document correlates with barcode or MRZ"]
        #[footprint_reason_code = None]
        I832,

        #[ser = "I833", description = "Minimum required information extracted from document MRZ"]
        #[footprint_reason_code = None]
        I833,

        #[ser = "I834", description = "Self-portrait passes liveness checks"]
        #[footprint_reason_code = None]
        I834,

        #[ser = "I836", description = "Document image correlates with self-portrait"]
        #[footprint_reason_code = None]
        I836,

        #[ser = "I837", description = "Self-portrait was not considered in decision"]
        #[footprint_reason_code = None]
        I837,

        #[ser = "I838", description = "Minimum Required Information extracted from the document"]
        #[footprint_reason_code = None]
        I838,

        #[ser = "I839", description = "Name extracted from document correlates with barcode and MRZ"]
        #[footprint_reason_code = None]
        I839,

        #[ser = "I840", description = "Address extracted from document correlates with barcode and MRZ"]
        #[footprint_reason_code = None]
        I840,

        #[ser = "I841", description = "DOB on document matches DOB on barcode or MRZ"]
        #[footprint_reason_code = None]
        I841,

        #[ser = "I842", description = "Expiration date on document matches date on barcode or MRZ"]
        #[footprint_reason_code = None]
        I842,

        #[ser = "I843", description = "Issue date on document matches date on barcode or MRZ"]
        #[footprint_reason_code = None]
        I843,

        #[ser = "I844", description = "Dates on document are valid"]
        #[footprint_reason_code = None]
        I844,

        #[ser = "I845", description = "Age meets minimum requirements"]
        #[footprint_reason_code = None]
        I845,

        #[ser = "I846", description = "Expired document within the grace period specified"]
        #[footprint_reason_code = None]
        I846,

        #[ser = "I847", description = "Document about to expire within the future grace period."]
        #[footprint_reason_code = None]
        I847,

        #[ser = "I848", description = "The document is not captured properly"]
        #[footprint_reason_code = None]
        I848,

        #[ser = "I849", description = "Incorrect ID type selected"]
        #[footprint_reason_code = None]
        I849,

        #[ser = "I854", description = "The back of the license was not passed; no barcode to extract information"]
        #[footprint_reason_code = None]
        I854,

        #[ser = "I855", description = "First Name matches with a known Nick Name or Alias"]
        #[footprint_reason_code = None]
        I855,

        #[ser = "I856", description = "Liveness was not determined"]
        #[footprint_reason_code = None]
        I856,

        #[ser = "I860", description = "Facial correlation was not calculated"]
        #[footprint_reason_code = None]
        I860,

        #[ser = "I903", description = "Address was not provided at input"]
        #[footprint_reason_code = None]
        I903,

        #[ser = "I904", description = "SSN/ITIN was not provided at input"]
        #[footprint_reason_code = None]
        I904,

        #[ser = "I905", description = "SSN/ITIN provided at input contained only 4 digits"]
        #[footprint_reason_code = None]
        I905,

        #[ser = "I906", description = "DOB was not provided at input"]
        #[footprint_reason_code = None]
        I906,

        #[ser = "I907", description = "SSN is issued to a non-US citizen"]
        #[footprint_reason_code = None]
        I907,

        #[ser = "I908", description = "Address is correlated with a military ZIP code"]
        #[footprint_reason_code = None]
        I908,

        #[ser = "I909", description = "First name and last name are possibly reversed"]
        #[footprint_reason_code = None]
        I909,

        #[ser = "I910", description = "Address is correlated with a past address"]
        #[footprint_reason_code = None]
        I910,

        #[ser = "I911", description = "Address is a PO Box"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressInputIsPoBox)]
        I911,

        #[ser = "I912", description = "SSN was randomly-issued by the SSA"]
        #[footprint_reason_code = None]
        I912,

        #[ser = "I917", description = "Full name and address can be resolved to the individual but the SSN/ITIN is not"]
        #[footprint_reason_code = None]
        I917,

        #[ser = "I919", description = "Full name, address, and SSN/ITIN can be resolved to the individual"]
        #[footprint_reason_code = None]
        I919,

        #[ser = "I920", description = "Emerging identity indicator"]
        #[footprint_reason_code = None]
        I920,

        #[ser = "I921", description = "Address is an accredited college or university"]
        #[footprint_reason_code = None]
        I921,

        #[ser = "I930", description = "The name and DOB of the identity matches a notable personality/celebrity"]
        #[footprint_reason_code = None]
        I930,

        #[ser = "I931", description = "First name or last name may refer to a non-person entity"]
        #[footprint_reason_code = None]
        I931,

        #[ser = "I975", description = "Non-MLA covered borrower status"]
        #[footprint_reason_code = None]
        I975,

        #[ser = "I998", description = "Name, SSN and DOB correlation verified by SSA"]
        #[footprint_reason_code = None]
        I998,

        #[ser = "I999", description = "Identity decease unverified by SSA"]
        #[footprint_reason_code = None]
        I999,

        #[ser = "R106", description = "Identity element in Alert List"]
        #[footprint_reason_code = None]
        R106,

        #[ser = "R110", description = "Alert List email address match"]
        #[footprint_reason_code = None]
        R110,

        #[ser = "R111", description = "Alert List SSN/ITIN match"]
        #[footprint_reason_code = None]
        R111,

        #[ser = "R113", description = "Alert List phone number match"]
        #[footprint_reason_code = None]
        R113,

        #[ser = "R180", description = "Watchlist search returned at least one hit on OFAC SDN list"]
        #[footprint_reason_code = None]
        R180,

        #[ser = "R181", description = "Watchlist search returned at least one hit on OFAC Non-SDN lists"]
        #[footprint_reason_code = None]
        R181,

        #[ser = "R182", description = "Watchlist search returned at least one hit on a sanction list excluding any OFAC hits"]
        #[footprint_reason_code = None]
        R182,

        #[ser = "R183", description = "Watchlist search returned at least one hit on an enforcement list excluding any OFAC hits"]
        #[footprint_reason_code = None]
        R183,

        #[ser = "R184", description = "Watchlist search returned at least one hit on a politically exposed person"]
        #[footprint_reason_code = None]
        R184,

        #[ser = "R185", description = "Watchlist search returned at least one entity that had adverse media articles"]
        #[footprint_reason_code = None]
        R185,

        #[ser = "R186", description = "Global Watchlist sources selected are correlated with the input identifiers"]
        #[footprint_reason_code = None]
        R186,

        #[ser = "R201", description = "The input SSN is invalid"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnInputIsInvalid)]
        R201,

        #[ser = "R202", description = "The input SSN is reported as deceased"]
        #[footprint_reason_code = Some(FootprintReasonCode::SubjectDeceased)]
        R202,

        #[ser = "R203", description = "Multiple identities associated with input SSN"]
        #[footprint_reason_code = None]
        R203,

        #[ser = "R204", description = "Entered SSN associated with multiple last names"]
        #[footprint_reason_code = None]
        R204,

        #[ser = "R205", description = "Entered SSN associated with different name and address"]
        #[footprint_reason_code = None]
        R205,

        #[ser = "R206", description = "The input SSN was issued prior to the input date-of-birth"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnIssuedPriorToDob)]
        R206,

        #[ser = "R207", description = "SSN/ITIN is associated with multiple DOBs"]
        #[footprint_reason_code = None]
        R207,

        #[ser = "R208", description = "SSN/ITIN is associated with multiple addresses"]
        #[footprint_reason_code = None]
        R208,

        #[ser = "R209", description = "No former addresses associated with the SSN"]
        #[footprint_reason_code = None]
        R209,

        #[ser = "R210", description = "Frequency of SSN in Socure records is unusually high"]
        #[footprint_reason_code = None]
        R210,

        #[ser = "R211", description = "SSN seen in frozen credit files"]
        #[footprint_reason_code = None]
        R211,

        #[ser = "R212", description = "The input last name is not associated with the input SSN"]
        #[footprint_reason_code = None]
        R212,

        #[ser = "R213", description = "Name does not correlate with the name for the resolved public record individual"]
        #[footprint_reason_code = None]
        R213,

        #[ser = "R214", description = "SSN/ITIN cannot be resolved to the individual"]
        #[footprint_reason_code = None]
        R214,

        #[ser = "R215", description = "First name does not match SSN"]
        #[footprint_reason_code = None]
        R215,

        #[ser = "R216", description = "Unable to verify date-of-birth"]
        #[footprint_reason_code = None]
        R216,

        #[ser = "R217", description = "SSN was randomly-issued by the SSA"]
        #[footprint_reason_code = None]
        R217,

        #[ser = "R218", description = "The input SSN is not the primary SSN for the input identity"]
        #[footprint_reason_code = None]
        R218,

        #[ser = "R219", description = "The input SSN is not found in public records"]
        #[footprint_reason_code = None]
        R219,

        #[ser = "R220", description = "Issue date for the provided SSN could not be resolved"]
        #[footprint_reason_code = None]
        R220,

        #[ser = "R221", description = "SSN associated with input phone number could not be confirmed"]
        #[footprint_reason_code = None]
        R221,

        #[ser = "R222", description = "Input SSN could not be confirmed"]
        #[footprint_reason_code = None]
        R222,

        #[ser = "R223", description = "Input SSN did not match any of the SSN's associated with the input phone number in the last two years"]
        #[footprint_reason_code = None]
        R223,

        #[ser = "R224", description = "4 or more different SSNs have been found to be inquired against the input phone"]
        #[footprint_reason_code = None]
        R224,

        #[ser = "R225", description = "4 or more different first names have been found to be inquired against the input SSN"]
        #[footprint_reason_code = None]
        R225,

        #[ser = "R226", description = "Multiple phones are marked current for the input SSN"]
        #[footprint_reason_code = None]
        R226,

        #[ser = "R227", description = "SSN is found to be inquired at a very frequent rate of less than once a month"]
        #[footprint_reason_code = None]
        R227,

        #[ser = "R228", description = "Only 1 component of the input DOB matches the best matched entity"]
        #[footprint_reason_code = None]
        R228,

        #[ser = "R229", description = "Only 2 components of the input DOB matches the best matched entity"]
        #[footprint_reason_code = None]
        R229,

        #[ser = "R230", description = "SSN was first seen in credit header records within the last 1 year"]
        #[footprint_reason_code = None]
        R230,

        #[ser = "R231", description = "SSN was first seen in credit header records between 1 to 3 years ago"]
        #[footprint_reason_code = None]
        R231,

        #[ser = "R232", description = "SSN was first seen in credit header records between 3 to 5 years ago"]
        #[footprint_reason_code = None]
        R232,

        #[ser = "R233", description = "No SSN found in credit header records for the given full name and DOB"]
        #[footprint_reason_code = None]
        R233,

        #[ser = "R234", description = "SSNs in credit header data associated with full name and DOB differ from input SSN by 1 digit"]
        #[footprint_reason_code = None]
        R234,

        #[ser = "R235", description = "Input full name could not be fuzzy-matched with full names associated with SSN in header and inquiry records"]
        #[footprint_reason_code = None]
        R235,

        #[ser = "R236", description = "Input DOB month does not match any DOB month found on inquiry records"]
        #[footprint_reason_code = None]
        R236,

        #[ser = "R237", description = "Input SSN does not match the SSN's associated with the given full name and DOB"]
        #[footprint_reason_code = None]
        R237,

        #[ser = "R238", description = "SSNs in credit header data associated with full name and DOB differ from input SSN by up to 2 digits"]
        #[footprint_reason_code = None]
        R238,

        #[ser = "R239", description = "SSNs in credit header data associated with full name and DOB differ from input SSN by up to 3 digits"]
        #[footprint_reason_code = None]
        R239,

        #[ser = "R298", description = "Identity resembles a manipulated Synthetic identity"]
        #[footprint_reason_code = None]
        R298,

        #[ser = "R299", description = "Identity resembles a fabricated Synthetic identity"]
        #[footprint_reason_code = None]
        R299,

        #[ser = "R350", description = "DOB indicates individual is less than 16 or more than 100 years old"]
        #[footprint_reason_code = None]
        R350,

        #[ser = "R351", description = "DOB indicates COPPA review"]
        #[footprint_reason_code = None]
        R351,

        #[ser = "R352", description = "DOB indicates an age between 13 and 15"]
        #[footprint_reason_code = None]
        R352,

        #[ser = "R353", description = "DOB indicates an age between 16 and 17"]
        #[footprint_reason_code = None]
        R353,

        #[ser = "R355", description = "DOB indicates an improbable age"]
        #[footprint_reason_code = None]
        R355,

        #[ser = "R401", description = "Device token was not previously encountered"]
        #[footprint_reason_code = None]
        R401,

        #[ser = "R402", description = "Invalid device token"]
        #[footprint_reason_code = None]
        R402,

        #[ser = "R403", description = "Device is a virtual device"]
        #[footprint_reason_code = None]
        R403,

        #[ser = "R405", description = "The Device Risk module was called, but a device token was not provided"]
        #[footprint_reason_code = None]
        R405,

        #[ser = "R406", description = "Device risk score represents high risk"]
        #[footprint_reason_code = None]
        R406,

        #[ser = "R520", description = "Emailrisk score represents high risk"]
        #[footprint_reason_code = None]
        R520,

        #[ser = "R551", description = "Email address is invalid"]
        #[footprint_reason_code = None]
        R551,

        #[ser = "R557", description = "Email address is disposable"]
        #[footprint_reason_code = None]
        R557,

        #[ser = "R558", description = "Email address is auto-generated"]
        #[footprint_reason_code = None]
        R558,

        #[ser = "R559", description = "Email address cannot be resolved to the individual"]
        #[footprint_reason_code = None]
        R559,

        #[ser = "R560", description = "Majority of characters in username are numbers"]
        #[footprint_reason_code = None]
        R560,

        #[ser = "R561", description = "Email address is less than 180 days old"]
        #[footprint_reason_code = None]
        R561,

        #[ser = "R562", description = "Email address domain is less than 180 days old"]
        #[footprint_reason_code = None]
        R562,

        #[ser = "R563", description = "Email address domain is invalid"]
        #[footprint_reason_code = None]
        R563,

        #[ser = "R564", description = "Email address username is invalid"]
        #[footprint_reason_code = None]
        R564,

        #[ser = "R565", description = "Email address domain represents high risk"]
        #[footprint_reason_code = None]
        R565,

        #[ser = "R566", description = "Email address has not been seen before"]
        #[footprint_reason_code = None]
        R566,

        #[ser = "R567", description = "Email address top-level domain represents high risk"]
        #[footprint_reason_code = None]
        R567,

        #[ser = "R568", description = "Email username appears to be scrambled"]
        #[footprint_reason_code = None]
        R568,

        #[ser = "R569", description = "Email string is unusually long"]
        #[footprint_reason_code = None]
        R569,

        #[ser = "R571", description = "Low activity observed on the email address in the last 180 days"]
        #[footprint_reason_code = None]
        R571,

        #[ser = "R572", description = "Email associated with more than 2 phone numbers in the last 2 years"]
        #[footprint_reason_code = None]
        R572,

        #[ser = "R573", description = "Email handle contains trigrams (groups of 3 consecutive letters) that have unusually low occurrence rates"]
        #[footprint_reason_code = None]
        R573,

        #[ser = "R574", description = "Email handle is composed of more than 50% symbols (i.e. ._)"]
        #[footprint_reason_code = None]
        R574,

        #[ser = "R601", description = "Phone number associated address is not correlated with the input address"]
        #[footprint_reason_code = None]
        R601,

        #[ser = "R602", description = "Phone number associated address is not correlated with the input country"]
        #[footprint_reason_code = None]
        R602,

        #[ser = "R603", description = "Phone number is invalid"]
        #[footprint_reason_code = Some(FootprintReasonCode::PhoneNumberInputInvalid)]
        R603,

        #[ser = "R604", description = "Phone number has not been actively used within the past 90 days"]
        #[footprint_reason_code = None]
        R604,

        #[ser = "R605", description = "Phone number has not been actively used for more than 90 days"]
        #[footprint_reason_code = None]
        R605,

        #[ser = "R606", description = "Phone number is not actively used"]
        #[footprint_reason_code = None]
        R606,

        #[ser = "R607", description = "Phone number associated address is partially correlated with the input address"]
        #[footprint_reason_code = None]
        R607,

        #[ser = "R608", description = "Phone number cannot be resolved to the individual"]
        #[footprint_reason_code = None]
        R608,

        #[ser = "R610", description = "IP address geolocation places user more than 100 miles from address"]
        #[footprint_reason_code = None]
        R610,

        #[ser = "R611", description = "Phone number is not allowed for consumers"]
        #[footprint_reason_code = None]
        R611,

        #[ser = "R613", description = "Phone number is fixed or traditional VoIP"]
        #[footprint_reason_code = None]
        R613,

        #[ser = "R614", description = "Phone number is toll-free"]
        #[footprint_reason_code = None]
        R614,

        #[ser = "R615", description = "Phone number is non-fixed or over-the-top VoIP"]
        #[footprint_reason_code = None]
        R615,

        #[ser = "R616", description = "Phone number is prepaid"]
        #[footprint_reason_code = None]
        R616,

        #[ser = "R617", description = "Phone number is not associated with a major US carrier"]
        #[footprint_reason_code = None]
        R617,

        #[ser = "R618", description = "Phone number has been in service between 90 and 365 days"]
        #[footprint_reason_code = None]
        R618,

        #[ser = "R619", description = "IP address is a known proxy"]
        #[footprint_reason_code = Some(FootprintReasonCode::IpAlertHighRiskProxy)]
        R619,

        #[ser = "R620", description = "Phonerisk score represents high risk"]
        #[footprint_reason_code = None]
        R620,

        #[ser = "R622", description = "Phone number has been in service between 7 and 30 days"]
        #[footprint_reason_code = None]
        R622,

        #[ser = "R623", description = "Phone number has been in service between 30 and 90 days"]
        #[footprint_reason_code = None]
        R623,

        #[ser = "R625", description = "Phone number has ported within the past 24 hours"]
        #[footprint_reason_code = None]
        R625,

        #[ser = "R626", description = "Phone number has been ported within the past 2 to 7 days"]
        #[footprint_reason_code = None]
        R626,

        #[ser = "R627", description = "Phone number has been ported within the past 7 to 30 days"]
        #[footprint_reason_code = None]
        R627,

        #[ser = "R628", description = "Phone number has been ported within the past 30 to 60 days"]
        #[footprint_reason_code = None]
        R628,

        #[ser = "R631", description = "Phone subscriber has been correlated with the input phone number for between 7 and 30 days"]
        #[footprint_reason_code = None]
        R631,

        #[ser = "R632", description = "Phone subscriber has been correlated with the input phone number for between 30 and 90 days"]
        #[footprint_reason_code = None]
        R632,

        #[ser = "R633", description = "Phone subscriber has been correlated with the input phone number for between 90 and 365 days"]
        #[footprint_reason_code = None]
        R633,

        #[ser = "R639", description = "IP address originates from outside of the US or US territories"]
        #[footprint_reason_code = None]
        R639,

        #[ser = "R640", description = "IP address originates from an OFAC sanctioned country"]
        #[footprint_reason_code = None]
        R640,

        #[ser = "R641", description = "Proxy is from services that change location to beat DRM,TOR points, temporary proxies and other masking services"]
        #[footprint_reason_code = None]
        R641,

        #[ser = "R642", description = "IP address is associated with a cloud hosting provider and is likely a proxy. Users are not usually located in a hosting facility"]
        #[footprint_reason_code = None]
        R642,

        #[ser = "R643", description = "IP address is associated with a location allowing public internet access"]
        #[footprint_reason_code = None]
        R643,

        #[ser = "R644", description = "IP proxy is cloud-based"]
        #[footprint_reason_code = None]
        R644,

        #[ser = "R645", description = "IP proxy is TOR-based"]
        #[footprint_reason_code = Some(FootprintReasonCode::IpTorExitNode)]
        R645,

        #[ser = "R646", description = "IP proxy is VPN-based"]
        #[footprint_reason_code = None]
        R646,

        #[ser = "R647", description = "IP proxy is cloud-security-based"]
        #[footprint_reason_code = None]
        R647,

        #[ser = "R648", description = "Phone number has had a name change in the last 3 days"]
        #[footprint_reason_code = None]
        R648,

        #[ser = "R650", description = "IP address is associated with an anonymizing proxy"]
        #[footprint_reason_code = Some(FootprintReasonCode::IpAlertHighRiskProxy)]
        R650,

        #[ser = "R652", description = "IP address is associated with spam activity"]
        #[footprint_reason_code = None]
        R652,

        #[ser = "R653", description = "IP address origin & usage indicates non-human traffic"]
        #[footprint_reason_code = None]
        R653,

        #[ser = "R654", description = "Phone number seen in frozen credit files"]
        #[footprint_reason_code = None]
        R654,

        #[ser = "R655", description = "Phone number was first seen less than 50 days ago"]
        #[footprint_reason_code = None]
        R655,

        #[ser = "R656", description = "Phone number seen in credit files flagged as having initial fraud alerts"]
        #[footprint_reason_code = None]
        R656,

        #[ser = "R657", description = "Input surname has not been associated with the phone number for more than 2 years"]
        #[footprint_reason_code = None]
        R657,

        #[ser = "R658", description = "Input surname has not been primarily used with the phone number for more than 2 years"]
        #[footprint_reason_code = None]
        R658,

        #[ser = "R659", description = "Phone number has been associated with more than two email addresses in the last 60 days"]
        #[footprint_reason_code = None]
        R659,

        #[ser = "R660", description = "Two or more addresses are marked as current in the phone public records"]
        #[footprint_reason_code = None]
        R660,

        #[ser = "R661", description = "No inquiry is found against this phone number"]
        #[footprint_reason_code = None]
        R661,

        #[ser = "R662", description = "The phone number was first seen less than sixty days ago within Socure network"]
        #[footprint_reason_code = None]
        R662,

        #[ser = "R701", description = "Address is inactive, not receiving mail, or vacant"]
        #[footprint_reason_code = None]
        R701,

        #[ser = "R702", description = "Address is not confirmed as deliverable"]
        #[footprint_reason_code = None]
        R702,

        #[ser = "R703", description = "Address is invalid or does not exist"]
        #[footprint_reason_code = None]
        R703,

        #[ser = "R704", description = "Address is a correctional facility"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressInputIsCorrectionalFacility)]
        R704,

        #[ser = "R705", description = "Address cannot be resolved to the individual"]
        #[footprint_reason_code = None]
        R705,

        #[ser = "R707", description = "Address is a commercial mail receiving agency or commercial mail drop"]
        #[footprint_reason_code = None]
        R707,

        #[ser = "R708", description = "Address is a PO Box"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressInputIsPoBox)]
        R708,

        #[ser = "R709", description = "Address is commercial or dual-purpose"]
        #[footprint_reason_code = None]
        R709,

        #[ser = "R710", description = "Address is a military location"]
        #[footprint_reason_code = None]
        R710,

        #[ser = "R711", description = "Address is a unique ZIP code, or corporate only, routing all mail internally by the assigned organization rather than by the USPS"]
        #[footprint_reason_code = None]
        R711,

        #[ser = "R712", description = "Address ZIP code is invalid"]
        #[footprint_reason_code = None]
        R712,

        #[ser = "R713", description = "Address mismatch between city, state, and ZIP code"]
        #[footprint_reason_code = None]
        R713,

        #[ser = "R714", description = "Address is fuzzy matched to the address on record"]
        #[footprint_reason_code = None]
        R714,

        #[ser = "R720", description = "Addressrisk score represents high risk"]
        #[footprint_reason_code = None]
        R720,

        #[ser = "R721", description = "Email address is not correlated with the input physical address"]
        #[footprint_reason_code = None]
        R721,

        #[ser = "R722", description = "The input state or ZIP was corrected during address standardisation"]
        #[footprint_reason_code = None]
        R722,

        #[ser = "R804", description = "Document image doesn't meet the minimum color requirements"]
        #[footprint_reason_code = None]
        R804,

        #[ser = "R810", description = "Document pattern and layout integrity check failed"]
        #[footprint_reason_code = None]
        R810,

        #[ser = "R819", description = "Image captured from a screen, or is a paper copy of an ID"]
        #[footprint_reason_code = None]
        R819,

        #[ser = "R820", description = "Document headshot has been modified"]
        #[footprint_reason_code = None]
        R820,

        #[ser = "R822", description = "First name extracted from document does not match input first name"]
        #[footprint_reason_code = None]
        R822,

        #[ser = "R823", description = "Last name extracted from document does not match input last name"]
        #[footprint_reason_code = None]
        R823,

        #[ser = "R824", description = "Address extracted from document does not match input address"]
        #[footprint_reason_code = None]
        R824,

        #[ser = "R825", description = "DOB extracted from document does not match input DOB"]
        #[footprint_reason_code = None]
        R825,

        #[ser = "R826", description = "Document Number extracted from document does not match input number"]
        #[footprint_reason_code = None]
        R826,

        #[ser = "R827", description = "Document is expired"]
        #[footprint_reason_code = None]
        R827,

        #[ser = "R831", description = "Cannot extract the minimum information from barcode"]
        #[footprint_reason_code = None]
        R831,

        #[ser = "R832", description = "Document Number extracted from document does not match with barcode or MRZ"]
        #[footprint_reason_code = None]
        R832,

        #[ser = "R833", description = "Cannot extract the minimum required information from MRZ"]
        #[footprint_reason_code = None]
        R833,

        #[ser = "R834", description = "Selfie fails the liveness check"]
        #[footprint_reason_code = None]
        R834,

        #[ser = "R835", description = "More than one face detected in the selfie"]
        #[footprint_reason_code = None]
        R835,

        #[ser = "R836", description = "Document image does not correlate with self-portrait"]
        #[footprint_reason_code = None]
        R836,

        #[ser = "R838", description = "Minimum amount of information cannot be extracted from document"]
        #[footprint_reason_code = None]
        R838,

        #[ser = "R839", description = "Name extracted from document does not match with barcode or MRZ"]
        #[footprint_reason_code = None]
        R839,

        #[ser = "R840", description = "Address extracted from document does not match with barcode or MRZ"]
        #[footprint_reason_code = None]
        R840,

        #[ser = "R841", description = "DOB on document does not match DOB on barcode or MRZ"]
        #[footprint_reason_code = None]
        R841,

        #[ser = "R842", description = "Expiration date on document does not match date on barcode or MRZ"]
        #[footprint_reason_code = None]
        R842,

        #[ser = "R843", description = "Issue date on document does not match date on barcode or MRZ"]
        #[footprint_reason_code = None]
        R843,

        #[ser = "R844", description = "Dates on document are not valid"]
        #[footprint_reason_code = None]
        R844,

        #[ser = "R845", description = "Minimum age criteria not met"]
        #[footprint_reason_code = None]
        R845,

        #[ser = "R850", description = "Self-portrait or the headshot is not usable for Facial Match"]
        #[footprint_reason_code = None]
        R850,

        #[ser = "R851", description = "Document number is an example number, or is not valid"]
        #[footprint_reason_code = None]
        R851,

        #[ser = "R852", description = "Submitted document is a temporary ID"]
        #[footprint_reason_code = None]
        R852,

        #[ser = "R853", description = "Unable to classify the ID or this is an unsupported ID type"]
        #[footprint_reason_code = None]
        R853,

        #[ser = "R856", description = "Obstructions on the face affecting the liveness"]
        #[footprint_reason_code = None]
        R856,

        #[ser = "R857", description = "No face found in the selfie frame"]
        #[footprint_reason_code = None]
        R857,

        #[ser = "R858", description = "The age on the document doesn't correlate with the selfie predicted age"]
        #[footprint_reason_code = None]
        R858,

        #[ser = "R859", description = "ID front correlates with another submitted ID front"]
        #[footprint_reason_code = None]
        R859,

        #[ser = "R861", description = "Data extracted from document does not match with barcode or MRZ"]
        #[footprint_reason_code = None]
        R861,

        #[ser = "R862", description = "The document could not be classified"]
        #[footprint_reason_code = None]
        R862,

        #[ser = "R901", description = "SSN/ITIN cannot be resolved to the individual"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnDoesNotMatch)]
        R901,

        #[ser = "R902", description = "Name cannot be resolved to the individual"]
        #[footprint_reason_code = None]
        R902,

        #[ser = "R907", description = "SSN has been reported as deceased"]
        #[footprint_reason_code = Some(FootprintReasonCode::SubjectDeceased)]
        R907,

        #[ser = "R909", description = "Identity has been reported as deceased"]
        #[footprint_reason_code = Some(FootprintReasonCode::SubjectDeceased)]
        R909,

        #[ser = "R911", description = "SSN issued prior to DOB"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnIssuedPriorToDob)]
        R911,

        #[ser = "R913", description = "SSN/ITIN is invalid"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnInputIsInvalid)]
        R913,

        #[ser = "R916", description = "Address is invalid or does not exist"]
        #[footprint_reason_code = None]
        R916,

        #[ser = "R919", description = "Address cannot be resolved to the individual"]
        #[footprint_reason_code = None]
        R919,

        #[ser = "R922", description = "DOB cannot be resolved to the individual"]
        #[footprint_reason_code = None]
        R922,

        #[ser = "R923", description = "SSN/ITIN was fuzzy matched to the SSN/ITIN on record"]
        #[footprint_reason_code = None]
        R923,

        #[ser = "R924", description = "Address was fuzzy matched to the address on record"]
        #[footprint_reason_code = None]
        R924,

        #[ser = "R927", description = "Name does not correlate with the name for the resolved individual"]
        #[footprint_reason_code = None]
        R927,

        #[ser = "R928", description = "SSN/ITIN is associated with multiple last names"]
        #[footprint_reason_code = None]
        R928,

        #[ser = "R930", description = "First name does not correlate with the first name for the resolved individual"]
        #[footprint_reason_code = None]
        R930,

        #[ser = "R932", description = "Address is a correctional facility"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressInputIsCorrectionalFacility)]
        R932,

        #[ser = "R933", description = "Last name is not correlated with the SSN/ITIN on record"]
        #[footprint_reason_code = None]
        R933,

        #[ser = "R934", description = "First name is not correlated with the SSN/ITIN on record"]
        #[footprint_reason_code = None]
        R934,

        #[ser = "R939", description = "SSN/ITIN is correlated with the first name but not the last name"]
        #[footprint_reason_code = None]
        R939,

        #[ser = "R940", description = "SSN/ITIN not found in public records"]
        #[footprint_reason_code = None]
        R940,

        #[ser = "R941", description = "SSN/ITIN is correlated with at least 1 other name and address"]
        #[footprint_reason_code = None]
        R941,

        #[ser = "R944", description = "Last name was fuzzy matched to the name on record"]
        #[footprint_reason_code = None]
        R944,

        #[ser = "R946", description = "DOB was fuzzy matched to the DOB on record"]
        #[footprint_reason_code = None]
        R946,

        #[ser = "R947", description = "SSN/ITIN is not the primary SSN/ITIN for the resolved identity"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnDoesNotMatch)]
        R947,

        #[ser = "R948", description = "Address mismatch between city, state, and ZIP code"]
        #[footprint_reason_code = None]
        R948,

        #[ser = "R953", description = "SSN was randomly-issued by the SSA and cannot be resolved to the individual"]
        #[footprint_reason_code = None]
        R953,

        #[ser = "R954", description = "SSN/ITIN entered is an ITIN"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnInputIsItin)]
        R954,

        #[ser = "R955", description = "SSN/ITIN is correlated to multiple identities"]
        #[footprint_reason_code = None]
        R955,

        #[ser = "R956", description = "Identity is correlated to multiple SSN/ITINs"]
        #[footprint_reason_code = None]
        R956,

        #[ser = "R957", description = "DOB is not on record and cannot be verified"]
        #[footprint_reason_code = None]
        R957,

        #[ser = "R961", description = "Address ZIP code is invalid"]
        #[footprint_reason_code = None]
        R961,

        #[ser = "R963", description = "Address ZIP code only serves PO Boxes"]
        #[footprint_reason_code = None]
        R963,

        #[ser = "R964", description = "Address is a commercial or institutional address"]
        #[footprint_reason_code = None]
        R964,

        #[ser = "R972", description = "Address is a commercial mail receiving agency or commercial mail drop"]
        #[footprint_reason_code = None]
        R972,

        #[ser = "R973", description = "Address is a unique ZIP code, or corporate only, routing all mail internally by the assigned organization rather than by the USPS"]
        #[footprint_reason_code = None]
        R973,

        #[ser = "R975", description = "MLA covered borrower status"]
        #[footprint_reason_code = None]
        R975,

        #[ser = "R976", description = "Identity is associated with an active duty alert"]
        #[footprint_reason_code = None]
        R976,

        #[ser = "R977", description = "Identity is associated with an active duty alert and a fraud victim initial alert"]
        #[footprint_reason_code = None]
        R977,

        #[ser = "R978", description = "Identity is associated with a fraud victim initial alert"]
        #[footprint_reason_code = None]
        R978,

        #[ser = "R979", description = "Identity is associated with an active duty alert and a fraud victim extended alert"]
        #[footprint_reason_code = None]
        R979,

        #[ser = "R980", description = "Identity is associated with a fraud victim extended alert"]
        #[footprint_reason_code = None]
        R980,

        #[ser = "R998", description = "Name, SSN and DOB correlation unverified by SSA"]
        #[footprint_reason_code = None]
        R998,

        #[ser = "R999", description = "Identity decease verified by SSA"]
        #[footprint_reason_code = None]
        R999
    }
}

#[cfg(test)]
mod tests {
    use crate::db_types::FootprintReasonCode;
    use crate::reason_code::socure::SocureReasonCode;

    #[test]
    fn test_vendor_reason_code_enum_use() {
        let reason_code1 = SocureReasonCode::try_from("I202").unwrap();
        assert_eq!(SocureReasonCode::I202, reason_code1);
        assert_eq!("The input SSN is an ITIN", reason_code1.description());
        assert_eq!(
            Some(FootprintReasonCode::SsnInputIsItin),
            Into::<Option<FootprintReasonCode>>::into(&reason_code1)
        );

        let reason_code2 = SocureReasonCode::try_from("R601").unwrap();
        assert_eq!(SocureReasonCode::R601, reason_code2);
        assert_eq!(
            "Phone number associated address is not correlated with the input address",
            reason_code2.description()
        );
        assert_eq!(None, Into::<Option<FootprintReasonCode>>::into(&reason_code2));

        SocureReasonCode::try_from("X123").expect_err("should err");
    }
}
