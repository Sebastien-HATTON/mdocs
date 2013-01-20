An opensource markdown-powered collaborative editor inspired in google docs.

This project was created to show [auth0](http://auth0.com) and because we wanted to have something like google docs with markdown support.

Collaborative means that you can edit a document with a remote partner at the same time and you can also share documents just as you would do with google docs.

You can also register your company or organization for free and share documentes company-wide. This is the use case we wanted to show with [Auth0](http://auth0.com).

## Env variables

-  DB: mongodb connection string in uri format (eg: ```mongodb://localhost/database```).
-  BASE_URL: base url of the web app, (eg ```https://dasdsa.herokuapp.com/```). This is optional, default value is http://localhost:8080/
-  AUTH0_CLIENT_ID: take this settings from your auth0 dashboard
-  AUTH0_CLIENT_SECRET: take this settings from your auth0 dashboard
-  AUTH0_DOMAIN: take this settings from your auth0 dashboard

If you want to be able to allow companies with google apps to register, you should register your application on the [google api console](https://code.google.com/apis/console/b/0/) and provide the following env variables:

-  GOOGLE_APPS_CLIENTID: the clinde id of your application in google
-  GOOGLE_APPS_CLIENTSECRET: the clinde id of your application in google

## Run locally

Once you cloned this repository locally, you need to install the dependencies:

	npm install

Then you have to run as follows

~~~
DB=X \
ANOTHER_ENV=Y \
... \
npm start
~~~

Alternatively you can install the foreman ruby gem and use ```foreman start```, first creating a ```.env``` file in the root as follows:

~~~
PORT=8080
DB=X
ANOTHER_ENV=Y
...
~~~