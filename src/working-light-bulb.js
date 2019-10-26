/*
Our stateless bulbs are a bit absurd, but they help us understand something
about state, it's most useful when we can change it.

"State" is the representation of a system at a particular point in time, in the
case of the light bulb, our states are a "lit" state and an "unlit" state.

Let's write a function that returns us a working light bulb.
*/

function workingLightBulb() {
  let isLit = false

  return {
    isLit() {
      return isLit
    },
    toggle() {
      isLit = !isLit
    },
  }
}

const bulb = workingLightBulb()
const logIsLit = () => {
  console.log(`Bulb is lit: ${bulb.isLit()}`)
}

logIsLit()
bulb.toggle()
logIsLit()
bulb.toggle()
logIsLit()
