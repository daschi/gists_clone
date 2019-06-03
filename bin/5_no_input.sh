#!/bin/bash
# Take no inputs, and count (and print) the number of lines read from stdin.
i=0
while read line; do
    i=$((i + 1))
done < /dev/stdin
echo $i | >&1
