use crate::utils::db2api::DbToApi;
use api_wire_types::Actor;
use db::models::annotation::Annotation;
use db::models::annotation::AnnotationInfo;

impl DbToApi<AnnotationInfo> for api_wire_types::Annotation {
    fn from_db((annotation, actor): AnnotationInfo) -> Self {
        let Annotation {
            id,
            timestamp,
            note,
            is_pinned,
            ..
        } = annotation;
        Self {
            id,
            timestamp,
            note,
            is_pinned,
            source: Actor::from_db(actor),
        }
    }
}
