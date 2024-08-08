import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:footprint_flutter/src/models/configuration.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';
import 'package:footprint_flutter/src/utils/create_url.dart';
import 'package:footprint_flutter/src/utils/logger.dart';
import 'package:footprint_flutter/src/utils/send_sdk_args.dart';
import 'package:uni_links/uni_links.dart';

bool _initialUriIsHandled = false;

enum _ResultType { authCompleted, completed, canceled }

class Browser {
  Uri? _latestUri;
  bool _isBrowserOpen = false;
  late _MyChromeSafariBrowser _browser;
  void Function(String token)? _handleComplete;
  void Function()? _handleCancel;
  void Function(Object)? _handleErrorCallback;
  void Function({required String authToken, required String vaultingToken})?
      _handAuthComplete;
  late final OnboardingStep _step;
  _ResultType? _result;

  Browser() {
    _handleIncomingLinks();
    _handleInitialUri();
  }

  Future<void> init(
    FootprintConfiguration config,
    OnboardingStep step,
    BuildContext context,
  ) async {
    _handleComplete = config.onComplete;
    _handleCancel = config.onCancel;
    _handleErrorCallback = config.onError;
    _handAuthComplete = config.onAuthComplete;
    _step = step;
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
          _processUri(uri, _step);
        },
        onError: (Object err) {
          _handleError(err);
        },
      );
    }
  }

  void _processUri(Uri? uri, OnboardingStep step) {
    if (uri == null || uri == _latestUri) return;
    _latestUri = uri;
    final queryParameters = uri.queryParameters;
    if (_step == OnboardingStep.auth) {
      if (queryParameters.containsKey('auth_token') &&
          queryParameters.containsKey('components_vault_token')) {
        _result = _ResultType.authCompleted;
        _handAuthComplete?.call(
            authToken: queryParameters['auth_token']!,
            vaultingToken: queryParameters['components_vault_token']!);
      } else if (queryParameters.containsKey('canceled')) {
        _result = _ResultType.canceled;
        _handleCancel?.call();
      }
    } else if (_step == OnboardingStep.onboard) {
      if (queryParameters.containsKey('validation_token')) {
        _result = _ResultType.completed;
        _handleComplete?.call(queryParameters['validation_token']!);
      } else if (queryParameters.containsKey('canceled')) {
        _result = _ResultType.canceled;
        _handleCancel?.call();
      }
    }
    _browser.close();
  }

  void _handleError(Object err) {
    _handleErrorCallback?.call(err);
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
