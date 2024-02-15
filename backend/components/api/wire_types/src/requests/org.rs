use newtypes::{
    input::Csv, CompanySize, TenantAppKind, TenantFrequentNoteKind, TenantRoleId, TenantRoleKindDiscriminant,
};

use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateTenantRequest {
    pub name: Option<String>,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
    pub logo_url: Option<String>,
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
pub struct GetTenantAppMetaRequest {
    pub kind: TenantAppKind,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct CreateTenantAppMetaRequest {
    pub kind: TenantAppKind,
    pub name: String,
    pub ios_app_bundle_id: Option<String>,       // Only set for iOS
    pub ios_team_id: Option<String>,             // Only set for iOS
    pub android_package_name: Option<String>,    // Only set for Android
    pub android_apk_cert_sha256: Option<String>, // Only set for Android
}
