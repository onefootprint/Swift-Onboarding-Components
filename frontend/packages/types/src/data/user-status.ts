/// This type doesn't exist on the backend - it is a function of a ScopedUser and is used to display
/// the top-level status of a user.
enum UserStatus {
  verified = 'pass',
  failed = 'fail',
  vaultOnly = 'vault-only',
  incomplete = 'incomplete',
}

export default UserStatus;
