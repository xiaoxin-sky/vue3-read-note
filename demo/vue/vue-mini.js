// vue 实现

// 实现 h 创建 vnode 函数
function h(tag, props, children) {
  return {
    tag,
    props,
    children,
  };
}

// 实现 mount 挂载函数
function mount(vnode, container) {
  const el = document.createElement(vnode.tag);
  vnode.el = el;
  // 处理 props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key];
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }
  // 处理 children
  if (vnode.children) {
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children;
    } else {
      vnode.children.forEach((vnode) => {
        mount(vnode, el);
      });
    }
  }
  container.appendChild(el);
}

// patch 补丁函数，用于 diff 对比新旧 vnode，并使用 dom API 进行更新dom对象
function patch(n1, n2) {
  // 假设 vnode 的 tag 是一样的
  const el = (n2.el = n1.el); // 保证新的 vnode 携带的真是 dom 一直传递下去
  // 对比 props
  const oldProps = n1.props || {};
  const newProps = n2.props || {};
  for (const key in newProps) {
    const newValue = newProps[key];
    const oldValue = oldProps[key];
    if (newValue !== oldValue) {
      oldProps[key] = newValue;
    }
  }
  for (const key in oldProps) {
    if (!(key in newProps)) {
      el.removeAttribute(key);
    }
  }
  // 对比 children
  const oldChildren = n1.children;
  const newChildren = n2.children;

  if (typeof newChildren === "string") {
    if (oldChildren !== newChildren) {
      el.innerHTML = "";
      el.textContent = newChildren;
    }
  } else {
    // newChildren 是数组
    if (oldChildren !== newChildren) {
      if (typeof oldChildren === "string") {
        newChildren.forEach((vnode) => {
          mount(vnode, el);
        });
      } else {
        el.innerHTML = ""; // 清空原来的子节点
        newChildren.forEach((vnode) => mount(vnode, el));
      }
    }
  }
}

const targetMap = new WeakMap();
let activeEffect;
// 收集effect依赖
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 响应式对象
function reactive(obj) {
  const proxy = new Proxy(obj, {
    get(target, key, receiver) {
      if (activeEffect) {
        targetMap.set(target, activeEffect);
      }
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const effect = targetMap.get(target);
      Reflect.set(target, key, value, receiver);
      if (effect) {
        effect();
      }
    },
  });
  return proxy;
}

// 结合组合式 api，构建 mini-vue

const App = {
  data: reactive({ a: 1 }),
  render() {
    return h(
      "button",
      {
        onClick: () => {
          this.data.a++;
        },
      },
      String(this.data.a)
    );
  },
};

// mount(App.render(), document.getElementById("app"));

function mountApp(component, container) {
  let preVnode;
  let isMount = false;
  effect(mountMain);
  function mountMain() {
    if (!isMount) {
      isMount = true;
      preVnode = component.render();
      mount(preVnode, container);
    } else {
      const newVnode = component.render();
      patch(preVnode, newVnode);
      preVnode = newVnode;
    }
  }
}
mountApp(App, document.getElementById("app"));
