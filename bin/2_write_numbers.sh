#!/bin/bash
j=1
while [ $j -le 10 ]
do
  printf "$j\n"
  j=$(( j + 1 ))
done
