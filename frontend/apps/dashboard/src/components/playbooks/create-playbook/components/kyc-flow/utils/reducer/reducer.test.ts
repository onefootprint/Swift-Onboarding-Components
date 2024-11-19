import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { getInitialValues, initialState } from './reducer';

describe('kyc flow reducer', () => {
  describe('when there is not playbook to overwrite', () => {
    it('should return the default values', () => {
      expect(getInitialValues()).toEqual(initialState);
    });
  });

  describe('when there is a playbook to overwrite', () => {
    it('should overwrite the name', () => {
      const playbook = getOnboardingConfiguration({ name: 'Identity verification' });
      expect(getInitialValues(playbook)).toMatchObject({
        data: {
          nameForm: {
            name: 'Identity verification',
          },
        },
      });
    });

    describe('template', () => {
      it('should overwrite when it has alpaca cipKind', () => {
        const playbook = getOnboardingConfiguration({ cipKind: 'alpaca' });
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            templateForm: {
              template: 'alpaca',
            },
          },
        });
      });

      it('should overwrite when it has apex cipKind', () => {
        const playbook = getOnboardingConfiguration({ cipKind: 'apex' });
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            templateForm: {
              template: 'apex',
            },
          },
        });
      });
    });

    describe('residency', () => {
      it('should set US residency when allowUsResidents is true', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({}),
          allowUsResidents: true,
          allowUsTerritoryResidents: true,
          internationalCountryRestrictions: [],
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            residencyForm: {
              residencyType: 'us',
              allowUsTerritories: true,
              isCountryRestricted: false,
              countryList: [],
            },
          },
        });
      });

      it('should set international residency when allowUsResidents is false', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({}),
          allowUsResidents: false,
          allowUsTerritoryResidents: false,
          internationalCountryRestrictions: ['CA', 'GB'],
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            residencyForm: {
              residencyType: 'international',
              allowUsTerritories: false,
              isCountryRestricted: true,
              countryList: ['CA', 'GB'],
            },
          },
        });
      });
    });

    describe('details', () => {
      describe('must collect data', () => {
        it('should set must collect data', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              mustCollectData: ['full_address', 'dob', 'phone_number', 'us_legal_status', 'ssn9'],
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                person: {
                  address: true,
                  dob: true,
                  email: true,
                  phoneNumber: true,
                  usLegalStatus: true,
                  ssn: {
                    collect: true,
                    kind: 'ssn9',
                    optional: false,
                  },
                  usTaxIdAcceptable: false,
                },
              },
            },
          });
        });

        it('should set SSN kind as SSN4', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              mustCollectData: ['full_address', 'dob', 'phone_number', 'us_legal_status', 'ssn4'],
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                person: {
                  ssn: {
                    collect: true,
                    kind: 'ssn4',
                    optional: false,
                  },
                },
              },
            },
          });
        });

        it('should set SSN kind as SSN4', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              mustCollectData: ['full_address', 'dob', 'phone_number', 'us_legal_status'],
              optionalData: ['ssn4'],
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                person: {
                  ssn: {
                    collect: true,
                    kind: 'ssn4',
                    optional: true,
                  },
                },
              },
            },
          });
        });

        it('should set SSN kind as SSN9', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              mustCollectData: ['full_address', 'dob', 'phone_number', 'us_legal_status'],
              optionalData: ['ssn9'],
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                person: {
                  ssn: {
                    collect: true,
                    kind: 'ssn9',
                    optional: true,
                  },
                },
              },
            },
          });
        });

        it('should set when it does not collect SSN', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              mustCollectData: ['full_address', 'dob', 'phone_number', 'us_legal_status'],
              optionalData: [],
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                person: {
                  address: true,
                  dob: true,
                  email: true,
                  phoneNumber: true,
                  usLegalStatus: true,
                  ssn: {
                    collect: false,
                    kind: 'ssn9',
                    optional: false,
                  },
                  usTaxIdAcceptable: false,
                },
              },
            },
          });
        });

        it('should set investor profile question when is defined', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              mustCollectData: ['full_address', 'dob', 'phone_number', 'investor_profile'],
              optionalData: [],
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                investor: {
                  collect: true,
                },
              },
            },
          });
        });
      });

      describe('docs', () => {
        it('should set when proof of address is defined', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              documentsToCollect: [{ kind: 'proof_of_address', data: { requiresHumanReview: true } }],
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                docs: {
                  poa: true,
                  requireManualReview: true,
                },
              },
            },
          });
        });

        it('should set when proof of ssn is defined', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              documentsToCollect: [{ kind: 'proof_of_ssn', data: { requiresHumanReview: true } }],
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                docs: {
                  possn: true,
                  requireManualReview: true,
                },
              },
            },
          });
        });

        it('should set when custom documents are defined', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              documentsToCollect: [
                {
                  kind: 'custom',
                  data: {
                    name: 'Proof of Lorem',
                    identifier: 'document.custom.*',
                    description: 'Lorem ipsum',
                    requiresHumanReview: true,
                    uploadSettings: 'prefer_upload',
                  },
                },
              ],
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                docs: {
                  custom: [
                    {
                      name: 'Proof of Lorem',
                      identifier: 'document.custom.*',
                      description: 'Lorem ipsum',
                      requiresHumanReview: true,
                      uploadSettings: 'prefer_upload',
                    },
                  ],
                },
              },
            },
          });
        });
      });

      describe('gov', () => {
        it('should set global definitions', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              documentTypesAndCountries: {
                countrySpecific: {},
                global: ['drivers_license'],
              },
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                gov: {
                  global: ['drivers_license'],
                },
              },
            },
          });
        });

        it('should set country definitions', () => {
          const playbook: OnboardingConfiguration = {
            ...getOnboardingConfiguration({
              kind: 'kyc',
              // @ts-expect-error this was deprecated but not removed
              mustCollectData: ['document_and_selfie'],
              documentTypesAndCountries: {
                countrySpecific: {
                  BR: ['drivers_license'],
                },
                global: [],
              },
            }),
          };
          expect(getInitialValues(playbook)).toMatchObject({
            data: {
              detailsForm: {
                gov: {
                  country: {
                    BR: ['drivers_license'],
                  },
                  selfie: true,
                },
              },
            },
          });
        });
      });
    });

    describe('required auth methods', () => {
      it('should set required auth methods from playbook config', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({
            requiredAuthMethods: ['email', 'phone'],
          }),
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            requiredAuthMethodsForm: {
              email: true,
              phone: true,
            },
          },
        });
      });

      it('should set auth methods to false when not included in playbook config', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({}),
          requiredAuthMethods: [],
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            requiredAuthMethodsForm: {
              email: false,
              phone: false,
            },
          },
        });
      });
    });

    describe('verification checks', () => {
      it('should set runKyc when it is enabled', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({
            verificationChecks: [{ kind: 'kyc', data: {} }],
          }),
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            verificationChecksForm: {
              runKyc: true,
            },
          },
        });
      });

      it('should set isNeuroEnabled when it is enabled', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({
            verificationChecks: [{ kind: 'neuro_id', data: {} }],
          }),
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            verificationChecksForm: {
              isNeuroEnabled: true,
            },
          },
        });
      });

      it('should set isSentilinkEnabled when it is enabled', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({
            verificationChecks: [{ kind: 'sentilink', data: {} }],
          }),
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            verificationChecksForm: {
              isSentilinkEnabled: true,
            },
          },
        });
      });

      it('should set ofac when it is enabled', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({
            verificationChecks: [
              {
                kind: 'aml',
                data: {
                  ofac: true,
                  continuousMonitoring: true,
                  adverseMedia: false,
                  pep: false,
                  matchKind: 'exact_name',
                },
              },
            ],
          }),
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            verificationChecksForm: {
              aml: {
                enhancedAml: true,
                ofac: true,
              },
            },
          },
        });
      });

      it('should set pep when it is enabled', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({
            verificationChecks: [
              {
                kind: 'aml',
                data: {
                  ofac: false,
                  continuousMonitoring: true,
                  adverseMedia: false,
                  pep: true,
                  matchKind: 'exact_name',
                },
              },
            ],
          }),
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            verificationChecksForm: {
              aml: {
                enhancedAml: true,
                pep: true,
              },
            },
          },
        });
      });

      it('should set adverseMedia and adverseMediaList when enabled', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({
            verificationChecks: [
              {
                kind: 'aml',
                data: {
                  ofac: false,
                  continuousMonitoring: true,
                  adverseMedia: true,
                  adverseMediaLists: ['financial_crime', 'fraud'],
                  pep: false,
                  matchKind: 'exact_name',
                },
              },
            ],
          }),
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            verificationChecksForm: {
              aml: {
                enhancedAml: true,
                adverseMedia: true,
                hasOptionSelected: true,
                adverseMediaList: {
                  financial_crime: true,
                  fraud: true,
                },
              },
            },
          },
        });
      });

      it('should set when matching method is fuzzy', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({
            verificationChecks: [
              {
                kind: 'aml',
                data: {
                  ofac: false,
                  continuousMonitoring: true,
                  adverseMedia: true,
                  adverseMediaLists: [],
                  pep: false,
                  matchKind: 'fuzzy_high',
                },
              },
            ],
          }),
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            verificationChecksForm: {
              aml: {
                enhancedAml: true,
                matchingMethod: {
                  kind: 'fuzzy',
                  fuzzyLevel: 'fuzzy_high',
                  exactLevel: 'exact_name',
                },
              },
            },
          },
        });
      });

      it('should set when matching method is exact', () => {
        const playbook: OnboardingConfiguration = {
          ...getOnboardingConfiguration({
            verificationChecks: [
              {
                kind: 'aml',
                data: {
                  ofac: false,
                  continuousMonitoring: true,
                  adverseMedia: true,
                  adverseMediaLists: [],
                  pep: false,
                  matchKind: 'exact_name_and_dob_year',
                },
              },
            ],
          }),
        };
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            verificationChecksForm: {
              aml: {
                enhancedAml: true,
                matchingMethod: {
                  kind: 'exact',
                  fuzzyLevel: 'fuzzy_low',
                  exactLevel: 'exact_name_and_dob_year',
                },
              },
            },
          },
        });
      });
    });
  });
});
