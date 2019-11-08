# Interpreter Differences

Just as `Machine` is more robust in the XState library than in our FSM library, so to is the supplied interpreter, the `interpret` function.

It contains everything we had before: `start`, `stop`, `send` and `subscribe`, but has many more methods that can be useful as well.

Most of these helpful methods are event handlers, which I refer to as the `on*` methods. They are:

- `onChange`
- `onDone`
- `onEvent`
- `onSend`
- `onStop`
- `onTransition`

Each of these methods receives a `listener` function (each listener accepts slightly different arguments. I recommend consulting the API docs for the precise API of the method [https://xstate.js.org/api/classes/interpreter.html](https://xstate.js.org/api/classes/interpreter.html)). These listeners are called when ever the corresponding event happens in the interpreted service.
