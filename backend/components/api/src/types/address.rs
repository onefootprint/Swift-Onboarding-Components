use chrono::{DateTime, Utc};
use db::models::address::Address;
use newtypes::{AddressId, SealedVaultBytes};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiAddress<D> {
    pub id: AddressId,
    pub line1: D,
    pub line2: D,
    pub city: D,
    pub state: D,
    pub zip: D,
    pub country: D,
    pub deactivated_at: Option<DateTime<Utc>>,
}

impl<D> ApiAddress<D> {
    pub fn serialize<F>(s: Address, transform_fn: F) -> Self
    where
        F: Fn(Option<SealedVaultBytes>) -> D,
    {
        let Address {
            id, deactivated_at, ..
        } = s;
        Self {
            id,
            line1: transform_fn(s.e_line1),
            line2: transform_fn(s.e_line2),
            city: transform_fn(s.e_city),
            state: transform_fn(s.e_state),
            zip: transform_fn(s.e_zip),
            country: transform_fn(s.e_country),
            deactivated_at,
        }
    }
}
