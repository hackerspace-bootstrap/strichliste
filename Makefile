start:
	node server.js

database:
	node createDatabase.js

run-unit-tests:
	NODE_ENV=test mocha --timeout 5000 --R dot $(shell find tests/unit -name "*.tests.js")

run-integration-tests	:
	NODE_ENV=test mocha --timeout 5000 --R dot $(shell find tests/integration -name "*.tests.js")

install-packages:
	npm i

test:
	npm prune
	@make run-unit-tests
	@make run-integration-tests

cover:
	NODE_ENV=test ./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- tests/unit/*.tests.js --timeout 5000 --R dot
	NODE_ENV=test ./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- tests/integration/*.tests.js --timeout 5000 --R dot

make travis:
	npm outdated --depth=0
	@make install-packages
	@make test
	@make cover

setup:
	@make install-packages
	@make test
	@make database