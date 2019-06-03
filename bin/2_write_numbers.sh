#!/bin/bash
# Write the numbers 1 to 10 (one on each line) to stdout then exit 0.

j=1
while [ $j -le 10 ]
do
  printf "$j\n"
  j=$(( j + 1 ))
done
