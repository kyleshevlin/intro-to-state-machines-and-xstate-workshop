const { Machine } = require('xstate')

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
