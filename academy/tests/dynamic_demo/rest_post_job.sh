#!/bin/bash
curl -X POST -H "Content-Type: application/json" -d @config.json -i http://localhost:9000/api/jobs
