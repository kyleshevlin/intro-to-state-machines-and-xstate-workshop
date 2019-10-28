# Workshop - Section 2
## Learn by Building - Making Our Own Finite State Machine

In the previous section, we worked through some of the difficulties of coding a simple light bulb correctly. There's a few gotchas and it's easy to wind up in an impossible state if we're not careful.

Near the end of that section, we wrote a better light bulb function that got rid of impossible states entirely. However, our solution wasn't something we could easily apply to other systems and model easily. We imperatively handled all our state management by creating our own enum of states and by handling state transitions in each of the methods individually. We want a way for this to happen declaratively, and to generalize how we do this. Lucky for all of us, there are state machines.

Now, I want to take the last idea I talked about in the previous section, that "state" is a directed graph, and build upon that. I think one of the best ways to learn something is to _build_ something, learning and using concepts along the way. So that's what we're going to do, we're going to build a finite state machine library.

---

What exactly is a finite state machine? A FSM is a mathematical model of computation that describes the behavior of a system. Every FSM has 5 parts:

- A finite number of states
- A finite number of events
- An `initial` state
- A `transition` method that determines the next state given the current state and event.
- A (possibly empty) set of final states

Let's apply this to the graph from before.

We have a finite set of states: lit, unlit, broken. We have a finite set of events, toggle and break. We have an initial state of unlit. We did not have a `transition` method, so we gotta get ourselves one of those. And we did have a final state of broken. We were almost there.

---
