import 'package:footprint_flutter/src/onboarding-components/models/collected_data_option.dart';

enum OnboardingRequirementKind {
  registerAuthMethod("register_auth_method"),
  registerPasskey("liveness"),
  document("collect_document"),
  collectKycData("collect_data"),
  collectKybData("collect_business_data"),
  investorProfile("collect_investor_profile"),
  authorize("authorize"),
  process("process");

  final String value;

  const OnboardingRequirementKind(this.value);

  static OnboardingRequirementKind? fromValue(String value) {
    switch (value) {
      case "register_auth_method":
        return OnboardingRequirementKind.registerAuthMethod;
      case "liveness":
        return OnboardingRequirementKind.registerPasskey;
      case "collect_document":
        return OnboardingRequirementKind.document;
      case "collect_data":
        return OnboardingRequirementKind.collectKycData;
      case "collect_business_data":
        return OnboardingRequirementKind.collectKybData;
      case "collect_investor_profile":
        return OnboardingRequirementKind.investorProfile;
      case "authorize":
        return OnboardingRequirementKind.authorize;
      case "process":
        return OnboardingRequirementKind.process;
      default:
        return null;
    }
  }

  @override
  String toString() {
    return value;
  }
}

class Requirement {
  final OnboardingRequirementKind kind;
  final List<CollectedDataOption>? missingAttributes;
  final List<CollectedDataOption>? populatedAttributes;
  final List<CollectedDataOption>? optionalAttributes;

  Requirement({
    required this.kind,
    this.missingAttributes,
    this.populatedAttributes,
    this.optionalAttributes,
  });

  factory Requirement.fromJson(Map<String, dynamic> json) {
    List<CollectedDataOption>? missingAttributes = [];
    List<CollectedDataOption>? populatedAttributes = [];
    List<CollectedDataOption>? optionalAttributes = [];

    if (json['missing_attributes'] != null) {
      for (var element in (json['missing_attributes'] as List<dynamic>)) {
        if (CollectedDataOption.fromValue(element) != null) {
          missingAttributes.add(CollectedDataOption.fromValue(element)!);
        }
      }
    }

    if (json['populated_attributes'] != null) {
      for (var element in (json['populated_attributes'] as List<dynamic>)) {
        if (CollectedDataOption.fromValue(element) != null) {
          populatedAttributes.add(CollectedDataOption.fromValue(element)!);
        }
      }
    }

    if (json['optional_attributes'] != null) {
      for (var element in (json['optional_attributes'] as List<dynamic>)) {
        if (CollectedDataOption.fromValue(element) != null) {
          optionalAttributes.add(CollectedDataOption.fromValue(element)!);
        }
      }
    }

    return Requirement(
      kind: OnboardingRequirementKind.fromValue(json['kind'])!,
      missingAttributes:
          json['missing_attributes'] != null ? missingAttributes : null,
      populatedAttributes:
          json['populated_attributes'] != null ? populatedAttributes : null,
      optionalAttributes:
          json['optional_attributes'] != null ? optionalAttributes : null,
    );
  }
}

// Notice that this an oversimplified version of the original model in "frontend/packages/types/src/api/onboarding-status.ts"
// This is because Dart does not have union types
// So, it would be quite complex to implement the original model in Dart
// This model should serve the purpose for now
class OnboardingRequirement {
  final bool isMet;
  final Requirement requirement;

  OnboardingRequirement({
    required this.isMet,
    required this.requirement,
  });

  factory OnboardingRequirement.fromJson(Map<String, dynamic> json) {
    return OnboardingRequirement(
      isMet: json['is_met'],
      requirement: Requirement.fromJson(json),
    );
  }
}

class OnboardingStatusResponse {
  final List<OnboardingRequirement> allRequirements;
  final bool canUpdateUserData;

  OnboardingStatusResponse({
    required this.allRequirements,
    required this.canUpdateUserData,
  });

  factory OnboardingStatusResponse.fromJson(Map<String, dynamic> json) {
    List<OnboardingRequirement> allRequirements = [];
    bool canUpdateUserData = false;

    if (json['all_requirements'] != null) {
      for (var element in (json['all_requirements'] as List<dynamic>)) {
        allRequirements.add(OnboardingRequirement.fromJson(element));
      }
    }
    if (json['can_update_user_data'] != null) {
      canUpdateUserData = json['can_update_user_data'];
    }

    return OnboardingStatusResponse(
      allRequirements: allRequirements,
      canUpdateUserData: canUpdateUserData,
    );
  }
}
