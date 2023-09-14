use crate::TenantId;

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
}
