use crate::ProxyConfigId;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use strum::EnumDiscriminants;

#[derive(Debug, Clone, Eq, PartialEq, Hash, Serialize, Deserialize, EnumDiscriminants, Apiv2Schema)]
#[strum_discriminants(name(InvokeVaultProxyPermissionKind), derive(strum_macros::Display))]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum InvokeVaultProxyPermission {
    Any,
    JustInTime,
    Id { id: ProxyConfigId },
}

impl std::fmt::Display for InvokeVaultProxyPermission {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let discriminant = InvokeVaultProxyPermissionKind::from(self);
        write!(f, "{}", discriminant)
    }
}
