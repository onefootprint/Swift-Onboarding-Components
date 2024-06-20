use crate::models::tenant::NewTenant;
use crate::models::tenant::Tenant;
use crate::TxnPgConn;
use chrono::Utc;
use newtypes::AppClipExperienceId;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::TenantId;
use newtypes::VaultPublicKey;

pub fn create(conn: &mut TxnPgConn) -> Tenant {
    let new_tenant = NewTenant {
        name: "Test tenant".to_owned(),
        public_key: VaultPublicKey::unvalidated(vec![]),
        e_private_key: EncryptedVaultPrivateKey(vec![]),
        workos_id: None,
        logo_url: None,
        sandbox_restricted: false,
        is_demo_tenant: false,
        is_prod_ob_config_restricted: false,
        is_prod_kyb_playbook_restricted: false,
        is_prod_auth_playbook_restricted: true,
        domains: vec!["Test domain".to_owned()],
        allow_domain_access: false,
        super_tenant_id: None,
    };
    Tenant::create(conn, new_tenant).expect("Couldn't create tenant")
}

pub fn create_with_keys(
    conn: &mut TxnPgConn,
    public_key: VaultPublicKey,
    e_private_key: EncryptedVaultPrivateKey,
) -> Tenant {
    let new_tenant = NewTenant {
        name: "Test tenant".to_owned(),
        public_key,
        e_private_key,
        workos_id: None,
        logo_url: None,
        sandbox_restricted: false,
        is_demo_tenant: false,
        is_prod_ob_config_restricted: false,
        is_prod_kyb_playbook_restricted: false,
        is_prod_auth_playbook_restricted: true,
        domains: vec!["Test domain".to_owned()],
        allow_domain_access: false,
        super_tenant_id: None,
    };

    Tenant::create(conn, new_tenant).expect("Couldn't create tenant")
}

pub fn create_in_memory(public_key: VaultPublicKey, e_private_key: EncryptedVaultPrivateKey) -> Tenant {
    Tenant {
        name: "Test tenant".to_owned(),
        public_key,
        e_private_key,
        workos_id: None,
        logo_url: None,
        sandbox_restricted: false,
        id: TenantId::from("t".to_string()),
        _created_at: Utc::now(),
        _updated_at: Utc::now(),
        website_url: None,
        company_size: None,
        privacy_policy_url: None,
        stripe_customer_id: None,
        is_demo_tenant: false,
        pinned_api_version: None,
        is_prod_ob_config_restricted: false,
        is_prod_kyb_playbook_restricted: false,
        is_prod_auth_playbook_restricted: false,
        allow_domain_access: false,
        supported_auth_methods: None,
        app_clip_experience_id: AppClipExperienceId::test_data("test".into()),
        domains: vec![],
        allowed_preview_apis: vec![],
        support_email: Default::default(),
        support_phone: Default::default(),
        support_website: Default::default(),
        super_tenant_id: None,
    }
}
