# Lambda Framework

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/1314/badge)](https://bestpractices.coreinfrastructure.org/projects/1314) [![Coverage Status](https://coveralls.io/repos/github/rogelio-o/lambda-framework/badge.svg?branch=master)](https://coveralls.io/github/rogelio-o/lambda-framework?branch=master) [![Build Status](https://travis-ci.org/rogelio-o/lambda-framework.svg?branch=master)](https://travis-ci.org/rogelio-o/lambda-framework) [![npm version](https://badge.fury.io/js/lambda-framework.svg)](https://badge.fury.io/js/lambda-framework)

A framework to create serverless web applications with any provider.

This is the core project, you can use it with an official implementation of a provider
or you can implement your own provider. For more information, please keep reading.

The idea behind Lambda Framework is that you can use the features of the framework
forgetting the provider you are using. Thus, you can change the provider without
change your code base. The only thing you have to do for change the provider is
change the lib that implements the one provider for other, but the core will be
the same.

## Lambda Framework projects

Lambda Framework is very modular. This is because the lambda functions have to be
lightweight. You can use the projects you need in your web application.

- [Core](https://github.com/rogelio-o/lambda-framework)
- [AWS Lambda implementation](https://github.com/rogelio-o/lambda-framework-aws)
- [Google Cloud Functions implementation](https://github.com/rogelio-o/lambda-framework-gcloud)
- [DustJS template engine implementation](https://github.com/rogelio-o/lambda-framework-dustjs)
- [Examples](https://github.com/rogelio-o/lambda-framework-examples)

## Features

- [x] Configurable
- [x] HTTP requests routing
- [x] Other events requests routing
- [x] HTTP helpers (redirection, etc)
- [x] Templating
- [x] Error handling
- [x] For any serverless provider
- [x] Extensible with modules

## How to use it?

### Initialize the App

The main object is the App. You have to instantiate a new App object and then
you can do what you need with it.
```typescript
import { App, IApp } from "lambda-framework";

const app: IApp = new App();
```

A event handling is started passing that event to the App method `handle`.
```typescript
app.handle(event, callback);
```

You don't need to care about passing the event to the App handler, you can use the [AWS Lambda implementation](https://github.com/rogelio-o/lambda-framework-aws) or another provider
implementation. These will manage the creation of the raw event and passing it to the handler.

```typescript
import { App, IApp } from "lambda-framework";
import { AWSHandler } from "lambda-framework-aws";

const app: IApp = new App();
...
const handler: AWSHandler = new AWSHandler(app);
export const handle = handler.handle.bind(handler);
```

### Event handling

A handler can be related with an event type or with a event that fulfil a
predicate. When the event happens, the handler is executed.

```typescript
app.event("eventType", (req: IEventRequest, next: INext, error: Error) => {
  ...
});

const predicate: IEventRoutePredicate = (req: req: IEventRequest) => {
  return req.event.original.param1 === "value1";
};
app.event(predicate, (req: IEventRequest, next: INext, error: Error) => {
  ...
});
```

### HTTP Routing

#### use

Handlers can be executed when a request is received for a specified path.

```typescript
app.use((req: IHttpRequest, res: IHttpResponse, next: INext) => {
  ... // Do something
  next();
}, "/blog/*");

app.use((req: IHttpRequest, res: IHttpResponse, next: INext, error: Error) => {
  ... // Error handling
});
```

#### route

Also, a final controller action can be executed when a request is received
with a specified path and method (`POST`, `GET`, `PUT` or `DELETE`).

```typescript
app.route("/blog/:id")
  .get((req: IHttpRequest, res: IHttpResponse) => {
    ... // Do something
  })
  .put((req: IHttpRequest, res: IHttpResponse) => {
    ... // Do something
  });
```

#### mount

The app has a default router. The router can have subrouters with more routes.
The subrouters can have a prefix in order to execute its routes only when
the path starts with the prefix.

```typescript
const subrouter: IRouter = new Router();

subrouter.route("/:id")
  .get(...)
  .put(...);

app.mount(subrouter, "/blog");
```

#### param

Handlers can be related also with the apparition of a param in a request.
For example, each time the `user` param appears, a handler loading the user
is executed.

```typescript
app.param("user", (req: IHttpRequest, res: IHttpResponse, next: INext, placeholderValue: any) => {
  ... // Load user
  next();
});
```

### HTTP body parsers

There is a few body parsers that can be used. The body parsers have
to be added as a handler to the path in which you want to use it.

#### JSON

```typescript
const reviver = (key: string, value: string): any => {
  if(key === "KEY" && value === "VALUE") {
    return 0;
  } else {
    return value;
  }
};

app.use(new JsonParser().create(reviver));
```

#### UrlEncoded

```typescript
const options: {[name: string]: any} = {};
options.type = "application/x-www-form-urlencoded"; // By default
options.extended = false; // By default

app.use(new UrlEncodedParser().create(options));
```

#### Multipart

```typescript
const options: {[name: string]: any} = {};
options.type = "multipart/form-data"; // By default

app.use(new MultipartParser().create(options));
```

### Others HTTP features

#### Response body

To response with a plain body:

```typescript
response.send("RESPONSE");
```

To response with a JSON body:

```typescript
response.json({key: "value"});
```

To response with a HTTP status and a body with a description:

```typescript
response.sendStatus(400);
```

To set the `Content-Type` of the response:

```typescript
response.contentType("text/html");
```

#### Format

To do things according to the `Accept` header of the request:

```typescript
response.format({
  "text/html": (req: IHttpRequest, res: IHttpResponse) => {
    ... // Do things
  },
  "application/json": (req: IHttpRequest, res: IHttpResponse) => {
    ... // Do things
  }
});
```

#### Response headers

```typescript
response.putHeader("key", "value");

response.putHeaders({
  key1: "value1",
  key2: "value2"
});

const previousPutHeader: string = response.header("key");

response.appendHeader("key", "value 2");

response.removeHeader("key2");
```

#### Cookies

Cookies can be added creating a Cookie object and adding it to the response.
The cookies can be configured with the expiration date and the path.

```typescript
const cookie: ICookie = new Cookie("cookie-name", "value", new Date(1, 1, 2020), "/", false);

response.addCookie(cookie);

response.addCookies([cookie]);
```

Signed cookies can be added configuring the secret key in the app and
configuring the cookie object on creation.

```typescript
app.set(configuration.COOKIE_SECRET, "SIGNED KEY");

const cookie: ICookie = new Cookie("cookie-name", "value", new Date(1, 1, 2020), "/", true);
response.addCookie(cookie);
```

Added cookies can be get from the response.

```typescript
const cookie = response.cookie("cookie-name");
```

#### Redirection

Redirections can be done in the response with `location` or `redirect`. The passed
URL can be _back_, so the user will be redirected to _Referrer_ or _Referer_ headers
(or to _/_ if there is no referrer header). In the method `redirect`, the HTTP
status code can be specified.

```typescript
response.location("back");

response.redirect("back");

response.redirect("/new-location", 301);
```

### Templating

There is a render method for rendering HTML templates. The methods can have the
following parameters:

- **view:** the template name.
- **options:** the params that will be injected into the view.
- **callback:** optional. If no callback is given, the resulting HTML will be returned
as response body with 200 HTTP status. If callback is given, the resulting HTML will
be passed as callback param.

```typescript
response.render("template1", {param: "value"});

response.render("template1", {param: "value"}, (html: string) => {
  doSomethingWithTemplate(html);
});
```

**IMPORTANT:** in order to use the render method, a template engine has to be added
to the app or to the subrouter in which it is used. Check the project to know
more about the [DustJS template engine](https://github.com/rogelio-o/lambda-framework-dustjs).

```typescript
app.addTemplateEngine(templateEngine);
```

## Contributions

All contributors will be welcome. You can contributing by implementing/fixing/answering one open [issue](issues), by suggesting new features for the framework,... For more info about contributing, you can read [this](CONTRIBUTING.md).

Make it happen.
