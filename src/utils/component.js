import $ from 'dom7';
import t7 from 'template7';
import Utils from '../utils/utils';

const tempDom = document.createElement('div');
const Component = {
  parse(componentString) {
    const callbackName = `f7_component_callback_${new Date().getTime()}`;

    // Template
    let template;
    if (componentString.indexOf('<template>') >= 0) {
      template = componentString.split('<template>')[1].split('</template>')[0].trim();
    }

    // Styles
    let styles;
    const stylesScopeId = Utils.now();
    if (componentString.indexOf('<style>') >= 0) {
      styles = componentString.split('<style>')[1].split('</style>')[0];
    } else if (componentString.indexOf('<style scoped>') >= 0) {
      styles = componentString.split('<style scoped>')[1].split('</style>')[0];
      styles = styles.split('\n').map((line) => {
        if (line.indexOf('{') >= 0) {
          if (line.indexOf('{{this}}') >= 0) {
            return line.replace('{{this}}', `[data-scope="${stylesScopeId}"]`);
          }
          return `[data-scope="${stylesScopeId}"] ${line.trim()}`;
        }
        return line;
      }).join('\n');
    }

    let scriptContent = componentString.split('<script>')[1].split('</script>')[0].trim();
    scriptContent = `window.${callbackName} = function () {${scriptContent}}`;

    // Insert Script El
    const scriptEl = document.createElement('script');
    scriptEl.innerHTML = scriptContent;
    $('head').append(scriptEl);

    const component = window[callbackName]();

    // Remove Script El
    $(scriptEl).remove();

    if (!component.template && !component.render) {
      component.template = template;
    }
    if (styles) {
      component.styles = styles;
      component.stylesScopeId = stylesScopeId;
    }
    return component;
  },
  compile(c, extend = {}) {
    const component = c;
    const context = Utils.extend({}, extend);

    // Apply context
    if (component.mounted) {
      component.mounted = component.mounted.bind(context);
    }
    if (component.beforeDestroy) {
      component.beforeDestroy = component.beforeDestroy.bind(context);
    }
    if (component.destroyed) {
      component.destroyed = component.destroyed.bind(context);
    }

    if (component.data) {
      component.data = component.data.bind(context);
      // Data
      Utils.extend(context, component.data());
    }
    if (component.render) component.render = component.render.bind(context);
    if (component.methods) {
      Object.keys(component.methods).forEach((methodName) => {
        context[methodName] = component.methods[methodName].bind(context);
      });
    }
    if (component.on) {
      Object.keys(component.on).forEach((eventName) => {
        component.on[eventName] = component.on[eventName].bind(context);
      });
    }

    // Render template
    let html = '';
    if (component.render) {
      html = component.render();
    } else if (component.template) {
      if (typeof component.template === 'string') {
        html = t7.compile(component.template)(context);
      } else {
        // Supposed to be function
        html = component.template(context);
      }
    }

    // Make Dom
    tempDom.innerHTML = html;

    // Extend context with $el
    const $el = tempDom.children[0];
    context.$el = $el;

    // Find Events
    const events = [];
    $(tempDom).find('*').each((index, el) => {
      for (let i = 0; i < el.attributes.length; i += 1) {
        const attr = el.attributes[i];
        if (attr.name.indexOf('@') === 0) {
          const event = attr.name.replace('@', '');
          let name = event;
          let stop = false;
          let prevent = false;
          let once = false;
          if (event.indexOf('.') >= 0) {
            event.split('.').forEach((eventNamePart, eventNameIndex) => {
              if (eventNameIndex === 0) name = eventNamePart;
              else {
                if (eventNamePart === 'stop') stop = true;
                if (eventNamePart === 'prevent') prevent = true;
                if (eventNamePart === 'once') once = true;
              }
            });
          }

          const value = attr.value;
          el.removeAttribute(attr.name);
          events.push({
            el,
            name,
            once,
            handler: (e) => {
              if (stop) e.stopPropagation();
              if (prevent) e.preventDefault();
              let methodName;
              let method;
              const args = [];
              if (value.indexOf('(') < 0) {
                args.push(e);
                methodName = value;
              } else {
                methodName = value.split('(')[0];
                value.split('(')[1].split(')')[0].split(',').forEach((argument) => {
                  let arg = argument.trim();
                  if (!isNaN(arg)) arg = parseFloat(arg);
                  else if (arg[0] === '"') arg = arg.replace(/"/g, '');
                  else if (arg[0] === '\'') arg = arg.replace(/'/g, '');
                  else if (arg.indexOf('.') > 0) {
                    let deepArg;
                    arg.split('.').forEach((path) => {
                      if (!deepArg) deepArg = context;
                      deepArg = deepArg[path];
                    });
                    arg = deepArg;
                  } else {
                    arg = context[arg];
                  }
                  args.push(arg);
                });
              }
              if (methodName.indexOf('.') >= 0) {
                methodName.split('.').forEach((path, pathIndex) => {
                  if (!method) method = context;
                  if (method[path]) method = method[path];
                  else {
                    throw new Error(`Component doesn't have method "${methodName.split('.').slice(0, pathIndex + 1).join('.')}"`);
                  }
                });
              } else {
                if (!context[methodName]) {
                  throw new Error(`Component doesn't have method "${methodName}"`);
                }
                method = context[methodName];
              }
              method(...args);
            },
          });
        }
      }
    });

    // Set styles scrope ID
    let styleEl;
    if (component.styles) {
      styleEl = document.createElement('style');
      styleEl.innerHTML = component.styles;
    }
    if (component.stylesScopeId) {
      $el.setAttribute('data-scope', component.stylesScopeId);
    }

    // Attach events
    events.forEach((event) => {
      $(event.el)[event.once ? 'once' : 'on'](event.name, event.handler);
    });

    component.destroy = function destroy() {
      if (component.beforeDestroy) component.beforeDestroy();
      if (styleEl) $(styleEl).remove();
      events.forEach((event) => {
        $(event.el).off(event.name, event.handler);
      });
      if (component.destroyed) component.destroyed();
    };

    // Store component instance
    for (let i = 0; i < tempDom.children.length; i += 1) {
      tempDom.children[i].f7Component = component;
    }

    return {
      el: $el,
      context,
      styleEl,
    };
  },
};
export default Component;