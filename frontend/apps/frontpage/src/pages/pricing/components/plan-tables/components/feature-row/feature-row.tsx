import { useTranslation } from '@onefootprint/hooks';
import {
  Box,
  createFontStyles,
  LinkButton,
  media,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type FeatureRowType = {
  title: string;
  details?: string;
  moreDetailsCta?: string;
  cost?: number;
  unitFirst?: string;
  unitSecond?: string;
  labelRight?: string;
  hideBorderBottom?: boolean;
  backgroundColor?: boolean;
  handleClickTrigger?: () => void;
};

const FeatureRow = ({
  title,
  details,
  moreDetailsCta,
  cost,
  unitFirst,
  unitSecond,
  labelRight,
  backgroundColor,
  hideBorderBottom,
  handleClickTrigger,
}: FeatureRowType) => {
  const { t } = useTranslation('pages.pricing');

  return (
    <RowContainer
      data-border-bottom={hideBorderBottom ? 'no-border-bottom' : null}
      data-background-color={backgroundColor ? 'with-background-color' : null}
    >
      <Title>
        <Typography variant="label-2" as="h4">
          {title}
        </Typography>
        {details && (
          <Typography
            variant="body-4"
            color="tertiary"
            sx={{ marginBottom: 2, maxWidth: '300px' }}
          >
            {details}
          </Typography>
        )}
        {moreDetailsCta && (
          <LinkButton
            size="compact"
            onClick={handleClickTrigger}
            sx={{ textAlign: 'left' }}
          >
            {moreDetailsCta}
          </LinkButton>
        )}
      </Title>
      {labelRight ? (
        <LabelContainer>{labelRight}</LabelContainer>
      ) : (
        <CreditsAndUnits>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="label-2" as="p">
              {t('units.dollar')}
            </Typography>
            <Typography variant="label-2" as="p" sx={{ textAlign: 'right' }}>
              {cost?.toFixed(2)}
            </Typography>
          </Box>
          {unitFirst ? (
            <Typography variant="caption-1" color="tertiary">
              {`/ ${unitFirst}`}
            </Typography>
          ) : null}
          {unitSecond && (
            <Typography variant="caption-1" color="tertiary">
              {`/ ${unitSecond}`}
            </Typography>
          )}
        </CreditsAndUnits>
      )}
    </RowContainer>
  );
};

const RowContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    gap: ${theme.spacing[4]};

    &:is(:last-child, [data-border-bottom='no-border-bottom']) {
      border-bottom: none;
    }

    &[data-background-color='with-background-color'] {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
`;

const CreditsAndUnits = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: end;
    justify-content: center;
    text-align: right;
    white-space: nowrap;
    max-width: 160px;

    ${media.greaterThan('sm')`
        flex-direction: row;
        gap: ${theme.spacing[2]};
        text-align: left;
        align-items: center;
        width: 160px;
    `};
  `}
`;

const LabelContainer = styled.div`
  ${createFontStyles('label-2')};
  width: 160px;
  text-align: right;
  display: flex;
  justify-content: end;
  align-items: center;

  ${media.greaterThan('sm')`
     justify-content: center;
     align-items: center;
  `}
`;

export default FeatureRow;
