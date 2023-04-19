pub mod detail;
pub mod list;

type EntityDetailResponse = api_wire_types::Entity;
type EntityListResponse = Vec<EntityDetailResponse>;
