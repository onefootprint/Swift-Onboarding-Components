use super::TenantVw;
use newtypes::DataIdentifier;

impl<Type> TenantVw<Type> {
    /// Retrieve the fields that the tenant is allowed to see exist.
    ///
    /// NOTE: This is different from whether the tenant can decrypt the data
    pub fn get_visible_populated_fields(&self) -> Vec<DataIdentifier> {
        // Right now, this is a simple shim method, but we might change this logic in the future
        // so it helps to group callsites
        // TODO do we want to filter out portable data added by other tenants that isn't requested
        // by the ob config?
        // For ex, if another tenant adds a portable credit card, should this tenant be able to see it?
        self.populated_dis()
    }
}
