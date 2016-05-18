# Publish-subscribe software design pattern

## Definitions

Publish-subscribe (shorten pub-sub) is the pattern of communication between application parts. 
The essential of this pattern is interchange with pieces of data called *messages*. 
Each part of application can either send the message or *subscribe* to new messages.
*Subscription* means register callback function which would be called when new message arrives. 

Some examples. 

##### Node.JS EventEmitter
```javascript
const EventEmitter = require('events');

const myEventBus = new EventEmitter();


myEventBus.on("myEvent", (message) => {
    console.log(`Hello, ${message.text}`);
});

myEventBus.emit("myEvent", { text: "World" });

```

##### .NET and C# has publish-subscribe pattern built into framework
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