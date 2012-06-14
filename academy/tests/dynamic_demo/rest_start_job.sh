echo "Starting job $1!"
curl -X POST -i http://localhost:9000/api/jobs/$1/start
