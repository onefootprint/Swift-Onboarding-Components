use crate::enclave_client::EnclaveClient;
use crate::utils::vault_wrapper::Business;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::TenantVw;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use crate::State;
use db::models::document::Document;
use db::models::document::DocumentImageArgs;
use db::models::document_upload::DocumentUpload;
use db::models::verification_request::VerificationRequest;
use db::DbPool;
use newtypes::email::Email;
use newtypes::BoData;
use newtypes::BusinessDataFromVault;
use newtypes::BusinessDataKind as BDK;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::DocVData;
use newtypes::DocumentId;
use newtypes::DocumentSide;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::IdentityDataKind as IDK;
use newtypes::IdvData;
use newtypes::PhoneNumber;
use newtypes::PiiBytes;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use std::collections::HashMap;
use std::str::FromStr;
use strum::IntoEnumIterator;

#[tracing::instrument(skip_all)]
pub async fn build_idv_data_from_verification_request(
    db_pool: &DbPool, // TODO: migrate to PgConn
    enclave_client: &EnclaveClient,
    request: VerificationRequest,
) -> FpResult<IdvData> {
    let vreq_id = request.id.clone();
    // Build the set of data we will send to the vendor by re-building the UVW from the DB using
    // the pointers to pieces of user data saved on the VerificationRequest
    let uvw = db_pool
        .db_query(move |conn| {
            VaultWrapper::<Person>::build(
                conn,
                VwArgs::Historical(&request.scoped_vault_id, request.uvw_snapshot_seqno),
            )
        })
        .await?;

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
        itin: decrypted_values.remove(&IDK::Itin.into()),
        dob: decrypted_values.remove(&IDK::Dob.into()),
        drivers_license_number: decrypted_values.remove(&IDK::DriversLicenseNumber.into()),
        drivers_license_state: decrypted_values.remove(&IDK::DriversLicenseState.into()),
        email,
        phone_number,
        verification_request_id: Some(vreq_id),
    };
    Ok(request)
}


// TODO: remove duplicate, see if we can get rid of build_idv_data_from_request
#[tracing::instrument(skip_all)]
pub async fn build_idv_data_at(
    db_pool: &DbPool, // TODO: migrate to PgConn
    enclave_client: &EnclaveClient,
    sv_id: &ScopedVaultId,
    seqno: DataLifetimeSeqno,
) -> FpResult<IdvData> {
    let sv_id = sv_id.clone();
    // Build the set of data we will send to the vendor by re-building the UVW from the DB using
    // the pointers to pieces of user data saved on the VerificationRequest
    let uvw = db_pool
        .db_query(move |conn| VaultWrapper::<Person>::build(conn, VwArgs::Historical(&sv_id, seqno)))
        .await?;

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
        itin: decrypted_values.remove(&IDK::Itin.into()),
        dob: decrypted_values.remove(&IDK::Dob.into()),
        drivers_license_number: decrypted_values.remove(&IDK::DriversLicenseNumber.into()),
        drivers_license_state: decrypted_values.remove(&IDK::DriversLicenseState.into()),
        email,
        phone_number,
        verification_request_id: None,
    };
    Ok(request)
}

#[tracing::instrument(skip_all)]
pub async fn bulk_build_data_from_requests(
    db_pool: &DbPool, // TODO: migrate to PgConn
    enclave_client: &EnclaveClient,
    requests: Vec<VerificationRequest>,
) -> FpResult<Vec<(VerificationRequest, IdvData)>> {
    let data_futs = requests
        .iter()
        .map(|r| build_idv_data_from_verification_request(db_pool, enclave_client, r.clone()));
    let res: Vec<IdvData> = futures::future::join_all(data_futs)
        .await
        .into_iter()
        .collect::<FpResult<Vec<IdvData>>>()?;

    let zipped = requests.into_iter().zip(res.into_iter()).collect();

    Ok(zipped)
}

async fn decrypt_documents(
    e_private_key: &EncryptedVaultPrivateKey,
    enclave_client: &EnclaveClient,
    images: Vec<DocumentUpload>,
) -> FpResult<HashMap<DocumentSide, PiiBytes>> {
    let docs = images
        .iter()
        .map(|u| (u.side, (e_private_key, &u.e_data_key, &u.s3_url)))
        .collect();

    let decrypted_documents = enclave_client.batch_decrypt_documents(docs).await?;

    Ok(decrypted_documents)
}

#[tracing::instrument(skip_all)]
pub async fn build_docv_data_from_identity_doc(
    state: &State,
    identity_document_id: DocumentId,
) -> FpResult<DocVData> {
    let (doc, images, uvw) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let (doc, dr) = Document::get(conn, &identity_document_id)?;
            let images = doc.images(conn, DocumentImageArgs::default())?;
            // TODO: if IDV args provided, only fetch the document with the ID on the VerificationRequest
            // This would allow us to re-use the uvw util to decrypt an image
            let uvw: TenantVw<Person> = VaultWrapper::build_for_tenant(conn, &dr.scoped_vault_id)?;
            Ok((doc, images, uvw))
        })
        .await?;

    let name_idks = vec![
        DataIdentifier::from(IDK::FirstName),
        DataIdentifier::from(IDK::LastName),
    ];
    let mut decrypted_name_idks = uvw.decrypt_unchecked(&state.enclave_client, &name_idks).await?;
    // decrypt the images and make sure we have at least a front image
    let mut decrypted = decrypt_documents(&uvw.vault.e_private_key, &state.enclave_client, images).await?;

    Ok(DocVData {
        reference_id: None,
        front_image: decrypted
            .remove(&DocumentSide::Front)
            .map(PiiBytes::into_base64_pii),
        back_image: decrypted
            .remove(&DocumentSide::Back)
            .map(PiiBytes::into_base64_pii),
        selfie_image: decrypted
            .remove(&DocumentSide::Selfie)
            .map(PiiBytes::into_base64_pii),
        country_code: doc.country_code.map(PiiString::from),
        document_type: Some(doc.document_type.try_into()?),
        first_name: decrypted_name_idks.remove(&IDK::FirstName.into()),
        last_name: decrypted_name_idks.remove(&IDK::LastName.into()),
    })
}

pub async fn build_business_data_from_verification_request(
    state: &State,
    request: VerificationRequest,
) -> FpResult<BusinessDataFromVault> {
    let VerificationRequest {
        scoped_vault_id: sv_id,
        uvw_snapshot_seqno: seqno,
        ..
    } = request;
    let bvw: TenantVw<Business> = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build_for_tenant_version(conn, &sv_id, seqno))
        .await?;

    // Unfortunately we have no way of ensuring whether or not we BO first name + last name is present
    // so we just opportunistically send if we have both fn/ln
    let business_owners = bvw
        .decrypt_business_owners(state)
        .await?
        .into_iter()
        .filter_map(|bo| {
            bo.name().map(|(first_name, last_name)| BoData {
                first_name,
                last_name,
            })
        })
        .collect();


    // Get remaining Business vault data
    let all_bdks: Vec<_> = BDK::non_bo_variants()
        .into_iter()
        .map(DataIdentifier::from)
        .collect();
    let mut decrypted_values = bvw.decrypt_unchecked(&state.enclave_client, &all_bdks).await?;

    let bd = BusinessDataFromVault {
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
    use super::build_idv_data_from_verification_request;
    use crate::State;
    use db::models::verification_request::VerificationRequest;
    use db::tests::test_db_pool::TestDbPool;
    use macros::test_state;
    use newtypes::VerificationRequestId;

    // Helper to debug IdvData being built from verification request while testing bifrost flows
    //
    // Place a breakpoint on the line indicated below to view the struct (can't println since we
    // scrub prints) #[ignore]
    // Manually commented out since #[test_state] doesn't support #[ignore] currently
    // #[test_state]
    // async fn debug_build_idv_data_from_verification_request(state: &mut State) {
    //     let vr = state.db_pool.db_query(move |conn| {
    //         VerificationRequest::get(conn, VerificationRequestId::from("your vreq
    // here".to_string())).unwrap()     }).await.unwrap();

    //     let b = build_idv_data_from_verification_request(&state.db_pool, &state.enclave_client,
    // vr).await.unwrap();

    //     // place breakpoint on the line below this
    //     assert!(b.first_name.is_none())

    // }
}
