class FootprintOptions {
  final bool? showCompletionPage;
  final bool? showLogo;

  FootprintOptions({
    this.showCompletionPage,
    this.showLogo,
  });

  Map<String, dynamic> toJson() {
    var map = {
      'show_completion_page': showCompletionPage,
      'show_logo': showLogo,
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
