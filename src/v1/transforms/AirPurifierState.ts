import AirState from './AirState.js';
import type {DeviceModel} from '../../lib/DeviceModel.js';

export default function AirPurifierState(deviceModel: DeviceModel, decodedMonitor) {
  const airState = AirState(deviceModel, decodedMonitor);

  airState['airState.operation'] = !!parseInt(decodedMonitor['Operation']);
  airState['airState.miscFuncState.airFast'] = !!parseInt(decodedMonitor['AirFast']);

  return airState;
}
