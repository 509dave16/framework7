import React from 'react';
import Utils from '../utils/utils';
import Mixins from '../utils/mixins';
import __reactComponentDispatchEvent from '../runtime-helpers/react-component-dispatch-event.js';
import __reactComponentSlots from '../runtime-helpers/react-component-slots.js';
import __reactComponentSetProps from '../runtime-helpers/react-component-set-props.js';

class F7Chip extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  onClick(event) {
    this.dispatchEvent('click', event);
  }

  onDeleteClick(event) {
    this.dispatchEvent('delete', event);
  }

  render() {
    const self = this;
    const props = self.props;
    const {
      media,
      text,
      deleteable,
      className,
      id,
      style,
      mediaTextColor,
      mediaBgColor,
      outline
    } = props;
    let mediaEl;
    let labelEl;
    let deleteEl;

    if (media || self.slots && self.slots.media) {
      const mediaClasses = Utils.classNames('chip-media', mediaTextColor && `text-color-${mediaTextColor}`, mediaBgColor && `bg-color-${mediaBgColor}`);
      mediaEl = React.createElement('div', {
        className: mediaClasses
      }, media || this.slots['media']);
    }

    if (text || self.slots && self.slots.text) {
      labelEl = React.createElement('div', {
        className: 'chip-label'
      }, text, this.slots['text']);
    }

    if (deleteable) {
      deleteEl = React.createElement('a', {
        href: '#',
        className: 'chip-delete',
        onClick: self.onDeleteClick.bind(self)
      });
    }

    const classes = Utils.classNames(className, 'chip', {
      'chip-outline': outline
    }, Mixins.colorClasses(props));
    return React.createElement('div', {
      id: id,
      style: style,
      className: classes,
      onClick: self.onClick.bind(self)
    }, mediaEl, labelEl, deleteEl);
  }

  get slots() {
    return __reactComponentSlots(this.props);
  }

  dispatchEvent(events, ...args) {
    return __reactComponentDispatchEvent(this, events, ...args);
  }

}

__reactComponentSetProps(F7Chip, Object.assign({
  id: [String, Number],
  media: String,
  text: [String, Number],
  deleteable: Boolean,
  mediaBgColor: String,
  mediaTextColor: String,
  outline: Boolean
}, Mixins.colorProps));

export default F7Chip;