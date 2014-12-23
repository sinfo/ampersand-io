var extend = require('ampersand-class-extend');
var io = require ('socket.io-client');

var AmpersandIOConst = function(socket, options){
  options || (options = {});
  if(socket){
    if(typeof socket === 'string'){
      socket = io(socket);
    }
    this.socket = socket;
  }
  if(options.listeners){
    this.listeners = {};
    this.addListeners(options.listeners);
  }
  if(options.setListeners){
    this.setListeners();
  }
  if(options.events){
    this.events = options.events;
  }
};

AmpersandIOConst.extend = extend;

var AmpersandIO = AmpersandIOConst.extend({

  socket: io.connect(),

  // The name of the events to be used in each operation
  events: {
    myEvent: 'event-one',
    otherEvent: 'event-two'
  },

  listeners: {
    'event-three':{ 
      fn: function(data, cb){
        console.log('event three received');
        return cb();
      },
      active: false,
    },
    'event-four': {
      fn: function(data, cb){
        console.log('event four received');
        return cb();
      },
      active: false,
    }
  },

  addListeners: function(){
    for(var i = 0; i < arguments.length; i++){
      var l = arguments[i];
      if(this.listeners[l.listener] && this.listeners[l.listener].active){
        continue;
      }
      if(this.events[l.listener]){
        l.listener = this.events[l.listener];
      }
      if(l.listener && l.fn && typeof(l.fn) == 'function'){
        this.listeners[l.listener] = {fn: l.fn};
      }
      if(l.active){
        this.socket.on(l.listener, this.listeners[l.listener].fn);
        this.listeners[l.listener].active = true;
      }
      else{
        this.listeners[l.listener].active = false;
      }
    }
  },

  setListeners: function (listeners){
    if(!listeners){
      listeners = Object.keys(this.listeners);
    }
    for(var i = 0; i < listeners.length; i++){
      var listenerID = listeners[i];
      var listener = this.listeners[listenerID];
      if(!listener.active){
        listener.active = true;
        if(this.events[listenerID]){
          listenerID = this.events[listenerID];
        }
        this.socket.on(listenerID, listener.fn);
      }
    }
  },

  removeListeners: function (listeners){
    if(!listeners){
      listeners = Object.keys(this.listeners);
    }
    for(var i = 0; i < listeners.length; i++){
      var listenerID = listeners[i];
      var listener = this.listeners[listenerID];
      if(listener.active){
        listener.active = false;
        if(this.events[listenerID]){
          listenerID = this.events[listenerID];
        }
        this.socket.removeListener(listenerID, listener.fn);
      }
    }
  },
  // Overridable function responsible for emitting the events
  emit: function (event, model, options){
    if(options.room){
      io.to(options.room).emit(event, model, options.callback);
    }
    else{
      this.socket.emit(event, model, options.callback);
    }
  }
});

module.exports = AmpersandIO;