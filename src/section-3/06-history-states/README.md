# History States

If you've been paying attention, you've realized something as we've been learning about state machines. Because `transition` is a pure function, there's no concept of _time_ or _history_.

XState has a special type of state node that is designed to add this feature to our machine's--the `history` node.

A `history` state node, when transitioned to, will return the machine to the last state _in that area_ of the machine.

There are two kinds of `history` nodes:

- `shallow` - the default, returns the machine to the top level `history` value
- `deep` - updates all children states to their `history` value as well

It's November and here in Portland, it's started to get chilly during the night. We have a space heater that we use to quickly warm the room in the morning and help us start our day. Let's imagine this space heater is a state machine with a `history` state that remembers the setting it had last time it was powered on.

```javascript
const spaceHeaterMachine = Machine({
  id: 'spaceHeater',
  initial: 'poweredOff',
  states: {
    poweredOff: {
      on: { TOGGLE_POWER: 'poweredOn.hist' }
    },
    poweredOn: {
      initial: 'low',
      states: {
        low: {
          on: { TOGGLE_LEVEL: 'high' }
        },
        high: {
          on: { TOGGLE_LEVEL: 'low' }
        },
        hist: {
          type: 'history'
        }
      },
      on: { TOGGLE_POWER: 'poweredOff' }
    },
  }
})
```

You can visualize this machine at [https://xstate.js.org/viz/?gist=63d252aad10e5a8ee6e9f4a36768401c](https://xstate.js.org/viz/?gist=63d252aad10e5a8ee6e9f4a36768401c).

To identify the `history` node, we give the state the `type: history`. Then, when we `TOGGLE_POWER` while `poweredOff`, the machine will transition to the `hist` state of `poweredOn`. If there is a history, for example we had the space heater set to `high`, it will transition to that state. If it's the first time we're powering on the machine, it will transition to the `initial` state of that area of the machine. In this case, that would be `low`.

This uses `history` in the `shallow` setting. What would it look like to use it in the `deep` setting?

Well, one of the features of my space heater is that it also oscillates back and forth, dispersing the heat in an arc around the room. Let's add the oscillation as a parallel state to the heat level.

```javascript
const spaceHeaterMachine = Machine({
  id: "spaceHeater",
  initial: "poweredOff",
  states: {
    poweredOff: {
      on: { TOGGLE_POWER: "poweredOn.hist" }
    },
    poweredOn: {
      type: "parallel",
      states: {
        level: {
          initial: "low",
          states: {
            low: {
              on: { TOGGLE_LEVEL: "high" }
            },
            high: {
              on: { TOGGLE_LEVEL: "low" }
            }
          }
        },
        oscillation: {
          initial: "disabled",
          states: {
            disabled: {
              on: { TOGGLE_OSCILLATION: "enabled" }
            },
            enabled: {
              on: { TOGGLE_OSCILLATION: "disabled" }
            }
          }
        },
        hist: {
          type: "history",
          history: "deep"
        }
      },
      on: { TOGGLE_POWER: "poweredOff" }
    }
  }
});
```

You can visualize this machine at [https://xstate.js.org/viz/?gist=0e11b9c177247df548d70fbeee3507d0](https://xstate.js.org/viz/?gist=0e11b9c177247df548d70fbeee3507d0).

This machine now will remember all the child states of `level` and `oscillation` and return to them when we power the machine back on.
