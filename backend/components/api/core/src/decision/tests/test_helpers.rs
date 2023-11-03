use db::{
    models::{
        contact_info::{ContactInfo, VerificationLevel},
        insight_event::CreateInsightEvent,
        ob_configuration::ObConfiguration,
        scoped_vault::ScopedVault,
        tenant::Tenant,
        vault::Vault,
        workflow::{Workflow, WorkflowUpdate},
    },
    tests::fixtures::{self, ob_configuration::ObConfigurationOpts},
    DbPool, TxnPgConn,
};
use newtypes::{
    BusinessDataKind, DataIdentifier, IdentityDataKind, PiiString, ScopedVaultId, VaultKind,
    WorkflowFixtureResult, WorkflowSource,
};

use crate::{
    enclave_client::EnclaveClient,
    errors::ApiResult,
    tests::fixtures::lib::random_phone_number,
    utils::{
        self,
        onboarding::NewBusinessVaultArgs,
        vault_wrapper::{Any, VaultWrapper},
    },
};

pub async fn create_user_and_onboarding(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    obc_opts: ObConfigurationOpts,
    kyc_fixture_result: Option<WorkflowFixtureResult>,
    create_business: bool,
) -> (
    Tenant,
    Workflow,
    Vault,
    ScopedVault,
    ObConfiguration,
    Option<Workflow>, // Business workflow
) {
    let (pk, tenant_e_key) = enclave_client.generate_sealed_keypair().await.unwrap();
    let biz_args = if create_business {
        let (public_key, e_private_key) = enclave_client.generate_sealed_keypair().await.unwrap();
        Some(NewBusinessVaultArgs {
            public_key,
            e_private_key,
            should_create_workflow: true,
        })
    } else {
        None
    };
    db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let tenant = fixtures::tenant::create_with_keys(conn, pk, tenant_e_key);
            let ob_config = fixtures::ob_configuration::create_with_opts(conn, &tenant.id, obc_opts);

            let (uv, su) = create_user_and_populate_vault(conn, ob_config.clone(), kyc_fixture_result);

            let (wf_id, biz_wf) = utils::onboarding::get_or_start_onboarding(
                conn,
                None,
                false,
                &uv.id,
                &su.id,
                &ob_config,
                Some(CreateInsightEvent { ..Default::default() }),
                biz_args,
                WorkflowSource::Hosted,
            )
            .unwrap();

            // Mark the onboardings as authorized since they would be authorized in prod by the
            // time they're used here
            let wf = Workflow::lock(conn, &wf_id)?;
            let wf = Workflow::update(wf, conn, WorkflowUpdate::is_authorized())?;

            let biz_wf = biz_wf
                .map(|biz_wf| -> ApiResult<_> {
                    let biz_wf = Workflow::lock(conn, &biz_wf.id)?;
                    let biz_wf = Workflow::update(biz_wf, conn, WorkflowUpdate::is_authorized())?;
                    Ok(biz_wf)
                })
                .transpose()?;

            if let Some(biz_wf) = biz_wf.as_ref() {
                let sbv = ScopedVault::get(conn, &biz_wf.scoped_vault_id)?;
                populate_business_vault(conn, &sbv.id);
            }

            Ok((tenant, wf, uv, su, ob_config, biz_wf))
        })
        .await
        .unwrap()
}

pub async fn create_kyc_user_and_wf(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    obc_opts: ObConfigurationOpts,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (Tenant, Workflow, Vault, ScopedVault, ObConfiguration) {
    let (t, wf, v, sv, obc, _) =
        create_user_and_onboarding(db_pool, enclave_client, obc_opts, fixture_result, false).await;
    (t, wf, v, sv, obc)
}

pub async fn create_kyb_user_and_onboarding(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    obc_opts: ObConfigurationOpts,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (
    Tenant,
    Workflow,
    Vault,
    ScopedVault,
    ObConfiguration,
    Workflow, // Business workflow
) {
    let (t, wf, v, sv, obc, biz_wf) =
        create_user_and_onboarding(db_pool, enclave_client, obc_opts, fixture_result, true).await;

    (t, wf, v, sv, obc, biz_wf.unwrap())
}

pub fn create_user_and_populate_vault(
    conn: &mut TxnPgConn,
    ob_config: ObConfiguration,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (Vault, ScopedVault) {
    let sandbox_id = fixture_result.map(|f| format!("{}_sandbox", f.as_ref()));
    let uv = fixtures::vault::create(conn, VaultKind::Person, sandbox_id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let update = vec![
        (
            IdentityDataKind::PhoneNumber.into(),
            PiiString::new(random_phone_number()),
        ),
        (
            IdentityDataKind::FirstName.into(),
            PiiString::new("Bob".to_owned()),
        ),
        (
            IdentityDataKind::LastName.into(),
            PiiString::new("Boberto".to_owned()),
        ),
        (
            IdentityDataKind::AddressLine1.into(),
            PiiString::new("123 Bob St.".to_owned()),
        ),
        (
            IdentityDataKind::AddressLine2.into(),
            PiiString::new("#33".to_owned()),
        ),
        (
            IdentityDataKind::City.into(),
            PiiString::new("Bobville".to_owned()),
        ),
        (
            IdentityDataKind::Dob.into(),
            PiiString::new("1990-01-01".to_owned()),
        ),
        (IdentityDataKind::State.into(), PiiString::new("GA".to_owned())),
        (IdentityDataKind::Zip.into(), PiiString::new("30303".to_owned())),
        (IdentityDataKind::Country.into(), PiiString::new("US".to_owned())),
        (
            IdentityDataKind::Ssn9.into(),
            PiiString::new("123456789".to_owned()),
        ),
    ];

    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id).unwrap();
    let new_ci = uvw.patch_data_test(conn, update, false).unwrap();
    let (_, ci) = new_ci
        .into_iter()
        .find(|(di, _)| di == &DataIdentifier::from(IdentityDataKind::PhoneNumber))
        .unwrap();
    ContactInfo::mark_verified(conn, &ci.id, VerificationLevel::OtpVerified).unwrap();

    (uv.into_inner(), su)
}

pub fn populate_business_vault(conn: &mut TxnPgConn, sb_id: &ScopedVaultId) {
    let update = vec![
        (
            BusinessDataKind::BeneficialOwners.into(),
            PiiString::new(
                "[{\"first_name\": \"Bob\", \"last_name\": \"Boberto\", \"ownership_stake\": 88}]".to_owned(),
            ),
        ),
        (
            BusinessDataKind::Name.into(),
            PiiString::new("Waffle House".to_owned()),
        ),
        (BusinessDataKind::Dba.into(), PiiString::new("Waho".to_owned())),
    ];

    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, sb_id).unwrap();
    uvw.patch_data_test(conn, update, false).unwrap();
}
