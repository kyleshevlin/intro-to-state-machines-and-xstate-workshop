# Adding `interpret`

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
