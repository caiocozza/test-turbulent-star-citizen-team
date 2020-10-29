## Test - Caio Cozza

I decided to move with a very lightweight implementation of websockets for nodejs instead of something like socket.io or similars.

This application runs with redis, it means that all events will be persisted, as required they will be restored if the server restarts.

I did some features that were not required to have a more complete application.

Most of the async functions are not awaited because in fact we don't need to await them in this case.

You can run the tests with:
```
    docker-compose -f test.docker-compose.yml up --build
```

You can run the application with:
```
    docker-compose -f run.docker-compose.yml up --build
```

