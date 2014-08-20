start:
	@node server.js

database:
	@node createDatabase.js

run-unit-tests:
	@NODE_ENV=test mocha $(shell find tests/unit -name "*.tests.js") --timeout=5000 --reporter=dot

run-integration-tests:
	@NODE_ENV=test mocha $(shell find tests/integration -name "*.tests.js") --timeout=5000 --reporter=dot

install-packages:
	@npm i
	@npm prune

test:
	@make install-packages
	@make run-unit-tests
	@make run-integration-tests

setup:
	@make install-packages
	@make test
	@make database