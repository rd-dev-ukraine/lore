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
While getting what messages class handles is easy, it is pretty hard to get who emits those messages.
So inspecting data flows could be hard task.
In big application there can be a mess.

It is recommended to use constant classes for command names, 
possible with nesting to split commands by application areas. 
For big application modules with independent set of commands use several command objects.

```javascript
// product-commands.js
export const ProductCommands = {
    ProductList: {
        SearchProduct: "ProductCommands.ProductList.Search",
        ProductListDataLoaded: "ProductCommands.ProductList.ProductListDataLoaded"
    },
    ProductEdit: {
        SaveProduct: "ProductCommands.ProductEdit.SaveProduct"
    }
};

// user-commands.js 
export const UserCommands = {
    UserList: {
        ...
    },
    UserEdit: {
        ...
    }
};
```

* No command separation. 
Each part of application can send any message.
There is no restriction on this.
It is hard to guarantee the application part sends only messages it allowed to send.

This issue is hard to address and avoid. 
If you're using string constants for message names nobody can prevent developer 
from entering the same string manually and break all encapsulation.
You could use some hand-made techniques like message namespacing, 
using non-string message identifiers etc. but there is no common way for this.
In most cases code review would be enough.

* Performance. 
It could be complex to use this pattern if there are thousands of subscribers in the system.
Especially if message addresses to only one of them.
Every subscriber would be notified and must reject foreign message by itself.
This leads to thousands of unnecessary method calls.

There are ways to work around this 
(like introducing `Recipient ID`-like fields both for the message and for subscriber,
named channels, advanced message routing etc.)
but there is no silver bullet in this.

If performance is important consider manual routing. 
Here is also no common ways to solve this because subscribers separation is pretty application-specific.
    
  
## Make our own

In this chapter we will write our own `EventBus` implementation for JavaScript. 
The most libs publishes and subscribes to messages by name, 
our will do this way too, but with some extra syntax sugar.

Example will use subset of ES6 natively supported by Node.JS, but could be easy compiled to ES5 with Babel.  

Our event bus would give us *ideal* decoupling - 
object will use publish-subscribe patterns *without any knowledge about event bus existence*.

We will rich this by providing special `register()` method. 
Any object used as argument of that method will be  processed in special way:
* All members which are functions and which name starts from `on<MessageName>` 
would be registered as handlers for MessageName.

For example,

```javascript
let obj = {
    onData(message) {...}
};

eventBus.register(obj);

let arg = {};
eventBus.publish("Data", arg); // obj.onData(arg) called 
```

* All members which are functions and which name starts from `publish<MessageName>`
would be replaced with new methods. 
If object now calls this method and pass an object as argument, 
the argument will be published as message with `MessageName`. 

Example

```javascript
let obj = {
    // Method body should be empty because method would be replaced with new.
    publishData(message) { }
};

eventBus.register(obj);
let arg = {};

obj.publishData(arg); // The message "Data" with argument arg is published to eventBus.
```

Our implementation is not fully completed because we miss `unregister` method wich cancels object registration.
Also it would be useful to add extra parameter to `subscribe` method identifies subscription owner.
Futher we also could add `unsubscribeAll(owner)` method which cancels all subscriptions belong to specified owner.

This is  useful because current `unsubscribe` method should receive the same instance of callback which used for subscription.
This could be hard if anonymous or arrow functions used.

Our event bus interface looks like this:

```javascript
class SmartEventBus {
    /** Registers callback for processing message with specified name. */    
    subscribe(message, callback) {}
    
    /** Removes callback for processing message. */
    unsubscribe(message, callback) { }
    
    /** 
     * Publishes message with specified name and data. 
     * Executes all registered callbacks for message with the same name using data as argument. 
     */
    publish(message, data) {}
    
    /**
     * Register subscribers and publishers for object methods.
     * Each method started with on<MessageName> will be registered as subscriber for MessageName.
     * Each method started with publish<MessageName> will be replaced with method which publishes MessageName on call.
     * 
     * Methods are searched either in object and in all prototypes.
     */
    register(object) {}
}
```

`subscribe`, `unsubscribe` and `publish` methods are trivial. 
They contain few lines of code each. 
(That's why I said simple event bus could be hand-written in 10 minutes). 
Check source code in the `smart-event-bus.js` file.

`register` method is more tricky.
The first complexity is getting all method names.
It is easy with object literals and prototype inheritance.
Simple iterating over properties could be used: `for(var prop in object) { .. }`.

For ES6 classes it is more complex. 
We should use [Object.getOwnPropertyNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames)
method for getting those properties. 
Moreover ES6 class methods declared on prototype, so we should use 
[Object.getPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf)
method to get prototype and search for methods in prototype and in prototype of prototype till prototype is not null.

We use helper method for this:

```javascript
getProps(object) {
    let hash = Object.getOwnPropertyNames(object)
        .filter(prop => prop !== "constructor")
        .reduce((hash, prop) => {
            hash[prop] = prop;
            return hash;
        }, {});

    let prototype = Object.getPrototypeOf(object);
    if (prototype) {
        hash = Object.assign(hash, this.getProps(prototype));
    }

    return hash;
}
```

I put all found methods to object hash because I'm interested only in names, not in actual structure of method definition.

Now `register` method is trivial, let's look on the code:

```javascript
register(object) {
    
    // Get all properties of inheritance chain
    let propertyHash = this.getProps(object);    
    
    // Object.keys returns all property names as array
    Object.keys(propertyHash)
        .forEach(prop => {
            
            // Get property value
            let val = object[prop];
            
            // Skip empty properties            
            if (val === null || val === undefined) {
                return;
            }
            
            // Skip non-functions
            if (typeof val !== "function") {
                return;
            }
            
            // Register handlers 
            if (prop.startsWith("on")) {
                const messageName = prop.substring(2);
                this.subscribe(messageName, data => {
                    object[prop].call(object, data);
                });
            }

            // Setup publisher methods
            if (prop.startsWith("publish")) {
                const messageName = prop.substring(7);
                
                // Use arrow function to catch this
                object[prop] = (data) => {
                    this.publish(messageName, data);
                };
            }
        });
}
```

And now example:

```javascript
"use strict";

class AlertDisplay {
    onAlert(text) { 
        console.log(text); 
    }
}

class AlterSender {
    // Empty body
    publishAlert(text) {}
}

const SmartEventBus = require("./smart-event-bus");

const eventBus = new SmartEventBus();

const display = new AlertDisplay();
const sender = new AlertSender();

eventBus.register(display);
eventBus.register(sender);

sender.publishAlert("Hello, World!"); // Prints "Hello, World!" to console.
```

As you can see `AlertDisplay` and `AlertSender` don't know about event bus. 
They just call methods or their method are called. Ideal decoupling.