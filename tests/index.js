var test = require('tape');
var AmpersandIO = require('../ampersand-io');
var IOClient = require('socket.io-client');

var MyClass = AmpersandIO.extend({
	events: {
		test1: 'test-1',
		test2: 'test-2',
		test3: ['test-3-1', 'test-3-2'],
		test4: 'test-4'
	}
});

test('extend', function(t){
	t.plan(3);

	var testObj = {test: 'test-extend'};
	var testMethod = {test: function(){return 'test';}};
	var testClass = AmpersandIO.extend({events: testObj, listeners: testObj}, testMethod);

	t.equal(testMethod.test(), testClass.prototype.test());
	t.equal(testObj, testClass.prototype.events);
	t.equal(testObj, testClass.prototype.listeners);
});

test('constructor', function(t){
	
	t.test('no arguments', function(subt){
		subt.plan(3);
		var IO = new MyClass('http://localhost:3000');

		subt.ok(IO.socket, 'socket object exists');
		subt.equal(IO.events, MyClass.prototype.events);
		subt.equal(IO.listeners, MyClass.prototype.listeners);
	});

	t.test('socket', function(subt){
		subt.plan(2);
		var socket = new IOClient('http://localhost:3000/otherChat');
		var namespaceIO = new MyClass('http://localhost:3000/chat');
		var socketIO = new MyClass(socket);

		subt.equal(namespaceIO.socket.nsp, '/chat');
		subt.equal(socketIO.socket, socket);
	});

	t.test('string and options', function (subt){
		subt.plan(1);
		var options = {
			events:{
				event: 'options-test'
			}
		};
		var IO = new MyClass('http://localhost:3000', options);

		subt.equal(IO.events, options.events);
	});

	t.test('socket and options', function (subt){
		subt.plan(2);
		var socket = new IOClient('otherChat');
		var options = {
			events: 'options-test'
		};
		var socketIO = new MyClass(socket, options);

		subt.equal(socketIO.socket, socket);
		subt.equal(socketIO.events, options.events);
	});
	
});

test('emit', function(t){
	var IO = new MyClass('http://localhost:3000');
	t.plan(9);

	setTimeout(function waitForConnection(){
		var testObj = {
			data: 'my-data',
			options: 'my-options'
		};
		var cbTestObj = {
			data: 'my-other-data',
			options: {
				other: 'my-other-options'
			}
		};

		cbTestObj.options.callback = function(request){
			t.equal(request.data, cbTestObj.data, 'options callback');
			t.equal(request.options.other, cbTestObj.options.other, 'options callback');
		};

		IO.emit('test1', testObj.data, testObj.options, function(request){
			t.equal(request.data, testObj.data, 'simple event callback');
			t.equal(request.options, testObj.options, 'simple event callback');
		});

		IO.emit('test3', testObj.data, testObj.options, function(request){
			t.equal(request.data, testObj.data, 'multiple event callback');
			t.equal(request.options, testObj.options, 'multiple event callback');
		});

		IO.emit('test1', cbTestObj.data, cbTestObj.options);

		IO.socket.on('response', function(){
			t.pass('emit without data and callback');
		});

		IO.emit('test2');

		setTimeout(function timeoutEnd(){
			t.end();
		},10000);

	},5000);
});

test('listeners', function(t){
	var IO = new MyClass('http://localhost:3000');
	t.plan(21);

	IO.addListeners({
		test1:{
			fn: function(){
				t.pass('listening to event property');
			},
			active: true
		},
		test2:{
			fn: function(){
				t.fail('added listener without active flag');
			}
		},
		test3:{
			fn: function(){
				t.pass('listening to multiple events [array]');
			},
			active: true
		},
		test4:{
			fn: function(){
				t.deepEqual(this, IO, 'correct \'this\' reference inside listener callback #4');
			},
			active: true
		}
	});

	t.ok(IO.listeners.test1.active, 'listener should be active');
	t.notOk(IO.listeners.test2.active, 'listener should not be active');
	t.ok(IO.listeners.test3.active, 'listener should be active');

	IO.emit('request');
	
	setTimeout(function() {
		IO.removeListeners();
		t.notOk(IO.listeners.test1.active, 'listener should not be active');
		t.notOk(IO.listeners.test2.active, 'listener should not be active');
		t.notOk(IO.listeners.test3.active, 'listener should not be active');

		t.equal((IO.socket._callbacks[IO.events.test1] || []).length, 0, 'listener should not be in the sockets callbacks');
		t.equal((IO.socket._callbacks[IO.events.test2] || []).length, 0, 'listener should not be in the sockets callbacks');
		t.equal((IO.socket._callbacks[IO.events.test3[0]] || []).length, 0, 'listener should not be in the sockets callbacks');
		t.equal((IO.socket._callbacks[IO.events.test3[1]] || []).length, 0, 'listener should not be in the sockets callbacks');

		IO.setListeners(Object.keys(IO.events));
		t.ok(IO.listeners.test1.active, 'listener should be active');
		t.ok(IO.listeners.test2.active, 'listener should be active');
		t.ok(IO.listeners.test3.active, 'listener should be active');

		t.ok(IO.socket._callbacks[IO.events.test1], 'listener should be in the sockets callbacks');
		t.ok(IO.socket._callbacks[IO.events.test2], 'listener should be in the sockets callbacks');
		t.ok(IO.socket._callbacks[IO.events.test3[0]], 'listener should be in the sockets callbacks');
		t.ok(IO.socket._callbacks[IO.events.test3[1]], 'listener should be in the sockets callbacks');
	}, 5000);
});

