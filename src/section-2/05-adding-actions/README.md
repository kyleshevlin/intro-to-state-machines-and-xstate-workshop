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
        actions: [() => { console.log('The bulb broke while lit') }]
      }
    }
  }
}
```

Now our machine doesn't know how to handle an event that points to an object instead of a string. We can rectify this by making _every_ transition an object. A transition that is a string will be a shorthand for `{ target: transition }`.

```javascript
const toTransitionObject = transition =>
  typeof transition === 'string' ? { target: transition } : transition

function createMachine(config) {
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

Now our machine can handle when `transition` is a string or an object. Next we have to be able to respond to `actions` put on that object.

To start, we can destructure `actions` off of the `transition` object, and for ease of use, we're going to default assign it to an empty array.

```javascript
const { target, actions = [] } = toTransitionObject(transition)
```

Now, we have to update the state objects returned by `machine.transition` to have an array of `actions` on them. One thing to remember, `machine.transition` is a pure function. So we never create side effects from the machine. The interpreter is in charge of dealing with side effects.

To start, this means we update our `initialState` object to have an empty array of `actions` (this will get updated later, and you'll see why):

```javascript
{
  initialState: {
    actions: [],
    value: config.initial
  }
}
```

Next, in our `transitionFailure` object, we'll also add an empty array of actions.

```javascript
const transitionFailure = {
  actions: [],
  changed: false,
  value,
}
```

Lastly, we're going to take the actions from the transition object and put them on the returned state.

```javascript
const { target, actions = [] } = toTransitionObject(transition)

return {
  actions,
  changed: true,
  value: target
}
```

Awesome! Now we are gonna fire an action when we fire the `BREAK` event and take the transition to broken.

We're not done though. The first improvement to make is that it might be useful to pass the event _into_ our action as an argument. So far, we've only been sending events as strings, but there's nothing to stop us from allowing an event object with more info stored in that object. This way, the string becomes a short hand for an event object (`{ type: event }`). Let's add a `toEventObject` function to handle this data massaging.

```javascript
//...
const toEventObject = event =>
  typeof event === 'string' ? { type: event } : event

//...
function createMachine(config) {
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
    }
  }
}
```

And we can use it in the interpreter as well to call these actions and pass them the event object.

```javascript
function interpret(machine) {
  //...
  send: event => {
    //...
    state = machine.transition(state, event)
    state.actions.forEach(action => {
      action(toEventObject(event))
    })
    //...
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
  .filter(Boolean)
```

We actually did something pretty clever here. There's no guarantee that `nextStateConfig.entry` is defined. By calling `filter` with the Boolean function, each action is coerced into a boolean, and `undefined` items are filtered out.

If we can call actions when we enter a state, then it makes sense to be able to call them when we exit a state as well.

```javascript
const allActions = []
  .concat(stateConfig.exit, actions, nextStateConfig.entry)
  .filter(Boolean)
```

I want to take a second to point out the order of actions getting called, it always goes in this order, current state's `exit`, the transition actions, and then the next state's `entry`. This is true of XState as well, so when we get to that section of the workshop, all of this will be very familiar.

Now that we have entry actions, we actually need to update our `initialState` in our machine to return them.

```javascript
const toArray = value => value === undefined ? [] : [].concat(value)

function createMachine(config) {
  const { id, initial, states } = config

  return {
    initialState: {
      actions: toArray(states[initial].entry)
    }
  }
}
```

I want to add one last feature to actions that'll not do much to improve our interpreter now, but will help us in the near future. I want to normalize our actions, so that each one is an object. I'm going to do this with another function that massages an action into the shape I want.

```javascript
const toActionObject = action => {
  switch (true) {
    case typeof action === 'string':
      return { type: action }

    case typeof action === 'function':
      return { type: action.name, exec: action }

    default:
      return action
  }
}
```

Now that we have `toActionObject`, we need to map our actions with it in two places, and update how we call our actions in the interpreter.

```javascript
const toActionObject = action => {
  switch (true) {
    case typeof action === 'string':
      return { type: action }

    case typeof action === 'function':
      return { type: action.name, exec: action }

    default:
      return action
  }
}

function createMachine(config) {
  const { id, initial, states } = config

  return {
    initialState: {
      actions: toArray(states[initial].entry).map(toActionObject)
    },
    transition(state, event) {
      //...
      const allActions = []
        .concat(stateConfig.exit, actions, nextStateConfig.entry)
        .filter(Boolean)
        .map(toActionObject)
    }
  }
}

//...
function interpret(machine) {
  //...
  send: event => {
    //...
    state.actions.forEach(({ exec }) => {
      exec && exec(toEventObject(event))
    })
    //...
  }
}
```

Now a user can pass an action in as a string shorthand. It won't do anything with our version of machine and interpreter, but this will help us in the next section and will familiarize you with the XState API for actions.