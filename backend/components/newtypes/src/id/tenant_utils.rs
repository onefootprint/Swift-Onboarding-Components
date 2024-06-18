use crate::{
    PartnerTenantId,
    TenantId,
    TenantKind,
};
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

    pub fn is_flexcar(&self) -> bool {
        self.0 == *"org_pl9GdKAiT9Yo0107B6ZOGp"
    }

    pub fn is_avis(&self) -> bool {
        self.0 == *"org_4R4qnsfYT0c4gSNID3yrU6"
    }
}

#[derive(Debug, Clone, Copy, From, PartialEq, Eq)]
pub enum OrgIdentifierRef<'a> {
    TenantId(&'a TenantId),
    PartnerTenantId(&'a PartnerTenantId),
}

#[derive(Debug, Clone, From)]
pub enum OrgIdentifier {
    TenantId(TenantId),
    PartnerTenantId(PartnerTenantId),
}

impl<'a> From<OrgIdentifierRef<'a>> for TenantKind {
    fn from(value: OrgIdentifierRef<'a>) -> Self {
        match value {
            OrgIdentifierRef::TenantId(_) => TenantKind::Tenant,
            OrgIdentifierRef::PartnerTenantId(_) => TenantKind::PartnerTenant,
        }
    }
}

impl From<&OrgIdentifier> for TenantKind {
    fn from(value: &OrgIdentifier) -> Self {
        match *value {
            OrgIdentifier::TenantId(_) => TenantKind::Tenant,
            OrgIdentifier::PartnerTenantId(_) => TenantKind::PartnerTenant,
        }
    }
}

impl<'a> OrgIdentifierRef<'a> {
    pub fn clone_into(&self) -> OrgIdentifier {
        match *self {
            OrgIdentifierRef::TenantId(t_id) => OrgIdentifier::TenantId(t_id.clone()),
            OrgIdentifierRef::PartnerTenantId(pt_id) => OrgIdentifier::PartnerTenantId(pt_id.clone()),
        }
    }
}

impl<'a> From<&'a OrgIdentifier> for OrgIdentifierRef<'a> {
    fn from(value: &'a OrgIdentifier) -> Self {
        match value {
            OrgIdentifier::TenantId(t_id) => OrgIdentifierRef::TenantId(t_id),
            OrgIdentifier::PartnerTenantId(pt_id) => OrgIdentifierRef::PartnerTenantId(pt_id),
        }
    }
}
