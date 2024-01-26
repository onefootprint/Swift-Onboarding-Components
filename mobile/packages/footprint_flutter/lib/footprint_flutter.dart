library footprint_flutter;

import 'package:flutter/material.dart';
import './types/configuration.dart';
import './utils/send_sdk_args.dart';
import './utils/logger.dart';
export './types/configuration.dart';

class Footprint {
  Future<void> init(FootprintConfiguration config, BuildContext context) async {
    var response = await sendSdkArgs(config);

    if (response.failed) {
      // TODO: Log
      logError();
    } else {
      print(response.data);
    }
  }
}

final footprint = Footprint();
