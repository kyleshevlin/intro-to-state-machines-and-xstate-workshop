# Delayed Events and Transitions

XState comes with a couple ways to easily delay an event and transition.

The elapsing of time itself is an event. Rather than requiring us to always create our own `setTimeout` to fire events, we can take transitions after the elapsing of a set amount of time.

We accomplish this with the `after` property on a state node. Think of it as "after X amount of time, transition". The first way to accomplish this is with a simple shorthand. Supply the timelength in milliseconds that you wish to delay.

Let's create a stoplight that automatically changes what color it displays:

```javascript
const stoplightMachine = Machine({
  id: 'stoplight',
  initial: 'red',
  states: {
    green: {
      after: {
        8000: 'yellow',
      },
    },
    yellow: {
      after: {
        4000: 'red',
      },
    },
    red: {
      after: {
        12000: 'green',
      },
    },
  },
})
```

You can visualize this machine here [https://xstate.js.org/viz/?gist=4161d0d947b3dea1222e53a59ad00bf7](https://xstate.js.org/viz/?gist=4161d0d947b3dea1222e53a59ad00bf7).

Our stop light automatically transitions on the delays we set.

We can make our delays dynamic by using the `options` object and setting our delays as the result of a function.

Let's imagine our same stoplight but in rush hour traffic and we want to double the length of the lights.

```javascript
const stoplightMachine = Machine(
  {
    id: 'stoplight',
    initial: 'red',
    context: {
      isRushHour: true, // yes this could be a state and it could be heirarchical, bear with me for the example.
    },
    states: {
      green: {
        after: {
          GREEN_DELAY: 'yellow',
        },
      },
      yellow: {
        after: {
          YELLOW_DELAY: 'red',
        },
      },
      red: {
        after: {
          RED_DELAY: 'green',
        },
      },
    },
    on: {
      TOGGLE_RUSH_HOUR: {
        actions: 'toggleRushHour',
      },
    },
  },
  {
    actions: {
      toggleRushHour: assign({
        isRushHour: ctx => !ctx.isRushHour,
      }),
    },
    delays: {
      GREEN_DELAY: (ctx, evt) => (ctx.isRushHour ? 8000 * 2 : 8000),
      YELLOW_DELAY: (ctx, evt) => (ctx.isRushHour ? 4000 * 2 : 4000),
      RED_DELAY: (ctx, evt) => (ctx.isRushHour ? 12000 * 2 : 12000),
    },
  }
)
```

This machine can be visualized here: [https://xstate.js.org/viz/?gist=bf85002e6382a9edcdfb1b8a9f779639](https://xstate.js.org/viz/?gist=bf85002e6382a9edcdfb1b8a9f779639)
