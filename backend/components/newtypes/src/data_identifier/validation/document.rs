use super::{Error, VResult};
use crate::{
    AllData, DataIdentifier, DocumentKind, NtResult, PiiJsonValue, PiiString, PiiValueKind, Validate,
    ValidateArgs,
};

impl Validate for DocumentKind {
    fn validate(
        self,
        value: PiiJsonValue,
        _: ValidateArgs,
        _: &AllData,
    ) -> NtResult<Vec<(DataIdentifier, PiiString)>> {
        if matches!(self, DocumentKind::Barcodes(_, _)) {
            let result = validate_barcodes(self, value)?;
            Ok(result)
        } else if let DocumentKind::OcrData(_, odk) = self {
            if odk.is_json() {
                Ok(vec![(self.into(), value.to_piistring()?)])
            } else {
                Ok(vec![(self.into(), value.as_string()?)])
            }
        } else {
            Ok(vec![(self.into(), value.as_string()?)])
        }
    }
}

fn validate_barcodes(di: DocumentKind, value: PiiJsonValue) -> VResult<Vec<(DataIdentifier, PiiString)>> {
    let value_kind = PiiValueKind::from(&value);
    if value_kind != PiiValueKind::Array {
        return Err(Error::IncorrectDataType(PiiValueKind::Array, value_kind));
    };
    // Make sure it obeys the barcode spec
    let barcodes = serde_json::from_value::<Vec<DocumentBarcode>>(value.leak().clone())?;
    if barcodes.is_empty() {
        return Ok(vec![]);
    }
    let value = value.to_piistring()?;
    Ok(vec![(di.into(), value)])
}

#[derive(Debug, serde::Deserialize)]
pub struct DocumentBarcode {
    /// Kind of barcode, like PDF 417
    pub kind: String,
    pub content: PiiString,
}
