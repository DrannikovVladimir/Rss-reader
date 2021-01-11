develop:
	npx webpack serve

install:
	npm ci

start:
	npm run start

build:
	rm -rf dist
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .
