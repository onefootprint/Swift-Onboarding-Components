use crate::TenantKind;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use strum_macros::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumDiscriminants;
use strum_macros::EnumString;

#[derive(Debug, Clone, Copy, PartialEq, Eq, EnumDiscriminants)]
#[strum_discriminants(derive(
    Display,
    serde_with::SerializeDisplay,
    serde_with::DeserializeFromStr,
    AsRefStr,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    macros::SerdeAttr,
))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(name(TenantRoleKindDiscriminant))]
#[strum_discriminants(serde(rename_all = "snake_case"))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[strum_discriminants(diesel(sql_type = Text))]
pub enum TenantRoleKind {
    ApiKey { is_live: bool },
    DashboardUser,
    CompliancePartnerDashboardUser,
}

impl TenantRoleKind {
    pub fn is_live(&self) -> Option<bool> {
        if let TenantRoleKind::ApiKey { is_live } = &self {
            Some(*is_live)
        } else {
            None
        }
    }
}

impl TenantRoleKindDiscriminant {
    /// The kind of tenant that can hold this role kind.
    pub fn tenant_kind(&self) -> TenantKind {
        match &self {
            TenantRoleKindDiscriminant::ApiKey | TenantRoleKindDiscriminant::DashboardUser => {
                TenantKind::Tenant
            }
            TenantRoleKindDiscriminant::CompliancePartnerDashboardUser => TenantKind::PartnerTenant,
        }
    }
}

crate::util::impl_enum_str_diesel!(TenantRoleKindDiscriminant);
