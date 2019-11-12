# Null Events and Transient Transitions

Sometimes, we want to transition to a state and immediately transition to another without calling an event. We can do this using the _null event_ and a _transient transition_ together.

The null event is an empty string: `''`. When we transition to a state that has a null event, we call this a transient transition, because we will not be staying in this state longer than the "step" of the machine.

What is this useful for? It's often useful in combination with guard conditions for deciding where in a machine to transition to after an event. It's also useful for updating context in response to a transition.

For example, I've posted this joke of a `procrastinationMachine` before on Twitter. It works like this:

```javascript
const procrastinationMachine = Machine(
  {
    id: 'procrastination',
    initial: 'idle',
    context: {
      attempts: 0,
    },
    states: {
      idle: {
        on: { TRY_TO_START: 'evaluating' },
      },
      evaluating: {
        entry: 'incrementAttempts',
        on: {
          '': [
            { target: 'working', cond: 'enoughAttempts' },
            { target: 'idle' },
          ],
        },
      },
      working: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      incrementAttempts: assign({
        attempts: ctx => ctx.attempts + 1,
      }),
    },
    guards: {
      enoughAttempts: ctx => ctx.attempts > 2,
    },
  }
)
```

You can visualize this machine at [https://xstate.js.org/viz/?gist=347c96eb19424e7c738df15eb28df0d9](https://xstate.js.org/viz/?gist=347c96eb19424e7c738df15eb28df0d9)

We enter a state where we are `evaluating` what to do next. We update some context on `entry`, and then the null event is called and we determine what transition to take. What's great about this is that it clearly demonstrates how deciding a conditional path can be a state itself in our machine.
