/*
Instead of storing our state as a combination of booleans, let's give our
enumerated states names. We can do this with an object mapping a key to a
string that represents our state.
*/

// Enumerating all of the possible states of our bulb
const BULB_STATES = {
  lit: 'lit',
  unlit: 'unlit',
  broken: 'broken',
}

function betterBulb() {
  const initialState = BULB_STATES.unlit
  let state = initialState

  return {
    value() {
      return state
    },
    toggle() {
      switch (state) {
        // If it's broken, no state change can or will occur
        case BULB_STATES.broken:
          return

        case BULB_STATES.lit:
          state = BULB_STATES.unlit
          return

        case BULB_STATES.unlit:
          state = BULB_STATES.lit
          return
      }
    },
    break() {
      // No matter what state we were in, when we break the bulb, it's broken
      state = BULB_STATES.broken
    },
  }
}

const bulb = betterBulb()
const logValue = () => {
  console.log(`Bulb state is: ${bulb.value()}`)
}

logValue()
bulb.toggle()
logValue()
bulb.break()
logValue()
bulb.toggle()
logValue()
