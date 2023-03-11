import { Categories } from 'homebridge';
import type {Device} from './lib/Device.js';
import AirPurifier from './devices/AirPurifier.js';
import Refrigerator from './devices/Refrigerator.js';
import WasherDryer from './devices/WasherDryer.js';
import Dishwasher from './devices/Dishwasher.js';
import Dehumidifier from './devices/Dehumidifier.js';
import {default as V1helper} from './v1/helper.js';
import {PlatformType} from './lib/constants.js';
import AirConditioner from './devices/AirConditioner.js';
import AeroTower from './devices/AeroTower.js';
import Styler from './devices/Styler.js';
import RangeHood from './devices/RangeHood.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class Helper {
  public static make(device: Device) {
    if (device.platform === PlatformType.ThinQ1) {
      // check if thinq1 available
      const deviceClass = V1helper.make(device);
      if (deviceClass) {
        return deviceClass;
      }
    }

    // thinq2
    switch (device.type) {
      case 'AERO_TOWER': return AeroTower;
      case 'AIR_PURIFIER': return AirPurifier;
      case 'REFRIGERATOR': return Refrigerator;
      case 'WASHER':
      case 'WASHER_NEW':
      case 'WASH_TOWER':
        return WasherDryer;
      case 'DRYER': return WasherDryer;
      case 'DISHWASHER': return Dishwasher;
      case 'DEHUMIDIFIER': return Dehumidifier;
      case 'AC': return AirConditioner;
      case 'STYLER': return Styler;
      case 'HOOD': return RangeHood;
    }

    return null;
  }

  public static category(device: Device) {
    switch (device.type) {
      case 'AIR_PURIFIER': return Categories.AIR_PURIFIER;
      case 'DEHUMIDIFIER': return Categories.AIR_DEHUMIDIFIER;
      default: return Categories.OTHER;
    }
  }
}

export function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target: any, ...sources: any[]) {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export function fToC(fahrenheit: number) {
  return parseFloat(((fahrenheit - 32) * 5 / 9).toFixed(1));
}

export function cToF(celsius: number) {
  return Math.round(celsius * 9 / 5 + 32);
}
