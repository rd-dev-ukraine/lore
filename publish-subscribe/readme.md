# Publish-subscribe software design pattern

## Definitions

Publish-subscribe (shorten pub-sub) is the pattern of communication between application parts. 
The essential of this pattern is interchange with pieces of data called *messages*. 
Each part of application can either send the message or *subscribe* to new messages.
*Subscription* means register callback function which would be called when new message arrives.

## History

Publish-subscribe is really ancient pattern. There is nothing new in it. 
It's used by old WinAPI. It's used by new AngularJS. 
Almost all UI frameworks use pub-sub pattern.
The interaction *user-application* is naturally event-based, 
so publish-subscribe pattern is natural implementation of such interaction.

## Some examples. 

#### Node.JS EventEmitter
```javascript
const EventEmitter = require('events');

const myEventBus = new EventEmitter();


myEventBus.on("myEvent", (message) => {
    console.log(`Hello, ${message.text}`);
});

myEventBus.emit("myEvent", { text: "World" });

```

#### .NET and C# has publish-subscribe pattern built into framework
```C#
public class Message
{
    public string Text {get;set;}
}

public class EventEmitter 
{
    /// Use simple Action<T> not EventHandler<T> because don't need a sender here.
    public event Action<Message> MessageReceived;
    
    public void EmitMessage(Message message)
    {
        MessageReceived?.Invoke(message);
    }
}


class Program
{
    public static void Main() 
    {
        var emitter = new EventEmitter();
        emitter += (message) => 
        {
            Console.WriteLine($"Hello, {message.Text}");        
        };
        
        
        emitter.EmitMessage(new Message { Text = "World" });
    }
}
```

## Pros and Cons

Publish-subscribe pattern could be good choice for communicating between application parts. 

### The advantages:

* Easy to build and easy to understand. 
  Building simple `EventEmitter`-like class in JavaScript takes a 20 minutes.
  And you will get fully understanding how it works and all its secrets due that time.
  It is simple, really.
  
* Decoupling. Application parts using pub-sub pattern depends only on messages type 
  (on message classes in strongly typed languages or on message structure in dynamic languages like JavaScript).
  Also for languages without native pub-sub support like JavaScript objects 
  need a reference to `publish` (or `emit`) method. 
  Actually, this is the less possible dependencies comparing to other communication methods.
  
* Easy to test. 
  Usually, the message handlers (methods which called on message receiving) 
  are just native methods which could be called by-hand either as by event bus.
  Messages are usually just **Plain Old Data Objects** which are so easy to fill in tests.
  Mocking `publish` methods are also pretty easy.
  
* Many-to-many relationships between publishers and subscribers.
  Message consumer doesn't matter who sends a message. 
  It doesn't matter how many message sources are in the system.
  This is really important thing. It greatly affects application architecture and makes it better.
  
* Inversion of control. Publish-subscribe pattern inverses the control. 
  It reverts component design from `pull` to `push` pattern.
  
  For example:
  
  #### Traditional *pull* component:
  
  ```javascript  
  // data-service.js
  class DataService {
      loadData() {
          return new Promise((resolve) => {
              resolve([{
                  id: 1,
                  value: "Value"
              }]);
          });
      }
  }    
  
  // controller.js
  const dataService = require("./data-service");
  
  class Controller {
      constructor(dataService) {
          this.dataService = dataService;
          
          this.dataService
              .loadData()
              .then(data => {
                  this.data = data;
                  this.displayData();
              });
      }
  }
  
  // app.js
  const DataService = require("./data-service");
  const Controller = require("./controller");
  
  const service = new DataService();
  const controller = new Controller(service);
  ```   
    
  Note the component *initiates* data retrieval. 
  Component knows how the data is got. 
  Component knows the data is got in async way.
  This doesn't brings any value for the component, instead it brings complexity.
  
  #### Let's take a look at *push* component with event emitter. 
  
  ```javascript
  // data-service.js
  class DataService {
      loadData() {
          return new Promise((resolve) => {
              resolve([{
                  id: 1,
                  value: "Value"
              }]);
          });
      }
  }  
  
  // controller.js
  class Controller {
      onData(data) {
          this.data = data;
          this.displayData();
      }
  }
  
  // app.js
  const EventEmitter = require("events");
  const DataService = require("./data-service");
  const Controller = require("./controller");
  
  const service = new DataService();
  const controller = new Controller();
  
  const eventBus = new EventEmitter();
  
  eventBus.on("dataRequested", () => {
      service.loadData()
        .then(data => {
            eventBus.emit("dataReceived", data);
        });
  });
  
  eventBus.on("dataReceived", data => {
      controller.onData(data);
  });  
  ```
  
  Now `Controller` doesn't even know about the data service. 
  The all things it knows is it expects a data. 
  It doesn't matter how data are loaded - sync or async.
  It doesn't matter who initiates the data loading.   
  
  There may seem there is much more code in `app.js`. 
  But that's because we handle all subscriptions manually. 
  Below we build an `EventBus` class which automates boilerplate code for subscription and publishing. 
  
  
  ### Disadvantages
  
  Since pub-sub pattern is cool it have some restrictions and disadvantages:
  
  * Decoupling. 
    Yes, there is two sides of coin. 
    Dependency tree in application becomes non-explicit.  