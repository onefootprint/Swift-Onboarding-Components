import 'package:footprint_flutter/src/onboarding-components/models/footprint_error.dart';
import 'package:meta/meta.dart';

class FormData {
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
  final CustomField? custom;

  FormData(
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
      this.custom,
      this.businessZip});

  FormData.fromJson(Map<String, dynamic> json)
      : email = json['id.email'],
        phoneNumber = json['id.phone_number'],
        firstName = json['id.first_name'],
        lastName = json['id.last_name'],
        dob = json['id.dob'],
        addressLine1 = json['id.address_line1'],
        addressLine2 = json['id.address_line2'],
        city = json['id.city'],
        state = json['id.state'],
        country = json['id.country'],
        zip = json['id.zip'],
        ssn9 = json['id.ssn9'],
        ssn4 = json['id.ssn4'],
        nationality = json['id.nationality'],
        usLegalStatus = json['id.us_legal_status'],
        citizenships = json['id.citizenships']?.cast<String>(),
        visaKind = json['id.visa_kind'],
        visaExpirationDate = json['id.visa_expiration_date'],
        itin = json['id.itin'],
        usTaxId = json['id.us_tax_id'],
        driversLicenseNumber = json['id.drivers_license_number'],
        driversLicenseState = json['id.drivers_license_state'],
        middleName = json['id.middle_name'],
        businessAddressLine1 = json['business.address_line1'],
        businessAddressLine2 = json['business.address_line2'],
        businessBeneficialOwners = (json['business.beneficial_owners'] as List?)
            ?.map((e) => BusinessBeneficialOwners.fromJson(e))
            .toList(),
        businessCity = json['business.city'],
        businessCorporationType = json['business.corporation_type'],
        businessCountry = json['business.country'],
        businessDba = json['business.dba'],
        businessFormationDate = json['business.formation_date'],
        businessFormationState = json['business.formation_state'],
        businessKycedBeneficialOwners =
            (json['business.kyced_beneficial_owners'] as List?)
                ?.map((e) => BusinessBeneficialOwners.fromJson(e))
                .toList(),
        businessName = json['business.name'],
        businessPhoneNumber = json['business.phone_number'],
        businessState = json['business.state'],
        businessTin = json['business.tin'],
        businessWebsite = json['business.website'],
        businessZip = json['business.zip'],
        custom = json.entries
            .where((element) => element.key.startsWith("custom."))
            .map((e) => CustomField(key: e.key, value: e.value))
            .firstOrNull;

  @internal
  Map<String, dynamic> toJson() {
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
          businessBeneficialOwners?.map((e) => e.toJson()).toList(),
      'business.city': businessCity,
      'business.corporation_type': businessCorporationType,
      'business.country': businessCountry,
      'business.dba': businessDba,
      'business.formation_date': businessFormationDate,
      'business.formation_state': businessFormationState,
      'business.kyced_beneficial_owners':
          businessKycedBeneficialOwners?.map((e) => e.toJson()).toList(),
      'business.name': businessName,
      'business.phone_number': businessPhoneNumber,
      'business.state': businessState,
      'business.tin': businessTin,
      'business.website': businessWebsite,
      'business.zip': businessZip,
      ...custom?.toJson() ?? {},
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }

  bool _isKycedBoKey(String key) {
    // Starts with business.kyced_beneficial_owners
    // Has index in the middle inside []
    // Ends with .first_name or .last_name or .middle_name or .ownership_stake or .email or .phone_number
    // use regex to match
    return RegExp(
            r'^business\.kyced_beneficial_owners\[\d+\]\.(first_name|last_name|middle_name|ownership_stake|email|phone_number)$')
        .hasMatch(key);
  }

  bool _isBoKey(String key) {
    // Starts with business.beneficial_owners
    // Has index in the middle inside []
    // Ends with .first_name or .last_name or .middle_name or .ownership_stake or .email or .phone_number
    // use regex to match
    return RegExp(
            r'^business\.beneficial_owners\[\d+\]\.(first_name|last_name|middle_name|ownership_stake|email|phone_number)$')
        .hasMatch(key);
  }

  int _getBoIndex(String key) {
    return int.parse(key.split('[')[1].split(']')[0]);
  }

  String _getBoField(String key) {
    return key.split('.')[2];
  }

  List<BusinessBeneficialOwners> _updateBoField(
      List<BusinessBeneficialOwners> boList, int index, String field, value) {
    if (index > boList.length) {
      throw FootprintError(
        kind: ErrorKind.uiError,
        message: 'Beneficial owner index out of bounds',
      );
    }
    if (index == boList.length) {
      return boList +
          [
            BusinessBeneficialOwners(
              boEmail: field == 'email' ? value : null,
              boFirstName: field == 'first_name' ? value : null,
              boLastName: field == 'last_name' ? value : null,
              boMiddleName: field == 'middle_name' ? value : null,
              boOwnershipStack:
                  field == 'ownership_stake' ? int.tryParse(value) : null,
              boPhoneNumber: field == 'phone_number' ? value : null,
            )
          ];
    }
    return boList.map((bo) {
      if (boList.indexOf(bo) == index) {
        return BusinessBeneficialOwners(
          boEmail: field == 'email' ? value : bo.boEmail,
          boFirstName: field == 'first_name' ? value : bo.boFirstName,
          boLastName: field == 'last_name' ? value : bo.boLastName,
          boMiddleName: field == 'middle_name' ? value : bo.boMiddleName,
          boOwnershipStack: field == 'ownership_stake'
              ? int.tryParse(value)
              : bo.boOwnershipStack,
          boPhoneNumber: field == 'phone_number' ? value : bo.boPhoneNumber,
        );
      }
      return bo;
    }).toList();
  }

  List<BusinessBeneficialOwners>? _getUpdatedBoList(
    List<BusinessBeneficialOwners>? boList,
    String key,
    dynamic value,
    bool isKyced,
  ) {
    if (isKyced) {
      if (!_isKycedBoKey(key)) {
        return boList;
      }
    } else {
      if (!_isBoKey(key)) {
        return boList;
      }
    }
    int index = _getBoIndex(key);
    String field = _getBoField(key);
    return _updateBoField(boList ?? [], index, field, value);
  }

  @internal
  FormData setField(String key, dynamic value) {
    return FormData(
      email: key == 'id.email' ? value : email,
      phoneNumber: key == 'id.phone_number' ? value : phoneNumber,
      firstName: key == 'id.first_name' ? value : firstName,
      middleName: key == 'id.middle_name' ? value : middleName,
      lastName: key == 'id.last_name' ? value : lastName,
      dob: key == 'id.dob' ? value : dob,
      addressLine1: key == 'id.address_line1' ? value : addressLine1,
      addressLine2: key == 'id.address_line2' ? value : addressLine2,
      city: key == 'id.city' ? value : city,
      state: key == 'id.state' ? value : state,
      country: key == 'id.country' ? value : country,
      zip: key == 'id.zip' ? value : zip,
      ssn9: key == 'id.ssn9' ? value : ssn9,
      ssn4: key == 'id.ssn4' ? value : ssn4,
      nationality: key == 'id.nationality' ? value : nationality,
      usLegalStatus: key == 'id.us_legal_status' ? value : usLegalStatus,
      citizenships: key == 'id.citizenships' ? value : citizenships,
      visaKind: key == 'id.visa_kind' ? value : visaKind,
      visaExpirationDate:
          key == 'id.visa_expiration_date' ? value : visaExpirationDate,
      itin: key == 'id.itin' ? value : itin,
      usTaxId: key == 'id.us_tax_id' ? value : usTaxId,
      driversLicenseNumber:
          key == 'id.drivers_license_number' ? value : driversLicenseNumber,
      driversLicenseState:
          key == 'id.drivers_license_state' ? value : driversLicenseState,
      businessAddressLine1:
          key == 'business.address_line1' ? value : businessAddressLine1,
      businessAddressLine2:
          key == 'business.address_line2' ? value : businessAddressLine2,
      businessBeneficialOwners:
          _getUpdatedBoList(businessBeneficialOwners, key, value, false),
      businessCity: key == 'business.city' ? value : businessCity,
      businessCorporationType:
          key == 'business.corporation_type' ? value : businessCorporationType,
      businessCountry: key == 'business.country' ? value : businessCountry,
      businessDba: key == 'business.dba' ? value : businessDba,
      businessFormationDate:
          key == 'business.formation_date' ? value : businessFormationDate,
      businessFormationState:
          key == 'business.formation_state' ? value : businessFormationState,
      businessKycedBeneficialOwners:
          _getUpdatedBoList(businessKycedBeneficialOwners, key, value, true),
      businessName: key == 'business.name' ? value : businessName,
      businessPhoneNumber:
          key == 'business.phone_number' ? value : businessPhoneNumber,
      businessState: key == 'business.state' ? value : businessState,
      businessTin: key == 'business.tin' ? value : businessTin,
      businessWebsite: key == 'business.website' ? value : businessWebsite,
      businessZip: key == 'business.zip' ? value : businessZip,
      custom: key.startsWith("custom.")
          ? CustomField(key: key, value: value)
          : custom,
    );
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

  BusinessBeneficialOwners.fromJson(Map<String, dynamic> json)
      : boEmail = json['email'],
        boFirstName = json['first_name'],
        boLastName = json['last_name'],
        boMiddleName = json['middle_name'],
        boOwnershipStack = json['ownership_stake'],
        boPhoneNumber = json['phone_number'];

  @internal
  Map<String, dynamic> toJson() {
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

class CustomField {
  final String key;
  final String value;

  CustomField({required this.key, required this.value});

  @internal
  Map<String, dynamic> toJson() {
    return {
      key: value,
    };
  }
}
