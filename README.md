# strichliste 

[![Build Status](https://travis-ci.org/hackerspace-bootstrap/strichliste.png)](https://travis-ci.org/hackerspace-bootstrap/strichliste)
[![Dependency Status](https://david-dm.org/hackerspace-bootstrap/strichliste/master.svg)](https://david-dm.org/hackerspace-bootstrap/strichliste/master)
[![devDependency Status](https://david-dm.org/hackerspace-bootstrap/strichliste/master/dev-status.svg)](https://david-dm.org/hackerspace-bootstrap/strichliste/master#info=devDependencies)

This module is the API for the strichliste app. Arbitrary clients can be implemented using this [API](#api-documentation)

__Clients__:

* [Web-Frontend](https://github.com/hackerspace-bootstrap/strichliste-web) ([demo](http://demo.strichliste.org/))

## TOC

* [First Steps](#first-steps)
* [Configuration](#configuration)
* [API Documentation](#api-documentation)

## First Steps

### Setup

#### Steps

##### Grap the latest [release](https://github.com/hackerspace-bootstrap/strichliste/releases)

##### install dependencies

````bash
$ make install-packages
````

##### run tests

````bash
$ make test
````

##### initialize database

creates the tables in the sqlitefile

````bash
$ make database
````

#### everything at once

For your convenience the following make target does all of the above steps at once:
````bash
$ make setup
````

#### start api server

Consider editing the configuration before starting the api server (see the [configuration](#configuration) section).
````bash
$ make start
````

## Configuration

The API server brings with it a default configuration which can be found in `/configuration/default.js`. This default can be used to setup your own configuration.
The server utilizes the [configurations](https://www.npmjs.org/package/configurations) module from npm which does a staged modification of configurations. Initially the default config is loaded and then subsequent modifications are applied.

You can add your own environment specific configuration by adding e.g. a `production.js` to the configurations folder. When the server is started with the node environment `NODE_ENV` set to `production`, the default config is enhanced by your production config. You don't have to specify each and every key from `default.js`, the defaults are retained.

You also can specify an external configuration sitting on an arbitrary place in your system by assigning it via a command line parameter:

````bash
$ node server.js --externalconfig=/etc/opt/strichliste/myconfig.js
````

### Configuration details

This section explains the content of the default.json which can be modified by you as you wish

````javascript
module.exports = {
    //the server runs on this port
    port: 8080,

    //details to the database
    database: {
        //the engine that should be used, until now only sqlite is supported
        type: 'SQLITE',

        //(arbitrary) options to the database engine
        options: {
            filename: 'data.sqlite'
        }
    },

    //strichliste announces actions via mqtt if desired
    mqtt: {
        //enable mqtt broadcasting
        enabled: false,

        //the mqtt service host
        host: 'localhost',

        // the mqtt service port
        port: 1883,

        //a list of topics that are broadcasted
        topics: {
            //gets broadcasted when someone adds a new transaction
            transactionValue: 'strichliste/transactionValue'
        }
    },

    //boundaries define values the apply to a user account or the transactions of auser
    boundaries: {
        account: {
            //the maximum amount that can be stored in a user's account (99999999 is equvalent to Inifinity)
            upper: 99999999,

            //the maximum dept a user can have
            lower: -50
        },
        transaction: {
            //the biggest transaction a user can do
            upper: 150,

            //the biggest money withdrawal a user can do
            lower: -20
        }
    },

    //logging
    logging: {
        //specifies if the api should log api access to the console
        active: true
    }
}
````

## API Documentation

Every API answer has the Content-Type `application/json`.
Data that is posted to the API is always JSON as well.

### Pagination

At some endpoints the following queryparameters can be used to control the pagination of lists:

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

The parameters and the list structure of the `Pagination` section are used in this endpoint.

#### POST /user

Creates a new user.
To create a new user a name has to be assigned via the following data structure:

````
{ "name": <string> }
````

Returns the status code 201 and the created user if the creation was successfull.

##### Errors

* 409: If a user already exists

#### GET /transaction

Lists the latest transactions.
Each transaction has the following data structure:
````
{
  id: <int>,
  userId: <int>,
  createDate: <DateTime>,
  value: <float>
}
````

Use the parameters and the list structure of the `Pagination` section to specify the list's structure.

#### GET /user/:userId

Returns one specific user.
The returned data structure correlates with the /user endpoint, additionally a list of the five last transactions is sent.
(See the /user/transaction section for a reference to the transaction data structure)

##### Errors

* 404: If the user could not be found

#### GET /user/:userId/transaction

Returns a list of transactions belonging to the user with the id :userId.
The structure of the transactions object corresponds to the definiton of the '/transaction' route

The parameters and the list structure of the `Pagination` section are used in this endpoint.

##### Errors

* 404: If the user could not be found

#### POST /user/:userId/transaction

Creates a new transaction for the user with the id `:userId`.
The following data structure describes the transaction:

````
{ value: <float> }
````

Returns the status code 201 if a transaction was successfully created.

##### Errors

* 400: If a transaction value is not a number or is zero.
* 403: If a transaction value is above or below a certain border (configurable) or the resulting user balance would exceed a certain border (configurable).
* 404: If the user has not been found


#### GET /user/:userId/transaction/:transactionId

Returns a certain transaction.
The data structure corresponds to that of the `/user/:userId/transaction` section.

##### Errors

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
