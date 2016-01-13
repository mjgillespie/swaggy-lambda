## What is swaggy-lambda
Swaggy-lambda is a command line utility that will help you simply make a JSON REST based service using swagger to define the interface, nodejs to implement the service, and the AWS Gateway and AWS Lambda using a 'serverless' deployment.

## Prerequisites
* npm & node installed
* An AWS account
* Run the AWS CLI & get default credentials, region, etc configured. You don't need the CLI, but it uses the credentials from the CLI to execute the API calls.
  * An AWS client id and secret key with access to create an IAM Role, API Gateway, and Lambda functions.
* Optional: install mocha globally: `npm install -g mocha`

## Getting up and running
* Download the source and run `npm link` to install a symbolic link to 'swaggy-lambda'. Once this stabilizes a little, I will publish the package so you can simply do a global install with `npm install -g`.
* Create a new blank project, run `npm init`
* Bootstrap your project with some sample swagger files and nodejs api resources. `swaggy-lambda bootstrap`
* This will create a sample project and do the following things:
  * Copy a sample swagger file to your local project
  * Copy any dependencies into your package.json
  * Initialize your swaggy-lambda configuration
  * Create a basic lambda execution role if one is not supplied.
  * Create an app.js for running locally in express and and sample api resources. These end up being what gets executed during the lambda function.
* Build the project: `swaggy-lambda build`
  * Note, the build url is output at the end of the build.
* Run integration tests: `mocha test/sample-test.js`
* Create a version `swaggy-lambda create-version 0.0.1`
* Deploy the version to a dev stage: `swaggy-lambda deploy-version 0.0.1 dev`
* View the swagger UI by pasting the link output of the bottom the deploy version task.

## How does it work?
The swaggy lambda uses a configuration by convention approach to AWS lambda functions that service the REST based service.

## How do I implement a resource
* Create a file in the 'api' folder named with the resource name. <resource.js>
* Implement the methods that the services support. If the resource.js file is created by `swaggy-lambda init`, then the methods listed in the swagger.json for that resource will be stubbed out.
* The lambda function takes in two parameters: event and context. 
  * The event object has resource name, method, parameters, body, and any validation errors generated by the swagger definition.
  * The context object has information about the call context, as well as the callback functions that
* If the call is successfull, call the 'succeed' method on the context object with the object to be returned to the service. You can either pass in the object itself, or in the case of a paged list, you can return an object with the format: 
```
{
	count: 1,
    start: 0,
    totalCount: 1,
    data: <array of resource objects>
}
```
* If the call is unsuccessful, call the fail function on the context object with the error information. Currently, only two types of failures are implemented: 'notfound', and 'validationerror'.

## Deploying to AWS API Gateway & Lambda
* Make sure you have the appropriate IAM access to put objects into s3, create API gateway endpoints, and manage lambda functions.
* In your project folder, run `swaggy-lambda build`. This will deploy the lambda functions to $latest and create an API gateway stage called 'build'.
* Once the build is at a satisfactory state, you can create a version: `swagger-lambda create-version <version-label>`. This will publish the lambda functions and deploy and name a version of the apigateway.
* Once the version is successfully created, then you can deploy the version to a stage: `swagger-lambda deploy-version <version-label> <stage>`
* The deploy-version command line will return the API Key needed to access this stage. To test it out, the swagger-ui is deployed to the /docs endpont: 
```
https://restapiid.execute-api.region.amazonaws.com/stage/docs
```
You will need to put the API Key in the API Key textbox 


## Running in Express
There is an app.js created when you run swaggy-lambda.js that creates an express app that implements the service in express. This will be primarily used for testing, but should function identically to the gateway.
```
node app.js
```

## Connecting to a Database
There is a mysql-bootstrap script that will generate a sample application that can connect to a MYSQL database running locally for development mode and RDS for the AWS Gateway. It has a single resource, Model1, with GET, POST, PUT, DELETE

### Prerequisites
* A instance of mysql running locally or accessible locally. ** You can connect to RDS, but the latency may be high **
* An application  user/password configured for the local DB instance.
* A new database configured for the application and grant full access to the DB for the application user. The bootstrap will build out a table if it doesn't exist.
* An application  user/password configured for the RDS DB instance.
* A new database configured for the application and grant full access to the DB for the application user. The bootstrap will build out a table if it doesn't exist. 
  * As of now the RDS instance must be public, or the lambda function won't be able to see it. AWS announced lambda functions will have access to VPN resources coming in the early in 2016, but they currently aren't generally available.
* create a new folder
* run `npm init`
* run `swaggy-lambda mysql-bootstrap`
  * It will ask for a local connection string and a build connection string
  * Format is `mysql://user:pass@host/db`
  * For the RDS connection, you can add the SSL info: `mysql://user:pwd@RDSUrl:3306/db?ssl=Amazon%20RDS`
* to test locally, run `node index.js`
* to build on API gateway, run  `swaggy-lambda build`
* to run the functional tests:
  * `mocha test/sample-test.js --local`
  * `mocha test/sample-test.js`
* Paste the test URL output by the build process to view the swagger-ui for this release.
  * If you get errors, go to the AWS Lambda Control Panel, Monitoring Tab->View Logs in Cloudwatch to help diagnose the issue.


## What you get for 'free'
* The main thing is that the tedious process of creating the API Gateway and Lambda functions is totally automated.
  * Resources are created for each resource in the swagger.json
  * A `swagger.json` resource is added to host the swagger file.
  * A `docs` resource is created to run swagger-ui on the endpoint.
  * Each method in the swagger path is added to the resource.
  * Parameters are mapped to the event object passed to the lambda function. The following parameters are supported:
    * Query Params -> event.params map.
    * Path Params -> event.params map.
    * Header Params -> event.params map.
    * Body parameter -> event.body map
  * Parameters are validated against the swagger parameter type, format, required, and the other validations configurable on the parameter such as maxLength, max
    * Body parameters are also validated.
    * Return parameters are mapped back
    * Status codes are mapped from the success/error object return by the lambda function.
    * 200 for GET & PUT, 201 for POST, 204 for DELETE
    * 422 for invalid parameters
    * 404 for nonfound values.
* Lambda function is create, uploaded, and deployed.
* REST function can be versioned and deployed to a different stage.
* Stage variables can be passed in to accomodate differences in behavior per stage, such as a DB connection or table name.
* Content-Range headers to support pagination of lists.



### Really, how does it work?
Well, all the endpoints get serviced by a single broker Lambda function. It then dynamically loads a module based on which resource is being requested. Each resource can have a number of methods associated with it, right now they are:
* list: A GET that will return a list of resources. Success returns 200 HTTP code.
* get: A GET that returns a single resource. Success returns 200 HTTP code.
* post: A POST method that creates a new record. Success returns 201 HTTP code.
* put: A PUT method that updates an existing resource. Success returns 200 HTTP code.
* delete: A DELETE method that deletes an existing resource. Success returns 204 HTTP code.
* validate: A method that validates the request above & beyond the built in swagger validations.



## FAQ
### Can I run this locally?
Sure, there is an app.js express app that will allow you to run the service locally our outside the AWS environment. Just run `node app.js` from the command line.

### This looks a lot like the node swagger package. Why not use that?
I tried to make the deployment to Lambda as lightweight as possible, so I didn't want the dependency to the full set of swagger tools. The size if the package is about 2.0 MB currently and with some optimizations it should be quite a bit lower.

### Man, that lamda/api gateway deployment code is ugly, do you really know what you are doing?
Good question. I'm relatively new to nodejs, so I am still getting used to the async/promise based implementation. I will continue to refactor the code, but push requests are more than welcomed.

### I deployed, but now I am getting 403 errors when I use swagger-ui? What gives?
Did you also include the API Key in the swagger ui?

### I started with the bootstrap, and now I want to integrate with dynamoDB, but I am getting security errors. What can I do?
You need to make sure the lambda execution role has access to any AWS resources it interacts with.

### What is the performance like?
With 128 MB RAM allocated, running tests against the API gateway takes about 100-300ms once it gets a little warmed up. The lambda execution is about 1ms for a simple sample data endpoint, so most of the latency is connecting to API Gateway and the internal latency between the gateway and Lambda.

### Can I run this inside a VPC?
Not yet, the API Gateway will only surface public facing endpoints. AWS has committed to having lambda functions able to access VPC resources in early 2016.

###How much is this going to cost me?
The AWS costs for the (API gateway)[https://aws.amazon.com/api-gateway/pricing/] and (lambda)[https://aws.amazon.com/lambda/pricing/];

For the us-east, the back of the napkin calculations say 1 billion calls in a month with a payload of 2K will cost:
* API Gateway: 1000*3.50 = $3,500 
* Transfer: 2K * 1,000,000,000 * $0.09 ~ $172
* Lambda Per Call: $0.02 * 1,000 = $20
* Lambda Execution Costs: 1,000,000,000 * 100ms * 0.125 GB = ~ $208
* Total = $3,900  $0.00000039 / call.

### Can I use a custom URL?
Coming soon.

### How do I set up caching?
Coming soon.

## Can I use OAuth security?
Currently no, but looking into it.


