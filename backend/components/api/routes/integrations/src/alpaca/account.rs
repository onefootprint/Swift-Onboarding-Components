use alpaca::types::account::AlpacaDocumentType;
use alpaca::types::account::Contact;
use alpaca::types::account::CreateAccountRequest;
use alpaca::types::account::Disclosures;
use alpaca::types::account::Document as AlpacaDocument;
use alpaca::types::account::Identity;
use alpaca::types::account::TaxIdType;
use alpaca::AlpacaCip;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyAuth;
use api_core::auth::tenant::TenantGuard;
use api_core::errors::cip_error::CipError;
use api_core::types::ApiResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_core::State;
use api_wire_types::AlpacaCreateAccountRequest;
use api_wire_types::AlpacaCreateAccountResponse;
use api_wire_types::DeprecatedAlpacaCreateAccountRequest;
use db::models::document::Document;
use db::models::scoped_vault::ScopedVault;
use newtypes::email::Email;
use newtypes::DataIdentifier as DI;
use newtypes::Declaration;
use newtypes::DocumentDiKind as DK;
use newtypes::IdDocKind;
use newtypes::IdentityDataKind as IDK;
use newtypes::InvestorProfileKind as IPK;
use newtypes::PhoneNumber;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::TenantId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use std::str::FromStr;

#[api_v2_operation(description = "Create an Alpaca account", tags(Integrations, Alpaca, Preview))]
#[actix::post("/users/{fp_id}/integrations/alpaca/account")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantApiKeyAuth,
    request: Json<AlpacaCreateAccountRequest>,
    fp_id: FpIdPath,
) -> ApiResponse<AlpacaCreateAccountResponse> {
    let AlpacaCreateAccountRequest {
        api_key,
        api_secret,
        hostname,
        enabled_assets,
        disclosures,
        agreements,
        trusted_contact,
        account_type,
    } = request.into_inner();
    let fp_id = fp_id.into_inner();
    let request = DeprecatedAlpacaCreateAccountRequest {
        fp_user_id: fp_id,
        api_key,
        api_secret,
        hostname,
        enabled_assets,
        disclosures,
        agreements,
        trusted_contact,
        account_type,
    };
    let result = post_inner(state, auth, request).await?;
    Ok(result)
}

#[api_v2_operation(
    description = "Create an Alpaca account",
    tags(Integrations, Alpaca, Deprecated)
)]
#[actix::post("/integrations/alpaca/account")]
pub async fn post_old(
    state: web::Data<State>,
    auth: TenantApiKeyAuth,
    request: Json<DeprecatedAlpacaCreateAccountRequest>,
) -> ApiResponse<AlpacaCreateAccountResponse> {
    let result = post_inner(state, auth, request.into_inner()).await?;
    Ok(result)
}

pub async fn post_inner(
    state: web::Data<State>,
    auth: TenantApiKeyAuth,
    request: DeprecatedAlpacaCreateAccountRequest,
) -> ApiResponse<AlpacaCreateAccountResponse> {
    tracing::info!(%request.fp_user_id, %request.hostname, "/integrations/alpaca/cip request");
    // TODO: do we also want to validate here that the user is `Pass` like we do in the CIP endpoint?
    let auth = auth.check_guard(TenantGuard::CipIntegration)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    // make the client
    let alpaca_client = alpaca::AlpacaCipClient::new(
        request.api_key.clone(),
        request.api_secret.clone(),
        &request.hostname,
    )
    .map_err(CipError::from)?;

    let request: CreateAccountRequest =
        create_create_account_request(&state, tenant_id, is_live, request).await?;
    let response = alpaca_client
        .create_account(request)
        .await
        .map_err(CipError::from)?;

    // parse the response as json and grab it's response code
    let status_code = response.status().as_u16();
    let alpaca_response: PiiJsonValue = response.json().await?;

    Ok(AlpacaCreateAccountResponse {
        status_code,
        alpaca_response,
    })
}

async fn create_create_account_request(
    state: &State,
    tenant_id: TenantId,
    is_live: bool,
    req: DeprecatedAlpacaCreateAccountRequest,
) -> FpResult<CreateAccountRequest> {
    let (uvw, doc) = state
        .db_query(move |conn| -> FpResult<(TenantVw<Person>, _)> {
            let sv = ScopedVault::get(conn, (&req.fp_user_id, &tenant_id, is_live))?;
            let doc = Document::get_latest_complete_identity(conn, &sv.id)?;
            let uvw = VaultWrapper::build_for_tenant(conn, &sv.id)?;
            Ok((uvw, doc))
        })
        .await?;

    tracing::info!(?doc, "create_create_account_request");

    let doc_info = doc
        .map(|(id, _)| -> FpResult<_> {
            // Get the document type that we used to vault the verified images. This is how incode
            // classified the document, which in rare cases may be different from how the user
            // classified the document
            let document_kind = id.vaulted_document_type.unwrap_or(id.document_type).try_into()?;
            let di_pairs = id
                .document_type
                .sides()
                .into_iter()
                .map(|s| {
                    (
                        DI::from(DK::Image(document_kind, s)),
                        DI::from(DK::MimeType(document_kind, s)),
                    )
                })
                .collect::<Vec<_>>();
            Ok(DocInfo {
                id_doc_kind: document_kind,
                di_pairs,
            })
        })
        .transpose()?;

    let mut decrypted = uvw
        .decrypt_unchecked(
            &state.enclave_client,
            vec![
                DI::Id(IDK::FirstName),
                DI::Id(IDK::LastName),
                DI::Id(IDK::Email),
                DI::Id(IDK::PhoneNumber),
                DI::Id(IDK::Dob),
                DI::Id(IDK::AddressLine1),
                DI::Id(IDK::AddressLine2),
                DI::Id(IDK::Zip),
                DI::Id(IDK::Country),
                DI::Id(IDK::State),
                DI::Id(IDK::City),
                DI::Id(IDK::Ssn9),
                DI::InvestorProfile(IPK::Declarations),
            ]
            .into_iter()
            .chain(doc_info.as_ref().map(|d| d.all_dis()).unwrap_or(vec![]))
            .collect::<Vec<_>>()
            .as_slice(),
        )
        .await?;

    let disclosures = if let Some(disclosures) = req.disclosures {
        disclosures
    } else {
        let declarations: Vec<Declaration> = decrypted.rm_di(IPK::Declarations)?.deserialize()?;
        Disclosures::from_declarations(&declarations)
    };

    let documents = if let Some(doc_info) = doc_info {
        let documents = doc_info
            .di_pairs
            .into_iter()
            .map(|(latest_doc_di, mime_di)| -> FpResult<AlpacaDocument> {
                let content = decrypted.rm_di(latest_doc_di)?.into();
                let mime_type = decrypted.rm_di(mime_di)?;
                Ok(AlpacaDocument {
                    document_type: AlpacaDocumentType::IdentityVerification,
                    document_sub_type: Some(doc_info.id_doc_kind.to_string()),
                    content,
                    mime_type: mime_type.leak_to_string(),
                })
            })
            .collect::<Result<Vec<_>, _>>()?;
        Some(documents)
    } else {
        None
    };

    Ok(CreateAccountRequest {
        enabled_assets: req.enabled_assets,
        contact: Contact {
            email_address: Email::from_str(decrypted.rm_di(IDK::Email)?.leak())?.email.into(),
            phone_number: PhoneNumber::parse(decrypted.rm_di(IDK::PhoneNumber)?)?
                .e164()
                .into(),
            street_address: vec![decrypted.rm_di(IDK::AddressLine1)?.into()],
            unit: decrypted.rm_di(IDK::AddressLine2).ok().map(|a| a.into()),
            city: decrypted.rm_di(IDK::City)?.into(),
            state: Some(decrypted.rm_di(IDK::State)?.into()), /* required if country_of_tax_residence is
                                                               * USA which currently our users are */
            postal_code: decrypted.rm_di(IDK::Zip)?.into(),
            country: decrypted.rm_di(IDK::Country)?.into(),
        },
        identity: Identity {
            given_name: decrypted.rm_di(IDK::FirstName)?.into(),
            middle_name: None,
            family_name: decrypted.rm_di(IDK::LastName)?.into(),
            date_of_birth: decrypted.rm_di(IDK::Dob)?.into(),
            tax_id: Some(decrypted.rm_di(IDK::Ssn9)?.into()),
            tax_id_type: Some(TaxIdType::USA_SSN),
            country_of_citizenship: None,
            country_of_birth: None,
            country_of_tax_residence: PiiString::from("USA").into(), // hardcoded for now
            visa_type: None,
            visa_expiration_date: None,
            date_of_departure_from_usa: None,
            permanent_resident: None,
            funding_source: vec![],
            annual_income_min: None,
            annual_income_max: None,
            liquid_net_worth_min: None,
            liquid_net_worth_max: None,
            total_net_worth_min: None,
            total_net_worth_max: None,
            extra: None,
        },
        disclosures,
        agreements: req.agreements,
        documents,
        trusted_contact: req.trusted_contact,
        account_type: req.account_type,
    })
}

struct DocInfo {
    id_doc_kind: IdDocKind,
    di_pairs: Vec<(DI, DI)>, // (LatestUpload, MimeType)
}

impl DocInfo {
    fn all_dis(&self) -> Vec<DI> {
        self.di_pairs
            .iter()
            .flat_map(|(di1, di2)| vec![di1.clone(), di2.clone()])
            .collect::<Vec<_>>()
    }
}
