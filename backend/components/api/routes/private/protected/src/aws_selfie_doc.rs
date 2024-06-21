//! Temporary tool to analyze selfie + doc comparison and over

use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web;
use api_core::types::ApiResponse;
use api_core::utils::vault_wrapper::EnclaveDecryptOperation;
use api_core::utils::vault_wrapper::Pii;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::ApiCoreError;
use api_core::FpResult;
use api_core::State;
use db::models::scoped_vault::ScopedVault;
use newtypes::DataIdentifier;
use newtypes::FpId;
use selfie_doc::analyze_id::AnalyzeIdResult;
use std::collections::HashMap;

#[derive(Debug, serde::Deserialize)]
pub struct CompareAnalyzeRequest {
    fp_id: FpId,
    document_id: DataIdentifier,
    selfie_id: DataIdentifier,
}

#[derive(Debug, serde::Serialize, macros::JsonResponder)]
pub struct ComparisonAndDocOcrResult {
    comparison_result: selfie_doc::compare::CompareResult,
    analyzed_id_scores: HashMap<String, f32>,
}

#[post("/private/protected/aws_selfie_doc")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<CompareAnalyzeRequest>,
    _: ProtectedAuth,
) -> ApiResponse<ComparisonAndDocOcrResult> {
    let CompareAnalyzeRequest {
        fp_id,
        document_id,
        selfie_id,
    } = request.into_inner();

    let uvw = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(
                conn,
                db::models::scoped_vault::ScopedVaultIdentifier::SuperAdminView { identifier: &fp_id },
            )?;
            VaultWrapper::<api_core::utils::vault_wrapper::Any>::build_for_tenant(conn, &sv.id)
        })
        .await?;

    let doc_id_op: EnclaveDecryptOperation = document_id.into();
    let selfie_id_op: EnclaveDecryptOperation = selfie_id.into();

    let results = uvw
        .fn_decrypt_unchecked_raw(
            &state.enclave_client,
            vec![doc_id_op.clone(), selfie_id_op.clone()],
        )
        .await?;

    let doc_pii_bytes = match results.get(&doc_id_op).ok_or(ApiCoreError::ResourceNotFound)? {
        Pii::Bytes(bytes) => bytes,
        _ => return Err(ApiCoreError::AssertionError("unexpected pii type".into()))?,
    };
    let selfie_pii_bytes = match results.get(&selfie_id_op).ok_or(ApiCoreError::ResourceNotFound)? {
        Pii::Bytes(bytes) => bytes,
        _ => return Err(ApiCoreError::AssertionError("unexpected pii type".into()))?,
    };

    let comparison_result = state
        .aws_selfie_doc_client
        .compare_doc_to_selfie(doc_pii_bytes, selfie_pii_bytes, None)
        .await?;

    let analyzed_id = state
        .aws_selfie_doc_client
        .extract_document_data(doc_pii_bytes)
        .await?;

    Ok(ComparisonAndDocOcrResult {
        comparison_result,
        analyzed_id_scores: match analyzed_id {
            AnalyzeIdResult::FoundDocumentMetadata(m) => m.scores(),
            _ => HashMap::new(),
        },
    })
}
