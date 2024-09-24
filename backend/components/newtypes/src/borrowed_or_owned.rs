#[derive(Debug, derive_more::From)]
/// BorrowedOrOwned is like a std::borrow::Cow, but it doesn't require the type to be Clone.
pub enum BorrowedOrOwned<'a, T> {
    Borrowed(&'a T),
    Owned(T),
}

impl<'a, T> AsRef<T> for BorrowedOrOwned<'a, T> {
    fn as_ref(&self) -> &T {
        match self {
            BorrowedOrOwned::Borrowed(t) => t,
            BorrowedOrOwned::Owned(t) => t,
        }
    }
}
