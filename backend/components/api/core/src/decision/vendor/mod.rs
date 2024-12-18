use self::tenant_vendor_control::TenantVendorControl;
use crate::FpResult;
use api_errors::FpError;
use api_errors::FpErrorCode;
use db::models::document::Document;
use db::models::document_request::DocumentRequest;
use db::models::incode_verification_session::IncodeVerificationSession;
use itertools::Itertools;
use newtypes::DocumentFixtureResult;
use newtypes::DocumentRequestKind;
use newtypes::ScopedVaultId;
use newtypes::VendorAPI;
use std::fmt::Display;

pub mod build_request;
pub mod fp_device_attestation;
pub mod idology;
pub mod incode;
pub mod kyc;
pub mod middesk;
pub mod neuro_id;
pub mod samba;
pub mod sentilink;
pub mod stytch;
pub mod tenant_vendor_control;
pub mod twilio;
pub mod vendor_api;
pub mod vendor_result;
pub mod vendor_trait;
pub mod verification_result;

#[derive(Debug)]
pub struct VendorAPIError {
    pub vendor_api: VendorAPI,
    pub error: idv::Error,
}

impl api_errors::FpErrorTrait for VendorAPIError {
    fn status_code(&self) -> api_errors::StatusCode {
        self.error.status_code()
    }

    fn code(&self) -> Option<FpErrorCode> {
        self.error.code()
    }

    fn context(&self) -> Option<serde_json::Value> {
        self.error.context()
    }

    fn message(&self) -> String {
        self.error.message()
    }
}

impl Display for VendorAPIError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.error)
    }
}

impl std::error::Error for VendorAPIError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.error.source()
    }
}

pub fn into_fp_error<E: Into<idv::Error>>(e: E) -> FpError {
    FpError::from(e.into())
}

// Struct to help with additional verification related to Documents
// does some common things useful for also working in sandbox where we might not have sent to a
// vendor
pub struct AdditionalIdentityDocumentVerificationHelper {
    pub sent_to_vendor: Option<Document>,
    pub other: Option<Document>,
}
impl AdditionalIdentityDocumentVerificationHelper {
    pub fn new(id_documents: Vec<(Document, DocumentRequest, Option<IncodeVerificationSession>)>) -> Self {
        let (sent_to_vendor, other): (Vec<_>, Vec<_>) = id_documents
            .into_iter()
            // only take identity docs
            .filter(|(_, dr, _)| matches!(dr.kind, DocumentRequestKind::Identity))
            // sort desc
            .sorted_by(|(i1, _, _), (i2, _, _)| i2.completed_seqno.cmp(&i1.completed_seqno))
            // partition by whether we sent to a vendor or not
            .partition(|(_, _, ivs)| ivs.is_some());

        Self {
            sent_to_vendor: sent_to_vendor.first().map(|(i, _, _)| i).cloned(),
            other: other.first().map(|(i, _, _)| i).cloned(),
        }
    }

    pub fn fixture(&self) -> Option<DocumentFixtureResult> {
        self.sent_to_vendor
            .as_ref()
            .and_then(|i| i.fixture_result)
            .or(self.other.as_ref().and_then(|i| i.fixture_result))
    }

    pub fn identity_document(&self) -> Option<Document> {
        self.sent_to_vendor.as_ref().or(self.other.as_ref()).cloned() //rm cloned
    }
}
