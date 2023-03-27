use crate::enclave_client::EnclaveClient;
use crate::utils::vault_wrapper::{VaultWrapper, VwArgs, Person};
use crate::{errors::ApiError, State};
use crypto::aead::AeadSealedBytes;
use db::DbPool;
use db::models::document_request::DocRefId;
use db::models::identity_document::IdentityDocument;
use db::models::verification_request::VerificationRequest;
use newtypes::{email::Email, IdentityDataKind as IDK, IdvData, PhoneNumber};
use newtypes::{DocVData, Base64Data, PiiString, DataIdentifier};
use std::{str::FromStr};
use strum::IntoEnumIterator;

pub async fn build_idv_data_from_verification_request(
    db_pool: &DbPool, // TODO: migrate to PgConn
    enclave_client: &EnclaveClient,
    request: VerificationRequest,
) -> Result<IdvData, ApiError> {
    // Build the set of data we will send to the vendor by re-building the UVW from the DB using
    // the pointers to pieces of user data saved on the VerificationRequest
    let uvw = db_pool
        .db_query(|conn| VaultWrapper::<Person>::build(conn, VwArgs::Idv(request)))
        .await??;

    let all_idks: Vec<_> = IDK::iter().map(DataIdentifier::from).collect();
    let mut decrypted_values = uvw.decrypt_unchecked(enclave_client, &all_idks).await?;
    // Remove sandbox suffixes
    let email = decrypted_values
        .remove(&IDK::Email.into())
        .map(|x| Email::from_str(x.leak()).map(|x| x.email))
        .transpose()?;
    let phone_number = decrypted_values
        .remove(&IDK::PhoneNumber.into())
        .map(|x| PhoneNumber::from_str(x.leak()).map(|x| x.e164()))
        .transpose()?;
    let request = IdvData {
        first_name: decrypted_values.remove(&IDK::FirstName.into()),
        last_name: decrypted_values.remove(&IDK::LastName.into()),
        address_line1: decrypted_values.remove(&IDK::AddressLine1.into()),
        address_line2: decrypted_values.remove(&IDK::AddressLine2.into()),
        city: decrypted_values.remove(&IDK::City.into()),
        state: decrypted_values.remove(&IDK::State.into()),
        zip: decrypted_values.remove(&IDK::Zip.into()),
        country: decrypted_values.remove(&IDK::Country.into()),
        ssn4: decrypted_values.remove(&IDK::Ssn4.into()),
        ssn9: decrypted_values.remove(&IDK::Ssn9.into()),
        dob: decrypted_values.remove(&IDK::Dob.into()),
        email,
        phone_number,
    };
    Ok(request)
}


/// Build a data structure that can be used to submit the images of identity documents (and selfie) to vendors
#[allow(dead_code)]
#[tracing::instrument(skip(state))]
pub async fn build_docv_data_for_submission_from_verification_request(
    state: &State,
    request: VerificationRequest,
) -> Result<DocVData, ApiError> {
    let Some(identity_doc_id) = request.identity_document_id.clone() else { 
        return Err(ApiError::AssertionError(
            format!("{} is not a document verification vendor", request.vendor_api),
    ))};

    let (doc, ref_id, uvw) = state
        .db_pool
        .db_query(
            move |conn| -> Result<(IdentityDocument, Option<String>, VaultWrapper<_>), ApiError> {
                let (doc, ref_id) = IdentityDocument::get(conn, &identity_doc_id)?;
                // TODO: if IDV args provided, only fetch the document with the ID on the VerificationRequest
                // This would allow us to re-use the uvw util to decrypt an image
                let uvw = VaultWrapper::build(conn, VwArgs::Idv(request))?;
                Ok((doc, ref_id.ref_id, uvw))
            },
        )
        .await??;

    let images = crate::utils::vault_wrapper::identity_document::fetch_image(state, doc).await?;
    let unsealed_key = uvw.decrypt_data_keys(state, vec![images.e_data_key]).await?.pop();
    let Some(key) = unsealed_key else {
        return Err(ApiError::AssertionError("Could not decrypt data key".into()));
    };
    
    // Decrypt
    let front = Base64Data(key.unseal_bytes(AeadSealedBytes(images.front_image.0))?);
    let mut back: Option<Base64Data> = None;
    if let Some(b) = images.back_image {
        back = Some(Base64Data(key.unseal_bytes(AeadSealedBytes(b.0))?));
    }
    let mut selfie: Option<Base64Data> = None;
    if let Some(b) = images.selfie_image {
        selfie = Some(Base64Data(key.unseal_bytes(AeadSealedBytes(b.0))?));
    }
    // Get the reference id for idology
    let parsed_reference_id = parse_reference_id_for_scan_verify(ref_id)?;
    
    Ok(DocVData {
        reference_id: parsed_reference_id,
        front_image: Some(PiiString::from(front.to_string_standard().0)),
        back_image: back.map(|b| PiiString::from(b.to_string_standard().0)),
        selfie_image: selfie.map(|b| PiiString::from(b.to_string_standard().0)),
        country_code: Some(images.document_country.into()),
        document_type: Some(images.document_type),
    })
}


/// 2023-01-05 
/// We are deprioritizing scan verify step ups for now since it requires a bit more product thought, but leaving this around for the future 
#[allow(dead_code)]
async fn build_docv_for_scan_verify_results(state: &State, request: VerificationRequest) -> Result<DocVData, ApiError> {
    let Some(identity_doc_id) = request.identity_document_id.clone() else { 
        return Err(ApiError::AssertionError(
            format!("{} is not a document verification vendor", request.vendor_api),
    ))};

    let ref_id = state
        .db_pool
        .db_query(
            move |conn| -> Result<Option<DocRefId>, ApiError> {
                let (_, ref_id) = IdentityDocument::get(conn, &identity_doc_id)?;
                Ok(ref_id.ref_id)
            },
        )
        .await??;
        let parsed_reference_id = parse_reference_id_for_scan_verify(ref_id)?;
        
        Ok(DocVData {
            reference_id: parsed_reference_id,
            ..Default::default()
        })
}

fn parse_reference_id_for_scan_verify(reference_id: Option<String>) -> Result<Option<u64>, ApiError> {
    reference_id.map(|r| r.parse::<u64>()).transpose().map_err(|_| ApiError::AssertionError("could not parse ref_id for idology".into()))
}


#[cfg(test)]
mod tests {
    use db::{test_helpers::test_db_pool, models::verification_request::VerificationRequest};
    use newtypes::VerificationRequestId;

    use crate::utils::mock_enclave::StateWithMockEnclave;
    use super::build_idv_data_from_verification_request;

    /// Helper to debug IdvData being built from verification request while testing bifrost flows
    /// 
    /// Place a breakpoint on the line indicated below to view the struct (can't println since we scrub prints)
    #[ignore]
    #[tokio::test]
    async fn debug_build_idv_data_from_verification_request() {
        let db_pool = test_db_pool();
        let state = &StateWithMockEnclave::init().await.state;
        
        let vr = db_pool.db_query(move |conn| {
            VerificationRequest::get(conn, VerificationRequestId::from("your vreq here".to_string())).unwrap()
        }).await.unwrap();


        let b = build_idv_data_from_verification_request(&db_pool, &state.enclave_client, vr).await.unwrap();

        // place breakpoint on the line below this
        assert!(b.first_name.is_none())

        

    }
}