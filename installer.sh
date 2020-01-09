#!/bin/sh
# installer.sh will install the necessary packages to get the pimodule up and running with basic functions

# Install packages
PACKAGES="aptitude git python-rpi.gpio python-dev python-serial python-smbus python-jinja2 python-xmltodict python-psutil python-pip"
apt-get update
apt-get upgrade -y
apt-get install $PACKAGES -y

# Enable I2C
raspi-config nonint do_i2c 0

#Clone PiModule library
git clone https://github.com/modmypi/PiModules.git /opt/PiModules

#Install Email broadcasting package
python /opt/PiModules/code/python/package/setup.py install

#Install the System Monitoring & File Safe Shutdown Daemons
python /opt/PiModules/code/python/upspico/picofssd/setup.py install

cd /opt/PiModules/code/python/upspico/picofssd
#Install to the SysVInit system
update-rc.d picofssd defaults

#Run at boot time
update-rc.d picofssd enable

#Clean install packages
rm -f /opt/PiModules