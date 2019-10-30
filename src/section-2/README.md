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

Why don't you take a few minutes, and come up with a config of your own and play around with it.

---

This is cool. We have an abstracted way of enumerating states and transitioning between them. But calling `transition` on our machine and passing in a state every time is going to get a bit tedious. We need something that will maintain the state of our machine for us.

In state machine lingo, this is called an interpreter. An interpreter takes a machine and returns to us a service. This service is responsible for maintaining the state of our machine internally, and provides us a number of methods that allow us to update that internal state. We're going to write an interpreter that suits our needs, which in our case, we want a way to get the current state, `send` events to the machine to update the state, a way to start and stop the service should we need, and a way to listen in on various activity in the machine. So let's start with a new `interpret` function.

```javascript
function interpret(machine) {
  return '¯\_(ツ)_/¯'
}
```

The first thing we need our interpreter to do is to start from the initial state of our machine. Let's modify our machine to return an `initialState` property that we can use to do this.

```javascript
function createMachine(config) {
  const { id, initial, states } = config
  //...
  return {
    initialState: initial,
    transition(state, event) {
      //...
    }
  }
}
```

Then in our `interpret` function:

```javascript
function interpret(machine) {
  let state = machine.initialState

  return '¯\_(ツ)_/¯'
}
```

I think one of the first useful things we could do for our interpreter is create a method that let's us view the current state.

```javascript
function interpret(machine) {
  let state = machine.initialState

  return {
    currentState() {
      return state
    }
  }
}
```

Next, let's add a `send` method to be able to transition the state of our service. Send receives an event and returns the next state. This is as simple as calling the `transition` method on our machine with the current state of the service.

```javascript
function interpret(machine) {
  let state = machine.initialState

  return {
    currentState() {
      return state
    },
    send(event) {
      state = machine.transition(state, event)
    }
  }
}
```

Next, let's add a way to start and stop our service:

```javascript
function interpret(machine) {
  let state = machine.initialState
  let isStarted = false

  const service = {
    currentState: () => state,
    send: (event) => {
      state = machine.transition(state, event)
    },
    start: () => {
      isStarted = true
      return service
    },
    stop: () => {
      isStarted = false
      return service
    }
  }

  return service
}
```

The last thing we might want to add is a way to respond when a transition is attempted:

```javascript
function interpret(machine) {
  let state = machine.initialState
  let isStarted = false
  const listeners = new Set()

  const service = {
    currentState: () => state,
    send: event => {
      if (!isStarted) {
        return
      }

      state = machine.transition(state, event)
      listeners.forEach(listener => listener(state))
    },
    start: () => {
      isStarted = true
      listeners.forEach(listener => listener(state))
      return service
    },
    stop: () => {
      isStarted = false
      listeners.forEach(listener => listeners.delete(listener))
      return service
    },
    subscribe: listener => {
      listeners.add(listener)

      return {
        unsubscribe: () => listeners.delete(listener)
      }
    }
  }

  return service
}
```

Let's give our interpreter a spin on our light bulb machine:

```javascript
const bulb = createMachine(config)
const service = interpret(bulb)

service.subscribe(state => { console.log(state) })

service.start() // 'unlit'
service.send('TOGGLE') // 'lit'
service.send('BREAK') // 'broken'

service.stop()
service.send('TOGGLE') // nothing happens, returns undefined
```

---

Alright, now we're really getting some where, our machine and interpreter are getting pretty useful now.

I'd like to take a second to go back and make some updates to the `state` we return from our `machine.transition()` method. Right now, we only return a string, but it seems like there is more useful information that we can provide our users.

Let's start by returning an object with a `value` property instead of a string. To do this, we'll have to update every where that returns a state to return an object. Because we want to be able to pass states returned from `transition` back into the machine, we'll need a way to handle when `transition` is handed either a string or an object for a state. To do that, we'll write a simple helper function `toStateObject`

```javascript
const toStateObject = state => typeof state === 'string' ? { value: state } : state
```

Then we can use it at the top of our `transition` method.

```javascript
transition(state, event) {
  const { value } = toStateObject(state)
  //...
}
```

What are some other useful things we could add to our `state` objects? I think it might be useful to add a `changed` property, that indicates whether the state changed. This could prove useful in our service subscriptions. We won't define it on our `initialState`, but otherwise it should be straight forward (for now) to implement.

...

Now we can create subscriptions that will only respond when something changes. For example, with our light bulb, we only care about the first time breaks, doing anything after that is pointless.

```javascript
bulbService.subscribe(state => {
  if (state.changed && state.value === 'broken') {
    alertUserToGetNewLightBulb()
  }
})
```

It's a bit weird that we'd have to trigger a function through a subscription like that. I wonder if there's something we can do to change that? We'll tackle that next.

---

So far, we've made a machine that transitions between states, but currently has very little, to almost no effect on the world outside of our machine. That doesn't make our machine as useful as it could be. In order to do anything meaningful with a program we have to _eventually_ have an impact on the world outside of program. Whether that's showing something on a screen, passing data to a third-party service, etc, being able to control these effects with a machine is powerful.

When it comes to state machines, there are two categories of side-effects we can create: actions and activities. We're going to cover activities later in the workshop, so for now I'll talk cover actions.

An action is a one-time, "fire and forget" side effect. Call a function, something will happen somewhere. What if our lightBulb machine was actually a smart light bulb machine, so that when it transitioned to the `broken` state, we called a function to let the user know you're bulb broke. How can we implement this?

If we want an action to happen on a transition, then it makes sense to define this somehow on the transition. In our machine, we have these events, `BREAK` and `TOGGLE` and the target other states `broken` and either `lit` or `unlit`. What if we made it optional to add an `actions` property somehow on that transition? Whenever I take the `BREAK` event in either `lit` or `unlit`, I'd like to fire an action as I transition to `broken`. Without implementing how it'll work, let's update our machine config to reflect our wants.

```javascript
//..
{
  lit: {
    on: {
      BREAK: {
        target: 'broken',
        actions: [() => { console.log('The bulb broke while lit')}]
      }
    }
  }
}
```

Now our interpreter doesn't know how to handle an event that points to an object instead of a string. We can rectify this by making _every_ transition an object, and we'll keep the string as a special shorthand in our machine.

```javascript
const toTransitionObject = transition =>
  typeof transition === 'string' ? { target: transition } : transition

function interpret(machine) {
  //...
  return {
    //...
    transition(state, event) {
      //...
      const { target } = toTransitionObject(transition)

      return {
        value: target,
        changed: true
      }
    }
  }
}
```

So far not much as changed, but now that transitions can be objects, we can destructure `actions` from it as well.

```javascript
const { target, actions = [] } = toTransitionObject(transition)
```

Then all we have to do to fire the actions is:

```javascript 
const { target, actions = [] } = toTransitionObject(transition)

actions.forEach(action => {
  action()
})
```

Awesome! Now we are gonna fire an action when we fire the `BREAK` event and take the transition to broken.

We're not done though. The first improvement is that it might be useful to pass the event _into_ our action as an argument. See, one thing we didn't specify before, but the `event` passed to `service.send()` doesn't have to be a string. Just like transitions, we can use a string shorthand for an object. Thus, we can send an object with a `type` property of our event. Should we ever want to pass more information down on our event, we can give send an event object. Like so:

```javascript
//...
const toEventObject = event =>
  typeof event === 'string' ? { type: event } : event

//...
function interpret(machine) {
  //...
  return {
    //...
    transition(state, event) {
      const { value } = toStateObject(state)
      const stateConfig = states[value]
      //...
      const eventObject = toEventObject(event)
      const transition = stateConfig.on[eventObject.type]
      //...
      actions.forEach(action => {
        action(eventObject)
      })
      //...
    }
  }
}
```

Cool, now if we wanted to send some info such as room of the house the bulb is that broke, we could send `bulbService.send({ type: 'BREAK', location: 'living room' })` and then be able to do something with `location` in our action.

The next improvement we can make is that there are not only actions that happen on transitions, but we can define `exit` and `entry` actions on state.

Rather than fire an action on each transition to `broken`, what if we fired an action whenever we entered the `broken` state instead. Let's adjust our config to suit our needs and then write the code to match it.

```javascript
{
  states: {
    //...
    broken: {
      entry: [(event) => { console.log(`I broke due to ${event.type}`) }]
    }
  }
}
```

Now we potentially have more actions than our current code can handle. We need to concatenate the entry actions of the next state some how.

```javascript
//...
const { target, actions = [] } = toTransitionObject(transition)
const nextStateConfig = states[target]
const allActions = []
  .concat(actions, nextStateConfig.entry)
  .filter(x => x)

allActions.forEach(action => {
  action(eventObject)
})
```

We actually did something pretty clever here. There's no guarantee that `nextStateConfig.entry` is defined. By calling `filter` with an identity function, each action is coerced into a boolean, and `undefined` items are filtered out.

If we can call actions when we enter a state, then it makes sense to be able to call them when we exit a state as well.

```javascript
const allActions = []
  .concat(stateConfig.exit, actions, nextStateConfig.entry)
  .filter(x => x)

allActions.forEach(action => {
  action(eventObject)
})
```



