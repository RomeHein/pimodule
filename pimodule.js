const I2c = require('i2c-bus')
const EventEmitter = require('events')

module.exports = class PiModuleHelper extends EventEmitter {
  constructor (addressesType) {
    super()
    this.addressesType = addressesType || 'default'
    if (addressesType === 'noRtc') {
      this.addresses = [0x68, null, null, 0x6B]
    } else if (addressesType === 'alternate') {
      this.addresses = [0x58, 0x59, 0x5A, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F]
    } else {
      this.addresses = [0x68, 0x69, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F]
    }

    this.commands = {
      poweringMode: [this.addresses[1], 0x00],
      batteryLevel: [this.addresses[1], 0x08],
      temperature: [this.addresses[1], 0x1b],
      pimoduleRunning: [this.addresses[1], 0x1a],
      keys: [this.addresses[1], 0x1b],
      shutdownTimer: [this.addresses[3], 0x05],
      auxilaryPower: [this.addresses[3], 0x06],
      buzzer: [this.addresses[3], 0x0d],
      buzzerFrequency: [this.addresses[3], 0x0e],
      buzzerDuration: [this.addresses[3], 0x10],
      relay: [this.addresses[3], 0x0c],
      ledGreen: [this.addresses[3], 0x0a],
      ledOrange: [this.addresses[3], 0x09],
      letBlue: [this.addresses[3], 0x0b],
      fanMode: [this.addresses[3], 0x11],
      fanSpeed: [this.addresses[3], 0x12],
      fanRunning: [this.addresses[3], 0x13],
      fanTemperatureTreshold: [this.addresses[3], 0x14]
    }

    this.getable = ['poweringMode', 'batteryLevel', 'temperature', 'auxilaryPower', 'buzzer', 'relay', 'ledGreen', 'ledOrange', 'ledBlue', 'fanMode', 'fanSpeed', 'fanRunning', 'fanTemperatureTreshold']
    this.switchable = ['auxilaryPower', 'buzzer', 'relay', 'ledGreen', 'ledOrange', 'ledBlue']
  }

  /**
  * Change I2C addresses used by piModule
  * @param {String} fromType 'alternate', 'noRtc' or 'default' can be used
  * @param {String} toType 'alternate', 'noRtc' or 'default' can be used
  */
  static async setAddressType (fromType, toType) {
    let i2c1 = await I2c.openPromisified(1)
    const address = (fromType === 'alternate' ? 0x5B : 0x6B)
    let command = 0xA0
    if (toType === 'alternate') {
      command = 0xA2
    } else if (toType === 'noRtc') {
      command = 0xA1
    }
    await i2c1.writeByte(address, 0x00, command)
    await i2c1.close()
  }

  // -------------------
  // GETTERS

  async get (hardware) {
    if (this.commands[hardware] && this.getable.indexOf(hardware) > -1) {
      const i2c1 = await I2c.openPromisified(1)
      const byte = await i2c1.readByte(...this.commands[hardware])
      await i2c1.close()
      return parseInt(byte, 16)
    }
    throw new Error(hardware + `is not a known 'getable' hardware`)
  }

  /**
   * Returns 'cable' if the raspberry is beeing powered by the cable, otherwise returns 'battery'
   */
  async getPoweringMode () {
    const data = await this.get('poweringMode')
    if (data === 1) {
      return 'cable'
    } else if (data === 2) {
      return 'battery'
    } else {
      return 'unknown'
    }
  }

  /**
   * Battery Voltage in 10th of mV in BCD format
   */
  async getBatteryLevel () {
    return this.get('batteryLevel')
  }

  /**
   * Get piModule PCB temperature
   */
  async getPiModuleTemperature () {
    return this.get('temperature')
  }

  /**
   * Get piModule relay state
   */
  async getBiStableRelayState () {
    return this.get('relay')
  }

  /**
   * Get fan mode: 0 is disabled, 1 is manual (read set fan speed), 2 is automatic
   */
  async getFanMode () {
    return this.get('fanMode')
  }

  async fanIsRunning () {
    return this.get('fanRunning')
  }

  /**
   * Get fan speed in %
   */
  async getFanSpeed () {
    return this.get('fanSpeed')
  }

  // -------------------
  // SETTERS

  async switch (hardware, on) {
    if (this.commands[hardware] && this.switchable.indexOf(hardware) > -1) {
      const i2c1 = await I2c.openPromisified(1)
      await i2c1.writeByte(...this.commands[hardware], on ? 0x01 : 0x00)
      await i2c1.close()
    } else {
      throw new Error(hardware + `is not a known 'switchable' hardware`)
    }
  }

  /**
   * Enable or disable the battery on the auxilary 5v and 3.3v of the piModule
   * @param {Boolean} on true if auxilary 5v and 3.3v need to be backed on piModule battery
   */
  async switchBackedAuxilaryPower (on) {
    await this.switch('auxilaryPower', on)
  }

  /**
   * Turn the built in buzzer of the pimodule on and off
   * @param {Boolean} on true to enable the built in buzzer of the pimodule
   */
  async switchBuzzer (on) {
    await this.switch('buzzer', on)
  }

  /**
   * Set piModule relay state
   * @param {Boolean} on true to turn on the relay
   */
  async switchBiStableRelay (on) {
    await this.switch('relay', on)
  }

  /**
   * Control state of the 3 built in leds
   * @param {String} color Orange, green and blue are available
   * @param {Bool} on Turn on or off the led
   */
  async switchLed (color, on) {
    if (color === 'green') {
      await this.switch('ledGreen', on)
    } else if (color === 'blue') {
      await this.switch('ledBlue', on)
    } else if (color === 'orange') {
      await this.switch('ledOrange', on)
    } else {
      throw new Error('Not a known led color')
    }
  }

  // -------------------
  // OTHERS

  /**
   * Set the shutdown timer (named STA or still alive functionnality). The timer can be updated or stoped before it reaches 0.
   * @param {Integer} seconds Seconds before the raspberry pi is turned off. Maximum value 596 seconds
   */
  async setShutdownTimer (seconds) {
    if (seconds > 0 && seconds <= 596) {
      const i2c1 = await I2c.openPromisified(1)
      const wbuf = Buffer.from([seconds.toString(16)])
      await i2c1.writeI2cBlock(this.addresses[3], 0x05, wbuf.length, wbuf)
      await i2c1.close()
    } else {
      throw new Error('Maximum shutdown timer value is 596 seconds. Minimum is 1')
    }
  }

  /**
   * Stop the shutdown timer (named STA or still alive functionnality)
   */
  async stopShutdownTimer () {
    const i2c1 = await I2c.openPromisified(1)
    await i2c1.writeByte(...this.commands.shutdownTimer, 0xff)
    await i2c1.close()
  }

  /**
   * Check if the piModule is running properly
   */
  async piModuleIsRunningProperly () {
    const i2c1 = await I2c.openPromisified(1)
    const buffer1 = await i2c1.readWord(...this.commands.pimodulerunning)
    await new Promise(resolve => setTimeout(resolve, 100))
    const buffer2 = await i2c1.readWord(...this.commands.pimodulerunning)
    await i2c1.close()
    return buffer1 !== buffer2
  }

  /**
   * Play a note from the built in buzzer of the PiModule
    * @param {Integer} duration Sound's duration in milisecond. Maximum duration 2550 ms
    * @param {Integer} frequency Sound's frequency in Hz
    **/
  async generateNote (frequency, duration) {
    if (duration >= 0 && duration <= 2550) {
      const i2c1 = await I2c.openPromisified(1)
      await i2c1.writeWord(...this.commands.frequency, frequency)
      await i2c1.writeByte(...this.commands.duration, Math.floor(duration / 10))
      await i2c1.close()
    } else {
      throw new Error('Maximum note duration is 2550ms')
    }
  }

  /**
   * Play an array of sounds.
   * @param {Array} sounds Array of array like this: [[sound1frequency, sound1Duration], [0, silenceDuration] ,[sound2frequency, sound2Duration], ...]
   */
  async playSounds (sounds) {
    if (sounds && sounds.constructor === Array) {
      for (const sound of sounds) {
        if (sound.constructor === Array && sound.length === 2) {
          if (sound[0]) {
            await this.generateNote(sound[0], sound[1])
          }
          // Add an extra 50ms to give some space between each note
          await new Promise(resolve => setTimeout(resolve, sound[1] + 50))
        }
      }
    }
  }

  /**
   * As the key detection is not an event trigger function. a timer needs to be set.
   * Pass any interval to activate the events 'a-key-triggered', 'b-key-triggered' and 'c-key-triggered'
   * Pass 0 to clear timer
   * @param {Integer} timeInterval time between each check in ms.
   */
  async setKeyPressedDetection (timeInterval) {
    if (timeInterval) {
      this.keyPressedDetectionTimer = setInterval(async () => {
        const i2c1 = await I2c.openPromisified(1)
        const byte = await i2c1.readByte(...this.commands.keys)
        let key = parseInt(byte, 16)
        if (key) {
          if (key === 1) {
            this.emit('a-key-triggered')
          } else if (key === 2) {
            this.emit('b-key-triggered')
          } else if (key === 3) {
            this.emit('c-key-triggered')
          }
          // Write 0 so that we can detect another key event
          await i2c1.writeByte(...this.commands.keys, 0x00)
        }
        await i2c1.close()
      }, timeInterval)
    } else {
      clearInterval(this.keyPressedDetectionTimer)
      this.keyPressedDetectionTimer = null
    }
  }

  /**
   * Set fan mode
   * @param {Integer} mode 0 to disable fan, 1 to set manual speed, 2 to set automatic speed
   */
  async setFanMode (mode) {
    if (mode >= 0 && mode <= 2) {
      const i2c1 = await I2c.openPromisified(1)
      await i2c1.writeByte(...this.commands.fanMode, mode.toString(16))
      await i2c1.close()
    } else {
      throw new Error('Forbidden mode. O to 2 allowed')
    }
  }

  /**
   * Set fan speed. Only valid when fan mode is set to manual (value 1)
   * @param {Integer} speed 0 to 100 in %
   */
  async setFanSpeed (speed) {
    if (speed >= 0 && speed <= 100) {
      const i2c1 = await I2c.openPromisified(1)
      await i2c1.writeByte(...this.commands.fanSpeed, speed.toString(16))
      await i2c1.close()
    } else {
      throw new Error('Forbidden speed. O to 100 allowed')
    }
  }

  /**
   * Set the temperature threshold in automatic Mode. Fan will start at 36 and stop at 35 degre
   * @param {Integer} temperature 0 to 60 degree Celsius
   */
  async setFanTemperatureTreshold (temperature) {
    if (temperature >= 60 && temperature <= 60) {
      const i2c1 = await I2c.openPromisified(1)
      await i2c1.writeByte(...this.commands.fanTemperatureTreshold, temperature.toString(16))
      await i2c1.close()
    } else {
      throw new Error('Forbidden temperature. O to 60 Celsius allowed')
    }
  }
}
