# PiModule

A node package helper to control your UPS PIco HV3.0A/B/B+ HAT

This library was not developped by the PiModule company.
Any issue/query concerning their product won't find answers here, sorry :/

## Getting Started

The PiModule documentation can be a bit tricky to read. So here is a small helper of the most common features you may want to use.
Once you have fallowed the installations process, you'll be able to use:

- Set pimodule addresses
- Get pimodule temperature
- Set shutdown timer
- Get pimodule battery level
- Get/set pimodule powering mode (battery or power)
- Set backed auxilary power
- Get pimodule running state 
- Set buzzer
- Generate sounds
- Get/set pimodule bistable relay state
- Set leds (orange, green, blue)
- Set events on keys (these name A, B and C)
- Get/set pimodule fan mode (automatic, manual, disable)
- Get pimodule fan state
- Get/set pimodule fan speed
- Set temperature treshold


### Prerequisites

You'll need a UPS PIco HV3.0A/B/B+ HAT, you can order it here:
https://pimodules.com/plus-advanced

You'll also need to get the installation process right. Which can be tricky as the official documentation gives multiple ways to do it.
My approach is to make it easy to reproduce via Ansible, in case your rasperry pi fails.
To use the playbook provided, just clone this repository:

```
git clone https://github.com/RomeHein/pimodule.git
```

You'll need at least ansible installed on your dev machine.
Make sure to change the local address of your raspberry pi aswell as the correct user in the following command:
```
cd /ansible
ANSIBLE_HOST_KEY_CHECKING=false ansible-playbook pimodule.yml -i raspberrypi.local, --user=pi --ask-pass
```

If you don't want to use ansible, just have a look to the commands in /ansible/roles/pimodule/tasks/main.yml, they should get you up and running.

### Installing

Just install via npm:

```
npm i pimodule --save
```

Then import the module and start using it:
```
    const PiModuleHelper = require('pimodule')
    piModule = new PiModuleHelper()

    const state = await piModule.piModuleIsRunningProperly()
    console.log(`PiModule is running: ${state}`)
```

When you instantiate pimodule, make sure you are using the right set of addresses:
Three are available: 'default', 'alternate' and 'noRtc'
If you are using 'alternate', instantiate the module like so:


```
    const PiModuleHelper = require('pimodule')
    piModule = new PiModuleHelper('alternate')
```


## Running the tests

Tests seems a bit useless here as functions are very simple wrappers of the i2c-bus node library (which is heavily tested). 
But I would make sure the library match the current implementation of the PiModule firmware before using pimodule.
You can check that by running directly on the raspberry pi

```
npm run check
```

This will run tests without mocking the i2c-bus library. That way we are sure addresses are correct


## Contributing

All pull requests/suggestions are welcome

## Authors

* **Romain Cayzac**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
