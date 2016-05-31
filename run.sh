#!/bin/bash
source /data/env
docker rm -f login
docker build -t login .
docker run -d --name login \
	-e VIRTUAL_HOST="$LOGIN_VIRTUAL_HOST" \
	-e MONGO_URL="$LOGIN_MONGO_URL" \
	-e MEMCACHED_URL="$LOGIN_MEMCACHED_URL" \
	-v /data/volumes/login/data \
	login

