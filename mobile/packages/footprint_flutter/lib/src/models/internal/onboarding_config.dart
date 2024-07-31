import 'package:footprint_flutter/footprint_flutter.dart';
import 'package:footprint_flutter/src/models/internal/auth_method.dart';

enum OnboardingConfigStatus { enabled, disabled }

enum OnboardingConfigKind { kyc, kyb, auth }

// Used in idv context
class OnboardingConfig {
  final String name;
  final String key;
  final String orgName;
  final String orgId;
  final String? logoUrl;
  final String? privacyPolicyUrl;
  final bool isLive;
  final OnboardingConfigStatus status;
  final FootprintAppearance? appearance;
  final bool isAppClipEnabled;
  final bool isInstantAppEnabled;
  final String appClipExperienceId;
  final bool isNoPhoneFlow;
  final bool requiresIdDoc;
  final bool isKyb;
  final bool allowInternationalResidents;
  final List<String>? supportedCountries;
  final List<String>? allowedOrigins;
  final bool? canMakeRealDocScanCallsInSandbox;
  final bool? isStepupEnabled;
  final OnboardingConfigKind? kind;
  final String? supportEmail;
  final String? supportPhone;
  final String? supportWebsite;
  final List<AuthMethodKind>? requiredAuthMethods;
  final bool? nidEnabled;

  OnboardingConfig({
    required this.name,
    required this.key,
    required this.orgName,
    required this.orgId,
    this.logoUrl,
    this.privacyPolicyUrl,
    required this.isLive,
    required this.status,
    this.appearance,
    required this.isAppClipEnabled,
    required this.isInstantAppEnabled,
    required this.appClipExperienceId,
    required this.isNoPhoneFlow,
    required this.requiresIdDoc,
    required this.isKyb,
    required this.allowInternationalResidents,
    this.supportedCountries,
    this.allowedOrigins,
    this.canMakeRealDocScanCallsInSandbox,
    this.isStepupEnabled,
    this.kind,
    this.supportEmail,
    this.supportPhone,
    this.supportWebsite,
    this.requiredAuthMethods,
    this.nidEnabled,
  });

  OnboardingConfig.fromJson(Map<String, dynamic> json)
      : name = json['name'] as String,
        key = json['key'] as String,
        orgName = json['orgName'] as String,
        orgId = json['orgId'] as String,
        logoUrl = json['logoUrl'] as String?,
        privacyPolicyUrl = json['privacyPolicyUrl'] as String?,
        isLive = json['isLive'] as bool,
        status = json['status'] == 'enabled'
            ? OnboardingConfigStatus.enabled
            : OnboardingConfigStatus.disabled,
        appearance = json['appearance'] == null
            ? null
            : FootprintAppearance.fromJson(json['appearance']),
        isAppClipEnabled = json['isAppClipEnabled'] as bool,
        isInstantAppEnabled = json['isInstantAppEnabled'] as bool,
        appClipExperienceId = json['appClipExperienceId'] as String,
        isNoPhoneFlow = json['isNoPhoneFlow'] as bool,
        requiresIdDoc = json['requiresIdDoc'] as bool,
        isKyb = json['isKyb'] as bool,
        allowInternationalResidents =
            json['allowInternationalResidents'] as bool,
        supportedCountries = json['supportedCountries'] == null
            ? null
            : List<String>.from(json['supportedCountries']),
        allowedOrigins = json['allowedOrigins'] == null
            ? null
            : List<String>.from(json['allowedOrigins']),
        canMakeRealDocScanCallsInSandbox =
            json['canMakeRealDocScanCallsInSandbox'] as bool?,
        isStepupEnabled = json['isStepupEnabled'] as bool?,
        kind = json['kind'] == null
            ? null
            : json['kind'] == 'kyc'
                ? OnboardingConfigKind.kyc
                : json['kind'] == 'kyb'
                    ? OnboardingConfigKind.kyb
                    : OnboardingConfigKind.auth,
        supportEmail = json['supportEmail'] as String?,
        supportPhone = json['supportPhone'] as String?,
        supportWebsite = json['supportWebsite'] as String?,
        requiredAuthMethods = json['requiredAuthMethods'] == null
            ? null
            : List<AuthMethodKind>.from(json['requiredAuthMethods'].map((e) =>
                AuthMethodKind.values.firstWhere(
                    (element) => element.toString() == 'AuthMethodKind.$e'))),
        nidEnabled = json['nidEnabled'] as bool?;

  Map<String, dynamic> toJson() => {
        'name': name,
        'key': key,
        'orgName': orgName,
        'orgId': orgId,
        'logoUrl': logoUrl,
        'privacyPolicyUrl': privacyPolicyUrl,
        'isLive': isLive,
        'status':
            status == OnboardingConfigStatus.enabled ? 'enabled' : 'disabled',
        'appearance': appearance?.toJson(),
        'isAppClipEnabled': isAppClipEnabled,
        'isInstantAppEnabled': isInstantAppEnabled,
        'appClipExperienceId': appClipExperienceId,
        'isNoPhoneFlow': isNoPhoneFlow,
        'requiresIdDoc': requiresIdDoc,
        'isKyb': isKyb,
        'allowInternationalResidents': allowInternationalResidents,
        'supportedCountries': supportedCountries,
        'allowedOrigins': allowedOrigins,
        'canMakeRealDocScanCallsInSandbox': canMakeRealDocScanCallsInSandbox,
        'isStepupEnabled': isStepupEnabled,
        'kind': kind == null
            ? null
            : kind == OnboardingConfigKind.kyc
                ? 'kyc'
                : kind == OnboardingConfigKind.kyb
                    ? 'kyb'
                    : 'auth',
        'supportEmail': supportEmail,
        'supportPhone': supportPhone,
        'supportWebsite': supportWebsite,
        'requiredAuthMethods': requiredAuthMethods
            ?.map((e) => e.toString().split('.').last)
            .toList(),
        'nidEnabled': nidEnabled,
      };
}
