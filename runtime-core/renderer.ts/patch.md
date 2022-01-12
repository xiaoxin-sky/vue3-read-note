### patch 主流程图

![img](https://cdn.nlark.com/yuque/0/2022/jpeg/1738914/1641025992480-eae14f3b-83db-4011-b937-62ddca2f8860.jpeg)

### 默认 node 节点选项 nodeOps

![img](https://cdn.nlark.com/yuque/0/2021/jpeg/1738914/1640512131977-277187e9-d892-436d-b74d-159260f6e085.jpeg)

### processText 函数处理

这个函数用于处理 Text 类型的 vnode 更新

```typescript
const processText: ProcessTextOrCommentFn = (n1, n2, container, anchor) => {
  if (n1 == null) {
    hostInsert(
      (n2.el = hostCreateText(n2.children as string)),
      container,
      anchor
    );
  } else {
    const el = (n2.el = n1.el!);
    if (n2.children !== n1.children) {
      hostSetText(el, n2.children as string);
    }
  }
};
```

处理 Text 类型的 vnode，有 2 种情况：

- n1 为 null，使用`hostCreateText`创建文本节点。

```typescript
createText: text => doc.createTextNode(text),
```

- n1 不为 null，使用`hostSetText`把 n2 的 children 替换给 n1

```typescript
setText: (node, text) => {
  node.nodeValue = text;
};
```

注意：可以看到不管是哪个分支，都会给 n2.el 赋值，那是因为 n1 已经被抛弃了，n1 的 parent 也会被替换成新的。如果这时候不给 n2.el 赋值的话，下次渲染就无法找到 el 节点了。

### processCommentNode 函数

这个函数用来处理注释节点更新。注释节点没有任何特别功能，就是原样展示，并且不具有动态特性。

2 种情况

- n1 为 null，使用 n2.children 创建一个注释节点，然后用 insertBefore 把节点 container
- n1 非 null，直接把 n2.el 的替换为 n1.el。 注释不支持动态内容。

### processElement 函数

处理 dom 元素类型的更新

在这里面拆分为了挂载 element 和 patch Element。这里特别处理了 SVG 类型元素，具体对 SVG 有什么特别处理暂不清楚。

还未完成。。。。

#### mountElement 挂载 element vode

Static 类型

静态节点，这里就是 inserHTML，此处的静态内容只能来自已编译的模板，只要用户只使用受信任的模板，这是安全的。这里使用静态模板缓存。

processFragment 片段类型

判断一定会循环 patch。

其他的默认情况

processElement 普通 ELement 元素

2 种情况

- n1 为 null，调用 `mountElement` 挂载 element 元素。

**mountElement 函数挂载**

先统一 vnode，然后循环 patch children。

- n1 不为 null，patchElement，对比 n1、n2.

**patchElement 函数**

patchChildren 对比
