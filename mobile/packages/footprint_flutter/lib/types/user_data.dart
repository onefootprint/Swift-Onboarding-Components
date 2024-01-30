part of "../footprint_flutter.dart";

class FootprintUserData {
  final String? email;
  final String? phoneNumber;
  final String? firstName;
  final String? lastName;
  final String? dob; // Date of birth
  final String? addressLine1;
  final String? addressLine2;
  final String? city;
  final String? state;
  final String? country; // 2 letter country code
  final String? zip;
  final String? ssn9;
  final String? ssn4;
  final String? nationality; // 2 letter country code
  final String? usLegalStatus;
  final List<String>? citizenships; // array of 2 letter country codes
  final String? visaKind;
  final String? visaExpirationDate;

  FootprintUserData({
    this.email,
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
  });

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
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
