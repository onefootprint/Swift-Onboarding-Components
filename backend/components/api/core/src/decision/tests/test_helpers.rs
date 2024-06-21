use crate::decision::rule_engine;
use crate::tests::fixtures::lib::random_phone_number;
use crate::utils::onboarding::NewBusinessVaultArgs;
use crate::utils::onboarding::NewOnboardingArgs;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::{
    self,
};
use crate::FpResult;
use crate::State;
use db::models::contact_info::ContactInfo;
use db::models::contact_info::VerificationLevel;
use db::models::document_request::DocumentRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::models::workflow::WorkflowUpdate;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::tests::fixtures::{
    self,
};
use db::TxnPgConn;
use newtypes::BusinessDataKind;
use newtypes::DataIdentifier;
use newtypes::DocumentRequestKind;
use newtypes::IdentityDataKind;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::VaultKind;
use newtypes::VerificationCheck;
use newtypes::VerificationCheckKind;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowSource;

pub async fn create_user_and_onboarding(
    state: &State,
    obc_opts: ObConfigurationOpts,
    kyc_fixture_result: Option<WorkflowFixtureResult>,
    create_business: bool,
    reuse_tenant: Option<Tenant>,
) -> (
    Tenant,
    Workflow,
    Vault,
    ScopedVault,
    ObConfiguration,
    Option<Workflow>, // Business workflow
) {
    let (pk, tenant_e_key) = state.enclave_client.generate_sealed_keypair().await.unwrap();
    let biz_args = if create_business {
        let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await.unwrap();
        Some(NewBusinessVaultArgs {
            public_key,
            e_private_key,
            should_create_workflow: true,
        })
    } else {
        None
    };
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let tenant = if let Some(t) = reuse_tenant {
                t
            } else {
                fixtures::tenant::create_with_keys(conn, pk, tenant_e_key)
            };
            let obc = fixtures::ob_configuration::create_with_opts(conn, &tenant.id, obc_opts);
            let obc = ObConfiguration::lock(conn, &obc.id).unwrap();
            // TODO: need to rework our test utils so they use the same codepaths as our application logic to
            // create things like OBC's and such
            rule_engine::default_rules::save_default_rules_for_obc(conn, &obc, None).unwrap();

            let (uv, su) = create_user_and_populate_vault(conn, obc.clone(), kyc_fixture_result);

            let args = NewOnboardingArgs {
                existing_wf_id: None,
                wfr_id: None,
                force_create: false,
                sv: &su,
                obc: &obc,
                insight_event: Some(CreateInsightEvent { ..Default::default() }),
                new_biz_args: biz_args,
                source: WorkflowSource::Hosted,
                fixture_result: None,
                actor: None,
                maybe_prefill_data: None,
                is_neuro_enabled: false,
            };
            let (wf_id, biz_wf, _) = utils::onboarding::get_or_start_onboarding(conn, args).unwrap();
            if let Some(fixture_result) = kyc_fixture_result {
                Workflow::update_fixture_result(conn, &wf_id, fixture_result).unwrap();
            }

            // Mark the onboardings as authorized since they would be authorized in prod by the
            // time they're used here
            let wf = Workflow::lock(conn, &wf_id)?;
            let wf = Workflow::update(wf, conn, WorkflowUpdate::is_authorized())?;

            let biz_wf = biz_wf
                .map(|biz_wf| -> FpResult<_> {
                    let biz_wf = Workflow::lock(conn, &biz_wf.id)?;
                    let biz_wf = Workflow::update(biz_wf, conn, WorkflowUpdate::is_authorized())?;
                    Ok(biz_wf)
                })
                .transpose()?;

            if let Some(biz_wf) = biz_wf.as_ref() {
                let sbv = ScopedVault::get(conn, &biz_wf.scoped_vault_id)?;
                populate_business_vault(conn, &sbv.id, &obc);
                if let Some(fixture_result) = kyc_fixture_result {
                    Workflow::update_fixture_result(conn, &biz_wf.id, fixture_result).unwrap();
                }
            }

            Ok((tenant, wf, uv, su, obc.into_inner(), biz_wf))
        })
        .await
        .unwrap()
}

pub struct FixtureData {
    pub t: Tenant,
    pub wf: Workflow,
    pub v: Vault,
    pub sv: ScopedVault,
    pub obc: ObConfiguration,
    pub dr: Option<DocumentRequest>,
}

pub async fn create_kyc_user_and_wf(
    state: &State,
    obc_opts: ObConfigurationOpts,
    fixture_result: Option<WorkflowFixtureResult>,
    reuse_tenant: Option<Tenant>,
) -> FixtureData {
    let (t, wf, v, sv, obc, _) =
        create_user_and_onboarding(state, obc_opts, fixture_result, false, reuse_tenant).await;
    let wf_id = wf.id.clone();
    let dr = state
        .db_pool
        .db_query(move |conn| DocumentRequest::get(conn, &wf_id, DocumentRequestKind::Identity))
        .await
        .unwrap();
    FixtureData {
        t,
        wf,
        v,
        sv,
        obc,
        dr,
    }
}

pub async fn create_kyb_user_and_onboarding(
    state: &State,
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
        create_user_and_onboarding(state, obc_opts, fixture_result, true, None).await;

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

pub fn populate_business_vault(conn: &mut TxnPgConn, sb_id: &ScopedVaultId, obc: &ObConfiguration) {
    let Some(VerificationCheck::Kyb { ein_only }) = obc.get_verification_check(VerificationCheckKind::Kyb)
    else {
        panic!("missing kyb check in configured obc")
    };
    let mut update = vec![
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
        (
            BusinessDataKind::Tin.into(),
            PiiString::new("123456789".to_owned()),
        ),
    ];
    if !ein_only {
        vec![
            (
                BusinessDataKind::AddressLine1.into(),
                PiiString::new("1 Biz Blvd".to_owned()),
            ),
            (
                BusinessDataKind::City.into(),
                PiiString::new("Gwinsville".to_owned()),
            ),
            (BusinessDataKind::State.into(), PiiString::new("NY".to_owned())),
            (BusinessDataKind::Zip.into(), PiiString::new("12345".to_owned())),
            (BusinessDataKind::Country.into(), PiiString::new("US".to_owned())),
            (
                BusinessDataKind::AddressLine2.into(),
                PiiString::new("Apt 2".to_owned()),
            ),
        ]
        .into_iter()
        .for_each(|bdk| update.push(bdk))
    }

    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, sb_id).unwrap();
    uvw.patch_data_test(conn, update, false).unwrap();
}
