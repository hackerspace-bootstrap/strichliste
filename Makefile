start:
	@node server.js

database:
	@node createDatabase.js

run-unit-tests:
	@NODE_ENV=test mocha --reporter=spec $(shell find tests/unit -name "*.tests.js")

run-integration-tests: testprepare
	@NODE_ENV=test mocha --reporter=spec $(shell find tests/integration -name "*.tests.js")

testprepare:
	@rm -f testdata.sqlite
	@node createDatabase.js --filename=testdata.sqlite

test:
	make run-unit-tests
	make run-integration-tests