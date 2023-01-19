use paperclip::actix::{web, Apiv2Schema};

use crate::State;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct EmptyRequest {}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct PaginationRequest<C> {
    pub cursor: Option<C>,
    pub page_size: Option<usize>,
}

impl<C> PaginationRequest<C> {
    pub fn page_size(&self, state: &web::Data<State>) -> usize {
        if let Some(page_size) = self.page_size {
            page_size
        } else {
            state.config.default_page_size
        }
    }

    pub fn cursor_item<'a, U>(&self, state: &web::Data<State>, values: &'a [U]) -> Option<&'a U> {
        if values.len() > self.page_size(state) {
            values.last()
        } else {
            None
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct PaginatedRequest<T, C> {
    #[serde(flatten)]
    data: T,
    #[serde(flatten)]
    pagination: PaginationRequest<C>,
}

impl<T, C> PaginatedRequest<T, C> {
    pub fn into_inner(self) -> (T, PaginationRequest<C>) {
        (self.data, self.pagination)
    }
}

impl<T, C> std::ops::Deref for PaginatedRequest<T, C> {
    type Target = PaginationRequest<C>;

    fn deref(&self) -> &Self::Target {
        &self.pagination
    }
}
