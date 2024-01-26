import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:uni_links/uni_links.dart';
import './types/configuration.dart';
import './utils/send_sdk_args.dart';
import './utils/create-url.dart';
import './utils/logger.dart';
export 'types/footprint_types.dart';

bool _initialUriIsHandled = false;

bool _initialUriIsHandled = false;

class Footprint {
  Uri? latestUri;
  Object? _err;
  StreamSubscription? subscription;
  bool isBrowserOpen = false;
  late final MyChromeSafariBrowser browser;

  Footprint() {
    handleIncomingLinks();
    handleInitialUri();

    browser = MyChromeSafariBrowser(onBrowserClosed: () {
      isBrowserOpen = false;
    });
  }

  Future<void> init(FootprintConfiguration config, BuildContext context) async {
    try {
      var response = await sendSdkArgs(config);
      var token = response.data;
      if (response.failed) {
        logError();
      }
      if (token != null && !isBrowserOpen) {
        var url = createUrl(
          token: token,
          appearance: config.appearance,
          // TODO: Fix tthis
          redirectUrl: "com.footprint.fluttersdk://example",
        );
        openBrowser(url);
      }
    } catch (e) {
      // Handle the error
      print('An error occurred: $e');
    }
  }

  void openBrowser(String url) {
    isBrowserOpen = true;
    browser.open(
        url: Uri.parse(url),
        options: ChromeSafariBrowserClassOptions(
            android: AndroidChromeCustomTabsOptions(
                shareState: CustomTabsShareState.SHARE_STATE_OFF),
            ios: IOSSafariOptions(
                barCollapsingEnabled: true,
                presentationStyle: IOSUIModalPresentationStyle.FORM_SHEET)));
  }

  void handleIncomingLinks() {
    if (!kIsWeb) {
      subscription = uriLinkStream.listen(
        (Uri? uri) {
          processUri(uri);
        },
        onError: (Object err) {
          handleError(err);
        },
      );
    }
  }

  void processUri(Uri? uri) {
    browser.close();
    latestUri = uri;
    _err = null;
    isBrowserOpen = false;
  }

  void handleError(Object err) {
    latestUri = null;
    _err = err is FormatException ? err : null;
  }

  Future<void> handleInitialUri() async {
    if (!_initialUriIsHandled) {
      _initialUriIsHandled = true;
      try {
        final uri = await getInitialUri();
        latestUri = uri;
      } on PlatformException {
        // Handle PlatformException
      } on FormatException catch (err) {
        handleError(err);
      }
    }
  }
}

class MyChromeSafariBrowser extends ChromeSafariBrowser {
  final VoidCallback onBrowserClosed;

  MyChromeSafariBrowser({required this.onBrowserClosed});

  @override
  void onClosed() {
    onBrowserClosed();
  }
}

final footprint = Footprint();
