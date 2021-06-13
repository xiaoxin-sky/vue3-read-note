# vNode—cloneVNode

> 本文列举一些 cloneVNode中了解的关键信息。

## cloneVNode 

> 在克隆vnode 的时候，故意不使用继承，这样可以避免对键枚举时的消耗。

#### 处理clone vnode.ref：normalizeRef 

> 只要`ref`是字段有值，就会把 vnode 的ref 重写为 { i: currentRenderingInstance, r: ref }
>
> currentRenderingInstance 暂时未知

#### patchFlages（补丁标记）

> 在diff期间会被用到，当diff期间遇到了 dynamicChildren，diff会进入  optimized mode，在这个模式中，会准确的捕获到那些被做了补丁标记（patch Flage）的 vDom 的更新。

#### 处理 patchFlage 属性

> patchFlage 标记不对 Fragment 类型进行处理，即克隆的对象类型如果是 Fragment ，那 patchFlage 字段会带有 patchFlag 标记。

#### shapeFlag 标记children的信息

> 暂不清楚用法

## h函数

> h函数就是对 createVnode 进行的一层包装，可以更方便的使用，而不必进行过多的判断和参数位置限制
