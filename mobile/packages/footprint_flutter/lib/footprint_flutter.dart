import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:uni_links/uni_links.dart';
import './types/configuration.dart';
import './utils/send_sdk_args.dart';
import './utils/logger.dart';
export './types/configuration.dart';

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
      print("webview was closed");
      isBrowserOpen = false;
    });
  }

  Future<void> init(FootprintConfiguration config, BuildContext context) async {
    var response = await sendSdkArgs(config);
    if (response.failed) {
      print("failed");
      logError();
    } else {
      var token = response.data;
      print("isBrowserOpen ${isBrowserOpen}");
      print("token ${token}");

      if (!isBrowserOpen && token != null) {
        openBrowser(token);
      }
    }
  }

  void openBrowser(String token) {
    isBrowserOpen = true;
    browser.open(
        url: Uri.parse(
            'https://id.onefootprint.com/?redirect_url=com.footprint.fluttersdk://example#$token'),
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

  // @override
  // void onOpened() {}

  // @override
  // void onCompletedInitialLoad() {}

  @override
  void onClosed() {
    onBrowserClosed();
  }
}

final footprint = Footprint();
