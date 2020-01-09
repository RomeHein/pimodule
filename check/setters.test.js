/* global test, describe, expect, jest */
const PiModuleHelper = require('../pimodule')
const I2c = require('i2c-bus')

describe('Check setters', () => {
  const piModule = new PiModuleHelper()

  test('key pressed detection', async () => {
    await piModule.setKeyPressedDetection(100)

    const mockCallback = jest.fn()
    piModule.on('a-key-triggered', mockCallback)

    // Simulate key stroke on A button
    const i2c1 = await I2c.openPromisified(1)
    await i2c1.writeByte(...piModule.commands.keys, 0x01)
    await i2c1.close()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockCallback.mock.calls.length).toBe(1)
    await piModule.setKeyPressedDetection()
    expect(piModule.keyPressedDetectionTimer).toBeNull()
  })
})
