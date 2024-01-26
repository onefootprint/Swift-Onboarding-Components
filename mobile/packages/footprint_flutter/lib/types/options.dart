class FootprintOptions {
  final bool? showCompletionPage;
  final bool? showLogo;

  FootprintOptions({
    this.showCompletionPage,
    this.showLogo,
  });

  Map<String, dynamic> toJson() {
    return {
      'show_completion_page': showCompletionPage,
      'show_logo': showLogo,
    };
  }
}
