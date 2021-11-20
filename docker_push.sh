docker build -t sebbyfay/auth:latest auth/
docker push sebbyfay/auth:latest

docker build -t sebbyfay/events:latest events/
docker push sebbyfay/events:latest

docker build -t sebbyfay/feeder:latest feeder/
docker push sebbyfay/feeder:latest

docker build -t sebbyfay/follows:latest follows/
docker push sebbyfay/follows:latest

docker build -t sebbyfay/goers:latest goers/
docker push sebbyfay/goers:latest

docker build -t sebbyfay/posts:latest posts/
docker push sebbyfay/posts:latest

docker build -t sebbyfay/statuses:latest statuses/
docker push sebbyfay/statuses:latest