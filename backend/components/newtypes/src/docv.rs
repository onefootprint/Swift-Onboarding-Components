use crate::PiiString;

#[derive(Debug, Default)]
pub struct DocVData {
    /// This is the reference id number we send to the vendor
    pub reference_id: Option<u64>,
    /// Front image
    pub front_image: Option<PiiString>,
    /// back image
    pub back_image: Option<PiiString>,
    // ISO 3166 Alpha-3 country code.
    pub country_code: Option<PiiString>,
    pub document_type: Option<String>,
}
