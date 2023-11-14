use crate::enclave_client::EnclaveClient;
use crate::errors::{ApiResult, AssertionError, ApiErrorKind};
use crate::errors::business::BusinessError;
use crate::utils::vault_wrapper::{VaultWrapper, VwArgs, Person, Business, TenantVw, DecryptedBusinessOwners};
use crate::{errors::ApiError, State};

use db::DbPool;
use db::models::document_request::DocRefId;
use db::models::document_upload::DocumentUpload;
use db::models::identity_document::IdentityDocument;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use newtypes::{email::Email, IdentityDataKind as IDK, IdvData, PhoneNumber, BusinessDataKind as BDK};
use newtypes::{DocVData, PiiBytes, DataIdentifier, BusinessData, BoData, ScopedVaultId, PiiString, IdentityDocumentId, DocumentSide, EncryptedVaultPrivateKey};
use std::collections::HashMap;
use std::str::FromStr;
use strum::IntoEnumIterator;

#[tracing::instrument(skip_all)]
pub async fn build_idv_data_from_verification_request(
    db_pool: &DbPool, // TODO: migrate to PgConn
    enclave_client: &EnclaveClient,
    request: VerificationRequest,
) -> Result<IdvData, ApiError> {
    let vreq_id = request.id.clone();
    // Build the set of data we will send to the vendor by re-building the UVW from the DB using
    // the pointers to pieces of user data saved on the VerificationRequest
    let uvw = db_pool
        .db_query(move |conn| VaultWrapper::<Person>::build(conn, VwArgs::Historical(&request.scoped_vault_id, request.uvw_snapshot_seqno)))
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
        middle_name: decrypted_values.remove(&IDK::MiddleName.into()),
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
        verification_request_id: Some(vreq_id),
    };
    Ok(request)
}

#[tracing::instrument(skip_all)]
pub async fn bulk_build_data_from_requests(
    db_pool: &DbPool, // TODO: migrate to PgConn
    enclave_client: &EnclaveClient,
    requests: Vec<VerificationRequest>,
)-> Result<Vec<(VerificationRequest, IdvData)>, ApiError> {
    let data_futs = requests.iter().map(|r| build_idv_data_from_verification_request(db_pool, enclave_client, r.clone()));
    let res: Vec<IdvData> = futures::future::join_all(data_futs).await.into_iter().collect::<ApiResult<Vec<IdvData>>>()?;

    let zipped = requests.into_iter().zip(res.into_iter()).collect();

    Ok(zipped)

}

async fn decrypt_documents(
    e_private_key: &EncryptedVaultPrivateKey,
    enclave_client: &EnclaveClient,
    images: Vec<DocumentUpload>,
) -> ApiResult<HashMap<DocumentSide, PiiBytes>> {
    let docs = images.iter().map(|u| (u.side, (e_private_key, &u.e_data_key, &u.s3_url))).collect();

    let decrypted_documents = enclave_client
        .batch_decrypt_documents(docs)
        .await?;

    Ok(decrypted_documents)
}

/// Build a data structure that can be used to submit the images of identity documents (and selfie) to vendors
#[allow(dead_code)]
#[tracing::instrument(skip_all)]
pub async fn build_docv_data_for_submission_from_verification_request(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    request: VerificationRequest,
) -> Result<DocVData, ApiError> {
    let Some(identity_doc_id) = request.identity_document_id.clone() else { 
        return Err(ApiErrorKind::AssertionError(
            format!("{} is not a document verification vendor", request.vendor_api),
    ))?};

    let (doc, ref_id, images, vault) = db_pool
        .db_query(
            move |conn| -> ApiResult<_> {
                let (doc, dr) = IdentityDocument::get(conn, &identity_doc_id)?;
                let images = doc.images(conn, true)?;
                let vault = Vault::get(conn, &dr.scoped_vault_id)?;
                Ok((doc, dr.ref_id, images, vault))
            },
        )
        .await??;        

    // decrypt the images and make sure we have at least a front image
    let mut decrypted = decrypt_documents(&vault.e_private_key, enclave_client, images).await?;

    if decrypted.get(&DocumentSide::Front).is_none() {
        return Err(AssertionError("Missing at least front part of document").into())
    }

    // Get the reference id for idology
    let parsed_reference_id = parse_reference_id_for_scan_verify(ref_id)?;
    
    Ok(DocVData {
        reference_id: parsed_reference_id,
        front_image: decrypted.remove(&DocumentSide::Front).map(PiiBytes::into_base64_pii),
        back_image: decrypted.remove(&DocumentSide::Back).map(PiiBytes::into_base64_pii),
        selfie_image: decrypted.remove(&DocumentSide::Selfie).map(PiiBytes::into_base64_pii),
        country_code: Some(doc.country_code.into()),
        document_type: Some(doc.document_type),
        // TODO not populating name here
        ..Default::default()
    })
}

#[tracing::instrument(skip_all)]
pub async fn build_docv_data_from_identity_doc(
    state: &State,
    identity_document_id: IdentityDocumentId,
) -> ApiResult<DocVData> {
    let (doc, images, uvw) = state.db_pool
        .db_query(
            move |conn| -> ApiResult<_> {
                let (doc, dr) = IdentityDocument::get(conn, &identity_document_id)?;
                let images = doc.images(conn, true)?;
                // TODO: if IDV args provided, only fetch the document with the ID on the VerificationRequest
                // This would allow us to re-use the uvw util to decrypt an image
                let uvw: TenantVw<Person> = VaultWrapper::build_for_tenant(conn, &dr.scoped_vault_id)?;
                Ok((doc, images, uvw))
            },
        )
        .await??;        

    let name_idks = vec![DataIdentifier::from(IDK::FirstName), DataIdentifier::from(IDK::LastName)];
    let mut decrypted_name_idks = uvw.decrypt_unchecked(&state.enclave_client, &name_idks).await?;
    // decrypt the images and make sure we have at least a front image
    let mut decrypted = decrypt_documents(&uvw.vault.e_private_key, &state.enclave_client, images).await?;

    if decrypted.get(&DocumentSide::Front).is_none() {
        return Err(AssertionError("Missing at least front part of document").into())
    }
    
    Ok(DocVData {
        reference_id: None,
        front_image: decrypted.remove(&DocumentSide::Front).map(PiiBytes::into_base64_pii),
        back_image: decrypted.remove(&DocumentSide::Back).map(PiiBytes::into_base64_pii),
        selfie_image: decrypted.remove(&DocumentSide::Selfie).map(PiiBytes::into_base64_pii),
        country_code: Some(doc.country_code.into()),
        document_type: Some(doc.document_type),
        first_name: decrypted_name_idks.remove(&IDK::FirstName.into()),
        last_name: decrypted_name_idks.remove(&IDK::LastName.into()),
    })
}

/// 2023-01-05 
/// We are deprioritizing scan verify step ups for now since it requires a bit more product thought, but leaving this around for the future 
#[allow(dead_code)]
async fn build_docv_for_scan_verify_results(state: &State, request: VerificationRequest) -> Result<DocVData, ApiError> {
    let Some(identity_doc_id) = request.identity_document_id.clone() else { 
        return Err(ApiErrorKind::AssertionError(
            format!("{} is not a document verification vendor", request.vendor_api),
    ))?};

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
    reference_id.map(|r| r.parse::<u64>()).transpose().map_err(|_| AssertionError("could not parse ref_id for idology").into())
}

pub async fn build_business_data_from_verification_request(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    request: VerificationRequest,
) -> Result<BusinessData, ApiError> {
    let seqno = request.uvw_snapshot_seqno;
    let (sv, bvw) = db_pool
        .db_query(move |conn| -> ApiResult<(ScopedVault, VaultWrapper<_>)> {
            let sv = ScopedVault::get(conn, &request.scoped_vault_id)?;
            let args = VwArgs::Historical(&request.scoped_vault_id, request.uvw_snapshot_seqno);
            let bvw = VaultWrapper::<Business>::build(conn, args)?;

            Ok((sv, bvw))
        })
        .await??;

    // Get FirstName + LastName for BO's. For Single-KYC, we get this from the JSON VaultData. For Multi_KYC, we get this from each BO's Vault
    let dbo = bvw.decrypt_business_owners(db_pool, enclave_client, &sv.tenant_id).await?;
    let business_owners = match dbo {
        DecryptedBusinessOwners::KYBStart { primary_bo: _, primary_bo_vault: _ } => return Err(ApiError::from(BusinessError::BoOnboardingNotComplete)),
        DecryptedBusinessOwners::SingleKYC { primary_bo: _, primary_bo_vault: _, primary_bo_data, secondary_bos } => {
            // I guess use vault_data for the primary BO too? 
            vec![primary_bo_data].into_iter().chain(secondary_bos).map(BoData::from).collect()
        },
        DecryptedBusinessOwners::MultiKYC { primary_bo: _, primary_bo_vault, primary_bo_data: _, secondary_bos } => {
            let secondary_bo_vaults = secondary_bos.into_iter().map(|b| b.2.ok_or(BusinessError::BoOnboardingNotComplete)).collect::<Result<Vec<_>,_>>()?;
            let vaults: Vec<_> = vec![primary_bo_vault].into_iter().chain(secondary_bo_vaults).map(|v| (v.0, v.1)).collect();
 
             let vws: HashMap<ScopedVaultId, TenantVw> = db_pool.db_query(move |conn| {
                 VaultWrapper::multi_get_for_tenant(conn, vaults, &sv.tenant_id, Some(seqno))
             
             }).await??;
             // Future optimization would be to bulk decrypt multiple vaults data in one enclave call
             let decrypt_futs = vws.into_values().map(|vw| {
                async move {
                    let dis = &[IDK::FirstName.into(), IDK::LastName.into()];
                    let mut res = vw.decrypt_unchecked(enclave_client, dis).await?;
                    let first_name = res.remove(&IDK::FirstName.into()).ok_or(BusinessError::BoVaultMissingFirstName)?;
                    let last_name = res.remove(&IDK::LastName.into()).ok_or(BusinessError::BoVaultMissingLastName)?;

                    Ok::<_, ApiError>((first_name, last_name))
                }
             });
             let res: Vec<(PiiString, PiiString)> = futures::future::join_all(decrypt_futs).await.into_iter().collect::<Result<Vec<_>, _>>()?;
             res.into_iter().map(|(first_name, last_name)| BoData { first_name, last_name}).collect()
        },
        DecryptedBusinessOwners::KybWithoutBos => vec![]

    };
    
    // Get remaining Business vault data
    let all_bdks: Vec<_> = BDK::iter().filter(|b| !matches!(b, BDK::BeneficialOwners | BDK::KycedBeneficialOwners)).map(DataIdentifier::from).collect();
    let mut decrypted_values = bvw.decrypt_unchecked(enclave_client, &all_bdks).await?;

    let bd = BusinessData {
        name: decrypted_values.remove(&BDK::Name.into()),
        dba: decrypted_values.remove(&BDK::Dba.into()),
        website_url: decrypted_values.remove(&BDK::Website.into()),
        phone_number: decrypted_values.remove(&BDK::PhoneNumber.into()),
        tin: decrypted_values.remove(&BDK::Tin.into()),
        address_line1: decrypted_values.remove(&BDK::AddressLine1.into()),
        address_line2: decrypted_values.remove(&BDK::AddressLine2.into()),
        city: decrypted_values.remove(&BDK::City.into()),
        state: decrypted_values.remove(&BDK::State.into()),
        zip: decrypted_values.remove(&BDK::Zip.into()),
        business_owners,
    };

    Ok(bd)
}


#[cfg(test)]
#[allow(unused)]
mod tests {
    use db::models::verification_request::VerificationRequest;
    use macros::test_state;
    use newtypes::VerificationRequestId;
    use db::tests::test_db_pool::TestDbPool;
    use crate::State;
    use super::build_idv_data_from_verification_request;

    // Helper to debug IdvData being built from verification request while testing bifrost flows
    // 
    // Place a breakpoint on the line indicated below to view the struct (can't println since we scrub prints)
    // #[ignore]
    // Manually commented out since #[test_state] doesn't support #[ignore] currently 
    // #[test_state]
    // async fn debug_build_idv_data_from_verification_request(state: &mut State) {        
    //     let vr = state.db_pool.db_query(move |conn| {
    //         VerificationRequest::get(conn, VerificationRequestId::from("your vreq here".to_string())).unwrap()
    //     }).await.unwrap();


    //     let b = build_idv_data_from_verification_request(&state.db_pool, &state.enclave_client, vr).await.unwrap();

    //     // place breakpoint on the line below this
    //     assert!(b.first_name.is_none())

        

    // }
}