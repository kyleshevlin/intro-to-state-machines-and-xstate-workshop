# Improving State Objects

I'd like to take a second to go back and make some updates to the `state` we return from our `machine.transition()` method. Right now, we only return a string, but it seems like there is more useful information that we can provide our users.

Let's start by returning an object with a `value` property instead of a string. To do this, we'll have to update every where that returns a state to return an object. Because we want to be able to pass states returned from `transition` back into the machine, we'll need a way to handle when `transition` is handed either a string or an object for a state. To do that, we'll write a simple helper function `toStateObject`

```javascript
const toStateObject = state =>
  typeof state === 'string' ? { value: state } : state
```

Then we can use it at the top of our `transition` method.

```javascript
transition(state, event) {
  const { value } = toStateObject(state)
  //...
}
```

What are some other useful things we could add to our `state` objects? I think it might be useful to add a `changed` property, that indicates whether the state changed. This could prove useful in our service subscriptions. We won't define it on our `initialState`, but otherwise it should be straight forward (for now) to implement.

...

Now we can create subscriptions that will only respond when something changes. For example, with our light bulb, we only care about the first time breaks, doing anything after that is pointless.

```javascript
bulbService.subscribe(state => {
  if (state.changed && state.value === 'broken') {
    alertUserToGetNewLightBulb()
  }
})
```

It's a bit weird that we'd have to trigger a function through a subscription like that. I wonder if there's something we can do to change that? We'll tackle that next.

We can also add a nice bit of functionality by adding a `matches` method so that we can determine if this state matches a particular value. To do this, we create a `createMatcher` factory function, like so:

```javascript
const createMatcher = value => stateValue => value === stateValue
```

We then supply each object with `matches: createMatcher(theValue)` key/value pair.
