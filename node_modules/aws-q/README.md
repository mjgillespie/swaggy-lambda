# aws-q

Give the AWS SDK some [Q promise](https://www.npmjs.org/package/q) magic

Makes AWS Requests act like Q by performing a filthy hack

## Usage

Setup the aws-q like so

    var AWS = 
    require('aws-sdk');
    var awsQ = require('aws-q');
    awsQ(AWS);

Now you can be a boss

    var ec2 = new AWS.EC2({ region: 'us-west-2' });
    ec2.describeAccountAttributes({})
    .then(function (result) {
        console.log('much success');
    })
    .catch(function(err){
        console.log('such failure')
    })
    .done(function(){
        console.log('wow aws-q');
    });

## Release History

- 0.1.2 Promises now return data instead of response **(Breaking changes)**
- 0.1.1 Fix bug with `.Promise()`
- 0.1.0 Initial implementation