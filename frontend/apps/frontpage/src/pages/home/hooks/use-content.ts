const useContent = () => ({
  testimonial: {
    author: {
      name: 'Joshua Browder',
      imgAlt: 'Picture of Joshua Browder',
      imgSrc: '/images/testimonial-author.png',
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
        imgSrc: '/images/article-vault.png',
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
    imgSrc: '/images/investors-logo.png',
    subtitle: 'Backed by the best founders & investors',
    title: 'Our investors',
  },
  getStarted: {
    cta: 'Join the waitlist',
    subtitle:
      'Join our waitlist to be one of the first to get access to Footprint private beta.',
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
