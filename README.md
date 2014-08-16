# strichliste [![Build Status](https://travis-ci.org/hackerspace-bootstrap/strichliste.png)](https://travis-ci.org/hackerspace-bootstrap/strichliste)

backend service for the strichliste app.

## setup

### install dependencies

````bash
$ npm install
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

### start api server

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

##### Errors
* 409: If a user already exists

#### GET /user/:userId

Returns one specific user.
The returned data structure correlates with the /user endpoint, additionally a list of the five last transactions is sent.
(See the /user/transaction section for a reference to the transaction data structure)

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

#### POST /user/:userId/transaction
#### GET /user/:userId/transaction/:transactionId
#### GET /settings
#### GET /metrics
