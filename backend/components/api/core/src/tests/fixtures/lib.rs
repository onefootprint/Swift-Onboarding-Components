use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::tests::fixtures;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::IdentityDataKind as IDK;
use newtypes::KycState;
use newtypes::Locked;
use newtypes::OnboardingStatus;
use newtypes::PiiString;
use newtypes::TenantId;
use newtypes::VaultKind;
use newtypes::WorkflowState;
use rand::Rng;

// Start of fixtures utils for setting up common sets of data (eg: make a user + onboarding + fill
// vault) TODO: get DE and other tests to use these and continue to improve the APIs and make them
// more extensible

pub fn random_phone_number() -> String {
    let mut rng = rand::thread_rng();

    format!(
        "+1{}",
        (0..10)
            .map(|_| rng.gen_range(0..10).to_string())
            .collect::<Vec<String>>()
            .join("")
    )
}

// TODO: this is duplicative with other text fixture
pub fn create_user_and_populate_vault(
    conn: &mut TxnPgConn,
    is_live: bool,
    tenant_id: TenantId,
    portable: bool,
    idks: Vec<IDK>,
) -> (Vault, Locked<ScopedVault>) {
    let sandbox_id = (!is_live).then_some("pass".to_string());
    let (uv, su) = if portable {
        let uv = fixtures::vault::create(conn, VaultKind::Person, sandbox_id, true).into_inner();
        let uvid = uv.id.clone();
        (uv, fixtures::scoped_vault::create(conn, &uvid, &tenant_id))
    } else {
        let args = fixtures::vault::new_vault_args(VaultKind::Person, sandbox_id, false);
        let (su, uv) = fixtures::scoped_vault::create_non_portable(conn, args, &tenant_id);
        (uv, su)
    };

    let idks = idks.into_iter().map(DataIdentifier::from).collect_vec();
    let update: Vec<(DataIdentifier, PiiString)> = vec![
        (IDK::PhoneNumber.into(), PiiString::new(random_phone_number())),
        (IDK::FirstName.into(), PiiString::new("Bob".to_owned())),
        (IDK::LastName.into(), PiiString::new("Boberto".to_owned())),
        (IDK::AddressLine1.into(), PiiString::new("123 Main st".to_owned())),
        (IDK::AddressLine2.into(), PiiString::new("#7".to_owned())),
        (IDK::City.into(), PiiString::new("Elijay".to_owned())),
        (IDK::State.into(), PiiString::new("GA".to_owned())),
        (IDK::Zip.into(), PiiString::new("94123".to_owned())),
        (IDK::Country.into(), PiiString::new("US".to_owned())),
    ];
    let update = update.into_iter().filter(|i| idks.contains(&i.0)).collect();

    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.patch_data_test_str(conn, update, true).unwrap();

    (uv, su)
}

pub fn create_user_and_onboarding(
    conn: &mut TxnPgConn,
    obc_opts: ObConfigurationOpts,
    onboarding_status: OnboardingStatus,
    idks: Vec<IDK>,
) -> (Tenant, Vault, Locked<ScopedVault>, Workflow) {
    let is_live = obc_opts.is_live;
    let tenant = fixtures::tenant::create(conn);
    let (_, obc) = fixtures::ob_configuration::create_with_opts(conn, &tenant.id, obc_opts);

    let tenant_id = tenant.id.clone();
    let (uv, su) = create_user_and_populate_vault(conn, is_live, tenant_id, true, idks);

    let wf = fixtures::workflow::create(conn, &su.id, &obc.id, None);
    let wf = Workflow::lock(conn, &wf.id).unwrap();
    let (wf, _, _) = Workflow::update_status_if_valid(wf, conn, onboarding_status).unwrap();
    let wf_id = Locked::new(wf.id);
    let wf = Workflow::update_state(
        conn,
        wf_id,
        WorkflowState::Kyc(KycState::DataCollection),
        WorkflowState::Kyc(KycState::Complete),
    )
    .unwrap();

    (tenant, uv, su, wf)
}
