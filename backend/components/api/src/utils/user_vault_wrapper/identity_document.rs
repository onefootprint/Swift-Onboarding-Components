use super::UserVaultWrapper;
use crate::errors::ApiError;
use crate::s3::S3Error;
use crate::State;
use db::models::identity_document::IdentityDocument;
use itertools::Itertools;
use newtypes::{IdentityDocumentId, SealedVaultBytes, SealedVaultDataKey};

pub struct IdentityDocumentImages {
    pub identity_document_id: IdentityDocumentId,
    pub document_type: String,
    pub document_country: String,
    pub front_image: SealedVaultBytes,
    // not all documents have backs
    pub back_image: Option<SealedVaultBytes>,
    pub e_data_key: SealedVaultDataKey,
}

pub async fn fetch_image(
    state: &State,
    identity_document: IdentityDocument,
) -> Result<IdentityDocumentImages, ApiError> {
    // require at least front to be non-None
    let (Some(front_path), back_path) = (identity_document.front_image_s3_url, identity_document.back_image_s3_url) else {
        // TODO is this really the right error?
        return Err(ApiError::S3Error(S3Error::InvalidS3Url))
    };

    let front = state
        .s3_client
        .get_object_from_s3_url(front_path.as_str())
        .await?;
    let mut back: Option<actix_web::web::Bytes> = None;
    if let Some(b) = back_path {
        back = Some(state.s3_client.get_object_from_s3_url(b.as_str()).await?);
    }

    Ok(IdentityDocumentImages {
        identity_document_id: identity_document.id,
        document_type: identity_document.document_type,
        document_country: identity_document.country_code,
        front_image: SealedVaultBytes(front.to_vec()),
        back_image: back.map(|b| SealedVaultBytes(b.to_vec())),
        e_data_key: identity_document.e_data_key,
    })
}

/// Impl for helpers related to fetching documents
impl UserVaultWrapper {
    /// Given a document_type, fetch from S3
    /// ALERT ALERT : this function assumes you have already check if the requester
    /// can access the image!
    pub async fn get_encrypted_images_from_s3(
        &self,
        state: &State,
        document_type: String,
    ) -> Vec<Result<IdentityDocumentImages, ApiError>> {
        let futures = self
            .identity_documents()
            .iter()
            .filter(|i| i.document_type == document_type)
            .map(|doc| fetch_image(state, doc.clone()));

        futures::future::join_all(futures).await
    }

    pub fn get_identity_document_types(&self) -> Vec<String> {
        self.identity_documents()
            .iter()
            .map(|i| i.document_type.clone())
            .collect::<Vec<String>>()
            .into_iter()
            .unique()
            .collect::<Vec<String>>()
    }
}
