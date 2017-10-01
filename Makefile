start:
	node server.js

database:
	node createDatabase.js

run-unit-tests:
	NODE_ENV=test ./node_modules/.bin/_mocha --timeout 10000 --reporter dot $(shell find tests/unit -name "*.tests.js")

run-integration-tests:
	NODE_ENV=test ./node_modules/.bin/_mocha --timeout 10000 --reporter dot $(shell find tests/integration -name "*.tests.js")

install-packages:
	npm i

test:
	npm prune
	rm -f testdata.sqlite
	@make run-unit-tests
	@make run-integration-tests

make travis:
	@make install-packages
	@make test

setup:
	@make install-packages
	@make test
	@make database
