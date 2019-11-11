# Activities

Activities are similar to `actions`, but are ongoing rather than "fire and forget". They are started when a state node is entered and stopped when it is exited.

Just like other actions, an activity is a function that receives the current `context` and `event`. Normal actions are void functions, but activites should return a function that performs any cleanup of functionality setup when the activity was started.

Let's take a simple example, an alarm clock. In it's default state, the clock is `idle`. When the alarm goes off, it begins to beep until the alarm is stopped. What would that look like?

```javascript
const alarmClockMachine = Machine(
  {
    id: 'alarmClock',
    initial: 'idle',
    context: {
      foo: 'bar',
    },
    states: {
      idle: {
        on: { ALARM: 'alarming' },
      },
      alarming: {
        activities: ['beeping'],
        on: { STOP: 'idle' },
      },
    },
  },
  {
    activities: {
      beeping: (context, event) => {
        const beep = () => {
          console.log('beep', context, event)
        }

        beep()
        const interval = setInterval(beep, 1000)

        return () => clearInterval(interval)
      },
    },
  }
)
```

You can visualize this machine at [https://xstate.js.org/viz/?gist=eff8b705f60ee4c44eec24c94a30c7d4](https://xstate.js.org/viz/?gist=eff8b705f60ee4c44eec24c94a30c7d4).

When the `alarming` state node is entered, the `beeping` activity is started. We fire an initial `beep` and then call `beep`s every second with `setInterval`. We return a function that calls `clearInterval` when the alarm is stopped.
