import {default as V2, RotateSpeed} from '../../devices/AirPurifier';
import type {CharacteristicValue, PlatformAccessory} from 'homebridge';
import type {Device} from '../../lib/Device';
import type {LGThinQHomebridgePlatform} from '../../platform';

export default class AirPurifier extends V2 {
  constructor(
    protected override readonly platform: LGThinQHomebridgePlatform,
    protected override readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);
  }

  override async setActive(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'Operation', value as boolean ? '1' : '0');
  }

  override async setTargetAirPurifierState(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];
    if (!this.Status.isPowerOn || (!!value !== this.Status.isNormalMode)) {
      return; // just skip it
    }

    await this.platform.ThinQ?.thinq1DeviceControl(device, 'OpMode', value as boolean ? '16' : '14');
  }

  override async setRotationSpeed(value: CharacteristicValue) {
    if (!this.Status.isPowerOn || !this.Status.isNormalMode) {
      return;
    }

    const device: Device = this.accessory.context['device'];
    const values = Object.keys(RotateSpeed);
    const windStrength = parseInt(values[Math.round((value as number)) - 1] || '0') || RotateSpeed.EXTRA;
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'WindStrength', windStrength.toString());
  }

  override async setSwingMode(value: CharacteristicValue) {
    if (!this.Status.isPowerOn || !this.Status.isNormalMode) {
      return;
    }

    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'CirculateDir', value as boolean ? '1' : '0');
  }

  override async setLight(value: CharacteristicValue) {
    if (!this.Status.isPowerOn) {
      return;
    }

    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'SignalLighting', value as boolean ? '1' : '0');
  }

  override async setAirFastActive(value: CharacteristicValue) {
    if (!this.Status.isPowerOn) {
      return;
    }

    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'AirFast', value as boolean ? '1' : '0');
  }
}
