const toStateObject = state =>
  typeof state === 'string' ? { value: state } : state

const toEventObject = event =>
  typeof event === 'string' ? { type: event } : event

const toTransitionObject = transition =>
  typeof transition === 'string' ? { target: transition } : transition

const identity = x => x

function createMachine(config) {
  const { context, id, initial, states } = config

  return {
    initialState: { context, value: initial },
    transition(state, event) {
      const { value } = toStateObject(state)
      const stateConfig = states[value]

      if (!stateConfig) {
        throw new Error(
          `Machine '${id}' does not have a state named '${value}'`
        )
      }

      const transitionFailure = {
        value,
        changed: false,
        context,
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
        .filter(identity)

      allActions.forEach(action => {
        action(context, eventObject)
      })

      return {
        value: target,
        changed: true,
        context,
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
