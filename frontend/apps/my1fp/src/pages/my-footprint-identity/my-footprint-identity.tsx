import { useTranslation } from '@onefootprint/hooks';
import { Accordion, Container, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import Footer from './components/footer';
import Header from './components/header';
import useSections from './hooks/use-sections';

const MyFootprintIdentity = () => {
  const { t } = useTranslation('pages.my-footprint-identity');
  const sections = useSections();
  const [activeAccordion, setActiveAccordion] = useState<null | number>(null);

  const handleAccordionChange = (accordionId: number) => () => {
    if (activeAccordion === accordionId) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(accordionId);
    }
  };

  return (
    <PageContainer>
      <Content>
        <Header />
        <Container sx={{ maxWidth: '680px' }}>
          <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
            {t('title')}
          </Typography>
          <div>
            <SectionContainer>
              {sections.map(({ id, title, iconComponent, Content }) => (
                <Accordion
                  iconComponent={iconComponent}
                  key={id}
                  onChange={handleAccordionChange(id)}
                  open={activeAccordion === id}
                  title={title}
                >
                  <Content />
                </Accordion>
              ))}
            </SectionContainer>
          </div>
        </Container>
      </Content>

      <Footer />
    </PageContainer>
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    > :not(:last-child) {
      margin-bottom: ${theme.spacing[4]};
    }
  `}
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-content: space-between;
  background: linear-gradient(180deg, #fafffb 0%, #ffffff 100%);
`;

const SectionContainer = styled.div`
  ${({ theme }) => css`
    > div:not(:last-child) {
      margin-bottom: ${theme.spacing[4]};
    }
  `}
`;

export default MyFootprintIdentity;
