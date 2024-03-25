use crate::{PartnerTenantId, TenantId, TenantKind};
use derive_more::From;

impl TenantId {
    pub fn is_findigs(&self) -> bool {
        self.0 == *"org_UrS3zJj1RDg3DXv3V5HUIv"
    }

    pub fn is_composer(&self) -> bool {
        self.0 == *"org_9QPsH20xLJCvSRRvxgQtFj"
    }

    pub fn is_coba(&self) -> bool {
        self.0 == *"org_5lwSs95mU5v3gOU9xdSaml"
    }

    pub fn is_fractional(&self) -> bool {
        self.0 == *"org_PtnIJT4VR35BS9xy0wITgF"
    }

    pub fn is_apiture(&self) -> bool {
        self.0 == *"org_VWhEJ36DGxIgTSl8CFJOhR"
    }

    pub fn is_coast(&self) -> bool {
        self.0 == *"org_vZfj1sekMjwGdURGCWisF"
    }
}

#[derive(Debug, Clone, Copy, From)]
pub enum TenantOrPartnerTenantIdRef<'a> {
    TenantId(&'a TenantId),
    PartnerTenantId(&'a PartnerTenantId),
}

#[derive(Debug, Clone, From)]
pub enum TenantOrPartnerTenantId {
    TenantId(TenantId),
    PartnerTenantId(PartnerTenantId),
}

impl<'a> From<TenantOrPartnerTenantIdRef<'a>> for TenantKind {
    fn from(value: TenantOrPartnerTenantIdRef<'a>) -> Self {
        match value {
            TenantOrPartnerTenantIdRef::TenantId(_) => TenantKind::Tenant,
            TenantOrPartnerTenantIdRef::PartnerTenantId(_) => TenantKind::PartnerTenant,
        }
    }
}

impl<'a> TenantOrPartnerTenantIdRef<'a> {
    pub fn clone_into(&self) -> TenantOrPartnerTenantId {
        match *self {
            TenantOrPartnerTenantIdRef::TenantId(t_id) => TenantOrPartnerTenantId::TenantId(t_id.clone()),
            TenantOrPartnerTenantIdRef::PartnerTenantId(pt_id) => {
                TenantOrPartnerTenantId::PartnerTenantId(pt_id.clone())
            }
        }
    }
}

impl<'a> From<&'a TenantOrPartnerTenantId> for TenantOrPartnerTenantIdRef<'a> {
    fn from(value: &'a TenantOrPartnerTenantId) -> Self {
        match value {
            TenantOrPartnerTenantId::TenantId(t_id) => TenantOrPartnerTenantIdRef::TenantId(t_id),
            TenantOrPartnerTenantId::PartnerTenantId(pt_id) => {
                TenantOrPartnerTenantIdRef::PartnerTenantId(pt_id)
            }
        }
    }
}
