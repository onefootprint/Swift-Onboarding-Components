import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:footprint_flutter/src/types/configuration.dart';
import 'package:footprint_flutter/src/utils/create_url.dart';
import 'package:footprint_flutter/src/utils/logger.dart';
import 'package:footprint_flutter/src/utils/send_sdk_args.dart';
import 'package:uni_links/uni_links.dart';

bool _initialUriIsHandled = false;

enum _ResultType { completed, canceled }

class _Footprint {
  Uri? _latestUri;
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
        _result = _ResultType.canceled;
        _handleCancel?.call();
      }
    }, onBrowserOpened: () {
      _isBrowserOpen = true;
      _result = null; // reset result
      _latestUri = null; // reset latestUri
    });

    var response = await sendSdkArgs(config);

    if (response.failed) {
      logError(response.error);
      return;
    }

    var token = response.data;
    if (token == null) {
      logError('Token is null');
      return;
    }

    if (_isBrowserOpen) {
      return;
    }

    var url = createUrl(token: token, config: config);
    _openWebView(url);
  }

  void _openWebView(String url) {
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
      uriLinkStream.listen(
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
        _result = _ResultType.completed;
        _handleComplete?.call(value);
      } else if (key == 'canceled') {
        _result = _ResultType.canceled;
        _handleCancel?.call();
      }
    });
    _browser.close();
  }

  void _handleError(Object err) {
    _latestUri = null;
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
