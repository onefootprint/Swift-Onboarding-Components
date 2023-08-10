use db::{
    models::{
        contact_info::ContactInfo,
        ob_configuration::ObConfiguration,
        onboarding::{Onboarding, OnboardingUpdate},
        scoped_vault::ScopedVault,
        tenant::Tenant,
        vault::Vault,
    },
    tests::fixtures,
    DbPool, TxnPgConn,
};
use newtypes::{
    BusinessDataKind, CipKind, CollectedDataOption, DataIdentifier, IdentityDataKind, PiiString,
    ScopedVaultId, VaultKind, WorkflowFixtureResult,
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
    must_collect_data: Vec<CollectedDataOption>,
    cip_kind: Option<CipKind>,
    is_live: bool,
    kyc_fixture_result: Option<WorkflowFixtureResult>,
    create_business: bool,
) -> (
    Tenant,
    Onboarding,
    Vault,
    ScopedVault,
    ObConfiguration,
    Option<ScopedVault>,
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
            let ob_config = fixtures::ob_configuration::create_with_opts(
                conn,
                &tenant.id,
                is_live,
                Some(must_collect_data),
                cip_kind,
            );

            let (uv, su) = create_user_and_populate_vault(conn, ob_config.clone(), kyc_fixture_result);

            let (ob, biz_ob) =
                utils::onboarding::get_or_start_onboarding(conn, &uv.id, &su.id, &ob_config, None, biz_args)
                    .unwrap();

            // Mark the onboardings as authorized since they would be authorized in prod by the
            // time they're used here
            let wf_id = ob.workflow_id;
            let ob = Onboarding::lock(conn, &ob.id)?;
            let ob = Onboarding::update(ob, conn, Some(&wf_id), OnboardingUpdate::is_authorized())?;

            let biz_ob = biz_ob
                .map(|biz_ob| -> ApiResult<_> {
                    let wf_id = biz_ob.workflow_id;
                    let biz_ob = Onboarding::lock(conn, &biz_ob.id)?;
                    let biz_ob =
                        Onboarding::update(biz_ob, conn, Some(&wf_id), OnboardingUpdate::is_authorized())?;
                    Ok(biz_ob)
                })
                .transpose()?;
            let sbv = biz_ob
                .map(|biz_ob| ScopedVault::get(conn, &biz_ob.scoped_vault_id))
                .transpose()?;

            if let Some(sbv) = sbv.as_ref() {
                populate_business_vault(conn, &sbv.id);
            }

            Ok((tenant, ob, uv, su, ob_config, sbv))
        })
        .await
        .unwrap()
}

pub async fn create_kyc_user_and_onboarding(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    must_collect_data: Option<Vec<CollectedDataOption>>,
    cip_kind: Option<CipKind>,
    is_live: bool,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (Tenant, Onboarding, Vault, ScopedVault, ObConfiguration) {
    let must_collect_data: Vec<CollectedDataOption> =
        must_collect_data.unwrap_or(vec![CollectedDataOption::PhoneNumber]);
    let (t, ob, v, sv, obc, _) = create_user_and_onboarding(
        db_pool,
        enclave_client,
        must_collect_data,
        cip_kind,
        is_live,
        fixture_result,
        false,
    )
    .await;
    (t, ob, v, sv, obc)
}

pub async fn create_kyb_user_and_onboarding(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    must_collect_data: Option<Vec<CollectedDataOption>>,
    is_live: bool,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (
    Tenant,
    Onboarding,
    Vault,
    ScopedVault,
    ObConfiguration,
    ScopedVault,
) {
    let must_collect_data: Vec<CollectedDataOption> = must_collect_data.unwrap_or(vec![
        CollectedDataOption::PhoneNumber,
        CollectedDataOption::FullAddress,
        CollectedDataOption::BusinessName,
        CollectedDataOption::BusinessBeneficialOwners,
    ]);
    let (t, ob, v, sv, obc, sbv) = create_user_and_onboarding(
        db_pool,
        enclave_client,
        must_collect_data,
        None,
        is_live,
        fixture_result,
        true,
    )
    .await;

    (t, ob, v, sv, obc, sbv.unwrap())
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
    ];

    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id).unwrap();
    let new_ci = uvw.patch_data_test(conn, update, false).unwrap();
    let (_, ci) = new_ci
        .into_iter()
        .find(|(di, _)| di == &DataIdentifier::from(IdentityDataKind::PhoneNumber))
        .unwrap();
    ContactInfo::mark_verified(conn, &ci.id).unwrap();

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
