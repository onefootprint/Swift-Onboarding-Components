import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:uni_links/uni_links.dart';
import 'dart:convert';
import 'dart:convert';
import 'package:http/http.dart' as http;

part "config/constants.dart";
part "types/appearance.dart";
part 'types/configuration.dart';
part 'types/l10n.dart';
part "types/options.dart";
part "types/user_data.dart";
part "utils/create-url.dart";
part "utils/send_sdk_args.dart";
part "utils/logger.dart";

bool _initialUriIsHandled = false;

enum _ResultType { SUCCESS, CANCELED }

class _Footprint {
  Uri? _latestUri;
  Object? _err;
  StreamSubscription? _subscription;
  bool _isBrowserOpen = false;
  late _MyChromeSafariBrowser _browser;
  void Function(String token)? _handleComplete;
  void Function()? _handleCancel;
  _ResultType? _result;

  _Footprint() {
    _handleIncomingLinks();
    _handleInitialUri();
  }

  Future<void> init(FootprintConfiguration config, BuildContext context) async {
    _handleComplete = config.onComplete;
    _handleCancel = config.onCancel;
    _browser = _MyChromeSafariBrowser(onBrowserClosed: () {
      _isBrowserOpen = false;
      if (_result == null) {
        // User closed the browser without completing the flow
        _result = _ResultType.CANCELED;
        _handleCancel?.call();
      }
    }, onBrowserOpened: () {
      _isBrowserOpen = true;
      _result = null; // reset result
      _latestUri = null; // reset latestUri
    });
    try {
      var response = await _sendSdkArgs(config);
      var token = response.data;
      if (response.failed) {
        _logError();
      }
      if (token != null && !_isBrowserOpen) {
        var url = _createUrl(
          token: token,
          appearance: config.appearance,
          // TODO: Fix this. This comes from the tenant
          redirectUrl: "com.footprint.fluttersdk://example",
        );
        _openBrowser(url);
      }
    } catch (e) {
      // Handle the error
      print('An error occurred: $e');
    }
  }

  void _openBrowser(String url) {
    _browser.open(
        url: Uri.parse(url),
        options: ChromeSafariBrowserClassOptions(
            android: AndroidChromeCustomTabsOptions(
                shareState: CustomTabsShareState.SHARE_STATE_OFF),
            ios: IOSSafariOptions(
                barCollapsingEnabled: true,
                presentationStyle: IOSUIModalPresentationStyle.FORM_SHEET)));
  }

  void _handleIncomingLinks() {
    if (!kIsWeb) {
      _subscription = uriLinkStream.listen(
        (Uri? uri) {
          _processUri(uri);
        },
        onError: (Object err) {
          _handleError(err);
        },
      );
    }
  }

  void _processUri(Uri? uri) {
    if (uri == null || uri == _latestUri) return;
    _latestUri = uri;
    uri.queryParameters.forEach((key, value) {
      if (key == 'validation_token') {
        _result = _ResultType.SUCCESS;
        _handleComplete?.call(value);
      } else if (key == 'canceled') {
        _result = _ResultType.CANCELED;
        _handleCancel?.call();
      }
    });
    _browser.close();
    _err = null;
  }

  void _handleError(Object err) {
    _latestUri = null;
    _err = err is FormatException ? err : null;
  }

  Future<void> _handleInitialUri() async {
    if (!_initialUriIsHandled) {
      _initialUriIsHandled = true;
      try {
        final uri = await getInitialUri();
        _latestUri = uri;
      } on PlatformException {
        // Handle PlatformException
      } on FormatException catch (err) {
        _handleError(err);
      }
    }
  }
}

class _MyChromeSafariBrowser extends ChromeSafariBrowser {
  final VoidCallback onBrowserClosed;
  final VoidCallback onBrowserOpened;

  _MyChromeSafariBrowser(
      {required this.onBrowserOpened, required this.onBrowserClosed});

  @override
  void onOpened() {
    onBrowserOpened();
  }

  @override
  void onClosed() {
    onBrowserClosed();
  }
}

final footprint = _Footprint();
