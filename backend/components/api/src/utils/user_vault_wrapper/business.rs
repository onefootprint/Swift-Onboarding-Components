use super::{Business, UserVaultWrapper};
use newtypes::{BusinessDataKind, SealedVaultBytes};

impl UserVaultWrapper<Business> {
    pub fn get_business_data_e_field(&self, kind: BusinessDataKind) -> Option<&SealedVaultBytes> {
        self.speculative
            .get_business_data_e_field(kind)
            .or_else(|| self.portable.get_business_data_e_field(kind))
    }
}
