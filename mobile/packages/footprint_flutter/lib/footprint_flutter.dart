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
  Future<void> init(FootprintConfiguration config, BuildContext context) async {
    var response = await sendSdkArgs(config);

    if (response.failed) {
      logError();
    } else {
      var token = response.data;
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => MyApp(sdkToken: token)),
      );
    }
  }
}

class MyChromeSafariBrowser extends ChromeSafariBrowser {
  @override
  void onOpened() {}
  @override
  void onCompletedInitialLoad() {}
  @override
  void onClosed() {}
}

class MyApp extends StatefulWidget {
  final String? sdkToken;

  const MyApp({Key? key, this.sdkToken}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Uri? _latestUri;
  Object? _err;
  StreamSubscription? _sub;
  bool _isBrowserOpen = false;
  final ChromeSafariBrowser browser = MyChromeSafariBrowser();

  @override
  void initState() {
    super.initState();
    _handleIncomingLinks();
    _handleInitialUri();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isBrowserOpen && _latestUri == null) {
      _openBrowser();
    }

    return MaterialApp(
      title: 'Flutter Custom Tabs Example',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        brightness: Brightness.light,
      ),
      darkTheme: ThemeData(
        primarySwatch: Colors.blue,
        brightness: Brightness.dark,
      ),
      home: Scaffold(),
    );
  }

  void _openBrowser() {
    browser.open(
        url: Uri.parse(
            'https://id.onefootprint.com/?redirect_url=com.footprint.fluttersdk://example#${widget.sdkToken}'),
        options: ChromeSafariBrowserClassOptions(
            android: AndroidChromeCustomTabsOptions(
                shareState: CustomTabsShareState.SHARE_STATE_OFF),
            ios: IOSSafariOptions(barCollapsingEnabled: true)));
    _isBrowserOpen = true;
  }

  void _handleIncomingLinks() {
    if (!kIsWeb) {
      _sub = uriLinkStream.listen(
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
    if (!mounted) return;
    browser.close();
    setState(() {
      _latestUri = uri;
      _err = null;
      _isBrowserOpen = false;
    });
  }

  void _handleError(Object err) {
    if (!mounted) return;
    setState(() {
      _latestUri = null;
      _err = err is FormatException ? err : null;
    });
  }

  Future<void> _handleInitialUri() async {
    if (!_initialUriIsHandled) {
      _initialUriIsHandled = true;
      try {
        final uri = await getInitialUri();
        if (!mounted) return;
        setState(() => _latestUri = uri);
      } on PlatformException {
        // Handle PlatformException
      } on FormatException catch (err) {
        _handleError(err);
      }
    }
  }
}

final footprint = Footprint();
