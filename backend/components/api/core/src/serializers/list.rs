use crate::utils::db2api::DbToApi;
use db::models::list::List;

impl DbToApi<List> for api_wire_types::List {
    fn from_db(list: List) -> Self {
        let List {
            id,
            created_at,
            actor,
            name,
            alias,
            kind,
            ..
        } = list;

        Self {
            id,
            name,
            alias,
            kind,
            created_at,
            actor,
        }
    }
}
