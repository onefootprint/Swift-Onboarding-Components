/// This type doesn't exist on the backend - it is a function of a ScopedBusiness and is used to display
/// the top-level status of a business.
enum BusinessStatus {
  verified = 'pass',
  failed = 'fail',
  incomplete = 'incomplete',
}

export default BusinessStatus;
