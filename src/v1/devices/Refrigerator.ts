import {default as RefrigeratorV2, RefrigeratorStatus} from '../../devices/Refrigerator.js';
import type {CharacteristicValue, PlatformAccessory} from 'homebridge';
import type {Device} from '../../lib/Device.js';
import type {LGThinQHomebridgePlatform} from '../../platform.js';
import {fToC} from '../../helper.js';

export default class Refrigerator extends RefrigeratorV2 {
  constructor(
    protected override readonly platform: LGThinQHomebridgePlatform,
    protected override readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    // disable door sensor on thinq1
    accessory.removeService(this.serviceDoorOpened);
    this.serviceDoorOpened = null;
  }

  protected override createThermostat(name: string, key: string) {
    const keyMap = {
      fridgeTemp: 'TempRefrigerator',
      freezerTemp: 'TempFreezer',
    };

    return super.createThermostat(name, keyMap[key]);
  }

  override async setTemperature(key: string, temp: string) {
    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, key, temp);
  }

  override async setExpressMode(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];
    const On = device.deviceModel.enumValue('IcePlus', '@CP_ON_EN_W');
    const Off = device.deviceModel.enumValue('IcePlus', '@CP_OFF_EN_W');

    this.platform.ThinQ?.thinq1DeviceControl(device, 'IcePlus', value ? On : Off);
  }

  override async setExpressFridge(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];
    const On = device.deviceModel.enumValue('ExpressFridge', '@CP_ON_EN_W');
    const Off = device.deviceModel.enumValue('ExpressFridge', '@CP_OFF_EN_W');

    this.platform.ThinQ?.thinq1DeviceControl(device, 'ExpressFridge', value ? On : Off);
  }

  override async setEcoFriendly(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];
    const On = device.deviceModel.enumValue('EcoFriendly', '@CP_ON_EN_W');
    const Off = device.deviceModel.enumValue('EcoFriendly', '@CP_OFF_EN_W');

    this.platform.ThinQ?.thinq1DeviceControl(device, 'EcoFriendly', value ? On : Off);
  }

  public override get Status() {
    return new Status(this.accessory.context['device'].snapshot?.refState, this.accessory.context['device'].deviceModel);
  }
}

export class Status extends RefrigeratorStatus {
  public override get freezerTemperature() {
    // eslint-disable-next-line max-len
    const defaultValue = this.deviceModel.lookupMonitorValue( 'TempFreezer', this.data?.['freezerTemp'], '0');
    if (this.tempUnit === 'FAHRENHEIT') {
      return fToC(parseInt(this.deviceModel.lookupMonitorValue('TempFreezer_F', this.data?.['freezerTemp'], defaultValue)));
    }

    return parseInt(this.deviceModel.lookupMonitorValue('TempFreezer_C', this.data?.['freezerTemp'], defaultValue));
  }

  public override get fridgeTemperature() {
    // eslint-disable-next-line max-len
    const defaultValue = this.deviceModel.lookupMonitorValue( 'TempRefrigerator', this.data?.['fridgeTemp'], '0');
    if (this.tempUnit === 'FAHRENHEIT') {
      return fToC(parseInt(this.deviceModel.lookupMonitorValue( 'TempRefrigerator_F', this.data?.['fridgeTemp'], defaultValue)));
    }

    return parseInt(this.deviceModel.lookupMonitorValue('TempRefrigerator_C', this.data?.['fridgeTemp'], defaultValue));
  }

  public override get isExpressFridgeOn() {
    return this.data?.['expressFridge'] === this.deviceModel.lookupMonitorName('ExpressFridge', '@CP_ON_EN_W');
  }

  public override get isExpressModeOn() {
    return this.data?.['expressMode'] === this.deviceModel.lookupMonitorName('IcePlus', '@CP_ON_EN_W');
  }

  public override get isEcoFriendlyOn() {
    return this.data?.['ecoFriendly'] === this.deviceModel.lookupMonitorName('EcoFriendly', '@CP_ON_EN_W');
  }
}
