#!/bin/bash

# Get the sync type from command line argument
SYNC_TYPE=${1:-users}
DIRECTION=${2:-db-to-firebase}

# Script paths
FIREBASE_TO_DB_SCRIPT="scripts/sync-firebase-to-db.js"
DB_TO_FIREBASE_SCRIPT="scripts/sync-db-to-firebase.js"

# Choose which script to run based on the direction
if [ "$DIRECTION" = "firebase-to-db" ]; then
  SCRIPT_PATH=$FIREBASE_TO_DB_SCRIPT
else
  SCRIPT_PATH=$DB_TO_FIREBASE_SCRIPT
fi

# Check if the script exists
if [ ! -f "$SCRIPT_PATH" ]; then
  echo "Error: Script $SCRIPT_PATH not found."
  exit 1
fi

echo "Running sync: $DIRECTION for $SYNC_TYPE"

# Execute the chosen script with the sync type
node $SCRIPT_PATH $SYNC_TYPE

exit $?