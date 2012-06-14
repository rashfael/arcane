#!/bin/zsh
for file in ./examples/*.json; do;
  echo "Running $file ..."
  coffee run -f $file -o /dev/null > /dev/null
  if [[ $? -ne 0 ]]; then
    echo "FAILED: $file"
  else
	  echo "SUCCESS: $file"
  fi
  echo "\n"
done;
