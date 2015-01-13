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

  addListeners: function(listeners){
    for(var listenerID in listeners){
      if(!listeners.hasOwnProperty(listenerID)){
        continue;
      }
      if(this.listeners[listenerID] && this.listeners[listenerID].active){
        continue;
      }
      var listener = listeners[listenerID];
      this.listeners[listenerID] = listener;
      if(this.events[listenerID]){
        listenerID = this.events[listenerID];
      }
      if(typeof listenerID === 'string'){
        listenerID = [listenerID];
      }
      for(var i = 0; i < listenerID.length; i++){
        var id = listenerID[i];
        if(listener.active){
          this.socket.on(id, listener.fn);
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
      var listener = this.listeners[listenerID];
      if(!listener.active){
        listener.active = true;
        if(this.events[listenerID]){
          listenerID = this.events[listenerID];
        }
        if(typeof listenerID === 'string'){
          listenerID = [listenerID];
        }
        for(var j = 0; j < listenerID.length; j++){
          this.socket.on(listenerID[j], listener.fn);
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
      var listener = this.listeners[listenerID];
      if(listener.active){
        listener.active = false;
        if(this.events[listenerID]){
          listenerID = this.events[listenerID];
        }
        if(typeof listenerID === 'string'){
          listenerID = [listenerID];
        }
        for(var j = 0; j < listenerID.length; j++){
          this.socket.removeListener(listenerID[j], listener.fn);
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