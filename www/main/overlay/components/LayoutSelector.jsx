import React from 'react';
import PropTypes from 'prop-types';
import { useStoreState } from 'easy-peasy';

const LayoutSelector = ({ changeLayout }) => {
  const currentLayout = useStoreState((state) => state.baniOverlay.layout);
  const layouts = ['top', 'bottom', 'split', 'vertical', 'classic', 'fullscreen'];
  const layoutMarkup = layouts.map((layout) => (
    <button
      type="button"
      key={`layout-${layout}`}
      className={`layout-btn ${layout}${currentLayout === layout ? ' active' : ''}`}
      data-layout={layout}
      onClick={changeLayout}
      title={layout}
      aria-label={`layout ${layout}`}
      aria-pressed={currentLayout === layout}
    >
      <span className="layout-bar layout-bar-1" />
      <span className="layout-bar layout-bar-2" />
      <span className="layout-bar layout-bar-3" />
      <span className="layout-bar layout-bar-4" />
      <span className="layout-vertical-bar" />
      <span className="layout-classic-bar" />
      <span className="layout-fullscreen-bar" />
    </button>
  ));
  return layoutMarkup;
};

LayoutSelector.propTypes = {
  changeLayout: PropTypes.func,
};

export default LayoutSelector;
