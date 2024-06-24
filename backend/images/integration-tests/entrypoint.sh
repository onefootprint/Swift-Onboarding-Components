#!/usr/bin/env bash

# Run the given command such that the gnome-keyring is available.
# This is needed for footprint-dr tests.
CMD=$@
dbus-run-session -- bash -c "echo -n test | gnome-keyring-daemon --unlock && $CMD"
