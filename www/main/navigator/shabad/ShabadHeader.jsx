import React, { useEffect, useState } from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';

import classNames from '../../common/utils/classnames';
import FavShabadIcon from './FavShabadIcon';
import ArrowIcon from './ArrowIcon';

const electron = require('electron');

const { ipcRenderer } = electron;
const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const ShabadHeader = () => {
  const [showViewer, setShowViewer] = useState(true);
  const { defaultPaneId } = useStoreState((state) => state.userSettings);
  const hideOverlayText = useStoreState((state) => state.baniOverlay.hideOverlayText);
  const { setHideOverlayText } = useStoreActions((state) => state.baniOverlay);

  useEffect(() => {
    ipcRenderer.send('toggle-viewer-window', showViewer);
  }, [showViewer]);

  const toggleOverlayText = () => {
    const nextValue = !hideOverlayText;
    // Persist in global baniOverlay settings
    if (typeof setHideOverlayText === 'function') {
      setHideOverlayText(nextValue);
    }
    // Push live delta to OBS/browser overlay immediately
    ipcRenderer.send(
      'save-overlay-settings',
      JSON.stringify({ hideOverlayText: nextValue }),
    );
  };

  return (
    <div className="shabad-pane-header">
      <FavShabadIcon />
      <button
        className={classNames(
          'button toggle-viewer-btn toggle-overlay-text-btn',
          hideOverlayText && 'btn-danger',
        )}
        onClick={toggleOverlayText}
        title={i18n.t('SHABAD_PANE.HIDE_OVERLAY_TEXT_TOOLTIP')}
      >
        <i className={`fa ${hideOverlayText ? 'fa-eye' : 'fa-eye-slash'}`} />
        <p>
          {hideOverlayText
            ? i18n.t('SHABAD_PANE.SHOW_OVERLAY_TEXT')
            : i18n.t('SHABAD_PANE.HIDE_OVERLAY_TEXT')}
        </p>
      </button>
      <button
        className={classNames('button toggle-viewer-btn', !showViewer && 'btn-danger')}
        onClick={() => setShowViewer(!showViewer)}
        title={showViewer ? i18n.t('SHABAD_PANE.HIDE_BUTTON_TOOLTIP') : ''}
      >
        {showViewer ? (
          <>
            <img src="assets/img/icons/monitor-slash.png" alt="" />
            <p>{i18n.t('SHABAD_PANE.HIDE_SCREEN')}</p>
          </>
        ) : (
          <>
            <img src="assets/img/icons/monitor.png" alt="" />
            <p>{i18n.t('SHABAD_PANE.SHOW_DISPLAY')}</p>
          </>
        )}
      </button>
      <ArrowIcon paneId={defaultPaneId} />
    </div>
  );
};

export default ShabadHeader;
