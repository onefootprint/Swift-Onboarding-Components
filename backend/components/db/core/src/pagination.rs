#[derive(Debug)]
pub struct OffsetPagination {
    page: Option<usize>,
    page_size: usize,
}

pub type NextPage = Option<usize>;

pub type OffsetPaginatedResult<T> = (Vec<T>, NextPage);

impl OffsetPagination {
    pub fn new(page: Option<usize>, page_size: usize) -> Self {
        Self { page, page_size }
    }

    pub fn page(page_size: usize) -> Self {
        Self::new(None, page_size)
    }

    /// Constructs the value to pass to the SQL offset clause.
    /// If a page is requested, skip the first N pages of results
    pub fn offset(&self) -> Option<i64> {
        self.page.map(|page| (self.page_size * page) as i64)
    }

    /// Constructs the value to pass to the SQL limit clause.
    /// Always fetch one more than the page size in order to determine if there is an extra page
    pub fn limit(&self) -> i64 {
        (self.page_size + 1) as i64
    }

    /// Truncate the results to the requested page size and return the next page, if any
    pub fn results<T>(&self, results: Vec<T>) -> OffsetPaginatedResult<T> {
        let has_next_page = results.len() > self.page_size;
        let next_page = has_next_page.then_some(self.page.unwrap_or_default() + 1);
        let results = results.into_iter().take(self.page_size).collect();
        (results, next_page)
    }
}


pub struct CursorPagination<TCursor> {
    pub cursor: Option<TCursor>,
    page_size: usize,
}

pub type CursorPaginatedResult<T, TCursor> = (Vec<T>, Option<TCursor>);

impl<TCursor> CursorPagination<TCursor> {
    pub fn new(cursor: Option<TCursor>, page_size: usize) -> Self {
        Self { cursor, page_size }
    }

    pub fn page(page_size: usize) -> Self {
        Self::new(None, page_size)
    }

    /// Constructs the value to pass to the SQL limit clause.
    /// Always fetch one more than the page size in order to determine if there is an extra page
    pub fn limit(&self) -> i64 {
        (self.page_size + 1) as i64
    }

    /// Truncate the results to the requested page size and return the cursor for the next page, if
    /// any
    pub fn results<T>(&self, results: Vec<T>) -> CursorPaginatedResult<T, TCursor>
    where
        T: ComputeCursor<TCursor>,
    {
        let next_cursor = results.get(self.page_size).map(|item| item.compute_cursor());
        let results = results.into_iter().take(self.page_size).collect();
        (results, next_cursor)
    }
}

pub trait ComputeCursor<T> {
    fn compute_cursor(&self) -> T;
}
