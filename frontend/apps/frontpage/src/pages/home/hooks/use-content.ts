import article1 from '../../../../public/images/article-1.png';
import article2 from '../../../../public/images/article-2.png';
import article3 from '../../../../public/images/article-3.png';
import article4 from '../../../../public/images/article-4.png';
import article5 from '../../../../public/images/article-5.png';
import article6 from '../../../../public/images/article-6.png';
import vaultMainArticle from '../../../../public/images/article-vault.png';
import investors from '../../../../public/images/investors-logo.png';
import testimonialAuthor from '../../../../public/images/testimonial-author.png';

const useContent = () => ({
  hero: {
    title: 'Frictionless Identity. High Integrity.',
    subtitle:
      'Footprint is a unified platform bringing together one-click KYC and a PII Vault.',
    cta: 'Join our waitlist',
  },
  playground: {
    title: 'Bringing back trust.',
    subtitle: 'Why Footprint?',
    tooltips: [
      'Focus on your company, we’ll handle the PII',
      'KYC should be quicker than tying your shoes',
      'Faster than Persona',
      'We got you covered 😇',
      'Privacy is a human right',
      'Better dev experience than Alloy Automation',
      'Get more good actors in',
      'Fraud detection should not be a moment in time',
      'Without biometrics, how do you know who you’re letting in?',
      'Accuracy and friction should not be a toggle',
      'More secure than VGS',
    ],
  },
  qualities: {
    title: 'Accurate, portable, and secure user verification',
    subtitle: 'A better, more secure experience',
    items: [
      {
        content:
          'Footprint’s privacy-preserving technology lets you satisfy KYC without needing to ever touch PII through our architecture. Utilize our PII vault which by default uses secure enclaves to protect data instead of building your own.',
        imgAlt: '',
        imgSrc: article1,
        title: 'Best-in-class security',
      },
      {
        content:
          'Footprint’s ecosystem creates a feedback loop on actors to increase accuracy through peer-to-peer verification, and our liveness scanning ensures only real people are applying. We use the most cutting edge biometric scans to ensure real people are making accounts',
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
        title: '12x faster',
      },
      {
        content:
          "With three lines of code, you'll have KYC and PII Vaulting running in less than a day. It's that simple.",
        imgAlt: '',
        imgSrc: article5,
        title: '10x developer experience',
      },
      {
        content:
          'Say goodbye to needing separate KYC and Tokenization tools. We do both in-one, and pass along the savings.',
        imgAlt: '',
        imgSrc: article6,
        title: '2x cheaper',
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
      "Our advanced PII vaults are built on top of secure Nitro Enclaves. Your customer's data is always end-to-end encrypted and can only be decrypted inside of the secure enclave.",
    articles: {
      main: {
        imgAlt: 'Image of a system',
        imgSrc: vaultMainArticle,
        title: "Privacy and security at your engineering team's fingertips",
        content:
          "Instead of building or buying your own data vaulting system, use Footprint's integrated vaulting to achieve strong cryptographic data protection for your most sensitive data.",
      },
      secondaries: [
        {
          title: 'Zero-trust by design',
          content:
            "Our permissioned API ensures only the right parties can access the data they're allowed to see. PII data is never stored in plaintext.",
        },
        {
          title: 'Granular data access',
          content:
            'Limit the exposure, only access the bare minimum data you need. Nothing else leaves our enclave-backed vaults.',
        },
        {
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
