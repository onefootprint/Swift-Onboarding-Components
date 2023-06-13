use crate::ModernIdDocKind;

struct DocumentCdoInfo {
    limited_doc_types: Option<Vec<ModernIdDocKind>>,
    us_only: bool,
    require_selfie: bool,
}

impl std::fmt::Display for DocumentCdoInfo {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match (self.limited_doc_types, self.us_only, self.requires_selfie) {
            (None, false, false) => write!(f, "document"),
            (None, false, true) => write!(f, "document_and_selfie"),
            (Some(ref doc_types), us_only, requires_selfie) => {
                let us_only = if us_only { "us_only" } else { "any" };
                write!(f, "document.{}.{}.{}", doc_types, us_only, requires_selfie)
            }
        }
    }
}
