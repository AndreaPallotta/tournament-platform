#!/usr/bin/env bash

PARENT_DIR=$(dirname "$(dirname "$0")")
FILENAME="$1"
OUTPUT_FILE="formatted_blacklisted_ips.json"
PROTOCOL="tcp"
FROM_PORT=0
TO_PORT=65535

if [[ -z "$1" ]]; then
    FILENAME="blacklisted_ips.txt"
fi

if [[ ! -f "$PARENT_DIR/$FILENAME" ]]; then
    echo "File not found: $PARENT_DIR/$FILENAME"
    exit 1
fi

echo "[" > $OUTPUT_FILE

while read ip; do
  if [[ $ip == *"/"* ]]; then
    echo "  {" >> $OUTPUT_FILE
    echo "    \"IpProtocol\": \"tcp\"," >> $OUTPUT_FILE
    echo "    \"FromPort\": 0," >> $OUTPUT_FILE
    echo "    \"ToPort\": 65535," >> $OUTPUT_FILE
    echo "    \"IpRanges\": [" >> $OUTPUT_FILE
    echo "      {" >> $OUTPUT_FILE
    echo "        \"CidrIp\": \"$ip\"" >> $OUTPUT_FILE
    echo "      }" >> $OUTPUT_FILE
    echo "    ]" >> $OUTPUT_FILE
    echo "  }," >> $OUTPUT_FILE
  else
    echo "  {" >> $OUTPUT_FILE
    echo "    \"IpProtocol\": \"tcp\"," >> $OUTPUT_FILE
    echo "    \"FromPort\": 0," >> $OUTPUT_FILE
    echo "    \"ToPort\": 65535," >> $OUTPUT_FILE
    echo "    \"IpRanges\": [" >> $OUTPUT_FILE
    echo "      {" >> $OUTPUT_FILE
    echo "        \"CidrIp\": \"$ip/32\"" >> $OUTPUT_FILE
    echo "      }" >> $OUTPUT_FILE
    echo "    ]" >> $OUTPUT_FILE
    echo "  }," >> $OUTPUT_FILE
  fi
done < "$PARENT_DIR/$FILENAME"

sed -i '$ s/,$//' $OUTPUT_FILE

echo "]" >> $OUTPUT_FILE