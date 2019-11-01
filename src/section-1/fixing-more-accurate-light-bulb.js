// This is what we have

// eslint-disable-next-line
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

// Make these pure functions now so I can use them on other bulbs
const logIsLit = bulb => {
  console.log(`Bulb is lit: ${bulb.isLit()}`)
}
const logIsBroken = bulb => {
  console.log(`Bulb is broken: ${bulb.isBroken()}`)
}

/*
Now let's try and fix it step by step. Perhaps the first thing to do is set
`isLit` to false when we call `break()` on our bulb
*/

function slightlyBetterBulbFactory() {
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
      isLit = false
    },
  }
}

const slightlyBetterBulb = slightlyBetterBulbFactory()
const sbb = slightlyBetterBulb // :) I'm lazy

logIsLit(sbb)
sbb.toggle()
logIsLit(sbb)
sbb.break()
logIsBroken(sbb)
logIsLit(sbb) // Phew

sbb.toggle()
logIsLit(sbb) // Gah!

/*
Ok, so it's not enough to set isLit to false, we have to prevent it from being
toggled once the bulb is broken
*/

function evenSlightlyBettererBulbFactory() {
  let isLit = false
  let isBroken = false

  return {
    isLit() {
      if (isBroken) {
        return false
      }

      return isLit
    },
    toggle() {
      if (isBroken) {
        isLit = false
        return
      }

      isLit = !isLit
    },
    isBroken() {
      return isBroken
    },
    break() {
      isBroken = true
      isLit = false
    },
  }
}

const esbb = evenSlightlyBettererBulbFactory()

console.log('==================')

logIsLit(esbb)
esbb.toggle()
logIsLit(esbb)
esbb.break()
logIsBroken(esbb)
logIsLit(esbb)
esbb.toggle()
logIsLit(esbb) // phew
