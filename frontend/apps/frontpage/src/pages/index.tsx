import React from 'react';
import styled from 'styled';

// import AuthorImage from '../../public/images/hero.png';
import Hero from '../components/hero';
import Navbar from '../components/navbar';
// import ReadyToStart from '../components/ready-to-start';
// import Testimonial from '../components/testimonial';

const Home = () => (
  <>
    <TopGradient>
      <Navbar ctaText="Join the waitlist" logoAltText="Footprint Logo's" />
      <Hero
        ctaText="Join the waitlist"
        imageAltText="An image of Footprint System"
        subtitleText="Footprint is a unified platform bringing together one-click KYC and a PII Vault."
        titleText="Frictionless Identity. High Integrity."
      />
    </TopGradient>
    {/* <Testimonial
      authorImage={AuthorImage}
      authorName="Joshua Browder"
      authorRole="Founder & CEO of DoNotPay"
      contentText="Footprint is the first identity company I’ve come across to make onboarding frictionless while handling both KYC and PII storage. I’m very excited to use the product to make our onboarding experience better at Do Not Pay."
    />
    <ReadyToStart
      ctaText="Join the waitlist"
      subtitleText="Footprint is replacing archaic identification processes with trust. We're in private beta and rolling out invites on a regular basis."
      titleText="Ready to get started?"
    /> */}
  </>
);

const TopGradient = styled.section`
  background: linear-gradient(
    180deg,
    #e1ddf9 0%,
    #e4e1fa 11.11%,
    #e8e4fa 22.22%,
    #ebe8fb 33.33%,
    #eeecfc 44.44%,
    #f2f0fc 55.56%,
    #f5f4fd 66.67%,
    #f8f7fe 77.78%,
    #fcfbfe 88.89%,
    #ffffff 100%
  );
`;

export default Home;
