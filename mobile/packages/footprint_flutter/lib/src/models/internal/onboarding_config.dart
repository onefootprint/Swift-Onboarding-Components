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
        orgName = json['org_name'] as String,
        orgId = json['org_id'] as String,
        logoUrl = json['logo_url'] as String?,
        privacyPolicyUrl = json['privacy_policy_url'] as String?,
        isLive = json['is_live'] as bool,
        status = json['status'] == 'enabled'
            ? OnboardingConfigStatus.enabled
            : OnboardingConfigStatus.disabled,
        appearance = json['appearance'] == null
            ? null
            : FootprintAppearance.fromJson(json['appearance']),
        isAppClipEnabled = json['is_app_clip_enabled'] as bool,
        isInstantAppEnabled = json['is_instant_app_enabled'] as bool,
        appClipExperienceId = json['app_clip_experience_id'] as String,
        isNoPhoneFlow = json['is_no_phone_flow'] as bool,
        requiresIdDoc = json['requires_id_doc'] as bool,
        isKyb = json['is_kyb'] as bool,
        allowInternationalResidents =
            json['allow_international_residents'] as bool,
        supportedCountries = json['supported_countries'] == null
            ? null
            : List<String>.from(json['supported_countries']),
        allowedOrigins = json['allowed_origins'] == null
            ? null
            : List<String>.from(json['allowed_origins']),
        canMakeRealDocScanCallsInSandbox =
            json['can_make_real_doc_scan_calls_in_sandbox'] as bool?,
        isStepupEnabled = json['is_stepup_enabled'] as bool?,
        kind = json['kind'] == null
            ? null
            : json['kind'] == 'kyc'
                ? OnboardingConfigKind.kyc
                : json['kind'] == 'kyb'
                    ? OnboardingConfigKind.kyb
                    : OnboardingConfigKind.auth,
        supportEmail = json['support_email'] as String?,
        supportPhone = json['support_phone'] as String?,
        supportWebsite = json['support_website'] as String?,
        requiredAuthMethods = json['required_auth_methods'] == null
            ? null
            : List<AuthMethodKind>.from(json['required_auth_methods'].map((e) =>
                AuthMethodKind.values.firstWhere(
                    (element) => element.toString() == 'AuthMethodKind.$e'))),
        nidEnabled = json['nid_enabled'] as bool?;

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['name'] = name;
    data['key'] = key;
    data['org_name'] = orgName;
    data['org_id'] = orgId;
    data['logo_url'] = logoUrl;
    data['privacy_policy_url'] = privacyPolicyUrl;
    data['is_live'] = isLive;
    data['status'] =
        status == OnboardingConfigStatus.enabled ? 'enabled' : 'disabled';
    data['appearance'] = appearance?.toJson();
    data['is_app_clip_enabled'] = isAppClipEnabled;
    data['is_instant_app_enabled'] = isInstantAppEnabled;
    data['app_clip_experience_id'] = appClipExperienceId;
    data['is_no_phone_flow'] = isNoPhoneFlow;
    data['requires_id_doc'] = requiresIdDoc;
    data['is_kyb'] = isKyb;
    data['allow_international_residents'] = allowInternationalResidents;
    data['supported_countries'] = supportedCountries;
    data['allowed_origins'] = allowedOrigins;
    data['can_make_real_doc_scan_calls_in_sandbox'] =
        canMakeRealDocScanCallsInSandbox;
    data['is_stepup_enabled'] = isStepupEnabled;
    data['kind'] = kind == null
        ? null
        : kind == OnboardingConfigKind.kyc
            ? 'kyc'
            : kind == OnboardingConfigKind.kyb
                ? 'kyb'
                : 'auth';
    data['support_email'] = supportEmail;
    data['support_phone'] = supportPhone;
    data['support_website'] = supportWebsite;
    data['required_auth_methods'] =
        requiredAuthMethods?.map((e) => e.toString().split('.').last).toList();
    data['nid_enabled'] = nidEnabled;
    return data;
  }
}
