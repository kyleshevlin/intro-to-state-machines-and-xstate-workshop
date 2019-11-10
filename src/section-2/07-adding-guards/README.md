# Adding Guards

We have one last feature we're going to build into our state machine. Wouldn't it be nice if we could _conditionally_ take a transition when reacting to an event? A simple example might be a vending machine. When a user presses a button to vend an item, we only want it to happen if they have deposited enough money to pay for that item. How can we add this to our machine?

We do this by placing a `cond` property on our transition object. `cond` is a predicate function (a function that returns a boolean) that receives the current `context` and `event` objects as arguments. The transition is only taken if `cond` returns `true`.

Let's start by imagining what our config will look like with this `cond` property added. To do this, let's switch up our example to the vending machine mentioned above.

```javascript
const config = {
  id: 'vending-machine',
  initial: 'idle',
  context: {
    change: 0,
    deposited: 0
  },
  states: {
    idle: {
      on: {
        DEPOSIT_QUARTER: {
          actions: [
            assign({
              deposited: context => context.deposited + 25
            })
          ]
        },
        VEND: {
          target: 'vending',
          cond: context => context.deposited >= 100
        }
      }
    },
    vending: {
      on: {
        DONE: 'idle'
      }
    }
  }
}
```

In the `idle` state, we have added a `VEND` event that has a `cond` function, this transition can only be taken if enough money has been deposited. Let's update our `creatMachine` to make this work.

The first thing to do is to destructure `cond` from our transition object, but because we still want to allow the string shorthand, we'll need to give `cond` a default value. Let's give it a predicate function that always returns true.

```javascript
function createMachine(config) {
  //...
  const {
    target = value,
    actions = [],
    cond = () => true,
  } = toTransitionObject(transition)
}
```

Now, if a `cond` is not supplied by a transition, calling the function will result in true. This allows us to keep the string shorthand for our transitions while allowing us to pass `context` and the `eventObject` when one is supplied.

```javascript
function createMachine(config) {
  //...

  const {
    target = value,
    actions = [],
    cond = () => true,
  } = toTransitionObject(transition)

  if (cond(context, eventObject)) {
    const nextStateConfig = states[target]
    let assigned = false
    //...
    return {
      actions: allActions,
      changed: target !== value || allActions.length > 0 || assigned,
      context: nextContext,
      value: target,
    }
  }

  // In the case where a condition wasn't met
  return transitionFailure
}
```

Now, one thing that is very useful when using conditions is the ability to try a different transition if our first condition isn't met. Up til now, we've only allowed our machine to try a single transition for an event. However, with the addition of guards, it makes sense that we allow the user to supply an array of transitions, and to take the first one that returns true from its `cond` function.

To do this, we need to change our code so that it makes an array of our transitions, regardless of how many are passed in, and then iterates over each transition, with an option to break our iteration once we return a transition.

To start, we can use our `toArray()` helper function and rename our variable to `transitions`

```javascript
const transitions = toArray(stateConfig.on[eventObject.type])
```

Now, we're going to use a `for..of` loop because we need it to break and return early if a transition is taken.

```javascript
for (const transition of transitions) {
  //...
}
```

We're going to move our check for the existence of a `transition` object to the top of our loop.

```javascript
for (const transition of transitions) {
  if (!transition) {
    return transitionFailure
  }
}
```

That's all there is to guards! Super simple to implement, but quite a powerful addition to our state machines. Try making some configs of your own that test out this feature.
