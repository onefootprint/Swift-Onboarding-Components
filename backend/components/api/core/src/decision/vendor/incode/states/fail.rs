use super::IncodeStateTransition;
use super::VerificationSession;
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::state::TransitionResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::errors::ApiErrorKind;
use crate::errors::AssertionError;
use crate::vendor_clients::IncodeClients;
use crate::FpResult;
use async_trait::async_trait;
use db::models::document::Document;
use db::models::document::DocumentUpdate;
use db::models::risk_signal::RiskSignal;
use db::models::user_timeline::UserTimeline;
use db::models::verification_request::VerificationRequest;
use db::DbPool;
use db::TxnPgConn;
use newtypes::DecisionIntentId;
use newtypes::DocumentId;
use newtypes::DocumentStatus;
use newtypes::FootprintReasonCode;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;

// TODO this is more like the other workflow state transitions where it has behavior that must be
// atomic with entering the state.
// Need to add a generic way to handle this
pub struct Fail {}

impl Fail {
    #[tracing::instrument("Fail::enter", skip_all)]
    pub fn enter(
        conn: &mut TxnPgConn,
        di_id: &DecisionIntentId,
        sv_id: &ScopedVaultId,
        vault_id: &VaultId,
        id_doc_id: &DocumentId,
    ) -> FpResult<()> {
        // Mark the id doc as failed
        let update = DocumentUpdate {
            completed_seqno: None,
            document_score: None,
            selfie_score: None,
            ocr_confidence_score: None,
            vaulted_document_type: None,
            status: Some(DocumentStatus::Failed),
            curp_completed_seqno: None,
            validated_country_code: None,
            review_status: None,
        };

        let (vres_id, vendor_api): (VerificationResultId, VendorAPI) = VerificationRequest::list(conn, di_id)?
                .into_iter()
                .filter(|(vreq, _)| vreq.vendor_api.is_incode_doc_flow_api())
                .filter_map(|(vreq, vres)| vres.map(|v| (v.id, vreq.vendor_api)))
                .collect::<Vec<_>>()
                .first()
                .cloned()
                // TODO: if there's an issue with StartOnboarding and we fail, then this will error, fix in upstack
                .ok_or(AssertionError(
                    "cannot find incode vres for doc upload failed FRC",
                ))?;

        let _ = RiskSignal::bulk_create(
            conn,
            sv_id,
            vec![(FootprintReasonCode::DocumentUploadFailed, vendor_api, vres_id)],
            newtypes::RiskSignalGroupKind::Doc,
            false,
        );

        Document::update(conn, id_doc_id, update)?;
        // Create a timeline event
        let info = newtypes::DocumentUploadedInfo {
            id: id_doc_id.clone(),
        };
        UserTimeline::create(conn, info, vault_id.clone(), sv_id.clone())?;

        Ok(())
    }
}

#[async_trait]
impl IncodeStateTransition for Fail {
    async fn run(
        _: &DbPool,
        _: &IncodeClients,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> FpResult<Option<Self>> {
        Ok(None)
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> FpResult<TransitionResult> {
        Err(ApiErrorKind::AssertionError(
            "Incode machine already failed".into(),
        ))?
    }

    fn next_state(_: &VerificationSession) -> IncodeState {
        Fail::new()
    }
}
