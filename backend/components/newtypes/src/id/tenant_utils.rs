use crate::PartnerTenantId;
use crate::TenantId;
use crate::TenantKind;
use derive_more::From;

impl TenantId {
    pub const APITURE: &'static str = "org_VWhEJ36DGxIgTSl8CFJOhR";
    pub const ARYEO: &'static str = "org_6CTPv02MXFKKWjB6wc5zHg";
    pub const BASIC_CAPITAL: &'static str = "org_hfT6m85IKbPHDFVOcybEmF";
    pub const BLOOM: &'static str = "org_xpRKH6lk73aZxuJbsGkUaJ";
    pub const COAST: &'static str = "org_vZfj1sekMjwGdURGCWisF";
    pub const COBA: &'static str = "org_5lwSs95mU5v3gOU9xdSaml";
    pub const COMPOSER: &'static str = "org_9QPsH20xLJCvSRRvxgQtFj";
    pub const FINDIGS: &'static str = "org_UrS3zJj1RDg3DXv3V5HUIv";
    pub const FLEXCAR: &'static str = "org_pl9GdKAiT9Yo0107B6ZOGp";
    pub const FOOTPRINT_LIVE: &'static str = "org_e2FHVfOM5Hd3Ce492o5Aat";
    pub const FRACTIONAL: &'static str = "org_PtnIJT4VR35BS9xy0wITgF";
    pub const GRID: &'static str = "org_AiK8peOw9mrqsb6yeHWEG8";
    pub const TRIUMPH: &'static str = "org_hWdmCvlFkzckWRls6motLm";
    pub const WINGSPAN: &'static str = "org_HfhfuQan6A6EXIYuFDwyNZ";

    pub fn is_findigs(&self) -> bool {
        self.0 == Self::FINDIGS
    }

    pub fn is_composer(&self) -> bool {
        self.0 == Self::COMPOSER
    }

    pub fn is_coba(&self) -> bool {
        self.0 == Self::COBA
    }

    pub fn is_fractional(&self) -> bool {
        self.0 == Self::FRACTIONAL
    }

    pub fn is_apiture(&self) -> bool {
        self.0 == Self::APITURE
    }

    pub fn is_coast(&self) -> bool {
        self.0 == Self::COAST
    }

    pub fn is_flexcar(&self) -> bool {
        self.0 == Self::FLEXCAR
    }

    pub fn is_basic_capital(&self) -> bool {
        self.0 == Self::BASIC_CAPITAL
    }

    pub fn is_grid(&self) -> bool {
        self.0 == Self::GRID
    }

    pub fn is_wingspan(&self) -> bool {
        self.0 == Self::WINGSPAN
    }

    pub fn is_footprint_live(&self) -> bool {
        self.0 == Self::FOOTPRINT_LIVE
    }

    pub fn is_triumph(&self) -> bool {
        self.0 == Self::TRIUMPH
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
