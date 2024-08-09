import { IcoChevronDown16, IcoShield16 } from '@onefootprint/icons';
import { CodeInline, Divider, createFontStyles } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import dashboardApiDocs from '@/api-reference/assets/dashboard-api-docs.json';
import hostedApiDocs from '@/api-reference/assets/hosted-api-docs.json';
import publicApiDocs from '@/api-reference/assets/public-api-docs.json';
import { SecurityTypes } from 'src/pages/api-reference/api-reference.types';

export type SecurityProps = {
  type: SecurityTypes;
};

const securityComponentContent = {
  ...publicApiDocs?.components?.securitySchemes,
  ...hostedApiDocs?.components?.securitySchemes,
  ...dashboardApiDocs?.components?.securitySchemes,
};

const Security = ({ type }: SecurityProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const [isExpanded, setIsExpanded] = useState(false);
  if (type === SecurityTypes.apiKey) {
    // We don't need to display any information for API key auth on the public docs site.
    return null;
  }
  return (
    <Container>
      <Title onClick={() => setIsExpanded(!isExpanded)}>
        <Content>
          <IcoShield16 />
          {t('auth-method')}: {type}
        </Content>
        <IconBounds isExpanded={isExpanded}>
          <IcoChevronDown16 color="tertiary" />
        </IconBounds>
      </Title>
      {isExpanded && (
        <>
          <Divider />
          <Description>
            {securityComponentContent[type].description}
            <br />
            <Example>
              {t('example')}: <CodeInline disabled>{`${securityComponentContent[type].name}: 1234`}</CodeInline>
            </Example>
          </Description>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-4')}
    color: ${theme.color.secondary};
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    overflow: hidden;
    user-select: none;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      border-color: ${theme.borderColor.primary};
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

const Description = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.secondary};
    padding: ${theme.spacing[5]} ${theme.spacing[5]};
  `}
`;

const Example = styled.span`
  ${({ theme }) => css`
    display: block;
    margin-top: ${theme.spacing[2]};
  `}
`;

const IconBounds = styled.div<{ isExpanded: boolean }>`
  ${({ theme, isExpanded }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${theme.spacing[6]};
    height: ${theme.spacing[6]};
    border-radius: 50%;
    background-color: ${theme.backgroundColor.secondary};
    transition: all 0.2s ease-in-out;
    transform: rotate(${isExpanded ? '180deg' : '0deg'});
  `}
`;

export default Security;
