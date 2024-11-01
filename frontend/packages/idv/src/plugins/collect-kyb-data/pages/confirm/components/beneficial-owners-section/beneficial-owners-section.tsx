import { IcoUserCircle24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Shimmer, Stack } from '@onefootprint/ui';
import type { SectionItemProps } from '../../../../../../components/confirm-collected-data';
import { MultiSection, Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import { useBusinessOwners } from '../../../../../../queries';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import BeneficialOwnersConfirm from './components/beneficial-owners-confirm';

const BeneficialOwnersSection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.confirm' });
  const [state] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
    config,
  } = state.context;
  const [isEditing, setIsEditing] = useState(false);
  const bosQuery = useBusinessOwners({ authToken });

  if (!bosQuery.data?.length) {
    return null;
  }

  const getPreviewSections = () => {
    if (bosQuery.isPending || bosQuery.isFetching) {
      const content = <LoadingBos />;
      return [{ content }];
    }

    const sections = bosQuery.data.map(bo => {
      const isPrimary = bo.isAuthedUser;
      const firstName = bo.decryptedData[IdDI.firstName];
      const middleName = bo.decryptedData[IdDI.middleName];
      const lastName = bo.decryptedData[IdDI.lastName];
      const email = bo.decryptedData[IdDI.email];
      const phoneNumber = bo.decryptedData[IdDI.phoneNumber];
      const ownershipStake = bo.ownershipStake;
      const items: { text: string; subtext: string }[] = [];

      if (firstName) {
        items.push({ text: t('beneficial-owners.first-name'), subtext: firstName });
      }
      if (middleName) {
        items.push({ text: t('beneficial-owners.middle-name'), subtext: middleName });
      }
      if (lastName) {
        items.push({ text: t('beneficial-owners.last-name'), subtext: lastName });
      }
      if (!isPrimary) {
        if (email) {
          items.push({ text: t('beneficial-owners.email'), subtext: email });
        }
        if (phoneNumber) {
          items.push({ text: t('beneficial-owners.phone-number'), subtext: phoneNumber });
        }
      }
      items.push({ text: t('beneficial-owners.ownership-stake'), subtext: `${ownershipStake || 0}%` });

      return {
        title: isPrimary ? t('beneficial-owners.beneficial-owner-you') : t('beneficial-owners.beneficial-owner'),
        content: (
          <Box display="flex" flexDirection="column" gap={6}>
            {items.map(({ text, subtext, textColor }: SectionItemProps) => (
              <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
            ))}
          </Box>
        ),
      };
    });
    return sections;
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const stopEditing = () => {
    setIsEditing(false);
  };

  return isEditing ? (
    <Section
      content={
        <BeneficialOwnersConfirm authToken={authToken} bos={bosQuery.data} config={config} onDone={stopEditing} />
      }
      IconComponent={IcoUserCircle24}
      testID="beneficial-owners"
      title={t('beneficial-owners.title')}
    />
  ) : (
    <MultiSection
      editLabel={t('summary.edit')}
      IconComponent={IcoUserCircle24}
      onEdit={startEditing}
      sections={getPreviewSections()}
      testID="beneficial-owners"
      title={t('beneficial-owners.title')}
    />
  );
};

export default BeneficialOwnersSection;

const LoadingBos = () => (
  <Box>
    <Stack flexDirection="column" gap={6} marginBottom={5}>
      <Shimmer height="28px" width="150px" />
      <Shimmer height="40px" width="70px" />
      <Shimmer height="40px" width="90px" />
      <Shimmer height="40px" width="50px" />
    </Stack>
  </Box>
);
