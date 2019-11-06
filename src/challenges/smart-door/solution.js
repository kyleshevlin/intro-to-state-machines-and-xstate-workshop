const { Machine } = require('xstate')
const { assert } = require('../../utils')

// By making opened and closed nested states of unlocked, we make it impossible
// to lock an opened door, or open a locked door

const doorMachine = Machine({
  id: 'door',
  initial: 'locked',
  states: {
    locked: {
      on: { UNLOCK: 'unlocked' },
    },
    unlocked: {
      initial: 'closed',
      states: {
        closed: {
          on: {
            OPEN: 'opened',
            LOCK: '#door.locked',
          },
        },
        opened: {
          on: { CLOSE: 'closed' },
        },
      },
    },
  },
})

assert(doorMachine.transition('locked', 'UNLOCK').matches('unlocked'), true)
assert(doorMachine.transition('unlocked', 'LOCK').matches('locked'), true)
assert(doorMachine.transition('unlocked.opened', 'LOCK').changed, false)
assert(doorMachine.transition('locked', 'OPEN').changed, false)
