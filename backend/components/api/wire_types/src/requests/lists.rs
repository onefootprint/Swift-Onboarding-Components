use crate::*;
use newtypes::{ListAlias, ListKind, PiiString};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateListRequest {
    pub name: String,
    pub alias: ListAlias,
    pub kind: ListKind,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateListEntryRequest {
    pub data: PiiString
}

