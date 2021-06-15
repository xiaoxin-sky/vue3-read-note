# Vue3 mini 简单实现

## 1.涉及 vnode、mount、diff（patch）、reactive

- vnode 实现

  > vnode 对应 vdom，vnode用js对象表示，vue3 中的 component API 的 h 函数会创建vnode

  ```js
  // 实现h 函数
  function h(tag,props,children){
    return {
      tag,
      props,
      children
    }
  }
  ```

- mount 实现

  > mount 主要功能是把vnode对应的 vdom 挂在到 真实的 dom 上。

  ```js
  // 实现 mount 函数
  function mount(vnode,container){
    const container = document.getElementById(container);
  }
  ```

  