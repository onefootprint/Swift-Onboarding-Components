// import request from '@onefootprint/request';
// import { AUTH_HEADER } from '@onefootprint/types';
// import type {
//   OnboardingValidateRequest,
//   OnboardingValidateResponse,
// } from '@onefootprint/types/src/api/onboarding-validate';
// import { useMutation } from '@tanstack/react-query';

// const onboardingValidateRequest = async (payload: OnboardingValidateRequest) => {
//   const response = await request<OnboardingValidateResponse>({
//     method: 'POST',
//     url: '/hosted/onboarding/validate',
//     headers: {
//       [AUTH_HEADER]: payload.authToken,
//     },
//   });

//   return response.data;
// };

// const useOnboardingValidate = () => useMutation(onboardingValidateRequest);

// export default useOnboardingValidate;

import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/onboarding-components/models/verification_response.dart';
import 'package:http/http.dart' as http;

Future<ValidationTokenResponse> validateOnboarding(String token) async {
  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/onboarding/validate'),
    headers: {'Content-Type': 'application/json', 'X-Fp-Authorization': token},
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    final vTok = ValidationTokenResponse.fromJson(responseBody);
    return vTok;
  } else {
    throw Exception('Failed to validate onboarding');
  }
}
