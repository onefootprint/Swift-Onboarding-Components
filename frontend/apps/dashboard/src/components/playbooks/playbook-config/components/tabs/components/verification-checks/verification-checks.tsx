import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Info from '../info';
import {
  isAmlCheck,
  isBusinessAml,
  isKybCheck,
  isKycCheck,
  isNeuroCheck,
  isSentilinkCheck,
} from './verification-checks.utils';

export type VerificationChecksProps = {
  playbook: OnboardingConfiguration;
};

const VerificationChecks = ({ playbook: { kind, verificationChecks, mustCollectData } }: VerificationChecksProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'verification-checks' });
  const kyb = verificationChecks.find(isKybCheck);
  const doesKyc = !!verificationChecks.find(isKycCheck);
  const aml = verificationChecks.find(isAmlCheck);
  const isBusinessAmlEnabled = !!verificationChecks.find(isBusinessAml);
  const isNeuroEnabled = !!verificationChecks.find(isNeuroCheck);
  const isSentilinkEnabled = !!verificationChecks.find(isSentilinkCheck);
  const hasFraudChecks = isNeuroEnabled || isSentilinkEnabled;

  const kybText = (() => {
    if (kind === 'kyc') return null;
    if (kyb?.data) {
      return kyb.data.einOnly ? t('kyb.ein-only') : t('kyb.full');
    }
    return t('kyb.none');
  })();

  const kycText = (() => {
    if (kind === 'kyb') {
      if (!doesKyc) return t('kyb.kyc.none');
      if (mustCollectData.includes('business_kyced_beneficial_owners')) return t('kyb.kyc.full');
    }
    if (kind === 'kyc') {
      return doesKyc ? t('kyc.full') : t('kyc.none');
    }
    return null;
  })();

  const matchingMethod = (() => {
    if (aml?.data.matchKind) {
      const kind = aml.data.matchKind;
      const matchingMethodMap = {
        exact_name: {
          label: t('matching-method.exact.title'),
          hint: t('matching-method.exact.name'),
        },
        exact_name_and_dob_year: {
          label: t('matching-method.exact.title'),
          hint: t('matching-method.exact.name-dob'),
        },
        fuzzy_low: {
          label: t('matching-method.fuzzy.title'),
          hint: t('matching-method.fuzzy.low'),
        },
        fuzzy_medium: {
          label: t('matching-method.fuzzy.title'),
          hint: t('matching-method.fuzzy.medium'),
        },
        fuzzy_high: {
          label: t('matching-method.fuzzy.title'),
          hint: t('matching-method.fuzzy.high'),
        },
      };
      return matchingMethodMap[kind];
    }
    return null;
  })();

  const adverseMediaListHint = (() => {
    if (aml?.data.adverseMediaLists) {
      const { adverseMediaLists } = aml.data;
      const list = [];
      if (adverseMediaLists.includes('financial_crime')) {
        list.push(t('screening.adverse-media-list.financial-crime'));
      }
      if (adverseMediaLists.includes('violent_crime')) {
        list.push(t('screening.adverse-media-list.violent-crime'));
      }
      if (adverseMediaLists.includes('sexual_crime')) {
        list.push(t('screening.adverse-media-list.sexual-crime'));
      }
      if (adverseMediaLists.includes('cyber_crime')) {
        list.push(t('screening.adverse-media-list.cyber-crime'));
      }
      if (adverseMediaLists.includes('terrorism')) {
        list.push(t('screening.adverse-media-list.terrorism'));
      }
      if (adverseMediaLists.includes('fraud')) {
        list.push(t('screening.adverse-media-list.fraud'));
      }
      if (adverseMediaLists.includes('narcotics')) {
        list.push(t('screening.adverse-media-list.narcotics'));
      }
      if (adverseMediaLists.includes('general_serious')) {
        list.push(t('screening.adverse-media-list.general-serious'));
      }
      if (adverseMediaLists.includes('general_minor')) {
        list.push(t('screening.adverse-media-list.general-minor'));
      }
      return list.join(', ');
    }
    return '';
  })();

  return (
    <Stack flexDirection="column" gap={8}>
      {kybText && (
        <Info.Group title={t('kyb.title')}>
          <Info.Item label={kybText} checked={!!kyb?.data} />
        </Info.Group>
      )}
      {kycText && (
        <Info.Group title={t('kyc.title')}>
          <Info.Item label={kycText} checked={doesKyc} />
        </Info.Group>
      )}
      {kind === 'kyb' && (
        <Stack direction="column" gap={4}>
          <Text variant="label-2">{t('business-aml.title')}</Text>
          <Info.Group title={t('screening.title')}>
            {isBusinessAmlEnabled ? (
              <>
                <Info.Item label={t('screening.ofac')} checked />
              </>
            ) : (
              <Info.Item label={t('screening.none')} checked={false} />
            )}
          </Info.Group>
        </Stack>
      )}
      <Stack direction="column" gap={4}>
        <Text variant="label-2">{kind === 'kyb' ? t('business-aml.bo-title') : t('aml.title')}</Text>
        {aml ? (
          <>
            <Info.Group title={t('screening.title')}>
              <Info.Item label={t('screening.ofac')} checked={aml.data.ofac} />
              <Info.Item label={t('screening.pep')} checked={aml.data.pep} />
              <Info.Item
                label={t('screening.adverse-media')}
                hint={adverseMediaListHint}
                checked={aml.data.adverseMedia}
              />
            </Info.Group>
            <Info.Group title={t('matching-method.title')}>
              {matchingMethod ? (
                <Info.Item label={matchingMethod.label} hint={matchingMethod.hint} checked />
              ) : (
                <Info.Item label={t('matching-method.none')} checked={false} />
              )}
            </Info.Group>
          </>
        ) : (
          <Info.Item label={t('screening.none')} checked={false} />
        )}
      </Stack>
      {kind === 'kyc' && (
        <Info.Group title={t('fraud-checks.title')}>
          {hasFraudChecks ? (
            <>
              <Info.Item label={t('fraud-checks.sentilink')} checked={isSentilinkEnabled} />
              <Info.Item label={t('fraud-checks.neuro')} checked={isNeuroEnabled} />
            </>
          ) : (
            <Info.Item label={t('fraud-checks.none')} checked={false} />
          )}
        </Info.Group>
      )}
    </Stack>
  );
};

export default VerificationChecks;
