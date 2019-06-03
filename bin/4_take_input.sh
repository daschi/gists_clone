#!/bin/bash
# Accept a positive integer as a command line argument, validate it, then write the numbers 1 to that number (one on each line) to stdout
echo $@
if [[ ! $# -eq 1 ]];
then
  echo $#
  echo "Must supply one positive integer" >&2
  exit 1
fi

if [[ $1 =~ ^[0-9]+$ ]];
then
  j=1
  while [ $j -le $1 ];
  do
    printf "$j\n"
    j=$(( j + 1 ))
  done
  exit 0
else
  echo "Must supply one positive integer" >&2
  exit 1
fi
