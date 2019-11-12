# Invoking Services

Modeling everything as a single machine is unweildy and difficult to reason about. Luckily, we don't have to.

Thus far, when we've entered a state, we've learned about starting actions and activities, but we can invoke services as well.

Services are child machines. The parent machine can respond to events sent by the child, including a couple special events depending on the service.

Also thus far, we have only really talked about synchronous code. We're about to discover how state machines will help us with asynchronous code.

A service is invoked by using the `invoke` property on a state node. The `invoke` property is an object with the following keys:

- `src` - The machine to be called. This can be:
  - a string pointing to a service in the `options` object
  - another machine
  - a function that returns a `Promise`
  - a function that returns a "callback handler"
  - a function that returns an observable
- `id` - a unique identifier for the service
- `onDone` - (optional) the transition to be taken when:
  - the child machine reaches its final state
  - the invoked promise resolves
  - the invoked observable completes
- `onError` - (optional) the transition taken when the invoked service encounters an error
- `autoForward` - (optional) If set to true, all events sent to the parent machine are forwarded to the child machine. Defaults to `false`.
- `data` - (optional, used only when invoking machines) - an object that maps properties of the child machine's `context` to a function that returns the corresponding value from the parent machine's `context`.

The first type of service we'll learn to invoke is a `Promise`

## Invoking Promises

Any promise can be represented as a machine which makes them perfect for invoking.

Let's say I am attempting to fetch some data from an API.

```javascript
const fetchCuteAnimals = () => {
  return fetch('https://www.reddit.com/r/aww.json')
    .then(res => res.json())
    .then(data => data.data.children.map(child => child.data))
}

const cuteAnimalMachine = Machine({
  id: 'cuteAnimals',
  initial: 'idle',
  context: {
    cuteAnimals: null,
    error: null,
  },
  states: {
    idle: {
      on: { FETCH: 'loading' },
    },
    loading: {
      invoke: {
        id: 'fetchCuteAnimals',
        src: fetchCuteAnimals,
        onDone: {
          target: 'success',
          actions: [
            assign({
              cuteAnimals: (context, event) => event.data,
            }),
          ],
        },
        onError: {
          target: 'failure',
          actions: [
            assign({
              error: (context, event) => event.data,
            }),
          ],
        },
      },
    },
    success: {
      type: 'final',
    },
    failure: {
      on: {
        RETRY: 'loading',
      },
    },
  },
})
```

You can view this machine at [https://xstate.js.org/viz/?gist=1c26d75849004f78b835f29cecbaf7b1](https://xstate.js.org/viz/?gist=1c26d75849004f78b835f29cecbaf7b1).

## Invoking Callbacks

Invoking callbacks is a powerful way to communicate between two machines. The child machine can send events to the parent and vice versa.

Let's make a ridiculous machine. I call it an `echoMachine`.

```javascript
const echoCallback = (c, e) => (cb, onEvent) => {
  onEvent(e => {
    if (e.type === 'YELL') {
      const interval = setInterval(() => {
        cb('ECHO')
      }, 500)

      return () => clearInterval(interval)
    }
  })
}

const echoMachine = Machine(
  {
    id: 'echo',
    initial: 'idle',
    context: {
      echoCount: 0,
    },
    states: {
      idle: {
        entry: ['resetEchoes'],
        on: { ACTIVATE: 'active' },
      },
      active: {
        invoke: {
          src: echoCallback,
          id: 'echoCallback',
        },
        on: {
          '': {
            target: 'idle',
            cond: 'enoughEchoes',
          },
          STOP: 'idle',
          YELL: {
            actions: send('YELL', { to: 'echoCallback' }),
          },
          ECHO: {
            actions: ['incEchoes'],
          },
        },
      },
    },
  },
  {
    actions: {
      incEchoes: assign({ echoCount: ctx => ctx.echoCount + 1 }),
      resetEchoes: assign({ echoCount: 0 }),
    },
    guards: {
      enoughEchoes: ctx => ctx.echoCount > 5,
    },
  }
)
```

There are a lot of shenanigans in there we haven't talked about yet, null events and transient transitions, but we'll get there. The key here is that when a `YELL` event occurs on the parent, we send it to the child. The child receives that event, responds to it by echoing. It calls `ECHO` on the parent which continues to happen until we've reached enough echoes in the `echoCount`.

## Observables

Unlike callbacks, observables can only send events to the parent machine, it cannot receive events from the parent. And like Promises, the `onDone` transition is taken when the observable completes.

```javascript
import { Machine, interpret } from 'xstate'
import { interval } from 'rxjs'
import { map, take } from 'rxjs/operators'

const intervalMachine = Machine({
  id: 'interval',
  initial: 'counting',
  context: { myInterval: 1000 },
  states: {
    counting: {
      invoke: {
        src: (context, event) =>
          interval(context.myInterval).pipe(
            map(value => ({ type: 'COUNT', value })),
            take(5)
          ),
        onDone: 'finished',
      },
      on: {
        COUNT: { actions: 'notifyCount' },
        CANCEL: 'finished',
      },
    },
    finished: {
      type: 'final',
    },
  },
})
```

## Invoking Machines

Invoking a machine is very similar to invoking Promises (because every Promise _is_ a machine). The `onDone` transition is taken when the child machine reaches its final state.

Similar to callbacks, invoked machines can send messages from child to parent and parent to child with `send` and `sendParent`.

```javascript
import { Machine, interpret, send, sendParent } from 'xstate'

// Invoked child machine
const minuteMachine = Machine({
  id: 'timer',
  initial: 'active',
  states: {
    active: {
      after: {
        // This is a delayed transition, we'll learn about them later
        60000: 'finished',
      },
    },
    finished: { type: 'final' },
  },
})

const parentMachine = Machine({
  id: 'parent',
  initial: 'pending',
  states: {
    pending: {
      invoke: {
        src: minuteMachine,
        // The onDone transition will be taken when the
        // minuteMachine has reached its top-level final state.
        onDone: 'timesUp',
      },
    },
    timesUp: {
      type: 'final',
    },
  },
})

const service = interpret(parentMachine)
  .onTransition(state => console.log(state.value))
  .start()
// => 'pending'
// ... after 1 minute
// => 'timesUp'
```
