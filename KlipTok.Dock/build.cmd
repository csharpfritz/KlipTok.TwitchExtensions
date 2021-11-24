start /b npm version %1
git add package.json
git commit -m "Updated and tagging version %1"
git tag %1
git push
git push --tags
docker build -t kliptok_extensionapi:%1 -t kliptok_extensionapi:latest -t ghcr.io/csharpfritz/kliptok_extensionapi:%1 -t ghcr.io/csharpfritz/kliptok_extensionapi:latest .
docker push ghcr.io/csharpfritz/kliptok_extensionapi:%1
docker push ghcr.io/csharpfritz/kliptok_extensionapi:latest