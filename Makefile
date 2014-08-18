start:
	@node server.js

database:
	@node createDatabase.js

run-unit-tests:
	@NODE_ENV=test mocha $(shell find tests/unit -name "*.tests.js")

run-integration-tests:
	@NODE_ENV=test mocha $(shell find tests/integration -name "*.tests.js")

test:
	make run-unit-tests
	make run-integration-tests