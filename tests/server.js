var io = require('socket.io')();

var events = {
	requestTests: 'request',
	test1: 'test-1',
	test2: 'test-2',
	test3: ['test-3-1', 'test-3-2']
};

console.log('server running');

io.on('connection', function(socket){

	socket.on(events.requestTests, function(){
		socket.emit(events.test1);
		socket.emit(events.test2);
		socket.emit(events.test3[0]);
		socket.emit(events.test3[1]);
	});

	socket.on('test-1', function(request, cb){
		cb(request);
	});

	socket.on(events.test2, function(request, cb){
		socket.emit('response');
	});

	socket.on(events.test3[0], function(request, cb){
		cb(request);
	});

	socket.on(events.test3[1], function(request, cb){
		cb(request);
	});
	
});
io.listen(3000);

setTimeout(function timeouExit(){
	io.close();
	process.exit();
}, 30000);

module.exports = io;