#### templet 在线编译成 render 函数

https://vue-next-template-explorer.netlify.app/

- HOISTED  vNode的提升标记
  - 好处1：提升变量后，每次调用渲染函数不必再次创建
  - 好处2：在 patten algorithm 中，看到2个节点在同一位置，并且绝对相等的情话下，可以跳过这个节点。

#### vue中默认开启 cacheHandlers 

> cacheHandlers 可以缓存可变的事件处理函数，使得 vNode 成为一个几乎静态的内容 object对象。这样可以避免使用到 补丁更新，因为每次都是同一个调用同一个函数名，即使函数内部的东西改变，但是引用的始终都是同一个函数名。 

##### template

```vue
<div>
  <div @click="onClick" id="dj">Masdasd</div>
</div>
```

编译后的 `render` 函数

```js
import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from "vue"

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("div", {
      onClick: _cache[1] || (_cache[1] = (...args) => (_ctx.onClick && _ctx.onClick(...args))),
      id: "dj"
    }, "Masdasd")
  ]))
}
```

> 从上面可以看到，`onClick: _cache[1] || (_cache[1] = (...args) => (_ctx.onClick && _ctx.onClick(...args)))`  不管外部的 onClick 方法内容如何改变，在 div `props` 上的 onClick 始终引用的都是 `_ctx.onClick(...args)_`。因为这个vNode 是静态不变的内容，这里就可以避免掉每次都需要对绑定是函数进行 vnode 对比，并替换成不同的事件处理函数，性能可以得到提升。

