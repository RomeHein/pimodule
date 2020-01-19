# PiModule

A node package helper to control your UPS PIco HV3.0A/B/B+ HAT

This library was not developped by the PiModules(R) UPSPIco company.
Any query/issue concerning their product won't find answers here, sorry :/ Feel free to refer to their official github repo:
https://github.com/modmypi/PiModules

Be aware that this package uses exclusively await/async, no callbacks ;)

## Getting Started

The PiModule documentation can be a bit tricky to read. So here is a small helper of the most common features you may want to use.
Once you've followed the installation process, you'll be able to use the following functions:

- Set pimodule addresses
- Get pimodule temperature
- Set shutdown timer
- Get pimodule battery level
- Get/set pimodule powering mode (battery or power)
- Set backed auxiliary power
- Get pimodule running state 
- Set buzzer state
- Generate sounds
- Get/set pimodule bistable relay state
- Set leds (orange, green, blue)
- Set events on keys (named A, B and C)
- Get/set pimodule fan mode (automatic, manual, disabled)
- Get pimodule fan state
- Get/set pimodule fan speed
- Set temperature threshold


### Prerequisites

You'll need a UPS PIco HV3.0A/B/B+ HAT, you can order it here:
https://pimodules.com/plus-advanced

You'll also need to get the installation process right.
You can choose one of two ways:

- Ansible

Make it easy to reproduce via Ansible in case your rasperry pi fails! 
To use the playbook provided, just clone this repository on your dev machine:

```
git clone https://github.com/RomeHein/pimodule.git
```

You'll need at least ansible installed.
Make sure to change the local address of your raspberry pi as well as the correct user in the following command:
```
cd /ansible
ANSIBLE_HOST_KEY_CHECKING=false ansible-playbook pimodule.yml -i raspberrypi.local, --user=pi --ask-pass
```

- Script: installer.sh

Just copy past the script `installer.sh` on your raspberry pi. 
Make sure you have the right permissions to run the script:
```
    chmod +x installer.sh
```
And run it with sudo:
```
sudo ./installer.sh
```

Alternatively, you can run it via npm once the repo is cloned on your raspberry pi:
``` 
sudo npm run installer
```

### Installing

Just install via npm:

```
npm i pimodule --save
```

### Usage

Import the module and start using it:
```
    const PiModuleHelper = require('pimodule')
    const piModule = new PiModuleHelper()

    const state = await piModule.piModuleIsRunningProperly()
    console.log(`PiModule is running: ${state}`)
```

When you instantiate pimodule, make sure you are using the right set of addresses:
Three are available: 'default', 'alternate' and 'noRtc'
If you are using 'alternate', instantiate the module like so:


```
    const PiModuleHelper = require('pimodule')
    const piModule = new PiModuleHelper('alternate')

    // Plays imperial starwars march from pimodule built in buzzer
    await piModule.playSounds([[220, 700], [220, 700], [220, 700],[174, 525], [261, 175], [220, 700], [174, 525], [261, 175], [220, 1400]])
```


## Running the tests

Tests seem a bit useless here as functions are very simple wrappers of the i2c-bus node library (which is heavily tested). 
However I would make sure the library matches the current implementation of the PiModule firmware before using pimodule.
You can check that by running directly on the raspberry pi:

```
npm run check
```

This will run tests without mocking the i2c-bus library. That way we are sure addresses are correct


## Contributing

All pull requests/suggestions are welcome.

## Authors

* **Romain Cayzac**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
