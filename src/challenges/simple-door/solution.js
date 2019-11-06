const { Machine } = require('xstate')
const { assert } = require('../../utils')

const doorMachine = Machine({
  id: 'simple-door',
  initial: 'locked',
  states: {
    locked: {
      id: 'locked',
      on: { UNLOCK: 'unlocked' },
    },
    unlocked: {
      initial: 'closed',
      states: {
        closed: {
          id: 'closed',
          on: {
            OPEN: 'opened',
            LOCK: '#locked',
          },
        },
        opened: {
          initial: 'deadboltDisengaged',
          states: {
            deadboltDisengaged: {
              on: {
                ENGAGE: 'deadboltEngaged',
                CLOSE: '#closed',
              },
            },
            deadboltEngaged: {
              on: {
                DISENGAGE: 'deadboltDisengaged',
              },
            },
          },
        },
      },
    },
  },
})

assert(
  doorMachine.transition({ unlocked: 'opened' }, 'LOCK').changed,
  false,
  'Cannot lock while door is opened'
)
assert(
  doorMachine.transition(
    {
      unlocked: {
        opened: 'deadboltEngaged',
      },
    },
    'CLOSE'
  ).changed,
  false,
  'Cannot close while deadbolt is engaged'
)
