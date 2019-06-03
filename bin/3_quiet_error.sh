#!/bin/bash
# Exit 0 if there’s a command line argument “quiet”, otherwise write an error message to stderr then exit 1.
set -e
set -x

if [[ $# -lt 1 ]];
then
  echo "This is an error message!" >&2
  exit 1
fi

for arg in $@;
do
  if [[ $arg == "--quiet" ]];
  then
    echo "You passed --quiet"
    exit 0
  fi
done

echo "This is an error message!" >&2
exit 1
