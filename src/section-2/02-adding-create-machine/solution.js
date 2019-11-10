function createMachine(config) {
  const { id, states } = config

  return {
    transition(state, event) {
      if (!states[state]) {
        throw new Error(
          `Machine '${id}' does not have a state named '${state}'`
        )
      }

      if (!states[state].on) {
        return state
      }

      const transition = states[state].on[event]

      if (!transition) {
        return state
      }

      return transition
    },
  }
}

module.exports = {
  createMachine,
}
