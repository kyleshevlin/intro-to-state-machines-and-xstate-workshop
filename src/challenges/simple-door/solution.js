const { Machine } = require('xstate')

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
