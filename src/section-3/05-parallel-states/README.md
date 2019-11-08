# Parallel States

Just as we can have states that are the children of parent states, we can have state systems that have no relation to each other whatsoever. They are parallel states. Each graph of state nodes is independent, the overall system is in multiple states at the same time.

With parallel states, the machine is in all of the states at the same time and there are no transitions between these nodes. Each of them contains their own set of substates.

I recently came across a great use of parallel states that I'm going to borrow for this workshop. I want to give full credit to the author, Robert Nystrom, and here is a [link to the example I am borrowing](https://gameprogrammingpatterns.com/state.html#concurrent-state-machines).

Do you play video games? I enjoy a few of them (too much, probably). Video games often make great use of state machines. A character is either doing _this_ or _that_. There are things though that a character can do in parallel. For example, a character might be moving while also wielding a weapon. Let's make a parallel state machine that makes sense of this.

To start, we set the `type` property of our machine to `parallel`. We also do not supply an `initial` property, since a parallel state node is in all of its states simultaneously.

```javascript
const heroineMachine = Machine({
  id: 'heroine',
  type: 'parallel',
  states: {
    movement: {
      initial: 'standing',
      states: {
        standing: {
          on: { WALK: 'walking' }
        },
        walking: {
          on: {
            STOP: 'standing'
          }
        }
      }
    },
    weaponHandling: {
      initial: 'holstered',
      states: {
        holstered: {
          on: { ARM: 'armed' }
        },
        armed: {
          on: { HOLSTER: 'holstered' }
        }
      }
    }
  }
})
```

You can see this machine visualized at [https://xstate.js.org/viz/?gist=abf51d6ec1a3a4f843b89187a3b8d270](https://xstate.js.org/viz/?gist=abf51d6ec1a3a4f843b89187a3b8d270).
