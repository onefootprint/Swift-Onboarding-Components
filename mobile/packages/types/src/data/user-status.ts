/// This type doesn't exist on the backend - it is a function of a ScopedUser and is used to display
/// the top-level status of a user.
enum UserStatus {
  verified = 'pass',
  failed = 'fail',
  incomplete = 'incomplete',
  pending = 'pending',

  vaultOnly = 'vault_only',
}

export default UserStatus;
