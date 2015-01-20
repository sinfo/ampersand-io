/*$AMPERSAND_VERSION*/
var extend = require('ampersand-class-extend');
var io = require ('socket.io-client');

var IOBase = function(socket, options){
  options || (options = {});
  if(socket){
    if(typeof socket === 'string'){
      socket = io(socket);
    }
    this.socket = socket;
  }
  else{
    options = (socket || {});
    this.socket = this.socket();
  }
  if(options.events){
    this.events = options.events;
  }
  if(options.listeners){
    this.listeners = {};
    this.addListeners(options.listeners);
  }
  else{
    this.setListeners();
  }
};

IOBase.extend = extend;

var AmpersandIO = IOBase.extend({

  socket: io,

  events: {},

  listeners: {},

  _setCallback: function(fn){
    var self = this;
    return function(){
      fn.apply(self, arguments);
    };
  },

  _setListener: function(event, listener){
    this.listeners[listener]._callbacks[event] = this._setCallback(this.listeners[listener].fn);
    this.socket.on(event, this.listeners[listener]._callbacks[event]);
  },

  _removeListener: function(event, listener){
    this.socket.removeListener(event, this.listeners[listener]._callbacks[event]);
  },

  addListeners: function(listeners){
    for(var listenerID in listeners){
      if(!listeners.hasOwnProperty(listenerID)){
        continue;
      }
      if(this.listeners[listenerID] && this.listeners[listenerID].active){
        continue;
      }
      var listener = listeners[listenerID], events = listenerID;
      this.listeners[listenerID] = listener;
      this.listeners[listenerID]._callbacks = {};
      if(this.events[listenerID]){
        events = this.events[listenerID];
      }
      if(typeof events === 'string'){
        events = [events];
      }
      for(var i = 0; i < events.length; i++){
        var id = events[i];
        if(listener.active){
          this._setListener(id, listenerID);
        }
      }
    }
  },

  setListeners: function (listeners){
    if(!listeners){
      listeners = Object.keys(this.listeners);
    }
    for(var i = 0; i < listeners.length; i++){
      var listenerID = listeners[i];
      var listener = this.listeners[listenerID], events = listenerID;
      if(!listener.active){
        listener.active = true;
        listener._callbacks = {};
        events = this.events[listenerID] || events;
        if(typeof events === 'string'){
          events = [events];
        }
        for(var j = 0; j < events.length; j++){
          var id = events[j];
          this._setListener(id, listenerID);
        }
      }
    }
  },

  removeListeners: function (listeners){
    if(!listeners){
      listeners = Object.keys(this.listeners);
    }
    for(var i = 0; i < listeners.length; i++){
      var listenerID = listeners[i];
      var listener = this.listeners[listenerID], events = listenerID;
      if(listener.active){
        listener.active = false;
        events = this.events[listenerID] || events;
        if(typeof events === 'string'){
          events = [events];
        }
        for(var j = 0; j < events.length; j++){
          var id = events[j];
          this._removeListener(id, listenerID);
        }
      }
    }
  },

  emit: function (event, data, options, cb){
    options || (options = {});
    if(typeof options === 'function'){
      cb = options;
      options = {};
    }
    cb || (cb = options.callback);
    if(this.events[event]){
      event = this.events[event];
    }
    if(typeof event === 'string'){
      event = [event];
    }
    for(var i = 0; i < event.length; i++){
      if(options.room){
        io.to(options.room).emit(event[i], {data: data, options: options}, cb);
      }
      else{
        this.socket.emit(event[i], {data: data, options: options}, cb);
      }
    }
  }
});

module.exports = AmpersandIO;