import 'package:flutter/material.dart';
import 'package:footprint_flutter/footprint_flutter.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Builder(
        builder: (_context) => Scaffold(
          appBar: AppBar(
            title: const Text('Footprint Flutter Demo'),
          ),
          body: Container(
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: Colors.white,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    fixedSize: const Size.fromWidth(300),
                    padding: const EdgeInsets.all(12),
                  ),
                  onPressed: () {
                    Navigator.of(_context).push(
                      MaterialPageRoute(
                        builder: (_context) => const Hosted(),
                      ),
                    );
                  },
                  child: const Text("Footprint Hosted Flow"),
                ),
                const SizedBox(height: 8),
                ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      fixedSize: const Size.fromWidth(300),
                      padding: const EdgeInsets.all(12),
                    ),
                    onPressed: () {
                      Navigator.of(_context).push(
                        MaterialPageRoute(
                          builder: (_context) => const OnboardingComponents(),
                        ),
                      );
                    },
                    child: const Text("Footprint Onboarding Components")),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// Example of how to use the Footprint Flutter SDK to create a hosted verification flow
class Hosted extends StatelessWidget {
  const Hosted({Key? key}) : super(key: key);

  void handlePress(BuildContext context) {
    var bootstrapData = FootprintBootstrapData(
        email: "example@gmail.com",
        phoneNumber: "+15555550100",
        firstName: "Piip",
        middleName: "the",
        lastName: "Foot",
        dob: "01/01/1996",
        addressLine1: "123 Main St",
        addressLine2: "Unit 123",
        city: "Huntington Beach",
        state: "CA",
        country: "US",
        zip: "12345",
        ssn9: "343434344",
        ssn4: "1234",
        nationality: "US",
        usLegalStatus: "citizen",
        citizenships: ["US", "BD"],
        visaKind: "f1",
        visaExpirationDate: "05/12/2024",
        businessAddressLine1: "1 Main St",
        businessAddressLine2: "Apt 10",
        businessCity: "San Francisco",
        businessCorporationType: "llc",
        businessCountry: "US",
        businessDba: "Test",
        businessName: "Acme",
        businessPhoneNumber: "+15555550100",
        businessState: "CA",
        businessTin: "12-3456789",
        businessWebsite: "test.test.com",
        businessZip: "94107");

    var config = FootprintConfiguration(
        appearance: FootprintAppearance(
            variables: FootprintAppearanceVariables(buttonPrimaryBg: 'red')),
        l10n: FootprintL10n(language: FootprintSupportedLanguage.en),
        onCancel: () => print("onCancel"),
        onComplete: (String token) => print("onComplete $token"),
        publicKey:
            "pb_test_pZoERpZeZkGW7RRVeBawSm", // using kyb public key to test the business bootstrap data as well
        redirectUrl: "com.footprint.fluttersdk://example",
        bootstrapData: bootstrapData);
    footprint.init(config, context);
  }

  @override
  Widget build(BuildContext context) {
    return Builder(
      builder: (_context) => Scaffold(
        appBar: AppBar(
          title: const Text('Hosted flow'),
        ),
        body: Container(
          // center child
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            color: Colors.white,
          ),
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              fixedSize: const Size.fromWidth(120),
              padding: const EdgeInsets.all(12),
            ),
            onPressed: () => handlePress(context),
            child: const Text("Verify"),
          ),
        ),
      ),
    );
  }
}

// Example of how to use the Footprint Flutter Onboarding Components to create an onboarding flow
enum Steps {
  identify,
  basicInfo,
  address,
  ssn,
  complete;

  Steps getNextStep() {
    switch (this) {
      case Steps.identify:
        return Steps.basicInfo;
      case Steps.basicInfo:
        return Steps.address;
      case Steps.address:
        return Steps.ssn;
      case Steps.ssn:
        return Steps.complete;
      case Steps.complete:
        return Steps.complete;
    }
  }
}

class OnboardingComponents extends StatefulWidget {
  const OnboardingComponents({super.key});

  @override
  State<OnboardingComponents> createState() => _OnboardingComponentsState();
}

class _OnboardingComponentsState extends State<OnboardingComponents> {
  @override
  Widget build(BuildContext context) {
    return Builder(
      builder: (_context) => Scaffold(
        appBar: AppBar(
          title: const Text('Onboarding Components'),
        ),
        body: FootprintProvider(
          publicKey: "pb_test_MtqfcQk0Ezi5stVfnxHLPm",
          redirectUrl: "com.footprint.fluttersdk://example",
          sandboxOutcome: SandboxOutcome(
            overallOutcome: OverallOutcome.fail,
          ),
          sandboxId: "3jmlksncdsvbvsbevdsaww",
          // authToken: "utok_0DcG15SEkP4YAuMwOoEsBGrjrFK0OTuUei",
          child: const Kyc(),
        ),
      ),
    );
  }
}

class Kyc extends StatefulWidget {
  const Kyc({super.key});

  @override
  State<Kyc> createState() => _KycState();
}

class _KycState extends State<Kyc> {
  Steps currentStep = Steps.identify;
  String validationToken = '';

  // We get requirements, vaultData, and several other helpful data from the verification result
  // We can pass around the verification result to the next steps
  // However, we also can get some of those data from FootprintUtils which is what I am going to do in this example
  // This state variable is just for demonstration purposes
  VerificationResult? verificationResult;

  handleComplete({String? token}) {
    setState(() {
      currentStep = currentStep.getNextStep();
      validationToken = token ?? '';
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!footprintUtils(context).isReady) {
      return const Center(child: CircularProgressIndicator());
    }

    return Container(
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        color: Colors.white,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (currentStep == Steps.identify)
              Identify(
                handleAuthenticated: (VerificationResult? verificationResult) {
                  print(
                      "Validation Token: ${verificationResult?.validationToken}");
                  setState(() {
                    this.verificationResult = verificationResult;
                  });
                  handleComplete();
                },
                useAuthToken: false,
              ),
            if (currentStep == Steps.basicInfo)
              BasicData(onCompleted: () {
                handleComplete();
              }),
            if (currentStep == Steps.address)
              AddressData(onCompleted: () {
                handleComplete();
              }),
            if (currentStep == Steps.ssn)
              Ssn(onCompleted: (String token) {
                handleComplete(token: token);
              }),
            if (currentStep == Steps.complete)
              Container(
                padding: const EdgeInsets.all(20),
                alignment: Alignment.center,
                child: Column(
                  children: [
                    const Text("KYC Complete"),
                    const SizedBox(height: 12),
                    const Text("Validation Token:"),
                    const SizedBox(height: 8),
                    Text(validationToken),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                      },
                      child: const Text('Close demo'),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

InputDecoration inputDecoration(String hintText, {String? errorText}) {
  return InputDecoration(
      hintText: hintText,
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Colors.grey, width: 0.0),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Colors.red, width: 1.0),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Colors.black38, width: 1.0),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Colors.red, width: 1.0),
      ),
      contentPadding: const EdgeInsets.all(12),
      counterText: "",
      errorText: errorText);
}

class Identify extends StatefulWidget {
  const Identify(
      {super.key,
      required this.handleAuthenticated,
      required this.useAuthToken});

  final void Function(VerificationResult? verificationResult)
      handleAuthenticated;
  final bool useAuthToken;

  @override
  State<Identify> createState() => _IdentifyState();
}

class _IdentifyState extends State<Identify> {
  bool isChallengeCreated = false;
  ChallengeKind? challengeKind;
  var requiresAuth;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      footprintUtils(context).requiresAuth().then((response) {
        if (response.requiresAuth == false) {
          widget.handleAuthenticated(response.verificationResult);
        } else {
          setState(() {
            requiresAuth = response.requiresAuth;
          });
        }
      });
    });
  }

  void handleChallengeCreated(ChallengeKind challengeKind) {
    setState(() {
      this.challengeKind = challengeKind;
      isChallengeCreated = true;
    });
  }

  void handleVerfied(VerificationResult? verificationResult) {
    widget.handleAuthenticated(verificationResult);
  }

  @override
  Widget build(BuildContext context) {
    if (requiresAuth == null) {
      return const Center(child: CircularProgressIndicator());
    }

    if (widget.useAuthToken) {
      return FootprintOtp(
        buildOtp: (otpUtils) {
          if (!isChallengeCreated) {
            otpUtils.createAuthTokenBasedChallenge().then((challengeKind) {
              handleChallengeCreated(challengeKind);
            }).catchError(
              (_) {
                footprintUtils(context).launchIdentify(
                    onAuthenticated: (String validationToken) {
                  widget.handleAuthenticated(null);
                } // Don't pass email and phone number - it's going to use auth token
                    );
              },
              test: (err) => err is InlineOtpNotSupportedException,
            );
            return const Center(child: CircularProgressIndicator());
          }

          return Container(
            padding: const EdgeInsets.fromLTRB(48, 20, 48, 20),
            child: TextField(
              decoration: inputDecoration(
                "Enter OTP from ${challengeKind == ChallengeKind.sms ? 'SMS' : 'Email'}",
              ),
              onSubmitted: (value) {
                otpUtils
                    .verifyOtpChallenge(verificationCode: value)
                    .then((verificationResult) {
                  handleVerfied(verificationResult);
                });
              },
            ),
          );
        },
      );
    }

    return FootprintOtp(
      buildOtp: (otpUtils) {
        if (!isChallengeCreated) {
          return FootprintForm(
            createForm: (handleSubmit, props) {
              return Container(
                padding: const EdgeInsets.fromLTRB(48, 20, 48, 20),
                alignment: Alignment.center,
                child: Column(
                  children: [
                    Text("Identification",
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 16),
                    FootprintField(
                      name: DataIdentifier.idEmail,
                      createField: ({error}) {
                        return FootprintTextInput(
                          labelText: "Email",
                          decoration: inputDecoration("Email",
                              errorText: error?.message),
                        );
                      },
                      // NOTE: Alternatively, you can use the `child` property to pass in a widget (example below for phone number)
                    ),
                    const SizedBox(height: 12),
                    FootprintField(
                      name: DataIdentifier.idPhoneNumber,
                      child: FootprintTextInput(
                        labelText: "Phone Number",
                        decoration: inputDecoration("Phone Number"),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () {
                        handleSubmit();
                      },
                      child: const Text('Submit'),
                    ),
                  ],
                ),
              );
            },
            onSubmit: (formData) {
              otpUtils
                  .createEmailPhoneBasedChallenge(
                email: formData.email ?? '',
                phoneNumber: formData.phoneNumber ?? "",
              )
                  .then((challegeKind) {
                handleChallengeCreated(challegeKind);
              }).catchError(
                (_) {
                  footprintUtils(context).launchIdentify(
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    onAuthenticated: (String validationToken) {
                      widget.handleAuthenticated(null);
                    },
                  );
                },
                test: (err) => err is InlineOtpNotSupportedException,
              );
            },
          );
        }
        return Container(
          padding: const EdgeInsets.fromLTRB(48, 20, 48, 20),
          child: TextField(
            decoration: inputDecoration(
              "Enter OTP from ${challengeKind == ChallengeKind.sms ? 'SMS' : 'Email'}",
            ),
            onSubmitted: (value) {
              otpUtils
                  .verifyOtpChallenge(verificationCode: value)
                  .then((verificationResult) {
                handleVerfied(verificationResult);
              });
            },
          ),
        );
      },
    );
  }
}

class BasicData extends StatelessWidget {
  const BasicData({super.key, required this.onCompleted});

  final void Function() onCompleted;

  void handleComplete(BuildContext context, FormData formData) {
    footprintUtils(context)
        .vault(
      formData,
    )
        .then(
      (_) {
        // for demonstration purposes, let's also print the requirements after this step
        footprintUtils(context).getRequirements().then((requirements) {
          print("Requirements: $requirements");
          onCompleted();
        });
      },
    ).catchError(
      (err) {
        print("Save Error $err");
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final FormData? vaultData = footprintUtils(context).vaultData;

    return FootprintForm(
      initialData: {
        DataIdentifier.idFirstName: vaultData?.firstName,
        DataIdentifier.idMiddleName: vaultData?.middleName,
        DataIdentifier.idLastName: vaultData?.lastName,
        DataIdentifier.idDob: vaultData?.dob,
      },
      createForm: (handleSubmit, props) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Container(
            padding: const EdgeInsets.fromLTRB(48, 20, 48, 20),
            alignment: Alignment.center,
            child: Column(
              children: [
                Text("Basic Information",
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 16),
                FootprintField(
                  name: DataIdentifier.idFirstName,
                  child: FootprintTextInput(
                    labelText: "First Name",
                    decoration: inputDecoration("First Name"),
                  ),
                ),
                const SizedBox(height: 12),
                FootprintField(
                  name: DataIdentifier.idMiddleName,
                  child: FootprintTextInput(
                    labelText: "Middle Name (Optional)",
                    decoration: inputDecoration("Middle Name (Optional)"),
                  ),
                ),
                const SizedBox(height: 12),
                FootprintField(
                  name: DataIdentifier.idLastName,
                  child: FootprintTextInput(
                    labelText: "Last Name",
                    decoration: inputDecoration("Last Name"),
                  ),
                ),
                const SizedBox(height: 12),
                FootprintField(
                  name: DataIdentifier.idDob,
                  child: FootprintTextInput(
                    labelText: "Date of Birth",
                    decoration: inputDecoration("Date of Birth"),
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () {
                    handleSubmit();
                  },
                  child: const Text('Submit'),
                ),
              ],
            ),
          ),
        );
      },
      onSubmit: (formData) {
        handleComplete(context, formData);
      },
    );
  }
}

class AddressData extends StatelessWidget {
  const AddressData({super.key, required this.onCompleted});

  final void Function() onCompleted;

  void handleComplete(BuildContext context, FormData formData) {
    footprintUtils(context)
        .vault(
      formData,
    )
        .then(
      (_) {
        // for demonstration purposes, let's also print the requirements after this step
        footprintUtils(context).getRequirements().then((requirements) {
          print("Requirements: $requirements");
          onCompleted();
        });
      },
    ).catchError(
      (err) {
        print("Save Error $err");
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final FormData? vaultData = footprintUtils(context).vaultData;
    return FootprintForm(
      initialData: {
        DataIdentifier.idAddressLine1: vaultData?.addressLine1,
        DataIdentifier.idAddressLine2: vaultData?.addressLine2,
        DataIdentifier.idCity: vaultData?.city,
        DataIdentifier.idState: vaultData?.state,
        DataIdentifier.idZip: vaultData?.zip,
        DataIdentifier.idCountry: vaultData?.country,
      },
      createForm: (handleSubmit, props) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Container(
            padding: const EdgeInsets.fromLTRB(48, 20, 48, 20),
            alignment: Alignment.center,
            child: Column(
              children: [
                Text("Address Information",
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 16),
                FootprintField(
                  name: DataIdentifier.idAddressLine1,
                  child: FootprintTextInput(
                    labelText: "Address Line 1",
                    decoration: inputDecoration("Address Line 1"),
                  ),
                ),
                const SizedBox(height: 12),
                FootprintField(
                  name: DataIdentifier.idAddressLine2,
                  child: FootprintTextInput(
                    labelText: "Address Line 2",
                    decoration: inputDecoration("Address Line 2"),
                  ),
                ),
                const SizedBox(height: 12),
                FootprintField(
                  name: DataIdentifier.idCity,
                  child: FootprintTextInput(
                    labelText: "City",
                    decoration: inputDecoration("City"),
                  ),
                ),
                const SizedBox(height: 12),
                FootprintField(
                  name: DataIdentifier.idState,
                  child: FootprintTextInput(
                    labelText: "State",
                    decoration: inputDecoration("State"),
                  ),
                ),
                const SizedBox(height: 12),
                FootprintField(
                  name: DataIdentifier.idZip,
                  child: FootprintTextInput(
                    labelText: "Zip",
                    decoration: inputDecoration("Zip"),
                  ),
                ),
                const SizedBox(height: 12),
                FootprintField(
                  name: DataIdentifier.idCountry,
                  child: FootprintTextInput(
                    labelText: "Country",
                    decoration: inputDecoration("Country"),
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () {
                    handleSubmit();
                  },
                  child: const Text('Submit'),
                ),
              ],
            ),
          ),
        );
      },
      onSubmit: (formData) {
        handleComplete(context, formData);
      },
    );
  }
}

class Ssn extends StatelessWidget {
  const Ssn({super.key, required this.onCompleted});

  final void Function(String token) onCompleted;

  void handleComplete(BuildContext context, FormData formData) {
    var utilMethods = footprintUtils(context);
    utilMethods
        .vault(
      formData,
    )
        .then(
      (_) {
        utilMethods.process().then((validationToken) {
          onCompleted(validationToken);
        }).catchError(
          (err) {
            print("Process Error $err");
            utilMethods.handoff(
              onComplete: (token) {
                onCompleted(token);
              },
              onError: (err) {
                print("Handoff error $err");
              },
              onCancel: () {
                print("Handoff canceled");
              },
            );
          },
          test: (err) => err is InlineProcessException,
        );
      },
    ).catchError(
      (err) {
        print("Save Error $err");
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final FormData? vaultData = footprintUtils(context).vaultData;
    return FootprintForm(
      initialData: {
        DataIdentifier.idSsn9: vaultData?.ssn9,
      },
      createForm: (handleSubmit, props) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Container(
            padding: const EdgeInsets.fromLTRB(48, 20, 48, 20),
            alignment: Alignment.center,
            child: Column(
              children: [
                Text("SSN", style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 16),
                FootprintField(
                  name: DataIdentifier.idSsn9,
                  child: FootprintTextInput(
                    labelText: "SSN (full 9 digits)",
                    decoration: inputDecoration("SSN (full 9 digits)"),
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () {
                    handleSubmit();
                  },
                  child: const Text('Submit'),
                ),
              ],
            ),
          ),
        );
      },
      onSubmit: (formData) {
        handleComplete(context, formData);
      },
    );
  }
}
