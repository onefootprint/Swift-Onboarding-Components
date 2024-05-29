use crate::*;
use newtypes::{
    ListAlias,
    ListKind,
    PiiString,
};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateListRequest {
    pub name: String,
    pub alias: ListAlias,
    pub kind: ListKind,
    pub entries: Option<Vec<PiiString>>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateListEntryRequest {
    pub entries: Vec<PiiString>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateListRequest {
    pub name: String,
    pub alias: ListAlias,
}
