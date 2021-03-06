import React from 'react';
import Mixins from '../utils/mixins';
import Utils from '../utils/utils';
import __reactComponentWatch from '../runtime-helpers/react-component-watch.js';
import __reactComponentDispatchEvent from '../runtime-helpers/react-component-dispatch-event.js';
import __reactComponentSlots from '../runtime-helpers/react-component-slots.js';
import __reactComponentSetProps from '../runtime-helpers/react-component-set-props.js';

class F7LoginScreen extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.__reactRefs = {};
  }

  onOpen(event) {
    this.dispatchEvent('loginscreen:open loginScreenOpen', event);
  }

  onOpened(event) {
    this.dispatchEvent('loginscreen:opened loginScreenOpened', event);
  }

  onClose(event) {
    this.dispatchEvent('loginscreen:close loginScreenClose', event);
  }

  onClosed(event) {
    this.dispatchEvent('loginscreen:closed loginScreenClosed', event);
  }

  open(animate) {
    const self = this;
    const el = self.refs.el;
    if (!self.$f7 || !el) return undefined;
    return self.$f7.loginScreen.open(el, animate);
  }

  close(animate) {
    const self = this;
    const el = self.refs.el;
    if (!self.$f7 || !el) return undefined;
    return self.$f7.loginScreen.close(el, animate);
  }

  render() {
    const self = this;
    const props = self.props;
    const {
      className,
      id,
      style
    } = props;
    const classes = Utils.classNames(className, 'login-screen', Mixins.colorClasses(props));
    return React.createElement('div', {
      ref: __reactNode => {
        this.__reactRefs['el'] = __reactNode;
      },
      id: id,
      style: style,
      className: classes
    }, this.slots['default']);
  }

  componentWillUnmount() {
    const self = this;
    const el = self.refs.el;
    if (self.f7LoginScreen) self.f7LoginScreen.destroy();
    if (!el) return;
    el.removeEventListener('loginscreen:open', self.onOpenBound);
    el.removeEventListener('loginscreen:opened', self.onOpenedBound);
    el.removeEventListener('loginscreen:close', self.onCloseBound);
    el.removeEventListener('loginscreen:closed', self.onClosedBound);
  }

  componentDidMount() {
    const self = this;
    const el = self.refs.el;
    if (!el) return;
    self.onOpenBound = self.onOpen.bind(self);
    self.onOpenedBound = self.onOpened.bind(self);
    self.onCloseBound = self.onClose.bind(self);
    self.onClosedBound = self.onClosed.bind(self);
    el.addEventListener('loginscreen:open', self.onOpenBound);
    el.addEventListener('loginscreen:opened', self.onOpenedBound);
    el.addEventListener('loginscreen:close', self.onCloseBound);
    el.addEventListener('loginscreen:closed', self.onClosedBound);
    self.$f7ready(() => {
      self.f7LoginScreen = self.$f7.loginScreen.create({
        el
      });

      if (self.props.opened) {
        self.f7LoginScreen.open(false);
      }
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
    __reactComponentWatch(this, 'props.opened', prevProps, prevState, opened => {
      const self = this;
      if (!self.f7LoginScreen) return;

      if (opened) {
        self.f7LoginScreen.open();
      } else {
        self.f7LoginScreen.close();
      }
    });
  }

}

__reactComponentSetProps(F7LoginScreen, Object.assign({
  id: [String, Number],
  opened: Boolean
}, Mixins.colorProps));

export default F7LoginScreen;