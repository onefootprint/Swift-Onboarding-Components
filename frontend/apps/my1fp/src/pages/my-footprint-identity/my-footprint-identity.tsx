import React, { Suspense, useState } from 'react';
import styled, { css } from 'styled-components';
import { Accordion, Box, Container, Divider } from 'ui';

import Footer from './components/footer';
import Header from './components/header';
import useSections, { Section } from './hooks/use-sections';

const MyFootprintIdentity = () => {
  const sections = useSections();
  const [activeAccordion, setActiveAccordion] = useState<null | number>(null);

  const handleAccordionChange = (accordionId: number) => () => {
    if (activeAccordion === accordionId) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(accordionId);
    }
  };

  const renderSectionGroup = (sectionGroup: Section[]) => (
    <SectionContainer>
      {sectionGroup.map(({ id, title, iconComponent, Content }) => (
        <Accordion
          iconComponent={iconComponent}
          key={id}
          onChange={handleAccordionChange(id)}
          open={activeAccordion === id}
          title={title}
        >
          <Suspense fallback={null}>
            <Content />
          </Suspense>
        </Accordion>
      ))}
    </SectionContainer>
  );

  return (
    <PageContainer>
      <Content>
        <Header />
        <Container>
          <div>
            {renderSectionGroup(sections.top)}
            <Box sx={{ marginY: 8 }}>
              <Divider />
            </Box>
            {renderSectionGroup(sections.bottom)}
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
      margin-bottom: ${theme.spacing[4]}px;
    }
  `}
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-content: space-between;
`;

const SectionContainer = styled.div`
  ${({ theme }) => css`
    > div:not(:last-child) {
      margin-bottom: ${theme.spacing[4]}px;
    }
  `}
`;

export default MyFootprintIdentity;
