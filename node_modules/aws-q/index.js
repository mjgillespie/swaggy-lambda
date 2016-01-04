var Q = require('q');

module.exports = function(AWS){
	AWS.Request.prototype.promise = function(){
		var deferred = Q.defer();

		this.
		on('success', function(response) {
			deferred.resolve(response.data);
		}).
		on('error', function(response) {
			deferred.reject(response);
		}).
		send();

		return deferred.promise;
	};

	AWS.Request.prototype.then = function(callback){
		return this.promise().then(callback);
	};

	AWS.Request.prototype.fail = function(callback){
		return this.promise().fail(callback);
	};
};