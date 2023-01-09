## Using Docker

The idea is to create a clone of your app to test with. The database container clone will have its own port and data. The app clone is only necessary if your save the environment variables in your app instead of using them directly. Otherwise, reusing the same app container would be fine.

With the cloned database, you can make connections to it like your normal database, but in each test you would:
1. Clear the data from the tables used in the query you're testing
2. Insert the data you need for the test

### With Compose

#### docker-compose.yaml
If we have a service for our application, which contains our tests, and another for our database, we want to duplicate these services in the Compose file.

When calling `docker-compose up` to start services like normal, we want to avoid starting these by adding them to a unique profile we'll call "db-test".

```
profiles:
  - db-test
```

We'll also make sure the database is running on ports different than the default

```
command: ["--port=3307", "--mysqlx-port=33070"]
```

We also create a clone of our app just for testing the database, adding the `db-test` profile as before and changing our environment variables for connecting to the test database.

#### Start/Create the Services
Start the test database.
```
sudo docker-compose up --detach test-db
```

Open a shell using the test app.
```
sudo docker-compose run test-db-app sh
```
Keeping it up and open to a shell allows running the test scripts as many times as you want without needing to restart the containers.

Run tests
```
node src/test.js
```

### Without Compose

#### Start/Create the database container
The first script tells docker to either start the test database container, or create it if it doesn't exist.

```
sudo docker start db-test || sudo docker run \
  --network sql-unit-tester_default \
  -e MYSQL_DATABASE=test_db \
  --env-file=../db/.env \
  --name db-test \
  -v \"$(cd .. && pwd)\"/db/init.sql:/docker-entrypoint-initdb.d/init.sql \
  mysql \
  --port=3307 \
  --mysqlx-port=33070
```

Line by line:

```
--network sql-unit-tester_default
```
adds it to the default network the other containers are on, so the app container can connect to it.

```
-e MYSQL_DATABASE=test_db
```
For the official MySQL Docker container, this creates the schema on the first run, and is ignored on subsequent runs.

```
--env-file=../db/.env
```
The official MySQL Docker container also needs a `MYSQL_ROOT_PASSWORD` variable set for the first run, which is in the given file

```
--name db-test
```
We give it a name to refer to later

```
-v \"$(cd .. && pwd)\"/db/init.sql:/docker-entrypoint-initdb.d/
```
All our table definitions exist in *init.sql*. We add it to *docker-entrypoint-initdb.d/* for the official MySQL Docker container to execute on the first run, creating our database tables.

```
mysql
```
The database image, which in this case is just the official MySQL image, but if we had a custom image we'd use that here.

```
--port=3307 \
--mysqlx-port=33070
```
The last two lines tell mysql to run on a different port to avoid conflict with the default 3306 and 33060 ports.

#### Run Tests
For this example, we're running a node script, *src/test.js*, which has our tests. We also have environment variables in our app for connecting to the database, which we called `DB_PORT` and `DB_HOST`.

We change them to point to our test database container, *db-test*, before running the node script. We also reuse our *app* container because in this simple setup, we use Node's `process.env` variables directly instead of saving them to JavaScript variables.

```
sudo docker exec app sh -c 'DB_PORT=33070 DB_HOST=db-test node src/test.js'
```