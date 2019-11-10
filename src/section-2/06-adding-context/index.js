const toArray = value => (value === undefined ? [] : [].concat(value))

const toStateObject = state =>
  typeof state === 'string' ? { value: state } : state

const toEventObject = event =>
  typeof event === 'string' ? { type: event } : event

const toTransitionObject = transition =>
  typeof transition === 'string' ? { target: transition } : transition

const toActionObject = action => {
  switch (true) {
    case typeof action === 'string':
      return { type: action }

    case typeof action === 'function':
      return { type: action.name, exec: action }

    default:
      return action
  }
}

function createMachine(config) {
  const { id, initial, states } = config

  return {
    initialState: {
      actions: toArray(states[initial].entry).map(toActionObject),
      value: initial,
    },
    transition(state, event) {
      const { value } = toStateObject(state)
      const stateConfig = states[value]

      if (!stateConfig) {
        throw new Error(
          `Machine '${id}' does not have a state named '${value}'`
        )
      }

      const transitionFailure = {
        actions: [],
        changed: false,
        value,
      }

      if (!stateConfig.on) {
        return transitionFailure
      }

      const eventObject = toEventObject(event)
      const transition = stateConfig.on[eventObject.type]

      if (!transition) {
        return transitionFailure
      }

      const { target, actions = [] } = toTransitionObject(transition)
      const nextStateConfig = states[target]
      const allActions = []
        .concat(stateConfig.exit, actions, nextStateConfig.entry)
        .filter(Boolean)
        .map(toActionObject)

      return {
        actions: allActions,
        changed: true,
        value: target,
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
      state.actions.forEach(({ exec }) => {
        exec && exec(toEventObject(event))
      })
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
