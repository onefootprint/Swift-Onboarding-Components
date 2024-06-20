use chrono::Utc;
use newtypes::macros::pii;
use newtypes::AlpacaDocumentType;
use newtypes::AlpacaPiiString;
use newtypes::FpId;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::Vendor;
/// Represents a request to upload CIP information for an alpaca Account
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CipRequest {
    /// The name of your identity verification and watchlist screening provider
    pub provider_name: Vec<Provider>,

    /// kyc section
    pub kyc: Kyc,

    /// document (photo id)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub document: Option<DocumentPhotoId>,

    /// photo (selfie)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub photo: Option<PhotoSelfie>,

    /// identity (non-documentary identity verification)
    pub identity: Identity,

    pub watchlist: Watchlist,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Provider {
    Footprint,
}

/// KYC
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Kyc {
    pub id: FpId,

    pub applicant_name: AlpacaPiiString,
    pub email_address: AlpacaPiiString,
    pub nationality: Option<AlpacaPiiString>,

    /// Government issued ID number of applicant
    pub id_number: Option<AlpacaPiiString>,

    /// Format in YYYY-MM-DD
    pub date_of_birth: AlpacaPiiString,
    pub address: AlpacaPiiString,
    pub postal_code: AlpacaPiiString,
    pub country_of_residency: AlpacaPiiString,

    /// This would be the final time that your team finished the KYC check. If this user was subject
    /// to EDD, then this timestamp would likely be hours or days after the check_completed_at field
    pub kyc_completed_at: Option<chrono::DateTime<Utc>>,
    pub ip_address: AlpacaPiiString,
    pub check_initiated_at: Option<chrono::DateTime<Utc>>,
    pub check_completed_at: Option<chrono::DateTime<Utc>>,

    pub approved_reason: Option<String>,
    pub approval_status: ApprovalStatus,
    pub approved_by: PiiString,

    /// The time that your system approved the account
    /// Potentially "now", i.e. when this request is made
    pub approved_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum ApprovalStatus {
    #[default]
    Approved,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default, Copy)]
#[serde(rename_all = "snake_case")]
pub enum CipResult {
    #[default]
    Clear,
    Consider,
}

impl CipResult {
    pub fn clear(is_clear: bool) -> Self {
        if is_clear {
            Self::Clear
        } else {
            Self::Consider
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum CipStatus {
    #[default]
    Complete,
    Withdrawn,
}

/// Document (photo ID)
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DocumentPhotoId {
    /// TBD: link to internal id of some sort -- maybe doc id?
    pub id: FpId,

    /// Your provider needs to determine whether the result of the document check is an overall
    /// "clear" or "consider". If a check comes back as "consider", you should explain in
    /// approval_reason what enhanced due diligence you conducted in order to make the decision to
    /// approve the account. (ex: manual review of documents + selfie and a specialist confirmed a
    /// match).
    pub result: CipResult,

    /// Overall status determined by your KYC provider for this specific check
    pub status: CipStatus,

    pub created_at: chrono::DateTime<Utc>,

    pub first_name: Option<AlpacaPiiString>,
    pub last_name: Option<AlpacaPiiString>,
    pub gender: Option<AlpacaPiiString>,
    pub date_of_birth: Option<AlpacaPiiString>,
    pub date_of_expiry: Option<AlpacaPiiString>,
    pub issuing_country: Option<AlpacaPiiString>,
    pub document_numbers: Option<Vec<AlpacaPiiString>>,
    pub document_type: Option<AlpacaDocumentType>,

    /// Checks whether the age calculated from the document’s date of birth data point is greater
    /// than or equal to the minimum accepted age. Unless otherwise discussed with Alpaca, users
    /// must be 18 years old to open an account.
    pub age_validation: CipResult,

    pub data_comparison: CipResult,
    pub data_comparison_breakdown: DataComparsionBreakDown,

    pub image_integrity: CipResult,
    pub image_integrity_breakdown: ImageIntegrityBreakdown,

    pub visual_authenticity: VisualAuthenticity,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct DataComparsionBreakDown {
    pub first_name: CipResult,
    pub last_name: CipResult,
    pub date_of_birth: CipResult,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<CipResult>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct ImageIntegrityBreakdown {
    /// Checks whether the quality of the image was sufficient for processing.
    pub image_quality: CipResult,
    /// Checks whether the submitted document is supported.
    pub supported_document: CipResult,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub colour_picture: Option<CipResult>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub conclusive_document_quality: Option<CipResult>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct VisualAuthenticity {
    /// If there is an indication of digital tampering, this would result in a “consider”
    pub digital_tampering: CipResult,

    /// If no face was detected on the document, this would result in a “consider”
    pub face_detection: CipResult,

    /// If fonts in the document don’t match the expected ones, this would result in a “consider”
    pub fonts: CipResult,

    /// If the pictures of the person identified on the document show signs of tampering or
    /// alteration, this would result in a “consider”
    pub picture_face_integrity: CipResult,

    /// If security features expected on the document are missing or wrong, this would result in a
    /// “consider”
    pub security_features: CipResult,

    /// The document does or doesn’t match the expected template for the document type and country
    /// it is from.
    pub template: CipResult,
}

/// Document (photo ID)
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PhotoSelfie {
    /// TBD: link to internal id of some sort -- maybe doc id?
    pub id: FpId,
    /// Your provider needs to determine whether the result of the document check is an overall
    /// "clear" or "consider". If a check comes back as "consider", you should explain in
    /// approval_reason what enhanced due diligence you conducted in order to make the decision to
    /// approve the account. (ex: manual review of documents + selfie and a specialist confirmed
    /// a match).
    pub result: CipResult,
    /// Overall status determined by your KYC provider for this specific check
    pub status: CipStatus,
    pub created_at: chrono::DateTime<Utc>,

    /// Checks whether the face in the document matches the face in the live photo.
    pub face_comparison: CipResult,
    /// Checks whether the quality and integrity of the selfie was sufficient to perform a face
    /// comparison.
    pub image_integrity: CipResult,
    /// Checks whether the person in the live photo is real (not a spoof or a photo of a person held
    /// up to the camera).
    pub visual_authenticity: CipResult,
}

/// Identity (non-document)
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Identity {
    /// TBD: link to internal id of some sort -- maybe doc id?
    pub id: FpId,
    /// Your provider needs to determine whether the result of the document check is an overall
    /// "clear" or "consider". If a check comes back as "consider", you should explain in
    /// approval_reason what enhanced due diligence you conducted in order to make the decision to
    /// approve the account. (ex: manual review of documents + selfie and a specialist confirmed
    /// a match).
    pub result: CipResult,
    /// Overall status determined by your KYC provider for this specific check
    pub status: CipStatus,
    pub created_at: chrono::DateTime<Utc>,

    /// Represents whether the identity found a matched residential address or not. If “clear”,
    /// provide detail in matched_address, if “consider” this may trigger EDD and require an
    /// approval_reason.
    pub matched_address: CipResult,

    /// example: [{“id”:“19099121”,“match_types”:[“credit_agencies”,“voting_register”]}]
    /// Note: we'll just write vendors here for now
    pub matched_addresses: Vec<Vendor>,

    /// Represents whether the identity found a matched date of birth (or year of birth) or not.
    /// If “clear”, provide detail in date_of_birth_breakdown, if “consider” this may trigger EDD
    /// and require an approved_reason.
    pub date_of_birth: CipResult,

    /// any additional information regarding in which sources the DOB was matched
    pub date_of_birth_breakdown: Vec<Vendor>,

    /// If “clear”, the social security number or other tax identification or national
    /// identification number was verified. If "consider" there was a mismatch on the tax ID
    /// number and documentary proof of the tax ID number should be uploaded via the accounts API
    /// document upload endpoint
    pub tax_id: CipResult,

    /// any additional information regarding in which sources the tax ID was matched
    pub tax_id_breakdown: Vec<Vendor>,
}

/// Watchlist object
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Watchlist {
    /// TBD: link to internal id of some sort -- maybe doc id?
    pub id: FpId,
    /// Your provider needs to determine whether the result of the document check is an overall
    /// "clear" or "consider". If a check comes back as "consider", you should explain in
    /// approval_reason what enhanced due diligence you conducted in order to make the decision to
    /// approve the account. (ex: manual review of documents + selfie and a specialist confirmed
    /// a match).
    pub result: CipResult,
    /// Overall status determined by your KYC provider for this specific check
    pub status: CipStatus,
    pub created_at: chrono::DateTime<Utc>,

    /// User’s name, address and DOB should be screened by the KYC provider against databases of
    /// Politically Exposed Persons sourced from government lists, websites and other media sources.
    /// If this field is “consider”, this should trigger EDD and then the records field and the
    /// approval_reason field need to be filled out with something along the lines of “PEP matches
    /// were manually reviewed and EDD was conducted. Match 1 had a non-matching DOB, match 2 was
    /// determined to be a false positive due to name similarity and match 3 does not align with the
    /// user’s address history determined in the EDD process”.
    pub politically_exposed_person: CipResult,

    /// Government and International Organizations Sanctions Lists, most importantly OFAC. If this
    /// field is “consider”, this should trigger EDD and then the records field and the
    /// approval_reason field need to be filled out.
    pub sanction: CipResult,

    /// Online news sources that have been scraped for risk-relevant information. Negative events
    /// reported by publicly and generally available media sources. If this field is “consider”,
    /// this should trigger EDD and then the records field and the approved_reason field need to be
    /// filled out.
    pub adverse_media: CipResult,

    /// Law-enforcement and Regulatory bodies Monitored Lists (including Terrorism, Money Laundering
    /// and Most Wanted lists).If this field is “consider”, this should trigger EDD and then the
    /// records field and the approval_reason field need to be filled out.
    pub monitored_lists: CipResult,

    /// If any of those fields are “consider” this is a space to provide the breakdown of those
    /// Matches or Hits that your KYC provider finds. It should include as much detail as possible
    /// broken down for each match or hit such as: name, aliases, addresses, DOB, type of hit (PEP,
    /// adverse media, etc.), and any accompanying details depending on the type of hit such as
    /// positions held, lists found on, a summary of and URL to adverse media article, explanation
    /// of the monitored list, etc. See below for an example. Free-form json here.
    pub records: Vec<PiiJsonValue>,
}

/// Fixtures for testing alpaca CIP types
pub mod fixtures {
    use super::*;
    use chrono::Duration;
    use serde_json::json;

    fn fp_id_test() -> FpId {
        FpId::from("fp_id_test_xyz1234".to_string())
    }

    impl CipRequest {
        /// generate a fixture CIP request
        pub fn test_fixture() -> Self {
            CipRequest {
                provider_name: vec![Provider::Footprint],
                kyc: Kyc {
                    id: fp_id_test(),
                    applicant_name: pii!("Carl Cassanova").into(),
                    email_address: pii!("carl.casanova@gmail.com").into(),
                    nationality: Some(pii!("american").into()),
                    id_number: None,
                    date_of_birth: pii!("1992-02-02").into(),
                    address: pii!("1 Penguin Place, Philadelphia PA").into(),
                    postal_code: pii!("10012").into(),
                    country_of_residency: pii!("USA").into(),
                    kyc_completed_at: Some(Utc::now()),
                    ip_address: pii!("127.0.0.1").into(),
                    check_initiated_at: Some(Utc::now() - Duration::seconds(10)),
                    check_completed_at: Some(Utc::now() - Duration::seconds(7)),
                    approval_status: ApprovalStatus::Approved,
                    approved_by: pii!("alex@onefootprint.com"),
                    approved_at: Utc::now(),
                    approved_reason: Some("We carefully review the document and matched all the fields to the submitted information.".into())
                },
                document: Some(DocumentPhotoId {
                    id: fp_id_test(),
                    status: CipStatus::Complete,
                    result: CipResult::Clear,
                    created_at: Utc::now(),
                    first_name: Some(pii!("Carl").into()),
                    last_name: Some(pii!("Casanova").into()),
                    gender: Some(pii!("Male").into()),
                    date_of_birth: Some(pii!("1992-02-02").into()),
                    date_of_expiry: Some(pii!("2025-02-02").into()),
                    issuing_country: Some(pii!("USA").into()),
                    document_numbers: Some(vec![pii!("12121212").into()]),
                    document_type: Some(AlpacaDocumentType::DriversLicense),
                    age_validation: CipResult::Clear,
                    data_comparison: CipResult::Clear,
                    data_comparison_breakdown: Default::default(),
                    image_integrity: CipResult::Clear,
                    image_integrity_breakdown: Default::default(),
                    visual_authenticity: Default::default(),
                }),
                photo: Some(PhotoSelfie {
                    id: fp_id_test(),
                    status: CipStatus::Complete,
                    result: CipResult::Clear,
                    created_at: Utc::now(),
                    face_comparison: CipResult::Clear,
                    image_integrity: CipResult::Clear,
                    visual_authenticity: CipResult::Clear,
                }),
                identity: Identity {
                    id: fp_id_test(),
                    status: CipStatus::Complete,
                    result: CipResult::Clear,
                    created_at: Utc::now(),
                    matched_address: CipResult::Clear,
                    matched_addresses: vec![Vendor::Idology, Vendor::Experian],
                    date_of_birth: CipResult::Clear,
                    date_of_birth_breakdown: vec![Vendor::Idology, Vendor::Experian],
                    tax_id: CipResult::Clear,
                    tax_id_breakdown: vec![Vendor::Idology, Vendor::Experian],
                },
                watchlist: Watchlist {
                    id: fp_id_test(),
                    status: CipStatus::Complete,
                    result: CipResult::Clear,
                    created_at: Utc::now(),
                    politically_exposed_person: CipResult::Clear,
                    sanction: CipResult::Clear,
                    adverse_media: CipResult::Clear,
                    monitored_lists: CipResult::Clear,
                    records: vec![PiiJsonValue::from(json!({"test_result": "all_clear"}))],
                },
            }
        }
    }
}
