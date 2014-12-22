var extend = require('ampersand-class-extend');
var io = require ('socket.io-client');

var AmpersandIO = function(socket, options){
  options || (options = {});
  if(socket){
    this.socket = socket;
  }
  if(options.listeners){
    this.listeners = {};
    this.addListeners(options.listeners);
  }
  if(options.events){
    this.events = options.events;
  }
};

AmpersandIO.extend = extend;

AmpersandIO.extend({
  socket: io('http://localhost:3000'),

  // The name of the events to be used in each operation
  events: {
    onNew: 'on-model-new',
    onUpdate: 'on-model-update',
    fetch: 'collection-fetch',
    onFetch: 'fetch-response'
  },

  listeners: {
    onUpdate:{ 
      fn: function(data, cb){
        var model = this.get(data.id);
        model.save(data, null);
        return cb();
      },
      active: false,
    },
    onNew: {
      fn: function(data, cb){
        this.create(data,{});
        return cb();
      },
      active: false,
    }
  },

  addListeners: function(){
    for(var i = 0; i < arguments.length; i++){
      var l = arguments[i];
      if(this.listeners[l.listener] && this.listeners[l.listener].active){
        console.log('listener already active');
        continue;
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
      var listener = listeners[i];
      if(!this.listeners[listener].active){
        this.socket.on(listener, this.listeners[listener].fn);
        this.listeners[listener].active = true;
      }
    }
  },

  removeListeners: function (listeners){
    if(!listeners){
      listeners = Object.keys(this.listeners);
    }
    for(var i = 0; i < listeners.length; i++){
      var listener = listeners[i];
      console.log(listener);
      if(this.listeners[listener].active){
        this.socket.removeListener(listener, this.listeners[listener].fn);
        this.listeners[listener].active = false;
      }
    }
  },
  // Overridable function responsible for emitting the events
  emit: function (event, model, options){
    this.socket.emit(event, model, options.callback);
  }
});

module.exports = AmpersandIO;