use super::{
    Error,
    VResult,
};
use crate::{
    AllData,
    CleanAndValidate,
    DataIdentifierValue,
    DocumentDiKind,
    NtResult,
    PiiJsonValue,
    PiiString,
    PiiValueKind,
    ValidateArgs,
};

impl CleanAndValidate for DocumentDiKind {
    type Parsed = ();

    fn clean_and_validate(
        self,
        value: PiiJsonValue,
        _: ValidateArgs,
        _: &AllData,
    ) -> NtResult<DataIdentifierValue<Self::Parsed>> {
        match self {
            DocumentDiKind::Barcodes(_, _) => Ok(validate_barcodes(self, value)?),
            DocumentDiKind::OcrData(_, odk) => {
                if odk.is_json() {
                    Ok(DataIdentifierValue {
                        di: self.into(),
                        value: value.to_piistring()?,
                        parsed: (),
                    })
                } else {
                    Ok(DataIdentifierValue {
                        di: self.into(),
                        value: value.as_string()?,
                        parsed: (),
                    })
                }
            }
            DocumentDiKind::Image(_, _)
            | DocumentDiKind::MimeType(_, _)
            | DocumentDiKind::LatestUpload(_, _)
            | DocumentDiKind::FinraComplianceLetter
            | DocumentDiKind::SsnCard
            | DocumentDiKind::ProofOfAddress
            | DocumentDiKind::Custom(_) => Ok(DataIdentifierValue {
                di: self.into(),
                value: value.as_string()?,
                parsed: (),
            }),
        }
    }
}

fn validate_barcodes(doc_kind: DocumentDiKind, value: PiiJsonValue) -> VResult<DataIdentifierValue<()>> {
    let value_kind = PiiValueKind::from(&value);
    if value_kind != PiiValueKind::Array {
        return Err(Error::IncorrectDataType(PiiValueKind::Array, value_kind));
    };

    // Make sure it obeys the barcode spec
    serde_json::from_value::<Vec<DocumentBarcode>>(value.leak().clone())?;

    let value = value.to_piistring()?;
    Ok(DataIdentifierValue {
        di: doc_kind.into(),
        value,
        parsed: (),
    })
}

#[derive(Debug, serde::Deserialize)]
pub struct DocumentBarcode {
    /// Kind of barcode, like PDF 417
    pub kind: String,
    pub content: PiiString,
}
