## Adding `createMachine`

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