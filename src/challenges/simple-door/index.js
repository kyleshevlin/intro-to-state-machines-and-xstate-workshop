const { Machine } = require('xstate')

// Make a door that works like your basic door with a deadbolt lock on it.
// The thing that makes this tricky is that the deadbolt can be engaged while
// the door is open, which would prevent the door from closing.
// Hint, this door requires even more hierarchical levels

// It can be in the following "states"
// Either open or closed
// Either locked or unlocked
// The door can not be closed if the lock is already engaged
// The door cannot be opened if it is locked

// Check the tests for some hints to the solution

const doorMachine = Machine({
  id: 'simple-door',
  initial: 'locked',
  states: {},
})

module.exports = {
  doorMachine,
}
