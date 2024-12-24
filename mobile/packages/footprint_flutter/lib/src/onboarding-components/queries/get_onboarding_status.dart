import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/onboarding-components/models/data_identifier.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_error.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_status.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_dis_from_cdo.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/parse_api_error_response.dart';
import 'package:http/http.dart' as http;

typedef Fields = ({
  List<DataIdentifier> missing,
  List<DataIdentifier> collected,
  List<DataIdentifier> optional,
});

typedef Requirements = ({
  bool isCompleted,
  bool isMissing,
  bool canProcessInline,
  bool canUpdateUserData
});

typedef GetOnboardingStatusResult = ({
  Fields fields,
  Requirements requirements
});

Future<OnboardingStatusResponse> getOnboardingRequirements(
    String authToken) async {
  final response = await http.get(
    Uri.parse('$apiBaseUrl/hosted/onboarding/status'),
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Authorization': authToken,
      'x-fp-client-version': clientVersion
    },
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return OnboardingStatusResponse.fromJson(responseBody);
  } else {
    final parsedError = parseApiErrorResponse(response.body);
    throw FootprintError(
      kind: ErrorKind.onboardingError,
      message: 'Failed to get onboarding status',
      supportId: parsedError.supportId,
    );
  }
}

Future<GetOnboardingStatusResult> getOnboardingStatus(String authToken) async {
  OnboardingStatusResponse onboardingStatusResponse =
      await getOnboardingRequirements(authToken);
  List<OnboardingRequirement> allRequirements =
      onboardingStatusResponse.allRequirements;

  List<DataIdentifier> missingFields = [];
  List<DataIdentifier> collectedFields = [];
  List<DataIdentifier> optionalFields = [];

  for (var obRequirement in allRequirements) {
    final requirement = obRequirement.requirement;
    List<DataIdentifier> optionalAttributes = [];
    List<DataIdentifier> populatedAttributes = [];
    List<DataIdentifier> missingAttributes = [];

    if (requirement.optionalAttributes != null) {
      for (var element in requirement.optionalAttributes!) {
        final associatedDis = getDisFromCdo(element);
        optionalAttributes.addAll(associatedDis);
      }
    }

    if (requirement.populatedAttributes != null) {
      for (var element in requirement.populatedAttributes!) {
        final associatedDis = getDisFromCdo(element);
        populatedAttributes.addAll(associatedDis);
      }
    }

    if (requirement.missingAttributes != null) {
      for (var element in requirement.missingAttributes!) {
        final associatedDis = getDisFromCdo(element).where((attr) {
          if (attr == DataIdentifier.idAddressLine2 &&
              !optionalAttributes.contains(DataIdentifier.idAddressLine2)) {
            optionalAttributes.add(DataIdentifier.idAddressLine2);
          }
          if (attr == DataIdentifier.idMiddleName &&
              !optionalAttributes.contains(DataIdentifier.idMiddleName)) {
            optionalAttributes.add(DataIdentifier.idMiddleName);
          }
          return attr != DataIdentifier.idAddressLine2 &&
              attr != DataIdentifier.idMiddleName;
        }).toList();
        missingAttributes.addAll(associatedDis);
      }
    }

    optionalFields.addAll(optionalAttributes);
    collectedFields.addAll(populatedAttributes);
    missingFields.addAll(missingAttributes);
  }

  return (
    fields: (
      missing: missingFields,
      collected: collectedFields,
      optional: optionalFields,
    ),
    requirements: (
      isCompleted: allRequirements.every((element) => element.isMet),
      isMissing: allRequirements.any((element) => !element.isMet),
      canProcessInline: !allRequirements.any((element) =>
          !element.isMet &&
          element.requirement.kind != OnboardingRequirementKind.process),
      canUpdateUserData: onboardingStatusResponse.canUpdateUserData
    )
  );
}
