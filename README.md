ampersand-io
============

Provides a [socket.io](http://socket.io) wrapper to be used with ampersand modules. Developed mainly to be used with [ampersand-io-model](https://github.com/sinfo/ampersand-io-model) and [ampersand-io-collection](https://github.com/sinfo/ampersand-io-collection)


## Install

```
npm install ampersand-io
```

## API Reference

### extend `AmpersandIO.extend([attributes])`

Supports the normal extend behavior (through usage of [ampersand-class-extend](https://github.com/ampersandjs/ampersand-class-extend)).

**Note** that neither the [events](#events-ioevents) property nor the [listeners](#listeners-iolisteners) property are extendable through this method.

### socket `IO.socket`

Override this property to specify the socket that will be used when a new object reference is created. Useful for when you have a pre-existing socket connection that you would like to use. Defaults to an socket.io-client instance resulting from `io.connect()`.

```javascript
var io = require('socket.io-client');
var IO = AmpersandIO.extend({
    socket: io()
});
```

### events `IO.events`

Overridable property containing a key-value reference to the events to be used by the socket conection. Useful for usage with the `listeners` property and methods, as well as with the `emit` emit.

```javascript
events: {
  eventOne: 'my-awesome-event',
  eventTwo: 'my-super-awesome-event'
}
```

It also supports the usage of arrays of different events tied to a single key.

```javascript
events: {
  eventArray: ['this-event', 'other-event']
}
```

### listeners `IO.listeners`

Overridable property containing a set of listeners to be used by the socket connection. The key may be an entirely unreferenced event or one of properties from the `events` property object. The `fn` property contains the callback function to be called when the event is fired. The `active` option is a Boolean that, if set to true, will set this listener to be initialized upon construction.

```javascript
events:{
  myEvent: 'thisEvent',
  arrayOfEvents: ['event1', 'event2']
}

listeners: {
	myEvent: {
		fn: function(data, cb){
			console.log('This is an event callback');
		}
	},
	arrayOfEvents: {
		fn: function(data, cb){
			console.log('This callback will be called when all the events of arrayOfEvents are fired');
		},
		active: true //will be active when the object is created
	},
	'otherEvent': {
		fn: function(data, cb){
			console.log('This event is not listed in the events property');
		}
	}
}
```

### constructor/initialize `new AmpersandIO([socket], [options])`

When creating an `AmpersandIO` object, you may choose to pass in either a `socket` object or a string to be used as a namespace for a new socket.io-client instance. If none of those are provided the `AmpersandIO` instance will use the [socket](#socket-iosocket) object defined in the class. Options support a [listeners](#listeners-iolisteners) and [events](#events-ioevents) object according to the ones mentioned above (note that these will override the class definitions). 

```javascript
var IO = new AmpersandIO('chat', {
	events: {
		receive: 'new-message'
	},
	listeners: {
		receive: {
			fn: function(data, cb){
				console.log('New message: ' + data);
			},
			active: true
		}	
	}
});
```

### addListeners `IO.addListeners(listeners)`

Add a set of listeners to the listeners property of the object. Pass a `listeners` object as [described above](#listeners-iolisteners). If a listener by that name already exists and is currently active it should be [removed](#removelisteners-ioremovelistenerslisteners) first or else it will be ignored.

### setListeners `IO.setListeners([listeners])`

Set the given listeners active. Accepts an array of strings containing the names of the events associated with the [listeners](#listeners-iolisteners). If no argument is provided the method will set all the listeners from the current object. Nothing done to listeners which are already active.

```javascript
// sets the listeners associated with the receive and send events
IO.setListeners(['receive', 'send']);

// sets all the listeners in the IO object
IO.setListeners();
```

### removeListeners `IO.removeListeners([listeners])`

Sets the given listeners unactive. Accepts an array of strings containing the names of the events associated with the [listeners](#listeners-iolisteners). If no argument is provided the method will `remove` all the listeners from the current object. Nothing done to listeners which are already unactive.

**Note:** the respective properties from the [listeners](#listeners-iolisteners) property aren't deleted. The `active` property is set to `false`.

```javascript
// removes the listeners associated with the receive and send events
IO.removeListeners(['receive', 'send']);

// removes all the listeners in the IO object
IO.removeListeners();
```

### emit `IO.emit(event, data, [options], [callback])`

Method responsible for emitting events. The `event` name may be one of the events listed in the [events](#events-ioevents) property or other of your choice. The data sent to the socket connections will be an object `{data: data, options: options}` containing the arguments passed to this function. Pass `options.room` if you want to emit to a particular room and an `options.callback` that will be also passed to the socket `emit` method. You may choose to pass the `callback` function directly as an argument (`options.callback` will be ignored in this case).

```javascript
IO.emit('send', 'hi', function(){
	console.log('acked hi');
});
```

## credits

Created by [@JGAntunes](http://github.com/JGAntunes), with the support of [@SINFO](http://github.com/sinfo) and based on a series of Ampersand Modules.


## license

MIT
