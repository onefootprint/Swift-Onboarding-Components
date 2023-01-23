use crate::State;
use paperclip::actix::{web, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct EmptyRequest {}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
/// Contains all of the fields that are passed in the querystring for a cursor-paginated request.
/// Cursor pagination requests take in a cursor that identifies the start of the page (and is
/// delivered by the last pagination request) using an ordered field.
/// This is more performant, but doesn't give any insight into how far you have paginated through
/// the results and requires the cursor field to have a _total_ ordering (partial does not work).
/// But, results stay consistent as new results are added to earlier pages.
/// Can be used alongside another actix web::Query extractor
pub struct CursorPaginationRequest<C> {
    pub cursor: Option<C>,
    pub page_size: Option<usize>,
}

impl<C> CursorPaginationRequest<C> {
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
/// Contains all of the fields that are passed in the querystring for an offset-paginated request.
/// Offset pagination requests take in a page number and page size and use postgres's OFFSET
/// in order to fetch the requested page.
/// This is less performant but simpler. Postgres iterates through all results matching a query and
/// skips the results that appear on the first N pages. This allows rendering the total number of
/// pages and jumping to a specific page. But, results on the Nth page are not stable.
/// Can be used alongside another actix web::Query extractor
pub struct OffsetPaginationRequest {
    pub page: Option<usize>,
    pub page_size: Option<usize>,
}

impl OffsetPaginationRequest {
    pub fn page_size(&self, state: &web::Data<State>) -> usize {
        if let Some(page_size) = self.page_size {
            page_size
        } else {
            state.config.default_page_size
        }
    }

    pub fn next_page(&self, state: &web::Data<State>, num_results: usize) -> Option<usize> {
        if num_results > self.page_size(state) {
            Some(self.page.unwrap_or_default() + 1)
        } else {
            None
        }
    }
}
