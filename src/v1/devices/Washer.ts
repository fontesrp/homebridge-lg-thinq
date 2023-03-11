import {default as WasherV2} from '../../devices/WasherDryer.js';
import type {LGThinQHomebridgePlatform} from '../../platform.js';
import {CharacteristicValue, Perms, PlatformAccessory} from 'homebridge';
import type {Device} from '../../lib/Device.js';

export default class Washer extends WasherV2 {
  constructor(
    protected override readonly platform: LGThinQHomebridgePlatform,
    protected override readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    const {
      Characteristic,
    } = this.platform;

    this.serviceWasherDryer.getCharacteristic(Characteristic.Active).setProps({
      perms: [
        Perms.PAIRED_READ,
        Perms.NOTIFY,
        Perms.PAIRED_WRITE,
      ],
    });
  }

  override async setActive(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'Power', value as boolean ? 'On' : 'Off');
  }
}
