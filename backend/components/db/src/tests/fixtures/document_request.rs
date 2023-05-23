use crate::{
    models::{
        document_request::{DocumentRequest, DocumentRequestUpdate},
        identity_document::{IdentityDocument, NewIdentityDocumentArgs},
        verification_request::VerificationRequest,
        verification_result::VerificationResult,
    },
    tests::prelude::TestPgConn,
};
use newtypes::{
    DecisionIntentId, DocumentRequestId, DocumentRequestStatus, OnboardingId, PiiJsonValue, ScopedVaultId,
    VaultId, VendorAPI, VerificationRequestId, VerificationResultId,
};
use std::str::FromStr;

#[derive(Clone)]
pub struct DocumentRequestFixtureCreateOpts {
    pub scoped_user_id: ScopedVaultId,
    pub user_vault_id: VaultId,
    pub onboarding_id: OnboardingId,
    pub collected_doc_opts: CollectedDocOpts,
    pub previous_document_request_id: Option<DocumentRequestId>,
    pub desired_status: DocumentRequestStatus,
    pub should_collect_selfie: bool,
}
#[derive(Clone)]
pub struct CollectedDocOpts {
    pub id_doc_collected: bool,
    pub has_verification_result: bool,
    pub verification_result_response: serde_json::Value,
}

impl Default for CollectedDocOpts {
    fn default() -> Self {
        Self {
            id_doc_collected: false,
            has_verification_result: false,
            verification_result_response: serde_json::json!({"test": "response"}),
        }
    }
}

impl Default for DocumentRequestFixtureCreateOpts {
    fn default() -> Self {
        DocumentRequestFixtureCreateOpts {
            scoped_user_id: "su1".to_string().into(),
            user_vault_id: "uv1".to_string().into(),
            onboarding_id: "ob1".to_string().into(),
            collected_doc_opts: CollectedDocOpts::default(),
            previous_document_request_id: None,
            desired_status: DocumentRequestStatus::Pending,
            should_collect_selfie: false,
        }
    }
}
pub type VerificationInfo = (VerificationRequestId, VerificationResultId);
pub fn create(
    conn: &mut TestPgConn,
    opts: DocumentRequestFixtureCreateOpts,
) -> (DocumentRequest, Option<VerificationInfo>) {
    if opts.collected_doc_opts.has_verification_result && !opts.collected_doc_opts.id_doc_collected {
        panic!("Need to set id_doc_collected=true if you want a verification result")
    }

    let doc_request = DocumentRequest::create(
        conn.conn(),
        opts.scoped_user_id.clone(),
        None,
        opts.should_collect_selfie,
        opts.previous_document_request_id,
    )
    .unwrap();
    let doc_req_id = doc_request.id.clone();
    let mut verification_info = None;

    // If we want to simulate having collected an id document
    if opts.collected_doc_opts.id_doc_collected {
        let args = NewIdentityDocumentArgs {
            request_id: doc_request.id.clone(),
            document_type: newtypes::IdDocKind::DriverLicense,
            country_code: "USA".to_owned(),
        };
        let id1 = IdentityDocument::create(conn, args).unwrap();

        // If we want to simulate having sent id document to vendor
        if opts.collected_doc_opts.has_verification_result {
            let vreq = VerificationRequest::create_document_verification_request(
                conn,
                VendorAPI::IdologyScanOnboarding,
                opts.scoped_user_id.clone(),
                id1.id,
                &DecisionIntentId::from_str("di_abc123").unwrap(),
            )
            .unwrap();

            let vres = VerificationResult::create(
                conn,
                vreq.id.clone(),
                opts.collected_doc_opts
                    .verification_result_response
                    .clone()
                    .into(),
                newtypes::SealedVaultBytes(
                    PiiJsonValue::new(opts.collected_doc_opts.verification_result_response)
                        .leak_to_vec()
                        .unwrap(),
                ),
                false,
            )
            .expect("VerificationResult failed to create");
            let update = DocumentRequestUpdate::idv_reqs_initiated();
            doc_request.update(conn.conn(), update).unwrap();

            verification_info = Some((vreq.id, vres.id));
        }
    }

    // Set our desired status
    let reloaded_doc_req = DocumentRequest::get(conn, &opts.scoped_user_id, &doc_req_id).unwrap();
    let update = DocumentRequestUpdate::status(opts.desired_status);

    (
        reloaded_doc_req.update(conn.conn(), update).unwrap(),
        verification_info,
    )
}
