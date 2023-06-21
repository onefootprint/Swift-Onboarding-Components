import { useToggle, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  DocumentDI,
  Entity,
  isVaultDataImage,
  VaultValue,
} from '@onefootprint/types';
import {
  Fade,
  LinkButton,
  SegmentedControl,
  Typography,
} from '@onefootprint/ui';
import Image from 'next/image';
import React, { useState } from 'react';

import useEntityVault from '@/entities/hooks/use-entity-vault';

type DocumentFieldProps = {
  label: string;
  dis: DocumentDI[];
  entity: Entity;
};

const getSrc = (value: VaultValue) => {
  if (isVaultDataImage(value)) {
    return value.src;
  }
  return '';
};

const DocumentField = ({ label, dis, entity }: DocumentFieldProps) => {
  const { t } = useTranslation('di');
  const { data } = useEntityVault(entity.id, entity);
  const options = dis
    .map(di => ({ label: t(di), value: getSrc(data?.[di]) }))
    .filter(option => option.value);
  const [segment, setSegment] = useState<string>(options[0].value);
  const [isVisible, show, hide] = useToggle(false);

  return (
    <Container role="row" aria-label={label}>
      <Inner>
        <LabelContainer>
          <Typography variant="body-3" color="tertiary" as="label">
            {label}
          </Typography>
        </LabelContainer>
        {isVisible ? (
          <LinkButton onClick={hide}>Hide</LinkButton>
        ) : (
          <LinkButton onClick={show}>Show</LinkButton>
        )}
      </Inner>
      <Fade isVisible={isVisible} from="center" to="center">
        <Preview>
          {options.length > 1 && (
            <SegmentedControl
              aria-label={t('segment-control')}
              onChange={setSegment}
              options={options}
              value={segment}
            />
          )}
          {options.map(option =>
            option.value === segment ? (
              <StyledImage
                alt={option.label}
                height={350}
                key={option.label}
                src={option.value}
                width={350}
              />
            ) : null,
          )}
        </Preview>
      </Fade>
    </Container>
  );
};
const Container = styled.div``;

const Inner = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: column;
  `};
`;

const Preview = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[5]};
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[6]};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[6]};
  `};
`;

const StyledImage = styled(Image)`
  object-fit: contain;
`;

export default DocumentField;
