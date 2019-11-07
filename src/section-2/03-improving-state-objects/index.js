function createMachine(config) {
  const { id, initial, states } = config

  return {
    initialState: initial,
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

function interpret(machine) {
  let state = machine.initialState
  let isStarted = false
  const listeners = new Set()

  const service = {
    currentState: () => state,
    send: event => {
      if (!isStarted) {
        return
      }

      state = machine.transition(state, event)
      listeners.forEach(listener => listener(state))
    },
    start: () => {
      isStarted = true
      listeners.forEach(listener => listener(state))
      return service
    },
    stop: () => {
      isStarted = false
      listeners.forEach(listener => listeners.delete(listener))
      return service
    },
    subscribe: listener => {
      listeners.add(listener)

      return {
        unsubscribe: () => listeners.delete(listener),
      }
    },
  }

  return service
}

module.exports = {
  createMachine,
  interpret,
}
