/* global test, describe, expect */
const PiModuleHelper = require('../pimodule')

describe('Check getters', () => {
  const piModule = new PiModuleHelper()

  test('get Pi module temperature', async () => {
    const temp = await piModule.getPiModuleTemperature()
    expect(temp).toBeDefined()
  })
  test('get Pi module battery', async () => {
    const battery = await piModule.getBatteryLevel()
    expect(battery).toBeDefined()
  })
  test('get pi powering mode', async () => {
    const mode = await piModule.getPoweringMode()
    expect(mode).toBeDefined()
    expect(mode).not.toContain('unknown')
  })
  test('pi module running properly', async () => {
    const running = await piModule.piModuleIsRunningProperly()
    expect(running).toBeTruthy()
  })
  test('get pi module bistable relay state', async () => {
    const state = await piModule.getBiStableRelayState()
    expect(state).toBeDefined()
  })
  test('get pi module fan mode', async () => {
    const mode = await piModule.getFanMode()
    expect(mode).toBeDefined()
  })
  test('get pi module fan running state', async () => {
    const running = await piModule.fanIsRunning()
    expect(running).toBeDefined()
  })
  test('get pi module fan speed', async () => {
    const mode = await piModule.getFanSpeed()
    expect(mode).toBeDefined()
  })
})
