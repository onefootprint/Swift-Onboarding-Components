mod state;
mod state_machine;
pub mod states;

use newtypes::{incode::IncodeDocumentType, IdDocKind};
pub use state_machine::*;

#[cfg(test)]
mod images;
#[cfg(test)]
mod test;

// Checks if the document type we received from incode OCR is supported in footprint
pub fn id_doc_kind_from_incode_document_type(
    doc_type: IncodeDocumentType,
) -> Result<IdDocKind, crate::decision::Error> {
    match doc_type {
        IncodeDocumentType::Passport => Ok(IdDocKind::Passport),
        IncodeDocumentType::DriversLicense => Ok(IdDocKind::DriverLicense),
        IncodeDocumentType::IdentificationCard => Ok(IdDocKind::IdCard),
        _ => Err(crate::decision::Error::IncodeDocumentTypeNotSupported(doc_type)),
    }
}
