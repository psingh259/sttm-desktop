import { action } from 'easy-peasy';
import { convertToCamelCase } from '../../utils';

// can we change them to import?
const fs = require('fs');

export const buildOverlayPrefs = (settingsSchema, state) => {
  const prefs = {};
  Object.keys(settingsSchema).forEach((settingKey) => {
    const stateVarName = convertToCamelCase(settingKey);
    if (state[stateVarName] !== undefined) {
      prefs[stateVarName] = state[stateVarName];
    } else {
      prefs[stateVarName] = settingsSchema[settingKey].initialValue;
    }
  });
  return prefs;
};

const createOverlaySettingsState = (settingsSchema, savedSettings, userConfigPath) => {
  const userSettingsState = {};
  Object.keys(settingsSchema).forEach((settingKey) => {
    const stateVarName = convertToCamelCase(settingKey);
    const stateFuncName = `set${convertToCamelCase(settingKey, true)}`;

    const savedValue =
      savedSettings.baniOverlay[settingKey] !== undefined
        ? savedSettings.baniOverlay[settingKey]
        : savedSettings.baniOverlay[stateVarName];
    userSettingsState[stateVarName] =
      savedValue !== undefined ? savedValue : settingsSchema[settingKey].initialValue;

    userSettingsState[stateFuncName] = action((state, payload) => {
      // eslint-disable-next-line no-param-reassign
      state[stateVarName] = payload;

      // Persist to disk using schema keys
      const updatedSettings = savedSettings;
      updatedSettings.baniOverlay[settingKey] = payload;
      fs.writeFileSync(userConfigPath, JSON.stringify(updatedSettings));

      // Live OBS prefs are emitted from the overlay window (OverlayState) to avoid
      // races with a stale main-window copy of baniOverlay.layout.
      // get-overlay-prefs still pushes a full snapshot when requested.

      return state;
    });
  });
  return userSettingsState;
};

export default createOverlaySettingsState;
