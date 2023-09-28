import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronRight16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, CodeInline, createFontStyles } from '@onefootprint/ui';
import React, { useState } from 'react';

import type { ContentSchema } from '@/api-reference/api-reference.types';

import Description from '../../../../../description';
import Enum from '../../../enum';

export type PropertyProps = {
  isRequired?: boolean;
  level?: number;
  property: ContentSchema;
  title: string;
};

const Properties = ({
  isRequired,
  title,
  property,
  level = 0,
}: PropertyProps) => {
  const { t } = useTranslation('pages.api-reference');
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(currentExpanded => !currentExpanded);
  };

  return (
    <Box>
      <Box>
        <Header>
          <Button disabled={!property.properties} onClick={handleToggle}>
            <Connector
              aria-hidden
              data-has-children={!!property.properties}
              data-level={level}
            />
            {property.properties && <IcoChevronRight16 color="tertiary" />}
            <CodeInline disabled size="compact">
              {title}
            </CodeInline>
            <Separator>·</Separator>
            <Type>{property.type}</Type>
          </Button>
          {isRequired && <Required>{t('required')}</Required>}
        </Header>
        {property.description || property.enum ? (
          <Content data-level={level}>
            {property.description ? (
              <Description>{property.description}</Description>
            ) : null}
            {property.enum && <Enum enums={property.enum} />}
          </Content>
        ) : null}
      </Box>
      {property.properties && expanded && (
        <Child>
          {Object.entries(property.properties).map(
            ([childTitle, childProperty]) => (
              <Properties
                title={childTitle}
                property={childProperty}
                level={level + 1}
                isRequired={property.required?.includes(childTitle)}
              />
            ),
          )}
        </Child>
      )}
    </Box>
  );
};

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Required = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('caption-4')}
    color: ${theme.color.warning};
  `}
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;

  &:disabled {
    cursor: initial;
  }
`;

const Connector = styled.div`
  ${({ theme }) => css`
    background: ${theme.borderColor.tertiary};
    height: ${theme.borderWidth[1]};
    margin-left: calc(${theme.spacing[2]} * -1);
    width: ${theme.spacing[3]};

    &[data-has-children='false'] {
      width: ${theme.spacing[5]};
      margin-right: ${theme.spacing[3]};
    }

    &[data-level='1'] {
      width: ${theme.spacing[8]};
    }
  `}
`;

const Separator = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
    padding: 0 ${theme.spacing[2]};
  `}
`;

const Type = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')}
    color: ${theme.color.secondary};
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[9]};
    margin-top: ${theme.spacing[3]};
  `}
`;

const Child = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[4]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

export default Properties;
