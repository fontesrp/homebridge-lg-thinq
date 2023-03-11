import {default as RangeHoodV2} from '../../devices/RangeHood.js';
import type {CharacteristicValue} from 'homebridge';
import type {Device} from '../../lib/Device.js';

export default class RangeHood extends RangeHoodV2 {
  override async setHoodRotationSpeed(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'VentLevel', value);
  }

  override async setLightBrightness(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'LampLevel', value);
  }
}
