use newtypes::FootprintReasonCode;
use strum::Display;
use strum_macros::EnumString;

macro_rules! reason_code_enum {
    (
        $(#[$macros:meta])*
        pub enum $name:ident {
            $(#[description = $description:literal] $item:ident),*
        }
    ) => {
        $(#[$macros])*
        pub enum $name {
            $(#[doc=$description] $item,)*
        }

        impl $name {
            pub fn description(&self) -> String {
                match self {
                    $(Self::$item => String::from($description)),*
                }
            }
        }
    }
}

reason_code_enum! {
    #[derive(Debug, Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, Hash)]
    #[serde(try_from = "&str")]
    pub enum SocureReasonCode {
        #[description = "Social networks match"]
        I121,

        #[description = "Online sources are representative of a broader digital footprint than just social networks"]
        I127,

        #[description = "Global Watchlist sources selected are not correlated with the input identifiers"]
        I196,

        #[description = "Name, address and SSN match"]
        I201,

        #[description = "The input SSN is an ITIN"]
        I202,

        #[description = "SSN was first seen in credit header records between 5 to 10 years ago"]
        I203,

        #[description = "SSN is first seen in credit header records more than 10 years ago"]
        I204,

        #[description = "SSN is found to be inquired once every 2 to 3 months"]
        I205,

        #[description = "SSN is found to be inquired once every 3 to 6 months"]
        I206,

        #[description = "SSN is found to be inquired once every 6 to 12 months"]
        I207,

        #[description = "SSN is found to be inquired less than once a year"]
        I208,

        #[description = "Device token previously encountered"]
        I401,

        #[description = "Multiple users associated with device"]
        I402,

        #[description = "Identity may not be primary device user"]
        I403,

        #[description = "Identity associated with primary device owner"]
        I404,

        #[description = "Device token previously associated with phone number"]
        I405,

        #[description = "Device token previously associated with email address"]
        I406,

        #[description = "Device token previously associated with first name"]
        I407,

        #[description = "Device token previously associated with last name"]
        I408,

        #[description = "Device token not encountered within the past 5 days"]
        I409,

        #[description = "Device session is associated with more than 2 phone numbers"]
        I410,

        #[description = "Device session is associated with more than 2 emails"]
        I411,

        #[description = "Device session is associated with more than 2 first names"]
        I412,

        #[description = "Device session is associated with more than 2 last names"]
        I413,

        #[description = "Session connected using a proxy"]
        I414,

        #[description = "Session connected using an IP located more than 100 miles from the address"]
        I415,

        #[description = "Session IP originates from within the United States"]
        I416,

        #[description = "Session IP originates from outside the United States"]
        I417,

        #[description = "Session connected using a residential IP address"]
        I419,

        #[description = "Session connected using a commercial IP address"]
        I420,

        #[description = "Session connected using a mobile IP address"]
        I421,

        #[description = "Device is a physical device"]
        I423,

        #[description = "The device type is a desktop or laptop computer"]
        I424,

        #[description = "The device type is mobile, tablet or wearable"]
        I425,

        #[description = "Emailrisk score represents low risk"]
        I520,

        #[description = "Email address is more than 180 days and less than 1 year old"]
        I550,

        #[description = "Email address is more than 1 year and less than 2 years old"]
        I551,

        #[description = "Email address is more than 2 years old"]
        I553,

        #[description = "Exact match between email and first name"]
        I554,

        #[description = "Email address domain is more than 180 days old"]
        I555,

        #[description = "Email address can be resolved to the individual"]
        I556,

        #[description = "Email is correlated with the first name"]
        I557,

        #[description = "Email is correlated with the last name"]
        I558,

        #[description = "Exact match between email and last name"]
        I559,

        #[description = "Email address domain represents a Fortune 500 company"]
        I560,

        #[description = "Email address domain represents a US College/University"]
        I561,

        #[description = "Email username contains ZIP code of current application"]
        I562,

        #[description = "Email address domain contains a special use domain (RFC, arpa, example, invalid, local, onion, etc.)"]
        I563,

        #[description = "Special characters which are not periods or underscores found in email alias"]
        I564,

        #[description = "Email username contains a role-level alias (employees, support, info, postmaster, admin, user, noreply, etc.)"]
        I565,

        #[description = "Email address provider is found in Public Web Source"]
        I566,

        #[description = "Email username contains five or more alphabetic sections"]
        I567,

        #[description = "Email handle contains a name"]
        I568,

        #[description = "Email handle contains input first name"]
        I569,

        #[description = "Email handle contains input surname"]
        I570,

        #[description = "Phone number is a landline"]
        I601,

        #[description = "Phone number is a mobile line"]
        I602,

        #[description = "Phone number is a premium-rate line"]
        I605,

        #[description = "Phone number is commercial or dual-purpose"]
        I608,

        #[description = "Phone number is consumer or residential"]
        I609,

        #[description = "Phone number is correlated with the address"]
        I610,

        #[description = "Phone number is associated with a major US carrier"]
        I611,

        #[description = "Phone number has been in service more than 365 days"]
        I614,

        #[description = "Phone number is associated with a Mobile Virtual Network Operator"]
        I616,

        #[description = "Phone number can be resolved to the individual"]
        I618,

        #[description = "Phonerisk score represents low risk"]
        I620,

        #[description = "Phone is correlated with the first name"]
        I621,

        #[description = "Phone is correlated with the last name"]
        I622,

        #[description = "Exact match between phone and first name"]
        I623,

        #[description = "Exact match between phone and last name"]
        I624,

        #[description = "Phone number has never been ported"]
        I625,

        #[description = "Phone number was ported at least 60 days ago"]
        I626,

        #[description = "Phone subscriber has been correlated with the input phone number for more than 365 days"]
        I630,

        #[description = "IP address is provided by a mobile carrier"]
        I631,

        #[description = "IP Connection is consumer"]
        I632,

        #[description = "IP Connection is business"]
        I633,

        #[description = "Proxy is an educational institution"]
        I634,

        #[description = "Proxy is registered to a corporation"]
        I635,

        #[description = "IP address originates from the US or US territories"]
        I636,

        #[description = "Email address is associated with the input phone number"]
        I637,

        #[description = "IP proxy is originating from Google or Apple consumer privacy networks"]
        I638,

        #[description = "IP address is a consumer privacy network proxy"]
        I639,

        #[description = "Address is multi-unit or high rise"]
        I704,

        #[description = "Address is single unit"]
        I705,

        #[description = "Address is an accredited college or university"]
        I706,

        #[description = "Address is residential"]
        I707,

        #[description = "Address can be resolved to the individual"]
        I708,

        #[description = "Address is correlated with the first name"]
        I709,

        #[description = "Address is correlated with the last name"]
        I710,

        #[description = "Address is confirmed as deliverable"]
        I711,

        #[description = "Address is confirmed deliverable by dropping secondary information (apartment, unit, etc.)"]
        I712,

        #[description = "Address is confirmed deliverable but was missing secondary information (apartment, unit, etc.)"]
        I713,

        #[description = "Address is valid but doesn't currently receive US Postal Service street delivery"]
        I714,

        #[description = "Address is correlated with a past address"]
        I715,

        #[description = "Address is a Small Office/Home Office (SOHO)"]
        I716,

        #[description = "Exact match between address and first name"]
        I718,

        #[description = "Exact match between address and last name"]
        I719,

        #[description = "Addressrisk score represents low risk"]
        I720,

        #[description = "Email address is correlated with the input physical address"]
        I721,

        #[description = "Email address is partially correlated with the input physical address"]
        I722,

        #[description = "Document resolutions insufficient for detailed analysis"]
        I805,

        #[description = "Document image resolution is insufficient"]
        I808,

        #[description = "Headshot passes integrity checks"]
        I820,

        #[description = "First name extracted from document correlates with input name"]
        I822,

        #[description = "Last name extracted from document correlates with input name"]
        I823,

        #[description = "Address extracted from document correlates with input address"]
        I824,

        #[description = "DOB extracted from document correlates with input DOB"]
        I825,

        #[description = "Document number extracted from document correlates with input number"]
        I826,

        #[description = "Minimum required information extracted from document Barcode"]
        I831,

        #[description = "Document number extracted from document correlates with barcode or MRZ"]
        I832,

        #[description = "Minimum required information extracted from document MRZ"]
        I833,

        #[description = "Self-portrait passes liveness checks"]
        I834,

        #[description = "Document image correlates with self-portrait"]
        I836,

        #[description = "Self-portrait was not considered in decision"]
        I837,

        #[description = "Minimum Required Information extracted from the document"]
        I838,

        #[description = "Name extracted from document correlates with barcode and MRZ"]
        I839,

        #[description = "Address extracted from document correlates with barcode and MRZ"]
        I840,

        #[description = "DOB on document matches DOB on barcode or MRZ"]
        I841,

        #[description = "Expiration date on document matches date on barcode or MRZ"]
        I842,

        #[description = "Issue date on document matches date on barcode or MRZ"]
        I843,

        #[description = "Dates on document are valid"]
        I844,

        #[description = "Age meets minimum requirements"]
        I845,

        #[description = "Expired document within the grace period specified"]
        I846,

        #[description = "Document about to expire within the future grace period."]
        I847,

        #[description = "The document is not captured properly"]
        I848,

        #[description = "Incorrect ID type selected"]
        I849,

        #[description = "The back of the license was not passed; no barcode to extract information"]
        I854,

        #[description = "First Name matches with a known Nick Name or Alias"]
        I855,

        #[description = "Liveness was not determined"]
        I856,

        #[description = "Facial correlation was not calculated"]
        I860,

        #[description = "Address was not provided at input"]
        I903,

        #[description = "SSN/ITIN was not provided at input"]
        I904,

        #[description = "SSN/ITIN provided at input contained only 4 digits"]
        I905,

        #[description = "DOB was not provided at input"]
        I906,

        #[description = "SSN is issued to a non-US citizen"]
        I907,

        #[description = "Address is correlated with a military ZIP code"]
        I908,

        #[description = "First name and last name are possibly reversed"]
        I909,

        #[description = "Address is correlated with a past address"]
        I910,

        #[description = "Address is a PO Box"]
        I911,

        #[description = "SSN was randomly-issued by the SSA"]
        I912,

        #[description = "Full name and address can be resolved to the individual but the SSN/ITIN is not"]
        I917,

        #[description = "Full name, address, and SSN/ITIN can be resolved to the individual"]
        I919,

        #[description = "Emerging identity indicator"]
        I920,

        #[description = "Address is an accredited college or university"]
        I921,

        #[description = "The name and DOB of the identity matches a notable personality/celebrity"]
        I930,

        #[description = "First name or last name may refer to a non-person entity"]
        I931,

        #[description = "Non-MLA covered borrower status"]
        I975,

        #[description = "Name, SSN and DOB correlation verified by SSA"]
        I998,

        #[description = "Identity decease unverified by SSA"]
        I999,

        #[description = "Identity element in Alert List"]
        R106,

        #[description = "Alert List email address match"]
        R110,

        #[description = "Alert List SSN/ITIN match"]
        R111,

        #[description = "Alert List phone number match"]
        R113,

        #[description = "Watchlist search returned at least one hit on OFAC SDN list"]
        R180,

        #[description = "Watchlist search returned at least one hit on OFAC Non-SDN lists"]
        R181,

        #[description = "Watchlist search returned at least one hit on a sanction list excluding any OFAC hits"]
        R182,

        #[description = "Watchlist search returned at least one hit on an enforcement list excluding any OFAC hits"]
        R183,

        #[description = "Watchlist search returned at least one hit on a politically exposed person"]
        R184,

        #[description = "Watchlist search returned at least one entity that had adverse media articles"]
        R185,

        #[description = "Global Watchlist sources selected are correlated with the input identifiers"]
        R186,

        #[description = "The input SSN is invalid"]
        R201,

        #[description = "The input SSN is reported as deceased"]
        R202,

        #[description = "Multiple identities associated with input SSN"]
        R203,

        #[description = "Entered SSN associated with multiple last names"]
        R204,

        #[description = "Entered SSN associated with different name and address"]
        R205,

        #[description = "The input SSN was issued prior to the input date-of-birth"]
        R206,

        #[description = "SSN/ITIN is associated with multiple DOBs"]
        R207,

        #[description = "SSN/ITIN is associated with multiple addresses"]
        R208,

        #[description = "No former addresses associated with the SSN"]
        R209,

        #[description = "Frequency of SSN in Socure records is unusually high"]
        R210,

        #[description = "SSN seen in frozen credit files"]
        R211,

        #[description = "The input last name is not associated with the input SSN"]
        R212,

        #[description = "Name does not correlate with the name for the resolved public record individual"]
        R213,

        #[description = "SSN/ITIN cannot be resolved to the individual"]
        R214,

        #[description = "First name does not match SSN"]
        R215,

        #[description = "Unable to verify date-of-birth"]
        R216,

        #[description = "SSN was randomly-issued by the SSA"]
        R217,

        #[description = "The input SSN is not the primary SSN for the input identity"]
        R218,

        #[description = "The input SSN is not found in public records"]
        R219,

        #[description = "Issue date for the provided SSN could not be resolved"]
        R220,

        #[description = "SSN associated with input phone number could not be confirmed"]
        R221,

        #[description = "Input SSN could not be confirmed"]
        R222,

        #[description = "Input SSN did not match any of the SSN's associated with the input phone number in the last two years"]
        R223,

        #[description = "4 or more different SSNs have been found to be inquired against the input phone"]
        R224,

        #[description = "4 or more different first names have been found to be inquired against the input SSN"]
        R225,

        #[description = "Multiple phones are marked current for the input SSN"]
        R226,

        #[description = "SSN is found to be inquired at a very frequent rate of less than once a month"]
        R227,

        #[description = "Only 1 component of the input DOB matches the best matched entity"]
        R228,

        #[description = "Only 2 components of the input DOB matches the best matched entity"]
        R229,

        #[description = "SSN was first seen in credit header records within the last 1 year"]
        R230,

        #[description = "SSN was first seen in credit header records between 1 to 3 years ago"]
        R231,

        #[description = "SSN was first seen in credit header records between 3 to 5 years ago"]
        R232,

        #[description = "No SSN found in credit header records for the given full name and DOB"]
        R233,

        #[description = "SSNs in credit header data associated with full name and DOB differ from input SSN by 1 digit"]
        R234,

        #[description = "Input full name could not be fuzzy-matched with full names associated with SSN in header and inquiry records"]
        R235,

        #[description = "Input DOB month does not match any DOB month found on inquiry records"]
        R236,

        #[description = "Input SSN does not match the SSN's associated with the given full name and DOB"]
        R237,

        #[description = "SSNs in credit header data associated with full name and DOB differ from input SSN by up to 2 digits"]
        R238,

        #[description = "SSNs in credit header data associated with full name and DOB differ from input SSN by up to 3 digits"]
        R239,

        #[description = "Identity resembles a manipulated Synthetic identity"]
        R298,

        #[description = "Identity resembles a fabricated Synthetic identity"]
        R299,

        #[description = "DOB indicates individual is less than 16 or more than 100 years old"]
        R350,

        #[description = "DOB indicates COPPA review"]
        R351,

        #[description = "DOB indicates an age between 13 and 15"]
        R352,

        #[description = "DOB indicates an age between 16 and 17"]
        R353,

        #[description = "DOB indicates an improbable age"]
        R355,

        #[description = "Device token was not previously encountered"]
        R401,

        #[description = "Invalid device token"]
        R402,

        #[description = "Device is a virtual device"]
        R403,

        #[description = "The Device Risk module was called, but a device token was not provided"]
        R405,

        #[description = "Device risk score represents high risk"]
        R406,

        #[description = "Emailrisk score represents high risk"]
        R520,

        #[description = "Email address is invalid"]
        R551,

        #[description = "Email address is disposable"]
        R557,

        #[description = "Email address is auto-generated"]
        R558,

        #[description = "Email address cannot be resolved to the individual"]
        R559,

        #[description = "Majority of characters in username are numbers"]
        R560,

        #[description = "Email address is less than 180 days old"]
        R561,

        #[description = "Email address domain is less than 180 days old"]
        R562,

        #[description = "Email address domain is invalid"]
        R563,

        #[description = "Email address username is invalid"]
        R564,

        #[description = "Email address domain represents high risk"]
        R565,

        #[description = "Email address has not been seen before"]
        R566,

        #[description = "Email address top-level domain represents high risk"]
        R567,

        #[description = "Email username appears to be scrambled"]
        R568,

        #[description = "Email string is unusually long"]
        R569,

        #[description = "Low activity observed on the email address in the last 180 days"]
        R571,

        #[description = "Email associated with more than 2 phone numbers in the last 2 years"]
        R572,

        #[description = "Email handle contains trigrams (groups of 3 consecutive letters) that have unusually low occurrence rates"]
        R573,

        #[description = "Email handle is composed of more than 50% symbols (i.e. ._)"]
        R574,

        #[description = "Phone number associated address is not correlated with the input address"]
        R601,

        #[description = "Phone number associated address is not correlated with the input country"]
        R602,

        #[description = "Phone number is invalid"]
        R603,

        #[description = "Phone number has not been actively used within the past 90 days"]
        R604,

        #[description = "Phone number has not been actively used for more than 90 days"]
        R605,

        #[description = "Phone number is not actively used"]
        R606,

        #[description = "Phone number associated address is partially correlated with the input address"]
        R607,

        #[description = "Phone number cannot be resolved to the individual"]
        R608,

        #[description = "IP address geolocation places user more than 100 miles from address"]
        R610,

        #[description = "Phone number is not allowed for consumers"]
        R611,

        #[description = "Phone number is fixed or traditional VoIP"]
        R613,

        #[description = "Phone number is toll-free"]
        R614,

        #[description = "Phone number is non-fixed or over-the-top VoIP"]
        R615,

        #[description = "Phone number is prepaid"]
        R616,

        #[description = "Phone number is not associated with a major US carrier"]
        R617,

        #[description = "Phone number has been in service between 90 and 365 days"]
        R618,

        #[description = "IP address is a known proxy"]
        R619,

        #[description = "Phonerisk score represents high risk"]
        R620,

        #[description = "Phone number has been in service between 7 and 30 days"]
        R622,

        #[description = "Phone number has been in service between 30 and 90 days"]
        R623,

        #[description = "Phone number has ported within the past 24 hours"]
        R625,

        #[description = "Phone number has been ported within the past 2 to 7 days"]
        R626,

        #[description = "Phone number has been ported within the past 7 to 30 days"]
        R627,

        #[description = "Phone number has been ported within the past 30 to 60 days"]
        R628,

        #[description = "Phone subscriber has been correlated with the input phone number for between 7 and 30 days"]
        R631,

        #[description = "Phone subscriber has been correlated with the input phone number for between 30 and 90 days"]
        R632,

        #[description = "Phone subscriber has been correlated with the input phone number for between 90 and 365 days"]
        R633,

        #[description = "IP address originates from outside of the US or US territories"]
        R639,

        #[description = "IP address originates from an OFAC sanctioned country"]
        R640,

        #[description = "Proxy is from services that change location to beat DRM,TOR points, temporary proxies and other masking services"]
        R641,

        #[description = "IP address is associated with a cloud hosting provider and is likely a proxy. Users are not usually located in a hosting facility"]
        R642,

        #[description = "IP address is associated with a location allowing public internet access"]
        R643,

        #[description = "IP proxy is cloud-based"]
        R644,

        #[description = "IP proxy is TOR-based"]
        R645,

        #[description = "IP proxy is VPN-based"]
        R646,

        #[description = "IP proxy is cloud-security-based"]
        R647,

        #[description = "Phone number has had a name change in the last 3 days"]
        R648,

        #[description = "IP address is associated with an anonymizing proxy"]
        R650,

        #[description = "IP address is associated with spam activity"]
        R652,

        #[description = "IP address origin & usage indicates non-human traffic"]
        R653,

        #[description = "Phone number seen in frozen credit files"]
        R654,

        #[description = "Phone number was first seen less than 50 days ago"]
        R655,

        #[description = "Phone number seen in credit files flagged as having initial fraud alerts"]
        R656,

        #[description = "Input surname has not been associated with the phone number for more than 2 years"]
        R657,

        #[description = "Input surname has not been primarily used with the phone number for more than 2 years"]
        R658,

        #[description = "Phone number has been associated with more than two email addresses in the last 60 days"]
        R659,

        #[description = "Two or more addresses are marked as current in the phone public records"]
        R660,

        #[description = "No inquiry is found against this phone number"]
        R661,

        #[description = "The phone number was first seen less than sixty days ago within Socure network"]
        R662,

        #[description = "Address is inactive, not receiving mail, or vacant"]
        R701,

        #[description = "Address is not confirmed as deliverable"]
        R702,

        #[description = "Address is invalid or does not exist"]
        R703,

        #[description = "Address is a correctional facility"]
        R704,

        #[description = "Address cannot be resolved to the individual"]
        R705,

        #[description = "Address is a commercial mail receiving agency or commercial mail drop"]
        R707,

        #[description = "Address is a PO Box"]
        R708,

        #[description = "Address is commercial or dual-purpose"]
        R709,

        #[description = "Address is a military location"]
        R710,

        #[description = "Address is a unique ZIP code, or corporate only, routing all mail internally by the assigned organization rather than by the USPS"]
        R711,

        #[description = "Address ZIP code is invalid"]
        R712,

        #[description = "Address mismatch between city, state, and ZIP code"]
        R713,

        #[description = "Address is fuzzy matched to the address on record"]
        R714,

        #[description = "Addressrisk score represents high risk"]
        R720,

        #[description = "Email address is not correlated with the input physical address"]
        R721,

        #[description = "The input state or ZIP was corrected during address standardisation"]
        R722,

        #[description = "Document image doesn't meet the minimum color requirements"]
        R804,

        #[description = "Document pattern and layout integrity check failed"]
        R810,

        #[description = "Image captured from a screen, or is a paper copy of an ID"]
        R819,

        #[description = "Document headshot has been modified"]
        R820,

        #[description = "First name extracted from document does not match input first name"]
        R822,

        #[description = "Last name extracted from document does not match input last name"]
        R823,

        #[description = "Address extracted from document does not match input address"]
        R824,

        #[description = "DOB extracted from document does not match input DOB"]
        R825,

        #[description = "Document Number extracted from document does not match input number"]
        R826,

        #[description = "Document is expired"]
        R827,

        #[description = "Cannot extract the minimum information from barcode"]
        R831,

        #[description = "Document Number extracted from document does not match with barcode or MRZ"]
        R832,

        #[description = "Cannot extract the minimum required information from MRZ"]
        R833,

        #[description = "Selfie fails the liveness check"]
        R834,

        #[description = "More than one face detected in the selfie"]
        R835,

        #[description = "Document image does not correlate with self-portrait"]
        R836,

        #[description = "Minimum amount of information cannot be extracted from document"]
        R838,

        #[description = "Name extracted from document does not match with barcode or MRZ"]
        R839,

        #[description = "Address extracted from document does not match with barcode or MRZ"]
        R840,

        #[description = "DOB on document does not match DOB on barcode or MRZ"]
        R841,

        #[description = "Expiration date on document does not match date on barcode or MRZ"]
        R842,

        #[description = "Issue date on document does not match date on barcode or MRZ"]
        R843,

        #[description = "Dates on document are not valid"]
        R844,

        #[description = "Minimum age criteria not met"]
        R845,

        #[description = "Self-portrait or the headshot is not usable for Facial Match"]
        R850,

        #[description = "Document number is an example number, or is not valid"]
        R851,

        #[description = "Submitted document is a temporary ID"]
        R852,

        #[description = "Unable to classify the ID or this is an unsupported ID type"]
        R853,

        #[description = "Obstructions on the face affecting the liveness"]
        R856,

        #[description = "No face found in the selfie frame"]
        R857,

        #[description = "The age on the document doesn't correlate with the selfie predicted age"]
        R858,

        #[description = "ID front correlates with another submitted ID front"]
        R859,

        #[description = "Data extracted from document does not match with barcode or MRZ"]
        R861,

        #[description = "The document could not be classified"]
        R862,

        #[description = "SSN/ITIN cannot be resolved to the individual"]
        R901,

        #[description = "Name cannot be resolved to the individual"]
        R902,

        #[description = "SSN has been reported as deceased"]
        R907,

        #[description = "Identity has been reported as deceased"]
        R909,

        #[description = "SSN issued prior to DOB"]
        R911,

        #[description = "SSN/ITIN is invalid"]
        R913,

        #[description = "Address is invalid or does not exist"]
        R916,

        #[description = "Address cannot be resolved to the individual"]
        R919,

        #[description = "DOB cannot be resolved to the individual"]
        R922,

        #[description = "SSN/ITIN was fuzzy matched to the SSN/ITIN on record"]
        R923,

        #[description = "Address was fuzzy matched to the address on record"]
        R924,

        #[description = "Name does not correlate with the name for the resolved individual"]
        R927,

        #[description = "SSN/ITIN is associated with multiple last names"]
        R928,

        #[description = "First name does not correlate with the first name for the resolved individual"]
        R930,

        #[description = "Address is a correctional facility"]
        R932,

        #[description = "Last name is not correlated with the SSN/ITIN on record"]
        R933,

        #[description = "First name is not correlated with the SSN/ITIN on record"]
        R934,

        #[description = "SSN/ITIN is correlated with the first name but not the last name"]
        R939,

        #[description = "SSN/ITIN not found in public records"]
        R940,

        #[description = "SSN/ITIN is correlated with at least 1 other name and address"]
        R941,

        #[description = "Last name was fuzzy matched to the name on record"]
        R944,

        #[description = "DOB was fuzzy matched to the DOB on record"]
        R946,

        #[description = "SSN/ITIN is not the primary SSN/ITIN for the resolved identity"]
        R947,

        #[description = "Address mismatch between city, state, and ZIP code"]
        R948,

        #[description = "SSN was randomly-issued by the SSA and cannot be resolved to the individual"]
        R953,

        #[description = "SSN/ITIN entered is an ITIN"]
        R954,

        #[description = "SSN/ITIN is correlated to multiple identities"]
        R955,

        #[description = "Identity is correlated to multiple SSN/ITINs"]
        R956,

        #[description = "DOB is not on record and cannot be verified"]
        R957,

        #[description = "Address ZIP code is invalid"]
        R961,

        #[description = "Address ZIP code only serves PO Boxes"]
        R963,

        #[description = "Address is a commercial or institutional address"]
        R964,

        #[description = "Address is a commercial mail receiving agency or commercial mail drop"]
        R972,

        #[description = "Address is a unique ZIP code, or corporate only, routing all mail internally by the assigned organization rather than by the USPS"]
        R973,

        #[description = "MLA covered borrower status"]
        R975,

        #[description = "Identity is associated with an active duty alert"]
        R976,

        #[description = "Identity is associated with an active duty alert and a fraud victim initial alert"]
        R977,

        #[description = "Identity is associated with a fraud victim initial alert"]
        R978,

        #[description = "Identity is associated with an active duty alert and a fraud victim extended alert"]
        R979,

        #[description = "Identity is associated with a fraud victim extended alert"]
        R980,

        #[description = "Name, SSN and DOB correlation unverified by SSA"]
        R998,

        #[description = "Identity decease verified by SSA"]
        R999
    }
}

impl From<&SocureReasonCode> for Option<FootprintReasonCode> {
    // Describes how we translate from Socure reason codes to our generic FootprintReasonCodes
    // We don't necessarily want to create a FootprintReasonCode for every single Socure code, so that's why this is Option<FootprintReasonCode>
    // TODO: flesh out mapping of all Socure reason codes into what we want for FootprintReasonCodes
    fn from(socure_reason_code: &SocureReasonCode) -> Self {
        match socure_reason_code {
            SocureReasonCode::R212 => Some(FootprintReasonCode::LastNameDoesNotMatch),
            SocureReasonCode::R202 => Some(FootprintReasonCode::SubjectDeceased),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::socure::reason_code::reason_codes::SocureReasonCode;

    #[test]
    fn test_try_from_and_description_macro() {
        let reason_code1 = SocureReasonCode::try_from("I610").unwrap();
        let reason_code2 = SocureReasonCode::try_from("R601").unwrap();
        SocureReasonCode::try_from("X123").expect_err("should err");

        assert_eq!(SocureReasonCode::I610, reason_code1);
        assert_eq!(
            "Phone number is correlated with the address",
            reason_code1.description()
        );
        assert_eq!(SocureReasonCode::R601, reason_code2);
        assert_eq!(
            "Phone number associated address is not correlated with the input address",
            reason_code2.description()
        );
    }
}
