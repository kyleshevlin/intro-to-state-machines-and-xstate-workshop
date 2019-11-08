# Section 3 - Diving into XState

I've got a confession to make. In Section 2, where we built our own finite state machine, we essentially rebuilt the `@xstate/fsm` library from scratch. You can check that project out [here](https://github.com/davidkpiano/xstate/tree/master/packages/xstate-fsm).

Since you are now familiar with the minimalist state machine library, it's time to be introduced to its fully featured companion, [XState](https://xstate.js.org).

With XState, we get a _lot_ more features.

- Hierarchical (nested) states
- Parallel States
- History States
- Activities
- Invokable Services
- Null Events & Transient Transitions
- Delayed Events & Transitions
- And more! (Seriously, there's more, but I won't have a chance to cover it here)

In this section, we'll cover topics that are only available if we use the larger XState library. Having access to these features can help us out in situations where a smaller state machine just won't do.
