enum DataIdentifier {
  email("id.email"),
  phoneNumber("id.phone_number"),
  firstName("id.first_name"),
  lastName("id.last_name"),
  dob("id.dob"),
  addressLine1("id.address_line1"),
  addressLine2("id.address_line2"),
  city("id.city"),
  state("id.state"),
  country("id.country"),
  zip("id.zip"),
  ssn9("id.ssn9"),
  ssn4("id.ss4"),
  nationality("id.nationality"),
  usLegalStatus("id.us_legal_status"),
  citizenships("id.citizenships"),
  visaKind("id.visa_kind"),
  visaExpirationDate("id.visa_expiration_date"),
  itin("id.itin"),
  usTaxId("id.us_tax_id"),
  driversLicenseNumber("id.drivers_license_number"),
  driversLicenseState("id.drivers_license_state"),
  middleName("id.middle_name"),
  businessAddressLine1("business.address_line1"),
  businessAddressLine2("business.address_line2"),
  businessBeneficialOwners("business.beneficial_owners"),
  businessCity("business.city"),
  businessCorporationType("business.corporation_type"),
  businessCountry("business.country"),
  businessDba("business.dba"),
  businessFormationDate("business.formation_date"),
  businessFormationState("business.formation_state"),
  businessKycedBeneficialOwners("business.kyced_beneficial_owners"),
  businessName("business.name"),
  businessPhoneNumber("business.phone_number"),
  businessState("business.state"),
  businessTin("business.tin"),
  businessWebsite("business.website"),
  businessZip("business.zip");

  final String val;

  const DataIdentifier(this.val);

  String get name => val;
}
