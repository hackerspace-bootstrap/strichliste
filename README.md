# strichliste [![Build Status](https://travis-ci.org/hackerspace-bootstrap/strichliste.png)](https://travis-ci.org/hackerspace-bootstrap/strichliste)

backend service for the strichliste app.

## setup

### install dependencies

````bash
$ make install-packages
````

### run tests

````bash
$ make test
````

### initialize database

creates the tables in the sqlitefile

````bash
$ make database
````

### everything at once

runs all of the above mentioned steps at once:
````bash
$ make setup
````

## start api server

````bash
$ make start
````

## API

Every API answer has the Content-Type `application/json`.
Data that is posted to the API is always JSON as well.

### Pagination

At some endpoints, the following parameters can be assigned to control pagination of lists:

* `limit`: the number of items to show
* `offset`: the number of the first item in the list

Each of the paginated lists are of the following data structure:

````
{
  overallCount: <int>,
  limit: <int>,
  offset: <int>,
  entries: [<entry]
}
````

### Endpoints

#### GET /user

Returns the complete list of all users.
Each user is described via the following data structure:
````
{
  "id": <int>,
  "name": <string>,
  "balance": <float>,
  "lastTransaction": <dateTime>
}
````

The parameters of the section `Pagination` can be used on this endpoint.
The list structure of the `Pagination` section does *NOT* apply.

#### POST /user

Creates a new user.
To create a new user a name has to be assigned via the following data structure:

````
{ "name": <string> }
````

Returns the status code 201 if a user was successfully created.

##### Errors

* 409: If a user already exists

#### GET /user/:userId

Returns one specific user.
The returned data structure correlates with the /user endpoint, additionally a list of the five last transactions is sent.
(See the /user/transaction section for a reference to the transaction data structure)

#### Errors

* 404: If the user could not be found

#### GET /user/:userId/transaction

Returns a list of transactions belonging to the user with the id :userId.
Each transaction has the following data structure:
````
{
  id: <int>,
  userId: <int>,
  createDate: <DateTime>,
  value: <float>
}
````

The parameters and the list structure of the `Pagination` section are used in this endpoint.

#### Errors

* 404: If the user could not be found

#### POST /user/:userId/transaction

Creates a new transaction for the user with the id `:userId`.
The following data structure describes the transaction:

````
{ value: <int> }
````

Returns the status code 201 if a transaction was successfully created.

#### Errors

* 400: If a transaction value is not a number or is zero.
* 403: If a transaction value is above or below a certain border (configurable) or the resulting user balance would exceed a certain border (configurable).
* 404: If the user has not been found


#### GET /user/:userId/transaction/:transactionId

Returns a certain transaction.
The data structure corresponds to that of the `/user/:userId/transaction` section.

#### Errors

* 404: If the user or the transaction could not be found

#### GET /settings

Returns the configured settings:

````
{
  boundaries: {
    upper: <int>
    lower: <int>
  }
}
````

For more details on the configuration see the `configuration` section.

#### GET /metrics

Returns metrics concerning the registered users and their transactions.
Data structure:

````
{
  overallBalance: <float>,
  countTransactions: <int>,
  contUsers: <int>,
  avgBalance: <float>,
  days: [
    {
      date: <Date>,
      overallNumber: <int>,
      distinctUsers: <int>,
      dayBalance: <float>,
      dayBalancePositive: <float>,
      dayBalanceNegative: <float>
    }
  ]
}
````