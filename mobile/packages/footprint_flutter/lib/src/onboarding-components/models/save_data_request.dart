const ALLOW_EXTRA_FIELDS_HEADER = 'x-fp-allow-extra-fields';
const AUTH_HEADER = 'X-Fp-Authorization';

class SaveDataRequest {
  Map<String, dynamic> data;
  List<Map<String, dynamic>> bootstrapDis;
  String authToken;
  bool? allowExtraFields;
  bool? speculative;

  SaveDataRequest(
      {required this.data,
      required this.bootstrapDis,
      required this.authToken,
      this.allowExtraFields,
      this.speculative});

  Map<String, dynamic> toJson() {
    return {
      'data': data,
      'bootstrap_dis': bootstrapDis,
      'auth_token': authToken,
      'allow_extra_fields': allowExtraFields,
      'speculative': speculative
    };
  }
}

class SaveDataResponse {
  final String? data;

  SaveDataResponse({this.data});
}
