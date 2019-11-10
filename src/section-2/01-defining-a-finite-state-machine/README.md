# Defining a Finite State Machine

What exactly is a finite state machine? A FSM is a mathematical model of computation that describes the behavior of a system. Every FSM has 5 parts:

- A finite number of states
- A finite number of events
- An `initial` state
- A `transition` method that determines the next state given the current state and event.
- A (possibly empty) set of final states

Let's apply this to the graph from before.

We have a finite set of states: lit, unlit, broken. We have a finite set of events, toggle and break. We have an initial state of unlit. We did not have a `transition` method, so we gotta get ourselves one of those. And we did have a final state of broken. We were almost there.

---

Let's keep using the light bulb from before, but build a state machine for it. Let's start by making an object for each state.

```javascript
const lit = {}
const unlit = {}
const broken = {}
```

Let's make a `states` object with all of those together.

```javascript
const states = {
  lit,
  unlit,
  broken
}
```

Cool, we have our finite set of states, let's make our `initial` while we are at it.

```javascript
const initial = 'unlit'
```

We can start to combine these together into a config object we will eventually pass to our machine function.

```javascript
const config = {
  initial,
  states
}
```

So up to this point, if we're thinking about the graph we had before. We have defined all the nodes in our graph, and we've even defined which node we would like to start at when traversing the graph. We haven't created any edges between those nodes right now. Technically, our state machine has 3 final states, but we can't get to any of them except for the one we've started in. So let's think our way through this.

We need to come up with a way of describing events in our system. Something where we can say, "on this event, transition to this state". Before, in our function, we had some methods that look similar to events. What if we took the method `toggle` and made it an event? Let's do that. We'll start with modifying the `unlit` state. Our state will get an `on` property, which will be an object of event descriptors. Each descriptor will point to the state we should go to if that even happens.

```javascript
const unlit = {
  on: {
    TOGGLE: 'lit'
  }
}
```

Cool, this same event does something to our lit state, so let's update that as well.

```javascript
const lit = {
  on: {
    TOGGLE: 'unlit'
  }
}
```

Awesome, we've just created two edges in our graph. We can transition from `lit` to `unlit` and vice versa. What about our `broken` state? Does it get any events? Better yet, how do we get to it? Right now, no other state has an event to it and it's just chilling out on its own. Can you fix that for me? Take a minute and make updates to our states to connect to our `broken` state.

...

Alright, you should have come up with something like this:

```javascript
const lit = {
  on: 
    TOGGLE: 'unlit',
    BREAK: 'broken'
  }
}
const unlit = {
  on: {
    TOGGLE: 'lit',
    BREAK: 'broken'
  }
}
const broken = {}
```
