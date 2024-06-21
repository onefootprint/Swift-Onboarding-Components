use self::tenant_vendor_control::TenantVendorControl;
use crate::errors::ApiResult;
use crate::errors::AssertionError;
use api_errors::FpError;
use db::models::document::Document;
use db::models::document_request::DocumentRequest;
use db::models::incode_verification_session::IncodeVerificationSession;
use itertools::Itertools;
use newtypes::DecisionIntentId;
use newtypes::DocumentFixtureResult;
use newtypes::DocumentRequestKind;
use newtypes::IdentityDataKind;
use newtypes::ScopedVaultId;
use newtypes::VendorAPI;
use std::fmt::Display;

pub mod build_request;
pub mod fp_device_attestation;
pub mod incode;
pub mod kyc;
pub mod make_request;
pub mod middesk;
pub mod neuro_id;
pub mod samba;
pub mod tenant_vendor_control;
pub mod vendor_api;
pub mod vendor_result;
pub mod vendor_trait;
pub mod verification_result;

pub fn get_vendor_apis_for_verification_requests(
    present_data_lifetime_kinds: &[IdentityDataKind],
    tenant_vendor_control: &TenantVendorControl,
) -> ApiResult<Vec<VendorAPI>> {
    // From the data in the vault, figure out which vendors we _can_ send to
    let vendor_apis = idv::requirements::available_vendor_apis(present_data_lifetime_kinds)
        .into_iter()
        // filter available vendor apis by whether or not this vendor is enabled for a tenant
        .filter(|v| tenant_vendor_control.enabled_vendor_apis().contains(v))
        .collect::<Vec<_>>();
    if vendor_apis.is_empty() {
        Err(AssertionError("Not enough information to send to any vendors"))?;
    } // probably should add some more validations in the future, like make sure we are _at least_ sending
      // to a KYC vendor
    Ok(vendor_apis)
}

#[derive(Debug)]
pub struct VendorAPIError {
    pub vendor_api: VendorAPI,
    pub error: idv::Error,
}

impl api_errors::FpErrorTrait for VendorAPIError {
    fn status_code(&self) -> api_errors::StatusCode {
        self.error.status_code()
    }

    fn code(&self) -> Option<String> {
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

pub fn map_to_api_error<E: Into<idv::Error>>(e: E) -> FpError {
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
