/*
What if we didn't have "state", and things were just always what they were?
That would be a bit of a strange world. Thinking about that too much might hurt
your brain. But, let's consider an absurd example anyways, a light bulb.

If we had a lamp in this stateless world, in order for the lamp to be on, we
would give it a light bulb that was always lit, and when we needed it off,
we would give it a lightbulb that was always unlit (or no bulb at all, but roll
with me here).

We can represent these stateless bulbs as functions that always return the same
value
*/

function alwaysLitBulb() {
  return { lit: true }
}

function alwaysUnlitBulb() {
  return { lit: false }
}

function lamp(bulb) {
  console.log(`Bulb is lit: ${bulb.lit}`)
}

lamp(alwaysLitBulb())
lamp(alwaysUnlitBulb())
