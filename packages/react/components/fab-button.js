import React from 'react';
import Utils from '../utils/utils';
import Mixins from '../utils/mixins';
import __reactComponentWatch from '../runtime-helpers/react-component-watch.js';
import __reactComponentDispatchEvent from '../runtime-helpers/react-component-dispatch-event.js';
import __reactComponentSlots from '../runtime-helpers/react-component-slots.js';
import __reactComponentSetProps from '../runtime-helpers/react-component-set-props.js';

class F7FabButton extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.__reactRefs = {};
  }

  onClick(event) {
    this.dispatchEvent('click', event);
  }

  render() {
    const props = this.props;
    const {
      className,
      id,
      style,
      fabClose,
      label,
      target
    } = props;
    const classes = Utils.classNames(className, {
      'fab-close': fabClose,
      'fab-label-button': label
    }, Mixins.colorClasses(props));
    let labelEl;

    if (label) {
      labelEl = React.createElement('span', {
        className: 'fab-label'
      }, label);
    }

    return React.createElement('a', {
      id: id,
      style: style,
      target: target,
      className: classes,
      onClick: this.onClick.bind(this)
    }, this.slots['default'], labelEl);
  }

  componentWillUnmount() {
    const self = this;

    if (self.f7Tooltip && self.f7Tooltip.destroy) {
      self.f7Tooltip.destroy();
      self.f7Tooltip = null;
      delete self.f7Tooltip;
    }
  }

  componentDidMount() {
    const self = this;
    const {
      tooltip
    } = self.props;
    if (!tooltip) return;
    self.$f7ready(f7 => {
      self.f7Tooltip = f7.tooltip.create({
        targetEl: self.refs.el,
        text: tooltip
      });
    });
  }

  get slots() {
    return __reactComponentSlots(this.props);
  }

  dispatchEvent(events, ...args) {
    return __reactComponentDispatchEvent(this, events, ...args);
  }

  get refs() {
    return this.__reactRefs;
  }

  set refs(refs) {}

  componentDidUpdate(prevProps, prevState) {
    __reactComponentWatch(this, 'props.tooltip', prevProps, prevState, newText => {
      const self = this;
      if (!newText || !self.f7Tooltip) return;
      self.f7Tooltip.setText(newText);
    });
  }

}

__reactComponentSetProps(F7FabButton, Object.assign({
  id: [String, Number],
  fabClose: Boolean,
  label: String,
  target: String,
  tooltip: String
}, Mixins.colorProps));

export default F7FabButton;