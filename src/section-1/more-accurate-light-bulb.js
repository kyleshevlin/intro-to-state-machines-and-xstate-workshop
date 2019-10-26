/*
We made a working light bulb, but it's actually an inaccurate one. Light bulbs,
at least up until recently, were pretty easy to break. Thus, we need a bulb
that can be broken.

Let's try and write a function that represents this.
*/

function moreAccurateBulb() {
  let isLit = false
  let isBroken = false

  return {
    isLit() {
      return isLit
    },
    toggle() {
      isLit = !isLit
    },
    isBroken() {
      return isBroken
    },
    break() {
      isBroken = true
    },
  }
}

const bulb = moreAccurateBulb()
const logIsLit = () => {
  console.log(`Bulb is lit: ${bulb.isLit()}`)
}
const logIsBroken = () => {
  console.log(`Bulb is broken: ${bulb.isBroken()}`)
}

logIsLit()
bulb.toggle()
logIsLit()
bulb.break()
logIsBroken()
logIsLit() // uh oh

/*
Uh oh! We've ended up in what should be an impossible state. How can a bulb both be lit and broken?
*/
