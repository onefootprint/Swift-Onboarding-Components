enum OverallOutcome {
  fail("fail"),
  pass("pass"),
  manualReview("manual_review"),
  useRulesOutcome("use_rules_outcome"),
  stepUp("step_up");

  final String value;

  const OverallOutcome(this.value);

  static OverallOutcome fromString(String value) {
    switch (value) {
      case "fail":
        return OverallOutcome.fail;
      case "pass":
        return OverallOutcome.pass;
      case "manual_review":
        return OverallOutcome.manualReview;
      case "use_rules_outcome":
        return OverallOutcome.useRulesOutcome;
      case "step_up":
        return OverallOutcome.stepUp;
      default:
        throw Exception("Invalid value $value");
    }
  }

  @override
  String toString() {
    return value;
  }
}

enum IdDocOutcome {
  pass("pass"),
  fail("fail"),
  real("real");

  final String value;

  const IdDocOutcome(this.value);

  static IdDocOutcome fromString(String value) {
    switch (value) {
      case "pass":
        return IdDocOutcome.pass;
      case "fail":
        return IdDocOutcome.fail;
      case "real":
        return IdDocOutcome.real;
      default:
        throw Exception("Invalid value $value");
    }
  }

  @override
  String toString() {
    return value;
  }
}

class SandboxOutcome {
  final OverallOutcome? overallOutcome;
  final IdDocOutcome? idDocOutcome;

  SandboxOutcome({
    this.overallOutcome,
    this.idDocOutcome,
  });

  factory SandboxOutcome.fromJson(Map<String, dynamic> json) {
    return SandboxOutcome(
      overallOutcome: OverallOutcome.fromString(json['overall_outcome']),
      idDocOutcome: IdDocOutcome.fromString(json['id_doc_outcome']),
    );
  }
}
