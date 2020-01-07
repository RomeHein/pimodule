const I2c = require('i2c-bus')
const sleep = require('util').promisify(setTimeout)
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
  }

  /**
  * Change I2C addresses used by piModule
  * @param {String} fromType 'alternate', 'noRtc' or 'default' can be used
  * @param {String} toType 'alternate', 'noRtc' or 'default' can be used
  */
  static async setAddressType (fromType, toType) {
  }

  /**
   * Get piModule PCB temperature
   */
  async getPiModuleTemperature () {
    let i2c1 = await I2c.openPromisified(1)
    const byte = await i2c1.readByte(this.addresses[1], 0x00)
    await i2c1.close()
    return parseInt(byte, 16)
  }

  /**
   * Set the shutdown timer (named STA or still alive functionnality). The timer can be updated or stoped before it reaches 0.
   * @param {Integer} seconds Seconds before the raspberry pi is turned off. Maximum value 596 seconds
   */
  async setShutdownTimer (seconds) {
  }

  /**
   * Stop the shutdown timer (named STA or still alive functionnality)
   */
  async stopShutdownTimer () {
  }

  /**
   * Battery Voltage in 10th of mV in BCD format
   */
  async getBatteryLevel () {
    let i2c1 = await I2c.openPromisified(1)
    const byte = await i2c1.readByte(this.addresses[1], 0x08)
    await i2c1.close()
    return parseInt(byte, 16)
  }

  /**
   * Returns 'cable' if the raspberry is beeing powered by the cable, otherwise returns 'battery'
   */
  async getPoweringMode () {
    let i2c1 = await I2c.openPromisified(1)
    const rbuf = Buffer.alloc(1)
    const buffer = await i2c1.readI2cBlock(this.addresses[1], 0x00, rbuf.length, rbuf)
    await i2c1.close()
    if (parseInt(buffer[0], 16) === 1) {
      return 'cable'
    } else if (parseInt(buffer[0], 16) === 2) {
      return 'battery'
    } else {
      return 'unknown'
    }
  }

  /**
   * Enable or disable the battery on the auxilary 5v and 3.3v of the piModule
   * @param {Boolen} on true if auxilary 5v and 3.3v need to be backed on piModule battery
   */
  async setBackedAuxilaryPower (on) {
  }

  /**
   * Check if the piModule is running properly
   */
  async piModuleIsRunningProperly () {
    let i2c1 = await I2c.openPromisified(1)
    const buffer1 = await i2c1.readWord(this.addresses[1], 0x22)
    await sleep(10)
    const buffer2 = await i2c1.readWord(this.addresses[1], 0x22)
    await i2c1.close()
    return buffer1[0] !== buffer2[0]
  }

  /**
   * Turn the built in buzzer of the pimodule on and off
   * @param {Boolean} on true to enable the built in buzzer of the pimodule
   */
  async switchBuzzer (on) {
  }

  /**
   * Play a note from the built in buzzer of the PiModule
    * @param {Integer} duration Sound's duration in milisecond. Maximum duration 2550 ms
    * @param {Integer} frequency Sound's frequency in Hz
    **/
  async generateNote (frequency, duration) {
  }

  /**
   * Play an array of sounds.
   * @param {Array} sounds Array of array like this: [[sound1frequency, sound1Duration], [0, silenceDuration] ,[sound2frequency, sound2Duration], ...]
   */
  async playSounds (sounds) {
  }

  /**
   * Get piModule relay state
   */
  async getBiStableRelayState () {
    let i2c1 = await I2c.openPromisified(1)
    const byte = await i2c1.readByte(this.addresses[3], 0x0c)
    await i2c1.close()
    return parseInt(byte, 16)
  }

  /**
   * Set piModule relay state
   * @param {Boolean} on true to turn on the relay
   */
  async switchBiStableRelay (on) {
  }

  /**
   * Control state of the 3 built in leds
   * @param {String} color Orange, green and blue are available
   * @param {Bool} on Turn on or off the led
   */
  async switchLed (color, on) {
  }

  /**
   * As the key detection is not an event trigger function. a timer needs to be set.
   * Pass any interval to activate the events 'a-key-triggered', 'b-key-triggered' and 'c-key-triggered'
   * Pass 0 to clear timer
   * @param {Integer} timeInterval time between each check in ms.
   */
  async setKeyPressedDetection (timeInterval) {
  }

  /**
   * Get fan mode: 0 is disabled, 1 is manual (read set fan speed), 2 is automatic
   */
  async getFanMode () {
    let i2c1 = await I2c.openPromisified(1)
    const byte = await i2c1.readByte(this.addresses[3], 0x11)
    await i2c1.close()
    return parseInt(byte, 16)
  }

  /**
   * Set fan mode
   * @param {Integer} mode 0 to disable fan, 1 to set manual speed, 2 to set automatic speed
   */
  async setFanMode (mode) {
  }

  async fanIsRunning () {
    const i2c1 = await I2c.openPromisified(1)
    const byte = await i2c1.readByte(this.addresses[3], 0x13)
    await i2c1.close()
    return parseInt(byte, 16)
  }

  /**
   * Get fan speed in %
   */
  async getFanSpeed () {
    const i2c1 = await I2c.openPromisified(1)
    const byte = await i2c1.readByte(this.addresses[3], 0x12)
    await i2c1.close()
    return parseInt(byte, 16)
  }

  /**
   * Set fan speed. Only valid when fan mode is set to manual (value 1)
   * @param {Integer} speed 0 to 100 in %
   */
  async setFanSpeed (speed) {
  }

  /**
   * Set the temperature threshold in automatic Mode. Fan will start at 36 and stop at 35 degre
   * @param {Integer} temperature 0 to 60 degree Celsius
   */
  async setFanTemperatureTreshold (temperature) {
  }
}
