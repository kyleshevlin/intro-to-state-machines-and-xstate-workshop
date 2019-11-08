# `Machine` configuration and `options`

In building our own finite state machine, we made a `createMachine` factory function. All the configs we wrote for `createMachine` will work exactly the same in XState's `Machine` factory function. Just drop the `create`.

`Machine` has a larger API than what we built before, so let's explore those differences.

## `strict` mode

There is one additional property that can be added to the `config` object, the `strict` property. By default, `strict` is `false`. By setting it to `true`, the Machine will throw an error whenever it encounters an event that is unaccounted for.

## The `options` argument

Our `createMachine` function only received one argument, a machine `config`. `Machine`, on the other hand, takes three arguments:

- `config` - what we know and love
- `options` - (optional) an object of our `actions`, `guards`, `activities`, and `services`
- `context` - (optional) the starting `context` of the machine

There's almost no reason to use this third argument, as there is a method that will do the same we will discuss shortly, but the second argument is very useful.

The `options` object allows us to use string shorthands to define `actions`, `guards`, `activities`, and `services` in our config. It is actually preferred that we write these this way as it makes our machines serializable and extendable. Let's make a simple example.

```javascript
const lightBulbMachine = Machine({
  id: 'lightBulb',
  initial: 'off',
  states: {
    lit: {
      on: {
        POWER_OFF: {
          target: 'unlit',
          actions: ['sendAnalytics']
        }
      }
    },
    unlit: {
      on: {
        POWER_ON: {
          target: 'lit',
          actions: ['sendAnalytics']
        }
      }
    }
  }
}, {
  actions: {
    sendAnalytics: (context, event) => { sendEventToAnalytics(event) }
  }
})
```

We can do the same for guards, activities and services, which we will learn about later.

## `.withConfig`

A nice method on `Machine` is `withConfig`, though it is somewhat poorly named. This allows us to override and merge in changes to the `options` of a machine. In this way, I can define a machine, give it a host of actions or services to be called, but I can redefine _what_ those actions do, if they do anything at all.

Perhaps I want a plainer bulb:

```javascript
const plainBulb = lightBulb.withConfig({
  actions: {
    sendAnalytics: () => {}
  }
})
```

## `.withContext`

Just as we could alter the `options` of a machine, we can replace the starting `context` of the machine as well. Whereas `withConfig` will _merge_ the object passed in with the original `options`, the object passed into `withConfig` will replace the context entirely.
