import { createStore, action } from 'easy-peasy';
import GlobalState from '../../common/store/GlobalState';
import convertToCamelCase from '../../common/utils/convert-to-camel-case';

const { sidebar, bottomBar } = require('../../../configs/overlay.json');

global.platform = require('../../desktop_scripts');

const settingsSchema = { ...sidebar.settings, ...bottomBar.settings };

const getSchemaStateKeys = () =>
  Object.keys(settingsSchema).map((settingKey) => convertToCamelCase(settingKey));

const getSchemaKeyForStateVar = (stateVarName) =>
  Object.keys(settingsSchema).find((key) => convertToCamelCase(key) === stateVarName);

// Plain JS mirror of overlay prefs (source of truth in overlay window)
let currentOverlayPrefs = {};

const getInitialOverlayState = () => {
  const globalOverlay = GlobalState.getState().baniOverlay;
  const initial = {};
  getSchemaStateKeys().forEach((stateVarName) => {
    if (globalOverlay[stateVarName] !== undefined) {
      initial[stateVarName] = globalOverlay[stateVarName];
    } else {
      const schemaKey = getSchemaKeyForStateVar(stateVarName);
      initial[stateVarName] = settingsSchema[schemaKey].initialValue;
    }
  });
  currentOverlayPrefs = { ...initial };
  return initial;
};

const sendPrefs = (payload) => {
  global.platform.ipc.send('save-overlay-settings', JSON.stringify(payload));
};

const createOverlayActions = () => {
  const overlayActions = {};
  getSchemaStateKeys().forEach((stateVarName) => {
    const stateActionName = `set${convertToCamelCase(stateVarName, true)}`;
    overlayActions[stateActionName] = action((state, payload) => {
      // eslint-disable-next-line no-param-reassign
      state[stateVarName] = payload;
      currentOverlayPrefs = {
        ...currentOverlayPrefs,
        [stateVarName]: payload,
      };

      // Persist single setting into main-window GlobalState / disk
      global.platform.ipc.send(
        'update-global-setting',
        JSON.stringify({
          actionName: stateActionName,
          payload,
          settingType: 'baniOverlay',
        }),
      );

      // Emit DELTA only — never re-send full snapshot (avoids stale layout clobber)
      sendPrefs({ [stateVarName]: payload });

      return state;
    });
  });
  return overlayActions;
};

const OverlayState = createStore({
  baniOverlay: {
    ...getInitialOverlayState(),
    ...createOverlayActions(),
  },
});

// Full snapshot once on overlay window load
sendPrefs({ ...currentOverlayPrefs });

export default OverlayState;
