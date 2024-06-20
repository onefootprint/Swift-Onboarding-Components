use newtypes::TenantRoleKindDiscriminant;
use newtypes::TenantScope;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
pub struct CreateTenantRoleRequest {
    pub name: String,
    pub scopes: Vec<TenantScope>,
    pub kind: TenantRoleKindDiscriminant,
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
pub struct UpdateTenantRoleRequest {
    pub name: Option<String>,
    pub scopes: Option<Vec<TenantScope>>,
}
