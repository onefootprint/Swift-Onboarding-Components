use crate::decision::rule_engine;
use crate::tests::fixtures::lib::random_phone_number;
use crate::utils::onboarding::get_or_create_user_workflow;
use crate::utils::onboarding::CommonWfArgs;
use crate::utils::onboarding::CreateUserWfArgs;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use db::models::contact_info::ContactInfo;
use db::models::data_lifetime::DataLifetime;
use db::models::document_request::DocumentRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::PrivateUpdateTenant;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::models::workflow::OnboardingWorkflowArgs;
use db::models::workflow::Workflow;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::tests::fixtures::{
    self,
};
use db::TxnPgConn;
use newtypes::BusinessDataKind;
use newtypes::DataIdentifier;
use newtypes::DocumentRequestKind;
use newtypes::IdentityDataKind;
use newtypes::Locked;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::PreviewApi;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
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
    Playbook,
    ObConfiguration,
    Option<Workflow>, // Business workflow
) {
    let (pk, tenant_e_key) = state.enclave_client.generate_sealed_keypair().await.unwrap();
    state
        .db_transaction(move |conn| {
            let tenant = if let Some(t) = reuse_tenant {
                t
            } else {
                fixtures::tenant::create_with_keys(conn, pk, tenant_e_key)
            };
            let update = PrivateUpdateTenant {
                allowed_preview_apis: Some(vec![PreviewApi::LegacyOnboardingStatusWebhook]),
                ..Default::default()
            };
            let tenant = Tenant::private_update(conn, &tenant.id, update)?;
            let (playbook, obc) = fixtures::ob_configuration::create_with_opts(conn, &tenant.id, obc_opts);
            // TODO: need to rework our test utils so they use the same codepaths as our application logic to
            // create things like OBC's and such
            rule_engine::default_rules::save_default_rules_for_obc(conn, &playbook, &obc.id).unwrap();

            let (uv, su) = create_user_and_populate_vault(conn, &tenant.id, kyc_fixture_result);
            let su = su.into_inner();

            let common_args = CommonWfArgs {
                playbook: &playbook,
                obc: &obc,
                insight_event: Some(CreateInsightEvent { ..Default::default() }),
                source: WorkflowSource::Hosted,
                wfr: None,
                force_create: false,
                su: &su,
            };
            let args = CreateUserWfArgs {
                existing_wf_id: None,
                seqno: DataLifetime::get_current_seqno(conn)?,
                fixture_result: kyc_fixture_result,
                actor: None,
                maybe_prefill_data: None,
                is_neuro_enabled: false,
            };
            let (wf, _) = get_or_create_user_workflow(conn, common_args.clone(), args)?;

            // Make sure the workflow is authorized since it would be authorized in prod by the time it's
            // used here
            assert!(wf.authorized_at.is_some());

            let biz_wf = if create_business {
                let sandbox_id = uv.sandbox_id.as_ref().map(|id| id.to_string());
                let bv = fixtures::vault::create(conn, VaultKind::Business, sandbox_id, true);
                let sb = fixtures::scoped_vault::create(conn, &bv.id, &tenant.id).into_inner();
                let ob_create_args = OnboardingWorkflowArgs {
                    scoped_vault_id: sb.id.clone(),
                    ob_configuration_id: obc.id.clone(),
                    authorized: true,
                    insight_event: None,
                    source: WorkflowSource::Hosted,
                    fixture_result: kyc_fixture_result,
                    is_one_click: false,
                    wfr_config: None,
                    is_neuro_enabled: false,
                };
                let (biz_wf, _) = Workflow::get_or_create_onboarding(conn, ob_create_args, false)?;
                assert!(biz_wf.authorized_at.is_some());
                populate_business_vault(conn, &sb.id, &obc);
                Some(biz_wf)
            } else {
                None
            };

            Ok((tenant, wf, uv, su, playbook.into_inner(), obc, biz_wf))
        })
        .await
        .unwrap()
}

pub struct FixtureData {
    pub t: Tenant,
    pub wf: Workflow,
    pub v: Vault,
    pub sv: ScopedVault,
    pub playbook: Playbook,
    pub obc: ObConfiguration,
    pub dr: Option<DocumentRequest>,
}

pub async fn create_kyc_user_and_wf(
    state: &State,
    obc_opts: ObConfigurationOpts,
    fixture_result: Option<WorkflowFixtureResult>,
    reuse_tenant: Option<Tenant>,
) -> FixtureData {
    let (t, wf, v, sv, playbook, obc, _) =
        create_user_and_onboarding(state, obc_opts, fixture_result, false, reuse_tenant).await;
    let wf_id = wf.id.clone();
    let dr = state
        .db_query(move |conn| DocumentRequest::get(conn, &wf_id, DocumentRequestKind::Identity))
        .await
        .unwrap();
    FixtureData {
        t,
        wf,
        v,
        sv,
        playbook,
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
    Playbook,
    ObConfiguration,
    Workflow, // Business workflow
) {
    let (t, wf, v, sv, playbook, obc, biz_wf) =
        create_user_and_onboarding(state, obc_opts, fixture_result, true, None).await;

    (t, wf, v, sv, playbook, obc, biz_wf.unwrap())
}

pub fn create_user_and_populate_vault(
    conn: &mut TxnPgConn,
    tenant_id: &TenantId,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (Vault, Locked<ScopedVault>) {
    let sandbox_id = fixture_result.map(|f| format!("{}_sandbox", f.as_ref()));
    let uv = fixtures::vault::create(conn, VaultKind::Person, sandbox_id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, tenant_id);

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
    let new_ci = uvw.patch_data_test_str(conn, update, false).unwrap();
    let (_, ci) = new_ci
        .into_iter()
        .find(|(di, _)| di == &DataIdentifier::from(IdentityDataKind::PhoneNumber))
        .unwrap();
    ContactInfo::mark_otp_verified(conn, &ci.id).unwrap();

    (uv.into_inner(), su)
}

pub fn populate_business_vault(conn: &mut TxnPgConn, sb_id: &ScopedVaultId, obc: &ObConfiguration) {
    let Some(VerificationCheck::Kyb { ein_only }) = obc.verification_checks().get(VerificationCheckKind::Kyb)
    else {
        panic!("missing kyb check in configured obc")
    };
    let mut update = vec![
        (
            BusinessDataKind::Name.into(),
            PiiJsonValue::new_string("Waffle House".to_owned()),
        ),
        (
            BusinessDataKind::Dba.into(),
            PiiJsonValue::new_string("Waho".to_owned()),
        ),
        (
            BusinessDataKind::Tin.into(),
            PiiJsonValue::new_string("123456789".to_owned()),
        ),
    ];
    if !ein_only {
        vec![
            (
                BusinessDataKind::AddressLine1.into(),
                PiiJsonValue::new_string("1 Biz Blvd".to_owned()),
            ),
            (
                BusinessDataKind::City.into(),
                PiiJsonValue::new_string("Gwinsville".to_owned()),
            ),
            (
                BusinessDataKind::State.into(),
                PiiJsonValue::new_string("NY".to_owned()),
            ),
            (
                BusinessDataKind::Zip.into(),
                PiiJsonValue::new_string("12345".to_owned()),
            ),
            (
                BusinessDataKind::Country.into(),
                PiiJsonValue::new_string("US".to_owned()),
            ),
            (
                BusinessDataKind::AddressLine2.into(),
                PiiJsonValue::new_string("Apt 2".to_owned()),
            ),
        ]
        .into_iter()
        .for_each(|bdk| update.push(bdk))
    }

    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, sb_id).unwrap();
    uvw.patch_data_test(conn, update, false).unwrap();
}
