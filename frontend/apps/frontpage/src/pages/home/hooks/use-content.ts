import IcoDatabase24 from 'icons/ico/ico-database-24';
import IcoEye24 from 'icons/ico/ico-eye-24';
import IcoLock24 from 'icons/ico/ico-lock-24';
import IcoShield24 from 'icons/ico/ico-shield-24';

import article1 from '../../../../public/highlights/article-1.png';
import article2 from '../../../../public/highlights/article-2.png';
import article3 from '../../../../public/highlights/article-3.png';
import article4 from '../../../../public/highlights/article-4.png';
import article5 from '../../../../public/highlights/article-5.png';
import article6 from '../../../../public/highlights/article-6.png';
import investors from '../../../../public/images/investors-logo.png';
import testimonialAuthor from '../../../../public/images/testimonial-author.png';
import vaultMainArticle from '../../../../public/vault/article-vault.png';

const useContent = () => ({
  title: 'Footprint',
  navbar: {
    cta: 'Join the waitlist',
    logoAlt: "Footprint Logo's",
  },
  hero: {
    title: 'Frictionless Identity Verification',
    subtitle:
      "Onboard users with the click of a button. Offload handling sensitive data. Grow your user base quickly and securely with Footprint's one-click KYC and secure data vault.",
    cta: 'Join the waitlist',
    imgAlt: 'An image of Footprint System',
  },
  playground: {
    title: 'Bringing back trust.',
    subtitle: 'Why Footprint?',
    instructions: 'Hover the boxes, will ya? 😎',
    tooltips: [
      'Focus on your company, we’ll handle the PII',
      'KYC should be quicker than tying your shoes',
      'Faster than Persona',
      'We got you covered 😇',
      'Privacy is a human right',
      'Get more good actors in',
      'More secure than VGS',
      'Fraud detection should not be a moment in time',
      'Without biometrics, how do you know who you’re letting in?',
      'Accuracy and friction should not be a toggle',
      'Better dev experience than Alloy Automation',
    ],
  },
  qualities: {
    title: 'Accurate, portable, and secure user verification',
    subtitle: 'An enhanced experience',
    items: [
      {
        content:
          "Footprint’s privacy-preserving technology lets you satisfy KYC without needing to ever touch PII. Our secure PII vault protects your user's data while saving you time and money.",
        imgAlt: '',
        imgSrc: article1,
        title: 'Best-in-class security',
      },
      {
        content:
          'Footprint leverages cutting-edge biometric scans, liveness checks, and peer-to-peer verification to validate real people in real time. Our ecosystem keeps bad actors out while creating a seamless experience for real users.',
        imgAlt: '',
        imgSrc: article2,
        title: 'Unprecedented accuracy',
      },
      {
        content:
          'Footprint’s technology combines storage and verification. Our solution is up to 2x cheaper than traditional methods to verify and store PII because we are able to condense what today requires multiple tools into one.',
        imgAlt: '',
        imgSrc: article3,
        title: 'More functionality, less dollars',
      },
    ],
  },
  advantages: {
    title: 'A new, comprehensive approach to KYC & PII storage',
    subtitle: 'Our advantages',
    items: [
      {
        content:
          'Our one-click flow increases conversion by dramatically reducing time to account creation.',
        imgAlt: '',
        imgSrc: article4,
        title: 'Increased conversion',
      },
      {
        content:
          "With a few lines of code, you'll have KYC and PII Vaulting running in less than a day. It's that simple.",
        imgAlt: '',
        imgSrc: article5,
        title: 'Enhanced dev experience',
      },
      {
        content:
          'Say goodbye to needing separate KYC and Tokenization tools. We do both in-one, and pass along the savings.',
        imgAlt: '',
        imgSrc: article6,
        title: 'Decreased cost',
      },
    ],
  },
  testimonial: {
    author: {
      name: 'Joshua Browder',
      imgAlt: 'Picture of Joshua Browder',
      imgSrc: testimonialAuthor,
      role: 'Founder & CEO of DoNotPay',
    },
    content:
      'Footprint is the first identity company I’ve come across to make onboarding frictionless while handling both KYC and PII storage. I’m very excited to use the product to make our onboarding experience better at DoNotPay.',
  },
  vault: {
    title: 'Own the data, disown the risk.',
    subtitle: 'PII vault',
    description:
      "Our advanced PII vaults are built on top of secure Nitro Enclaves. Your customer's data is end-to-end encrypted: it can only be processed and read within our secure environment.",
    articles: {
      main: {
        Icon: IcoLock24,
        imgAlt: 'Image of a system',
        imgSrc: vaultMainArticle,
        title: "Privacy and security at your engineering team's fingertips",
        content:
          "Instead of building or buying your own data vaulting system, use Footprint's integrated vaulting to achieve strong cryptographic protection for your most sensitive data.",
      },
      secondaries: [
        {
          Icon: IcoEye24,
          title: 'Zero-trust by design',
          content:
            "Our permissioned API ensures only the right parties can access the data they're allowed to see. PII data is never stored in plaintext.",
        },
        {
          Icon: IcoDatabase24,
          title: 'Granular data access',
          content:
            'Limit the exposure, only access the bare minimum data you need. Nothing else leaves our enclave-backed vaults.',
        },
        {
          Icon: IcoShield24,
          title: 'Secure enclave backed',
          content:
            'Our system guarantees that all PII data is always encrypted to our network gapped, storage / cpu / memory isolated Nitro Enclaves.',
        },
      ],
    },
  },
  investors: {
    imgAlt: 'An image with all the investors',
    imgSrc: investors,
    subtitle: 'Backed by the best founders & investors',
    title: 'Our investors',
  },
  getStarted: {
    cta: 'Join our waitlist',
    subtitle:
      'Join our waitlist to get a chance at 1,000 free verifications when we launch out of private beta.',
    title: 'Ready to get started?',
  },
  footer: {
    copyright: 'One Footprint Inc.',
    links: [
      {
        href: 'https://onefootprint.com/privacy-policy',
        text: 'Privacy',
      },
      { href: 'https://twitter.com/footprint_hq', text: 'Twitter' },
    ],
  },
});

export default useContent;
