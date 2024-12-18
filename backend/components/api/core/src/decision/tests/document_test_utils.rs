use crate::decision::vendor::vendor_trait::MockVendorAPICall;
use crate::State;
use crypto::aead::SealingKey;
use db::models::document::Document;
use db::models::document::DocumentImageArgs;
use db::tests::MockFFClient;
use feature_flag::BoolFlag;
use idv::incode::doc::response::*;
use idv::incode::doc::IncodeAddBackRequest;
use idv::incode::doc::IncodeAddFrontRequest;
use idv::incode::doc::IncodeAddMLConsentRequest;
use idv::incode::doc::IncodeAddPrivacyConsentRequest;
use idv::incode::doc::IncodeAddSelfieRequest;
use idv::incode::doc::IncodeFetchOCRRequest;
use idv::incode::doc::IncodeFetchScoresRequest;
use idv::incode::doc::IncodeGetOnboardingStatusRequest;
use idv::incode::doc::IncodeProcessFaceRequest;
use idv::incode::doc::IncodeProcessIdRequest;
use idv::incode::response::OnboardingStartResponse;
use idv::incode::IncodeResponse;
use idv::incode::IncodeStartOnboardingRequest;
use newtypes::DocumentFixtureResult;
use newtypes::DocumentId;
use newtypes::DocumentKind;
use newtypes::DocumentRequestKind;
use newtypes::DocumentSide;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::S3Url;
use newtypes::SealedVaultBytes;
use newtypes::Selfie;
use newtypes::TenantId;
use std::sync::Arc;

#[derive(Clone, Copy)]
pub enum UserKind {
    Live,
    Sandbox(DocumentFixtureResult),
    Demo,
}

impl UserKind {
    pub fn identity_doc_fixture(&self) -> Option<DocumentFixtureResult> {
        match self {
            UserKind::Live => None,
            UserKind::Sandbox(f) => Some(*f),
            UserKind::Demo => todo!(),
        }
    }
}

#[derive(Clone)]
pub struct DocumentUploadTestCase {
    pub user_kind: UserKind,
    pub document_type: DocumentKind,
    pub require_selfie: Selfie,
}

impl DocumentUploadTestCase {
    pub fn new(user_kind: UserKind, document_type: DocumentKind, include_selfie: Selfie) -> Self {
        DocumentUploadTestCase {
            user_kind,
            document_type,
            require_selfie: include_selfie,
        }
    }

    pub fn requires_selfie(&self) -> bool {
        matches!(self.require_selfie, Selfie::RequireSelfie) && !self.is_non_identity_document_flow()
    }

    pub fn identity_doc_fixture(&self) -> Option<DocumentFixtureResult> {
        self.user_kind.identity_doc_fixture()
    }

    pub fn user_is_live(&self) -> bool {
        matches!(self.user_kind, UserKind::Live)
    }

    pub fn make_incode_calls(&self) -> bool {
        (self.user_is_live() || matches!(self.user_kind, UserKind::Sandbox(DocumentFixtureResult::Real)))
            && !self.is_non_identity_document_flow()
    }

    pub fn is_non_identity_document_flow(&self) -> bool {
        !matches!(self.document_type.into(), DocumentRequestKind::Identity)
    }
}


pub enum IncodeMockOpts {
    Full,
    StopAfterFront {
        add_front_response: Option<IncodeResponse<AddSideResponse>>,
    },
    UploadFront {
        add_front_response: Option<IncodeResponse<AddSideResponse>>,
    },
    UploadBack {
        add_back_response: Option<IncodeResponse<AddSideResponse>>,
    },
    UploadSelfie {
        add_selfie_response: Option<IncodeResponse<AddSelfieResponse>>,
    },
    Process,
}

pub struct IncodeMocker {
    id_doc_kind: DocumentKind,
    require_selfie: bool,
}
impl IncodeMocker {
    pub fn new(id_doc_kind: DocumentKind, require_selfie: bool) -> Self {
        Self {
            id_doc_kind,
            require_selfie,
        }
    }

    pub fn mock(&self, state: &mut State, opts: IncodeMockOpts) {
        match opts {
            IncodeMockOpts::Full => {
                self.mock_start(state);
                self.mock_front(state, None);
                self.mock_back(state, None);
                self.mock_selfie(state, None);
                self.mock_processing(state);
            }
            IncodeMockOpts::StopAfterFront { add_front_response } => {
                self.mock_start(state);
                self.mock_front(state, add_front_response);
            }
            IncodeMockOpts::UploadFront { add_front_response } => {
                self.mock_front(state, add_front_response);
            }
            IncodeMockOpts::UploadBack { add_back_response } => {
                self.mock_back(state, add_back_response);
            }
            IncodeMockOpts::UploadSelfie { add_selfie_response } => {
                self.mock_selfie(state, add_selfie_response);
            }
            IncodeMockOpts::Process => self.mock_processing(state),
        }
    }

    fn mock_start(&self, state: &mut State) {
        let mut mock_incode_start_onboarding =
            MockVendorAPICall::<IncodeStartOnboardingRequest, IncodeResponse<OnboardingStartResponse>>::new();
        mock_incode_start_onboarding
            .expect_make_request()
            .times(1)
            .return_once(move |_| Ok(idv::tests::fixtures::incode::start_onboarding_response()));
        state.set_incode_start_onboarding(Arc::new(mock_incode_start_onboarding));
    }

    fn mock_front(&self, state: &mut State, override_response: Option<IncodeResponse<AddSideResponse>>) {
        // Add Front
        let mut mock_incode_add_front =
            MockVendorAPICall::<IncodeAddFrontRequest, IncodeResponse<AddSideResponse>>::new();
        mock_incode_add_front
            .expect_make_request()
            .times(1)
            .return_once(move |_| {
                Ok(override_response.unwrap_or(idv::tests::fixtures::incode::add_side_response()))
            });
        state.set_incode_add_front(Arc::new(mock_incode_add_front));
    }

    fn mock_back(&self, state: &mut State, override_response: Option<IncodeResponse<AddSideResponse>>) {
        if self.id_doc_kind.sides().contains(&DocumentSide::Back) {
            let mut mock_incode_add_back =
                MockVendorAPICall::<IncodeAddBackRequest, IncodeResponse<AddSideResponse>>::new();
            mock_incode_add_back
                .expect_make_request()
                .times(1)
                .return_once(move |_| {
                    Ok(override_response.unwrap_or(idv::tests::fixtures::incode::add_side_response()))
                });
            state.set_incode_add_back(Arc::new(mock_incode_add_back));
        }
    }

    fn mock_selfie(&self, state: &mut State, override_response: Option<IncodeResponse<AddSelfieResponse>>) {
        if self.require_selfie {
            let mut mock_add_selfie =
                MockVendorAPICall::<IncodeAddSelfieRequest, IncodeResponse<AddSelfieResponse>>::new();
            mock_add_selfie
                .expect_make_request()
                .times(1)
                .return_once(move |_| {
                    Ok(override_response.unwrap_or(idv::tests::fixtures::incode::add_selfie_response()))
                });
            state.set_incode_add_selfie(Arc::new(mock_add_selfie));
        }
    }

    fn mock_processing(&self, state: &mut State) {
        if self.require_selfie {
            let mut mock_process_face =
                MockVendorAPICall::<IncodeProcessFaceRequest, IncodeResponse<ProcessFaceResponse>>::new();
            mock_process_face
                .expect_make_request()
                .times(1)
                .return_once(move |_| Ok(idv::tests::fixtures::incode::process_face_response()));
            state.set_incode_process_face(Arc::new(mock_process_face));
        }
        // Process ID
        let mut mock_incode_process_id =
            MockVendorAPICall::<IncodeProcessIdRequest, IncodeResponse<ProcessIdResponse>>::new();
        mock_incode_process_id
            .expect_make_request()
            .times(1)
            .return_once(move |_| Ok(idv::tests::fixtures::incode::process_id_response()));
        state.set_incode_process_id(Arc::new(mock_incode_process_id));

        // Privacy Consent
        let mut mock_privacy_consent =
            MockVendorAPICall::<IncodeAddPrivacyConsentRequest, IncodeResponse<AddConsentResponse>>::new();
        mock_privacy_consent
            .expect_make_request()
            .times(1)
            .return_once(move |_| Ok(idv::tests::fixtures::incode::add_consent_response()));
        state.set_incode_add_privacy_consent(Arc::new(mock_privacy_consent));

        // ML consent
        let mut mock_ml_consent =
            MockVendorAPICall::<IncodeAddMLConsentRequest, IncodeResponse<AddConsentResponse>>::new();
        mock_ml_consent
            .expect_make_request()
            .times(1)
            .return_once(move |_| Ok(idv::tests::fixtures::incode::add_consent_response()));
        state.set_incode_add_ml_consent(Arc::new(mock_ml_consent));

        // Fetch Scores
        let mut mock_fetch_scores =
            MockVendorAPICall::<IncodeFetchScoresRequest, IncodeResponse<FetchScoresResponse>>::new();
        mock_fetch_scores
            .expect_make_request()
            .times(1)
            .return_once(move |_| Ok(idv::tests::fixtures::incode::fetch_scores_response()));
        state.set_incode_fetch_scores(Arc::new(mock_fetch_scores));
        // Fetch OCR
        let mut mock_fetch_ocr =
            MockVendorAPICall::<IncodeFetchOCRRequest, IncodeResponse<FetchOCRResponse>>::new();
        mock_fetch_ocr
            .expect_make_request()
            .times(1)
            .return_once(move |_| Ok(idv::tests::fixtures::incode::fetch_ocr_response(None)));
        state.set_incode_fetch_ocr(Arc::new(mock_fetch_ocr));

        let mut mock_get_ob_status = MockVendorAPICall::<
            IncodeGetOnboardingStatusRequest,
            IncodeResponse<GetOnboardingStatusResponse>,
        >::new();
        mock_get_ob_status
            .expect_make_request()
            .times(1)
            .return_once(move |_| Ok(idv::tests::fixtures::incode::get_onboarding_status_response()));
        state.set_incode_get_onboarding_status(Arc::new(mock_get_ob_status));
    }
}


// Mock s3 client returning an encrypted image. We have to do a lot of dancing around here
// bc the enclave client needs to decrypt bytes encrypted in a certain format with a specific key
pub async fn mock_enclave_s3_client(
    state: &mut State,
    document_id: DocumentId,
    e_vault_private_key: &EncryptedVaultPrivateKey,
) {
    let mut mock_s3_client_enclave = crate::s3::MockS3Client::new();

    let (data_keys, s3_urls): (Vec<SealedVaultBytes>, Vec<S3Url>) = state
        .db_query(move |conn| {
            let (identity_document, _) = Document::get(conn, &document_id)?;
            identity_document.images(conn, DocumentImageArgs::default())
        })
        .await
        .unwrap()
        .iter()
        .map(|du| (SealedVaultBytes(du.e_data_key.0.clone()), du.s3_url.clone()))
        .unzip();

    let decrypt_opts = data_keys
        .iter()
        .map(|dk| (e_vault_private_key, dk, vec![]))
        .collect();

    // each document upload is encrypted with a different key, so we actually have
    // to keep track of which keys and which s3URLs go together to mock appropriately
    let decrypted_data_keys_with_urls = state
        .enclave_client
        .batch_decrypt_to_piibytes(decrypt_opts)
        .await
        .unwrap()
        .into_iter()
        .map(|b| SealingKey::new(b.into_leak()).unwrap())
        .zip(s3_urls);

    decrypted_data_keys_with_urls.for_each(|(key, url)| {
        let s = newtypes::Base64Data::from_str_standard(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        )
        .unwrap();
        let sealed_doc_bytes = key.seal_bytes(&s.0).unwrap();

        mock_s3_client_enclave
            .expect_get_object_from_s3_url()
            .withf(move |u| *u == url.to_string())
            .return_once(move |_| Ok(actix_web::web::Bytes::from(sealed_doc_bytes.0.clone())));
    });

    state
        .enclave_client
        .replace_s3_client(Arc::new(mock_s3_client_enclave));
}

// Mock something that impls S3Client putting something.
pub fn mock_s3_put_object(state: &mut State) {
    // TODO: make these 2 things match / test doc/encrypted/ or w/e we do
    let mut mock_s3_client = crate::s3::MockS3Client::new();

    mock_s3_client
        .expect_put_bytes()
        .times(1)
        .return_once(move |bucket, key, _, _| Ok(format!("s3://{}/{}", bucket, key)));

    state.set_s3_client(Arc::new(mock_s3_client).clone());
}

pub fn mock_ff_client(
    state: &mut State,
    identity_document_fixture: Option<DocumentFixtureResult>,
    tenant_id: TenantId,
) {
    let mut mock_ff_client = MockFFClient::new();

    if matches!(identity_document_fixture, Some(DocumentFixtureResult::Real)) {
        mock_ff_client.mock(|c| {
            c.expect_flag()
                .withf(move |f| *f == BoolFlag::CanMakeDemoIncodeRequestsInSandbox(&tenant_id))
                .return_const(true);
        });
        state.set_ff_client(mock_ff_client.into_mock());
    }
}
