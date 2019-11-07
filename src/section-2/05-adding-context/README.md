# Adding Context

Thus far, we've been building something entirely around the idea of finite states. This is great for modeling systems, but it doesn't model all systems. Can you think of anything that _can't_ be modeled with a finite state machine?

The humble text input is a good place to start.

An input can receive an infinite number of strings. It is impossible to enumerate all the possibilities, by definition. It has infinite states.

Now, believe it or not, infinite states can have a role to play in finite state machines. We can store arbitrary infinite states, referred to as "extended state" on the `context` property of a machine.

`context` is an object on the machine that can hold data to be passed to actions and other functions we'll learn in the near future. `context` helps are machines be even more useful.

We can set the initial context of our machine on the `context` property of our config, but we're going to need a new example. What about a smart bulb that changes colors? We could hold the current color value in context.

```javascript
const smartBulbConfig = {
  id: 'smart-bulb',
  initial: 'unlit',
  context: {
    color: '#fff'
  },
  states: {
    unlit: {
      on: {
        BREAK: 'broken',
        TOGGLE: 'lit',
      }
    },
    lit: {
      on: {
        BREAK: 'broken',
        TOGGLE: 'unlit'
      }
    },
    broken: {}
  }
}

const smartBulbMachine = createMachine(smartBulbConfig)
```

Now, we're going to need to add some events that can handle the color change.

```javascript
const smartBulbConfig = {
  id: 'smart-bulb',
  initial: 'unlit',
  context: {
    color: '#fff'
  },
  states: {
    unlit: {
      on: {
        BREAK: 'broken',
        CHANGE_COLOR: {
          actions: []
        },
        TOGGLE: 'lit',
      }
    },
    lit: {
      on: {
        BREAK: 'broken',
        CHANGE_COLOR: {
          actions: []
        },
        TOGGLE: 'unlit'
      }
    },
    broken: {}
  }
}
```

We've added a `CHANGE_COLOR` event to our `unlit` and `lit` states. Notice two things, we haven't added a `target` to the transition object, because we don't want to transition to a different state. Sometimes we'll respond to events and only change the extended state, and not transition to a different state of the machine. We can make a quick update to our code that ensure the target is set to the current state value when our target is undefined.

```javascript
const { target = value, actions = [] } = toTransitionObject(transition)
```

So, the only thing we want to do is fire an action that updates context. How do we do that?

We're going to create a special function, `assign`, that is an action that'll update the context of the given state. This is going to take some work to get right.

I'm going to start by updating the config of our object to what we want. This will put our machine and interpreter into a bit of a broken state, but we'll handle that soon.

```javascript
const smartBulbConfig = {
  id: 'smart-bulb',
  initial: 'unlit',
  context: {
    color: '#fff'
  },
  states: {
    unlit: {
      on: {
        BREAK: 'broken',
        CHANGE_COLOR: {
          actions: [assign((context, event) => ({
            color: event.color
          }))]
        },
        TOGGLE: 'lit',
      }
    },
    lit: {
      on: {
        BREAK: 'broken',
        CHANGE_COLOR: {
          actions: [assign({
            color: (context, event) => event.color
          })]
        },
        TOGGLE: 'unlit'
      }
    },
    broken: {}
  }
}
```

You'll notice I gave `assign` two different signatures. If you're familiar with `React.setState()`, this will look some what familiar to you. We can give `assign` a function that returns an object, or we can give `assign` an object. What's special about the object signature, is that each key can be updated with a function that receives `context`, and the `event`.

Now, let's define this `assign` function. `assign` will create an action object, but with our own private `type` property.

```javascript
const ASSIGN_ACTION_TYPE = '__assign__'
const assign = assignment => ({
  type: ASSIGN_ACTION_TYPE,
  assignment
})
```

Since this creates an action object, it makes sense that we need to update the code that handles our actions next. In `machine.transition`:

```javascript
const allActions = []
  .concat(stateConfig.exit, actions, nextStateConfig.entry)
  .filter(Boolean)
  .map(toActionObject)
  .filter(action => {
    if (action.type !== ASSIGN_ACTION_TYPE) {
      return true
    }

    // handle updating context here

    return false
  })
```

We've added another `filter` to our `allActions` chain of array manipulations because we want to be able to pass along the updated context as part of our next state, but we don't want the user to receive those actions in the returned state object. This actually gets to one of what I would call a "gotcha" in state machine.

`machine.transition` must remain a pure function. Given a state and an event, we always want to get back the same output. Thus, we're going to give back to the user the completely updated context in the next state object. It doesn't matter how many `assign` actions they do, the next `context` will be the combination of them all.

If I try to make a machine that increments a count twice, but logging out the count each time by doing something like:

```javascript
{
  on: {
    INCREMENT: {
      actions: [
        assign({ count: context => context + 1 }),
        context => { console.log(context.count) },
        assign({ count: context => context + 1 }),
        context => { console.log(context.count) },
      ]
    }
  }
}
```

I'm not going to get the result I expect. It's going to log out `2` each time. With this filter we're going to write, this is going to make sense.

```javascript
  let nextContext = context

  const allActions = []
  //...
  .filter(action => {
    const { assignment, type } = action

    if (type !== ASSIGN_ACTION_TYPE) {
      return true
    }

    let tmpContext = {...nextContext}

    if (typeof assignment === 'function') {
      tmpContext = assignment(nextContext, eventObject)
    } else {
      Object.keys(assignment).forEach(key => {
        tmpContext[key] = typeof assignment[key] === 'function'
          ? assignment[key](nextContext, eventObject)
          : assignment[key]
      })
    }

    nextContext = tmpContext
    return false
  })

  return {
    actions: allActions,
    changed: true,
    context: nextContext,
    value: target
  }
```

There is one last thing we need to do. We now are in a situation where we've demonstrated that a machine can have a transition without a target, and thus in theory, they could provide an empty object to that transition and the state will not change.

So `changed` now needs to guarantee that the `target` and `value` are different. It's also helpful to know if there are any actions. We also want to set `changed` to true if we've assigned any new context, thus updating the state, or that we have any actions left in `allActions`.

```javascript
let assigned = false

const allActions = []
  //...
  .filter(action => {
    //...

    let assigned = true
    let tmpContext = {...nextContext}
    //...
  })

return {
  actions: allActions,
  changed: target !== value || allActions.length > 0 || assigned
  context: nextContext,
  value: target
}
```

The last step to wiring this all up is updating our interpreter to call our actions with the state context

```javascript
state.actions.forEach(({ exec }) => {
  exec && exec(state.context, toEventObject(event))
})
```

Now our light bulb should update color when we send an `assign` action for the `CHANGE_COLOR` event.

Why don't you try adding something to context and an event and action for it. You could try checking how many times the light bulb is turned on or off, or perhaps you can add some context for how strong the illumination should be, like a dimmer switch.