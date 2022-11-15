use db::models::annotation::Annotation;

use crate::utils::db2api::DbToApi;

impl DbToApi<Annotation> for api_wire_types::Annotation {
    fn from_db(t: Annotation) -> Self {
        let Annotation {
            id,
            timestamp,
            note,
            is_pinned,
            ..
        } = t;
        Self {
            id,
            timestamp,
            note,
            is_pinned,
        }
    }
}
