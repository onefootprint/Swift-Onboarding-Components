pub mod detail;
pub mod search;

type EntityDetailResponse = api_wire_types::Entity;
type EntityListResponse = Vec<EntityDetailResponse>;
