use std::rc::Rc;

/// A struct is !Sync/!Send if any of the fields are !Sync/!Send. Embed NotSyncMarker inside a
/// struct to make that struct !Sync and !Send.
/// This works because Rc is not Send/Sync (since it's non-atomically counting references which is amenable to race conditions across threads)
/// TODO: impl !Sync for Locked<T> once this feature is out of rust nightly
#[derive(Debug, Clone)]
pub struct NotSyncMarker(Rc<()>);

impl NotSyncMarker {
    fn new() -> Self {
        Self(Rc::new(()))
    }
}

/// Wraps a type T and makes it not Sync and not Send, which disallows it from being returned from
/// an asynchronously-executed closure.
/// This can be used to ensure that objects aren't passed back from diesel database operations,
/// which is useful to make sure locked objects aren't use outside of the connection in which they
/// are fetched.
pub struct Locked<T>(T, NotSyncMarker);

impl<T> Locked<T> {
    pub fn new(t: T) -> Self {
        Self(t, NotSyncMarker::new())
    }

    /// Consumes self and returns unlocked UVW
    pub fn into_inner(self) -> T {
        self.0
    }
}

/// Through dereference coercion, functions that want a &UserVaultWrapper can accept a &LockedUserVaultWrapper
impl<T> std::ops::Deref for Locked<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
