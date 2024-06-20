use crate::*;
use newtypes::email::Email;
use newtypes::input::Csv;
use newtypes::CompanySize;
use newtypes::TenantFrequentNoteKind;
use newtypes::TenantRoleId;
use newtypes::TenantRoleKindDiscriminant;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateTenantRequest {
    pub name: Option<String>,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
    pub privacy_policy_url: Option<String>,
    pub allow_domain_access: Option<bool>,
    pub support_email: Option<String>,
    pub support_phone: Option<String>,
    pub support_website: Option<String>,
    /// Used to set support_email to null
    pub clear_support_email: Option<bool>,
    /// Used to set support_phone to null
    pub clear_support_phone: Option<bool>,
    /// Used to set support_website to null
    pub clear_support_website: Option<bool>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct OrgMemberFilters {
    pub role_ids: Option<Csv<TenantRoleId>>,
    pub search: Option<String>,
    pub is_invite_pending: Option<bool>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct OrgRoleFilters {
    pub search: Option<String>,
    pub kind: Option<TenantRoleKindDiscriminant>,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct GetOrgFrequentNotes {
    pub kind: TenantFrequentNoteKind,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct CreateOrgFrequentNoteRequest {
    pub kind: TenantFrequentNoteKind,
    pub content: String,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct CreateTenantAndroidAppMetaRequest {
    pub package_names: Vec<String>,
    pub apk_cert_sha256s: Vec<String>,
    pub integrity_verification_key: String,
    pub integrity_decryption_key: String,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct UpdateTenantAndroidAppMetaRequest {
    pub package_names: Option<Vec<String>>,
    pub apk_cert_sha256s: Option<Vec<String>>,
    pub integrity_verification_key: Option<String>,
    pub integrity_decryption_key: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct CreateTenantIosAppMetaRequest {
    pub team_id: String,
    pub app_bundle_ids: Vec<String>,
    pub device_check_key_id: String,
    pub device_check_private_key: String,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct UpdateTenantIosAppMetaRequest {
    pub team_id: Option<String>,
    pub app_bundle_ids: Option<Vec<String>>,
    pub device_check_key_id: Option<String>,
    pub device_check_private_key: Option<String>,
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
pub struct CreateTenantUserRequest {
    pub email: Email,
    pub role_id: TenantRoleId,
    pub redirect_url: String, // The URL to the dashboard where the invite login link should be sent
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    #[serde(default)]
    /// A feature only used by employees to allow inviting users to a tenant without sending them an
    /// email
    pub omit_email_invite: bool,
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
pub struct UpdateTenantRolebindingRequest {
    pub role_id: Option<TenantRoleId>,
}
