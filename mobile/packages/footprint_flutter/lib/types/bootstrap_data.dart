part of "../footprint_flutter.dart";

class FootprintBootstrapData {
  final String? email;
  final String? phoneNumber;
  final String? firstName;
  final String? middleName;
  final String? lastName;
  final String? dob;
  final String? addressLine1;
  final String? addressLine2;
  final String? city;
  final String? state;
  final String? country;
  final String? zip;
  final String? ssn9;
  final String? ssn4;
  final String? nationality;
  final String? usLegalStatus;
  final List<String>? citizenships;
  final String? visaKind;
  final String? visaExpirationDate;
  final String? itin;
  final String? usTaxId;
  final String? driversLicenseNumber;
  final String? driversLicenseState;

  final String? businessAddressLine1;
  final String? businessAddressLine2;
  final List<BusinessBeneficialOwners>? businessBeneficialOwners;
  final String? businessCity;
  final String? businessCorporationType;
  final String? businessCountry;
  final String? businessDba;
  final String? businessFormationDate;
  final String? businessFormationState;
  final List<BusinessBeneficialOwners>? businessKycedBeneficialOwners;
  final String? businessName;
  final String? businessPhoneNumber;
  final String? businessState;
  final String? businessTin;
  final String? businessWebsite;
  final String? businessZip;

  FootprintBootstrapData(
      {this.email,
      this.phoneNumber,
      this.firstName,
      this.lastName,
      this.dob,
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.state,
      this.country,
      this.zip,
      this.ssn9,
      this.ssn4,
      this.nationality,
      this.usLegalStatus,
      this.citizenships,
      this.visaKind,
      this.visaExpirationDate,
      this.itin,
      this.usTaxId,
      this.driversLicenseNumber,
      this.driversLicenseState,
      this.middleName,
      this.businessAddressLine1,
      this.businessAddressLine2,
      this.businessBeneficialOwners,
      this.businessCity,
      this.businessCorporationType,
      this.businessCountry,
      this.businessDba,
      this.businessFormationDate,
      this.businessFormationState,
      this.businessKycedBeneficialOwners,
      this.businessName,
      this.businessPhoneNumber,
      this.businessState,
      this.businessTin,
      this.businessWebsite,
      this.businessZip});

  Map<String, dynamic> _toJson() {
    var map = {
      'id.email': email,
      'id.phone_number': phoneNumber,
      'id.first_name': firstName,
      'id.last_name': lastName,
      'id.dob': dob,
      'id.address_line1': addressLine1,
      'id.address_line2': addressLine2,
      'id.city': city,
      'id.state': state,
      'id.country': country,
      'id.zip': zip,
      'id.ssn9': ssn9,
      'id.ssn4': ssn4,
      'id.nationality': nationality,
      'id.us_legal_status': usLegalStatus,
      'id.citizenships': citizenships,
      'id.visa_kind': visaKind,
      'id.visa_expiration_date': visaExpirationDate,
      'id.itin': itin,
      'id.us_tax_id': usTaxId,
      'id.drivers_license_number': driversLicenseNumber,
      'id.drivers_license_state': driversLicenseState,
      'id.middle_name': middleName,
      'business.address_line1': businessAddressLine1,
      'business.address_line2': businessAddressLine2,
      'business.beneficial_owners':
          businessBeneficialOwners?.map((e) => e._toJson()).toList(),
      'business.city': businessCity,
      'business.corporation_type': businessCorporationType,
      'business.country': businessCountry,
      'business.dba': businessDba,
      'business.formation_date': businessFormationDate,
      'business.formation_state': businessFormationState,
      'business.kyced_beneficial_owners':
          businessKycedBeneficialOwners?.map((e) => e._toJson()).toList(),
      'business.name': businessName,
      'business.phone_number': businessPhoneNumber,
      'business.state': businessState,
      'business.tin': businessTin,
      'business.website': businessWebsite,
      'business.zip': businessZip
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}

class BusinessBeneficialOwners {
  final String? boEmail;
  final String? boFirstName;
  final String? boLastName;
  final String? boMiddleName;
  final int? boOwnershipStack;
  final String? boPhoneNumber;

  BusinessBeneficialOwners({
    this.boEmail,
    this.boFirstName,
    this.boLastName,
    this.boMiddleName,
    this.boOwnershipStack,
    this.boPhoneNumber,
  });

  Map<String, dynamic> _toJson() {
    var map = {
      'email': boEmail,
      'first_name': boFirstName,
      'last_name': boLastName,
      'middle_name': boMiddleName,
      'ownership_stake': boOwnershipStack,
      'phone_number': boPhoneNumber,
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
