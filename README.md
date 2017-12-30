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
- [Website](https://github.com/rogelio-o/lambda-framework-website)
- [Website Resources](https://github.com/rogelio-o/lambda-framework-website-resources)

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

TODO

### HTTP Routing

TODO

### HTTP body parsers

TODO

### Others HTTP features

TODO

### Templating

TODO

### More info, API and tutorials

TODO

## Contributions

All contributors will be welcome. You can contributing by implementing/fixing/answering one open [issue](issues), by suggesting new features for the framework,... For more info about contributing, you can read [this](CONTRIBUTING.md).

Make it happen.
