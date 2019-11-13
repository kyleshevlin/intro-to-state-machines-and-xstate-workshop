# More on Transitions

You thought transitions were simple, didn't you?! They can be, with a single string of characters, but they can also be objects with a `target` and `actions` and more.

It is possible for a state to transition to itself. These are called "self transitions". Consider a machine that fires an action with each transition, but doesn't change state.

```javascript
const idleMachine = Machine({
  id: 'idle',
  initial: 'idle',
  states: {
    idle: {
      entry: () => {
        console.log('entered')
      },
      exit: () => {
        console.log('exited')
      },
    },
  },
  on: {
    '*': {
      target: 'idle',
      actions: () => {
        console.log('transitioning')
      },
    },
  },
})
```

You can visualize this machine at [https://xstate.js.org/viz/?gist=5db85c81b33fb15e1dc3df47bdf41fbc](https://xstate.js.org/viz/?gist=5db85c81b33fb15e1dc3df47bdf41fbc).

This `idleMachine` only has one state. We're using what's called a "wildcard descriptor" for our event. _Any_ event sent to our machine will trigger that event and it's transition. We target `idle`, and doing so triggers the `entry`, `exit` and transition `actions` every time. Try it a few times in a console or in the visualizer to see for yourself.

This self transition is called an "external transition". As in, it goes outside of itself and reenters itself. At some point, the transition is external to the state node.

If we make the smallest modification, literally one character, in this machine, we can make it so only the `actions` on the transition are fired. It looks like this:

```javascript
const idleMachine = Machine({
  id: 'idle',
  initial: 'idle',
  states: {
    idle: {
      entry: () => {
        console.log('entered')
      },
      exit: () => {
        console.log('exited')
      },
    },
  },
  on: {
    '*': {
      target: '.idle',
      actions: () => {
        console.log('transitioning')
      },
    },
  },
})
```

You can visualize this machine at [https://xstate.js.org/viz/?gist=71954155fdf6345c10e1f8bb29945e23](https://xstate.js.org/viz/?gist=71954155fdf6345c10e1f8bb29945e23).

How long did it take you to spot the difference? That `.` in front of the `target` of `idle` tells the machine to take an internal transition. It does not exit its state, and therefore also does not re-enter the state. Thus, `entry` and `exit` actions are not called.

This can be useful in situations where transition actions are required, but we want to behave as if we have remained in the same state.

---

One interesting scenario that can take place is a transition to multiple targets. This only occurs when a transition enters a parallel state node and defines the child states of the parallel state node. This is demonstrated in my parallel rich text machine where we `RESET` all the nodes.
