const toStateObject = state =>
  typeof state === 'string' ? { value: state } : state

function createMachine(config) {
  const { id, initial, states } = config

  return {
    initialState: { value: initial },
    transition(state, event) {
      const { value } = toStateObject(state)

      if (!states[value]) {
        throw new Error(
          `Machine '${id}' does not have a state named '${value}'`
        )
      }

      const transitionFailure = {
        value,
        changed: false,
      }

      if (!states[value].on) {
        return transitionFailure
      }

      const transition = states[value].on[event]

      if (!transition) {
        return transitionFailure
      }

      return {
        value: transition,
        changed: true,
      }
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
