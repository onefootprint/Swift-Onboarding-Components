use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use crypto::aead::AeadSealedBytes;
use db::models::document_request::DocRefId;
use db::models::identity_document::IdentityDocument;
use db::models::verification_request::VerificationRequest;
use db::HasDataAttributeFields;
use newtypes::{email::Email, DataLifetimeKind, IdvData, PhoneNumber};
use newtypes::{DocVData, Base64Data, PiiString};
use std::{collections::HashMap, str::FromStr};
use strum::IntoEnumIterator;

pub async fn build_idv_data_from_verification_request(
    state: &State,
    request: VerificationRequest,
) -> Result<IdvData, ApiError> {
    // Build the set of data we will send to the vendor by re-building the UVW from the DB using
    // the pointers to pieces of user data saved on the VerificationRequest
    let uvw = state
        .db_pool
        .db_query(|conn| UserVaultWrapper::build_for_idv(conn, request))
        .await??;

    let (keys, encrypted_values): (Vec<_>, Vec<_>) = DataLifetimeKind::iter()
        .flat_map(|a| uvw.get_e_field(a).map(|v| (a, v)))
        .unzip();
    let decrypted_values = uvw.decrypt(state, encrypted_values).await?;
    let mut decrypted_values: HashMap<DataLifetimeKind, _> =
        keys.into_iter().zip(decrypted_values.into_iter()).collect();
    // Remove sandbox suffixes
    let email = decrypted_values
        .remove(&DataLifetimeKind::Email)
        .map(|x| Email::from_str(x.leak()).map(|x| x.email))
        .transpose()?;
    let phone_number = decrypted_values
        .remove(&DataLifetimeKind::PhoneNumber)
        .map(|x| PhoneNumber::from_str(x.leak()).map(|x| x.number))
        .transpose()?;
    let request = IdvData {
        first_name: decrypted_values.remove(&DataLifetimeKind::FirstName),
        last_name: decrypted_values.remove(&DataLifetimeKind::LastName),
        address_line1: decrypted_values.remove(&DataLifetimeKind::AddressLine1),
        address_line2: decrypted_values.remove(&DataLifetimeKind::AddressLine2),
        city: decrypted_values.remove(&DataLifetimeKind::City),
        state: decrypted_values.remove(&DataLifetimeKind::State),
        zip: decrypted_values.remove(&DataLifetimeKind::Zip),
        country: decrypted_values.remove(&DataLifetimeKind::Country),
        ssn4: decrypted_values.remove(&DataLifetimeKind::Ssn4),
        ssn9: decrypted_values.remove(&DataLifetimeKind::Ssn9),
        dob: decrypted_values.remove(&DataLifetimeKind::Dob),
        email,
        phone_number,
    };
    Ok(request)
}


/// Build a data structure that can be used to submit the images of identity documents (and selfie) to vendors
#[allow(dead_code)]
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
            move |conn| -> Result<(IdentityDocument, Option<String>, UserVaultWrapper), ApiError> {
                let (doc, ref_id) = IdentityDocument::get(conn, &identity_doc_id)?;
                let uvw = UserVaultWrapper::build_for_idv(conn, request)?;
                Ok((doc, ref_id.ref_id, uvw))
            },
        )
        .await??;

    let images = crate::utils::user_vault_wrapper::identity_document::fetch_image(state, doc).await?;
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
    // Get the reference id for idology
    let parsed_reference_id = parse_reference_id_for_scan_verify(ref_id)?;
    
    Ok(DocVData {
        reference_id: parsed_reference_id,
        front_image: Some(PiiString::from(front.to_string_standard())),
        back_image: back.map(|b| PiiString::from(b.to_string_standard())),
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