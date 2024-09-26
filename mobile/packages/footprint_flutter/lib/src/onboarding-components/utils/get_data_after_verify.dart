import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/get_decrypted_data.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/get_onboarding_status.dart';

typedef GetDataAfterVerifyResponse = ({
  Fields fields,
  Requirements requirements,
  FormData vaultData,
});

Future<GetDataAfterVerifyResponse> getDataAfterVerify(
    String authToken, FootprintSupportedLocale locale, WidgetRef ref) async {
  GetOnboardingStatusResult onboardingStatus =
      await getOnboardingStatus(authToken);
  final (:fields, :requirements) = onboardingStatus;
  final allDis = fields.missing + fields.collected + fields.optional;
  final vaultData = await getDecryptedData(
      (authToken: authToken, dis: allDis, locale: locale));
  ref.read(fpContextNotifierProvider.notifier).updateVaultData(vaultData);

  return (
    fields: fields,
    requirements: requirements,
    vaultData: vaultData,
  );
}
