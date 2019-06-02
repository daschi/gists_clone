#!/bin/bash
# Exit 0 if there’s a command line argument “quiet”, otherwise write an error message to stderr then exit 1.

for arg in $@
do
  if [ $arg == "--quiet" ]
  then
    exit 0
  else
    printf "This is an error message!" &>2
    exit 1
  fi
done
