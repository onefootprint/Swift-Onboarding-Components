import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

import IconAccountTypes from './components/account-types';
import IconApplication from './components/icon-application';
import NavDivider from './components/nav-divider';
import IconRiskDisclosure from './components/risk-disclosure';
import IconSubmit from './components/submit';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <LayoutContainer>
    <Header>
      <CustomContainer>
        <Image
          alt="Webull logo"
          height={22}
          src="/webull/logo.svg"
          width={128}
        />
      </CustomContainer>
    </Header>
    <CustomContainer>
      <Nav>
        <IconApplication label="Application" />
        <NavDivider />
        <IconAccountTypes label="Account Types" />
        <NavDivider />
        <IconRiskDisclosure label="Risk Disclosure" />
        <NavDivider />
        <IconSubmit label="Submit" />
      </Nav>
      <Content>
        <StepContent>
          <Title>Verify Your Identity</Title>
          <Line>
            Webull Financial complies with all SEC and FINRA customer
            identification rules. We are required by the US Patriot Act to
            verify the identity of any person seeking to open a brokerage
            account. Your information is encrypted and securely transmitted.
          </Line>
          {children}
        </StepContent>
        <Faq>
          <h4>FAQ</h4>
          <details>
            <summary>
              I want to open a brokerage account on Webull, but I don`t have a
              driver`s license or state ID. Can I still open a brokerage
              account?
            </summary>
            <p>
              You can open your brokerage account with a valid US passport, too.
              You can also open an account if you have a valid E1, E2, E3, F1,
              H1B, H3, TN1, O1, or L1 and a valid SSN or ITIN.
            </p>
          </details>
          <details>
            <summary>Why do I have to enter my ID?</summary>
            <p>
              Webull complies with an SEC customer identification rule of the
              USA Patriot Act of 2001. This rule requires Webull to put
              procedures in place to verify the identity of any person seeking
              to open an account and to maintain records of their information.
              We do not intend to use this data for anything other than the
              fulfillment of our regulatory requirements and will take the
              security of all collected data very seriously.
            </p>
          </details>
        </Faq>
      </Content>
    </CustomContainer>
  </LayoutContainer>
);

const CustomContainer = styled.div`
  width: 1100px;
  margin: 0 auto;
`;

const LayoutContainer = styled.div`
  font-family: 'Open Sans';
`;

const Header = styled.header`
  align-items: center;
  box-shadow: 0 1px 5px 0 rgb(0 0 0 / 10%);
  display: flex;
  height: 80px;
  justify-content: center;
  width: 100%;
`;

const Nav = styled.nav`
  display: flex;
  margin: 20px 0 64px;
  justify-content: space-between;
  align-items: center;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 128px;
`;

const StepContent = styled.div``;

const Title = styled.h2`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Line = styled.h2`
  font-size: 18px;
  font-weight: 400;
  line-height: 27px;
  padding-top: 16px;
  margin-bottom: 40px;
`;

const Faq = styled.div`
  margin-top: 48px;
  opacity: 0.9;

  h4 {
    font-size: 18px;
    margin-bottom: 24px;
    margin-top: 12px;
  }

  details {
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 16px;
    line-height: 24px;

    &:not(:last-child) {
      padding-bottom: 16px;
      border-bottom: 1px solid #e1e3ea;
    }
  }

  p {
    margin-top: 16px;
  }
`;

export default Layout;
