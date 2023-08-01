use crate::utils::vault_wrapper::{Any, VaultWrapper};
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::{Onboarding, OnboardingUpdate};
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::tests::fixtures;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::{DataIdentifier, IdentityDataKind as IDK, OnboardingStatus, PiiString};
use newtypes::{TenantId, VaultKind};
use rand::Rng;

// Start of fixtures utils for setting up common sets of data (eg: make a user + onboarding + fill vault)
// TODO: get DE and other tests to use these and continue to improve the APIs and make them more extensible

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
    ob_config: Option<ObConfiguration>,
    idks: Vec<IDK>,
) -> (Vault, ScopedVault) {
    let sandbox_id = (!is_live).then_some("#pass".to_string());
    let (uv, su) = if let Some(ob_config) = ob_config {
        let uv = fixtures::vault::create(conn, VaultKind::Person, sandbox_id, true).into_inner();
        let uvid = uv.id.clone();
        (uv, fixtures::scoped_vault::create(conn, &uvid, &ob_config.id))
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
    uvw.patch_data_test(conn, update, true).unwrap();

    (uv, su)
}

pub fn create_user_and_onboarding(
    conn: &mut TxnPgConn,
    is_live: bool,
    onboarding_status: OnboardingStatus,
    idks: Vec<IDK>,
) -> (Tenant, Onboarding, Vault, ScopedVault, Workflow) {
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, is_live);
    let ob_config_id = ob_config.id.clone();

    let tenant_id = tenant.id.clone();
    let (uv, su) = create_user_and_populate_vault(conn, is_live, tenant_id, Some(ob_config), idks);

    let suid = su.id.clone();
    let onboarding = fixtures::onboarding::create(conn, suid, ob_config_id, None);
    let ob = Onboarding::lock(conn, &onboarding.id).unwrap();
    let onboarding = Onboarding::update(
        ob,
        conn,
        OnboardingUpdate {
            status: Some(onboarding_status),
            ..Default::default()
        },
    )
    .unwrap();
    let wf = Workflow::get(conn, onboarding.workflow_id.as_ref().unwrap()).unwrap();

    (tenant, onboarding, uv, su, wf)
}
