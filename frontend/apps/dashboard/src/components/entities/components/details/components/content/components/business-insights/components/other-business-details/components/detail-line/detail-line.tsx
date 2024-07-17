import {
  BusinessDetailPhoneNumber,
  BusinessDetailTin,
  BusinessDetailValue,
  BusinessDetailWebsite,
} from '@onefootprint/types';
import { Badge, Stack, Text } from '@onefootprint/ui';
import { ParseKeys } from 'i18next';
import kebabCase from 'lodash/kebabCase';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { BusinessDetail } from '../../../../types';

type DetailLineProps = {
  label: BusinessDetail;
  value: BusinessDetailValue;
};

const DetailLine = ({ label, value }: DetailLineProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });
  const isLabelWithVerification = [BusinessDetail.tin, BusinessDetail.phoneNumber, BusinessDetail.website].includes(
    label,
  );

  const renderValue = (): string => {
    if (!isLabelWithVerification) return value as string;
    if (label === BusinessDetail.tin) {
      return (value as BusinessDetailTin).tin;
    }
    if (label === BusinessDetail.phoneNumber) {
      return (value as BusinessDetailPhoneNumber).phone;
    }
    if (label === BusinessDetail.website) {
      return (value as BusinessDetailWebsite).url;
    }
    return value as string;
  };

  const renderVerificationBadge = () => {
    if (value && isLabelWithVerification) {
      const detailValue = value as BusinessDetailTin | BusinessDetailPhoneNumber | BusinessDetailWebsite;
      return (
        <Badge variant={detailValue.verified ? 'success' : 'error'}>
          {detailValue.verified ? t('tags.verified') : t('tags.not-verified')}
        </Badge>
      );
    }
    return null;
  };

  return (
    <Stack direction="row" width="100%" gap={3}>
      <Stack gap={3} align="center" maxWidth="50%">
        <Text variant="body-3" display="flex" gap={2} tag="div">
          {t(`details.${kebabCase(label)}` as ParseKeys<'common'>)}
        </Text>
        {renderVerificationBadge()}
      </Stack>
      <Line />
      <Text variant="body-3" maxWidth="50%" truncate display="flex">
        {renderValue()}
      </Text>
    </Stack>
  );
};

const Line = styled.div`
  ${({ theme }) => css`
    flex: 1;
    position: relative;

    &::after {
      content: '';
      bottom: 7px;
      left: 0;
      position: absolute;
      right: 0;
      border-bottom: ${theme.borderWidth[1]} dashed
        ${theme.borderColor.tertiary};
    }
  `}
`;

export default DetailLine;
