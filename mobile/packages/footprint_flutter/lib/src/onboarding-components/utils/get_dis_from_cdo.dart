import 'package:footprint_flutter/src/onboarding-components/models/collected_data_option.dart';
import 'package:footprint_flutter/src/onboarding-components/models/data_identifier.dart';

List<DataIdentifier> getDisFromCdo(CollectedDataOption cdo) {
  switch (cdo) {
    case CollectedDataOption.name:
      return [
        DataIdentifier.idFirstName,
        DataIdentifier.idMiddleName,
        DataIdentifier.idLastName
      ];
    case CollectedDataOption.dob:
      return [DataIdentifier.idDob];
    case CollectedDataOption.ssn4:
      return [DataIdentifier.idSsn4];
    case CollectedDataOption.ssn9:
      return [DataIdentifier.idSsn9];
    case CollectedDataOption.usTaxId:
      return [DataIdentifier.idUsTaxId];
    case CollectedDataOption.address:
      return [
        DataIdentifier.idAddressLine1,
        DataIdentifier.idAddressLine2,
        DataIdentifier.idCity,
        DataIdentifier.idState,
        DataIdentifier.idZip,
        DataIdentifier.idCountry,
      ];
    case CollectedDataOption.email:
      return [DataIdentifier.idEmail];
    case CollectedDataOption.phoneNumber:
      return [DataIdentifier.idPhoneNumber];
    case CollectedDataOption.nationality:
      return [DataIdentifier.idNationality];
    case CollectedDataOption.usLegalStatus:
      return [
        DataIdentifier.idUsLegalStatus,
        DataIdentifier.idVisaKind,
        DataIdentifier.idVisaExpirationDate,
        DataIdentifier.idCitizenships,
        DataIdentifier.idNationality,
      ];
    case CollectedDataOption.businessName:
      return [DataIdentifier.businessName, DataIdentifier.businessDba];
    case CollectedDataOption.businessTin:
      return [DataIdentifier.businessTin];
    case CollectedDataOption.businessAddress:
      return [
        DataIdentifier.businessAddressLine1,
        DataIdentifier.businessAddressLine2,
        DataIdentifier.businessCity,
        DataIdentifier.businessState,
        DataIdentifier.businessZip,
        DataIdentifier.businessCountry,
      ];
    case CollectedDataOption.businessPhoneNumber:
      return [DataIdentifier.businessPhoneNumber];
    case CollectedDataOption.businessWebsite:
      return [DataIdentifier.businessWebsite];
    case CollectedDataOption.businessCorporationType:
      return [DataIdentifier.businessCorporationType];
    case CollectedDataOption.businessBeneficialOwners:
      return [DataIdentifier.businessBeneficialOwners];
    case CollectedDataOption.businessKycedBeneficialOwners:
      return [DataIdentifier.businessKycedBeneficialOwners];
    case CollectedDataOption.investorProfile:
      return [
        DataIdentifier.investorEmploymentStatus,
        DataIdentifier.investorOccupation,
        DataIdentifier.investorEmployer,
        DataIdentifier.investorAnnualIncome,
        DataIdentifier.investorNetWorth,
        DataIdentifier.investorInvestmentGoals,
        DataIdentifier.investorRiskTolerance,
        DataIdentifier.investorDeclarations,
        DataIdentifier.investorSeniorExecutiveSymbols,
        DataIdentifier.investorFamilyMemberNames,
        DataIdentifier.investorPoliticalOrganization,
        DataIdentifier.investorBrokerageFirmEmployer,
        DataIdentifier.investorFundingSources,
      ];
    default:
      throw Exception("CollectedDataOption not supported: $cdo");
  }
}
