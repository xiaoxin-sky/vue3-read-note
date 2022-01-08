# Vue3 mini 简单实现

> ###### 涉及 vnode、mount、diff（patch）、reactive

- vnode 创建vdom实现

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

- mount 挂载函数实现

  > mount 主要功能是把vnode对应的 vdom 挂在到 真实的 dom 上。

  ```js
  // 实现 mount 函数
  function mount(vnode,container){
    const container = document.getElementById(container);
  }
  ```

- patch 补丁函数diff实现

  > 补丁函数目的在于对比两个vnode，从最小 dom API 调用的角度来对比vnode，更新vnode

  ```js
  function patch(n1,n2){
    const el = n2.el = n1.el;
    // 对比tag，忽略
    /* 对比 props */
    const oldProps = n1.props||{};
    const newProps = n2.props || {};
    // 删除
    for(const key in newProps){
      const newVal = newProps[key];
      const oldVal = oldProps[key];
      if(newVal !== oldVal){
        el.setAttribute(key,newVal);
      }
    }
    // 删除掉 newProps 中的对象
    for(const key in oldProps){
      if(!(key in newProps)){
        el.removeAttribute(key)
      }
    }
    /* 对比 children */
    const newChildren = n2.children;
    const oldChildren = n1.children;
    if(typeof newChildren === 'string'){
      if(typeof oldChildren === 'string'){
        if(newChildren !== oldChildren){
          el.textContent = newChildren
        }
      }else {
        el.innerHTML = '';
        // 循环挂载 vnode 到 newChildren 上
        newChildren.forEach(vnode=>mount(vnode,el))
      }
    }else{
     	if(typeof oldChildren === 'stirng'){
        newChildren.forEach(vnode=>mount(vnode,el))
      }else{
        // oldChildren 和 newChildren 都是数组
        const commonLen = Math.min(oldChildren.length,newChildren.length);
        // 仅仅对公共长度进行简单对比，不处理位置变化的场景
        for(let i=0;i<commonLen;i++){
          patch(oldChildren[i],newChildren[i])
        }
        // 处理删除情况
        if(oldChildren.length > newChildren.length){
          oldChildren.splite(newChildren.length).forEach(child=>{
            el.removeChild(child)
          })
        }else {
          // 新增情况
          newChildren.splite(oldChildren.length).forEach(child=>{
            el.append(child)
          })
        }
      }
    }
    
  }
  ```

- reactive 响应式函数

  > 响应式函数主要依赖 Proxy Reflect 对象来实现，代理和对象映射
  >
  > 响应式对象有几个概念
  >
  > 1. effect依赖收集
  > 2. 响应式触发
  > 3. 响应式追踪

  watchEffect 与 reactive 一起配合使用。

  > watchEffect 函数主要用于收集 响应式的 effect 函数，watchEffect 收集 effect，当effect中有响应式对象时候，响应式对象会把当前正在调用的 effect 收集记录起来。
  >
  > 当外部再次触发响应式对象的赋值操作的时候，会触发记录到的响应式对象。

  ```js
  // 实现 watchEffect
  let activeEffect=null
  function watchEffect(effect){
    activeEffect = effect
    effect();
  }
  
  // 实现 reactive
  function reactive(obj){
    return new Proxy(obj,{
      get(target,key,receiver){
       	const dep = track(target,key)
        return Reflect.get(target,key,receiver)
      },
      set(target,key,value,receiver){
        trigger(target)
        return Reflect.set(target,key,value,receiver)
      }
    })
  }
  // 追踪函数添加依赖函数
  const targetMap = new WeakMap()
  function track(target,key){
    if(!activeEffect){
      return 
    }
    let depsMap = targetMap.get(target);
    if(!depsMap){
       depsMap = new Map();
      	targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key)
    if(!dep){
      dep = new Set();// 储存对象
      depsMap.set(key,dep);
    }
    dep.add(activeEffect)
  }
  // 触发函数
  function trigger(target,key){
    const depsMap = targetMap.get(target)
    if(!depsMap){
      return
    }
    const deps = depsMap.get(key)
    if(!deps){
      return 
    }
    const dep = deps.get(key)
    dep.forEach(effect=>{
      effect()
    })
  }
  ```

- 最后结合 reactive 、 mount 、patch ，组合成为mini-vue

  > 主要的一点注意 effect 是 渲染 vnode，已经挂在过之后，只需要重新渲染，然后 运行patch 对修改vnode进行 diff，打补丁即可。

  ```js
  // mountApp 实现呢
  function mountApp(component, container) {
    let isMount = false;
    let preVnode;
    effect(() => {
      if (!isMount) {
        isMount = true
        preVnode = component.render();
        mount(preVnode, container);
      } else {
        const newVnode = component.render();
        patch(preVnode, newVnode);
        preVnode = newVnode;
      }
    });
  }
  ```

  