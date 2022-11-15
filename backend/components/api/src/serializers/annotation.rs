use api_wire_types::Actor;
use db::models::annotation::{Annotation, AnnotationInfo};

use crate::utils::db2api::DbToApi;

impl DbToApi<AnnotationInfo> for api_wire_types::Annotation {
    fn from_db((annotation, tenant_user): AnnotationInfo) -> Self {
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
            source: Actor::from_db(tenant_user),
        }
    }
}
