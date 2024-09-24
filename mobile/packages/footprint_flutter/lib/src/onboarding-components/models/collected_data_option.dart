// The equivalent code in FE is in frontend/packages/types/src/api/onboarding-status.ts
// You will notice in the FE code that we separated the KYC, KYB, investor profile, and document collection
// and then use an union type
// unfortunately, dart does not have union types :(
// so we are putting all of them in one enum
// for now, this should serve the purpose
// if we need to separate them in the future, we need to come up with a different solution
enum CollectedDataOption {
  investorProfile("investor_profile"),
  businessName("business_name"),
  businessTin("business_tin"),
  businessAddress("business_address"),
  businessPhoneNumber("business_phone_number"),
  businessWebsite("business_website"),
  businessCorporationType("business_corporation_type"),
  businessBeneficialOwners("business_beneficial_owners"),
  businessKycedBeneficialOwners("business_kyced_beneficial_owners"),
  name("name"),
  dob("dob"),
  ssn4("ssn4"),
  ssn9("ssn9"),
  address("full_address"),
  email("email"),
  phoneNumber("phone_number"),
  nationality("nationality"),
  usLegalStatus("us_legal_status"),
  usTaxId("us_tax_id"),
  document("document"),
  documentAndSelfie("document_and_selfie");

  final String value;
  const CollectedDataOption(this.value);

  static CollectedDataOption? fromValue(String value) {
    switch (value) {
      case "investor_profile":
        return CollectedDataOption.investorProfile;
      case "business_name":
        return CollectedDataOption.businessName;
      case "business_tin":
        return CollectedDataOption.businessTin;
      case "business_address":
        return CollectedDataOption.businessAddress;
      case "business_phone_number":
        return CollectedDataOption.businessPhoneNumber;
      case "business_website":
        return CollectedDataOption.businessWebsite;
      case "business_corporation_type":
        return CollectedDataOption.businessCorporationType;
      case "business_beneficial_owners":
        return CollectedDataOption.businessBeneficialOwners;
      case "business_kyced_beneficial_owners":
        return CollectedDataOption.businessKycedBeneficialOwners;
      case "name":
        return CollectedDataOption.name;
      case "dob":
        return CollectedDataOption.dob;
      case "ssn4":
        return CollectedDataOption.ssn4;
      case "ssn9":
        return CollectedDataOption.ssn9;
      case "full_address":
        return CollectedDataOption.address;
      case "email":
        return CollectedDataOption.email;
      case "phone_number":
        return CollectedDataOption.phoneNumber;
      case "nationality":
        return CollectedDataOption.nationality;
      case "us_legal_status":
        return CollectedDataOption.usLegalStatus;
      case "us_tax_id":
        return CollectedDataOption.usTaxId;
      case "document":
        return CollectedDataOption.document;
      case "document_and_selfie":
        return CollectedDataOption.documentAndSelfie;
      default:
        return null;
    }
  }

  @override
  String toString() {
    return value;
  }
}
