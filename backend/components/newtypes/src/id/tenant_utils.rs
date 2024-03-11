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
pub enum TenantOrPartnerTenantId<'a> {
    TenantId(&'a TenantId),
    PartnerTenantId(&'a PartnerTenantId),
}

impl<'a> From<TenantOrPartnerTenantId<'a>> for TenantKind {
    fn from(value: TenantOrPartnerTenantId<'a>) -> Self {
        match value {
            TenantOrPartnerTenantId::TenantId(_) => TenantKind::Tenant,
            TenantOrPartnerTenantId::PartnerTenantId(_) => TenantKind::PartnerTenant,
        }
    }
}
