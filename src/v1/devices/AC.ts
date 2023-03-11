import {default as AirConditioner, FanSpeed} from '../../devices/AirConditioner.js';
import type {CharacteristicValue} from 'homebridge';
import {ACOperation} from '../transforms/AirState.js';
import type {Device} from '../../lib/Device.js';
import type {RangeValue} from '../../lib/DeviceModel.js';

export default class AC extends AirConditioner {

  protected override createHeaterCoolerService() {
    const {
      Characteristic,
    } = this.platform;
    const device: Device = this.accessory.context['device'];

    super.createHeaterCoolerService();

    const currentTemperatureValue = device.deviceModel.value('TempCur') as RangeValue;

    if (!this.service) {
      return;
    }

    this.service.getCharacteristic(Characteristic.CurrentTemperature)
      .setProps({
        minValue: currentTemperatureValue.min,
        maxValue: currentTemperatureValue.max,
      });

    const targetTemperatureValue = device.deviceModel.value('TempCfg') as RangeValue;
    this.service.getCharacteristic(Characteristic.CoolingThresholdTemperature)
      .setProps({
        minValue: targetTemperatureValue.min,
        maxValue: targetTemperatureValue.max,
      });
    this.service.getCharacteristic(Characteristic.HeatingThresholdTemperature)
      .setProps({
        minValue: targetTemperatureValue.min,
        maxValue: targetTemperatureValue.max,
      });
  }

  override async setFanState(value: CharacteristicValue) {
    if (!this.Status.isPowerOn) {
      return;
    }

    const device: Device = this.accessory.context['device'];
    const { TargetFanState } = this.platform.Characteristic;

    const windStrength = value === TargetFanState.AUTO ? 8 : FanSpeed.HIGH; // 8 mean fan auto mode
    this.platform.ThinQ?.thinq1DeviceControl(device, 'WindStrength', windStrength);
  }

  override async setJetModeActive(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];

    if (this.Status.isPowerOn && this.Status.opMode === 0) {
      const jetModeValue = value ? '1' : '0';
      await this.platform.ThinQ?.thinq1DeviceControl(device, 'Jet', jetModeValue);
    }
  }

  override async setActive(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];
    const isOn = value as boolean;
    const op = isOn ? ACOperation.RIGHT_ON : ACOperation.OFF;
    const opValue = device.deviceModel.enumValue('Operation', op);

    await this.platform.ThinQ?.thinq1DeviceControl(device, 'Operation', opValue);
  }

  override async setTargetTemperature(value: CharacteristicValue) {
    if (!this.Status.isPowerOn) {
      return;
    }

    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'TempCfg', value as string);
    device.data.snapshot['airState.tempState.target'] = value as number;
    this.updateAccessoryCharacteristic(device);
  }

  override async setFanSpeed(value: CharacteristicValue) {
    if (!this.Status.isPowerOn) {
      return;
    }

    const speedValue = Math.max(1, Math.round(value as number));
    const device: Device = this.accessory.context['device'];
    const windStrength = parseInt(Object.keys(FanSpeed)[speedValue - 1] || '0') || FanSpeed.HIGH;

    this.platform.ThinQ?.thinq1DeviceControl(device, 'WindStrength', windStrength);
  }

  override async setSwingMode(value: CharacteristicValue) {
    if (!this.Status.isPowerOn) {
      return;
    }

    const swingValue = !!value as boolean ? '100' : '0';

    const device: Device = this.accessory.context['device'];

    if (this.config.ac_swing_mode === 'BOTH' || this.config.ac_swing_mode === 'VERTICAL') {
      await this.platform.ThinQ?.thinq1DeviceControl(device, 'WDirVStep', swingValue);
      device.data.snapshot['airState.wDir.vStep'] = swingValue;
    }

    if (this.config.ac_swing_mode === 'BOTH' || this.config.ac_swing_mode === 'HORIZONTAL') {
      await this.platform.ThinQ?.thinq1DeviceControl(device, 'WDirHStep', swingValue);
      device.data.snapshot['airState.wDir.hStep'] = swingValue;
    }

    this.updateAccessoryCharacteristic(device);
  }

  override async setOpMode(opMode: number) {
    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'OpMode', opMode);
    device.data.snapshot['airState.opMode'] = opMode;

    this.updateAccessoryCharacteristic(device);
  }

  override async setLight(value: CharacteristicValue) {
    const device: Device = this.accessory.context['device'];
    await this.platform.ThinQ?.thinq1DeviceControl(device, 'DisplayControl', value ? '1' : '0');
  }
}
