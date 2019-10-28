# Workshop - Section 2
## Learn by Building - Making Our Own Finite State Machine

In the previous section, we worked through some of the difficulties of coding a simple light bulb correctly. There's a few gotchas and it's easy to wind up in an impossible state if we're not careful.

Near the end of that section, we wrote a better light bulb function that got rid of impossible states entirely. However, our solution wasn't something we could easily apply to other systems and model easily. We imperatively handled all our state management by creating our own enum of states and by handling state transitions in each of the methods individually. We want a way for this to happen declaratively, and to generalize how we do this. Lucky for all of us, there are state machines.

Now, I want to take the last idea I talked about in the previous section, that "state" is a directed graph, and build upon that. I think one of the best ways to learn something is to _build_ something, learning and using concepts along the way. So that's what we're going to do, we're going to build a finite state machine library.

---

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
  on: {
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

We've now describe the states of our system and all the finite events that transition us from state to state. But now we need to create a function that can take this config and do something with it. Let's make a factory function called `createMachine` that accepts our config. We'll figure out what it actually does next.

```javascript
function createMachine(config) {
  return '¯\_(ツ)_/¯'
}
```

Ok, what should our machine do? We know for sure that it needs to give us a `transition` method that takes a state and an event, and return us the calculated next state. So let's start writing that up.

```javascript
function createMachine(config) {
  return {
    transition(state, event) {
      return '¯\_(ツ)_/¯'
    }
  }
}
```

Ok, I know it should compute the next state given the state it's given and the event. `transition` is a pure function, we always give it a state and determine what the next state should be. Because we give it a state, we should see if this machine even handles this state, and throw an error if it doesn't.

```javascript
function createMachine(config) {
  const { states } = config

  return {
    transition(state, event) {
      if (!states[state]) {
        throw new Error(`Machine does not have a state named '${state}'`)
      }

      return '¯\_(ツ)_/¯'
    }
  }
}
```

This is good, but I think we can make the error note a little better. As a user, I might be interested in knowing _which_ machine failed a bit faster. If we give each config object an `id`, we can pass that `id` into the error to show our user.

```javascript
const config = {
  id: 'light-bulb',
  initial,
  states
}

// ...

function createMachine(config) {
  const { id, states } = config

  return {
    transition(state, event) {
      if (!states[state]) {
        throw new Error(
          `Machine '${id}' does not have a state named '${state}'`
        )
      }

      return '¯\_(ツ)_/¯'
    }
  }
}
```

Great. I think the next best place to start is to determine if the current `state` even has any events on it. If it doesn't have an `on` property, we know that it can't possibly respond to the `event` and should return the state passed in.

```javascript
function createMachine(config) {
  const { id, states } = config

  return {
    transition(state, event) {
      if (!states[state]) {
        throw new Error(
          `Machine '${id}' does not have a state named '${state}'`
        )
      }

      if (!states[state].on) {
        return state
      }

      return '¯\_(ツ)_/¯'
    }
  }
}
```

We also know if it has the on property but doesn't have this event, then we should also return the `state` passed in.

```javascript
function createMachine(config) {
  const { id, states } = config

  return {
    transition(state, event) {
      if (!states[state]) {
        throw new Error(
          `Machine '${id}' does not have a state named '${state}'`
        )
      }

      if (!states[state].on) {
        return state
      }

      const transition = states[state].on[event]

      if (!transition) {
        return state
      }

      return '¯\_(ツ)_/¯'
    }
  }
}
```

Finally, if we have a defined transition for that event, let's return that.

```javascript
function createMachine(config) {
  const { id, states } = config

  return {
    transition(state, event) {
      if (!states[state]) {
        throw new Error(
          `Machine '${id}' does not have a state named '${state}'`
        )
      }

      if (!states[state].on) {
        return state
      }

      const transition = states[state].on[event]

      if (!transition) {
        return state
      }

      return transition
    }
  }
}
```

Let's try this out with our `config` and see what happens.

```javascript
const lit = {
  on: {
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

const initial = 'unlit'
const states = {
  lit,
  unlit,
  broken
}

const config = {
  id: 'light-bulb',
  initial,
  states
}

function createMachine(config) {
  const { id, states } = config

  return {
    transition(state, event) {
      if (!states[state]) {
        throw new Error(
          `Machine '${id}' does not have a state named '${state}'`
        )
      }

      if (!states[state].on) {
        return state
      }

      const transition = states[state].on[event]

      if (!transition) {
        return state
      }

      return transition
    }
  }
}

const bulb = createMachine(config)

console.log(bulb.transition('lit', 'TOGGLE')) // 'unlit'
console.log(bulb.transition('unlit', 'TOGGLE')) // 'lit'
console.log(bulb.transition('lit', 'BREAK')) // 'broken'
console.log(bulb.transition('unlit', 'BREAK')) // 'broken'
console.log(bulb.transition('broken', 'TOGGLE')) // 'broken'
```