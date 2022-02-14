由于没有子节点没有设置 key，那就少了相应的点对点的优化，只能粗略的进行按照共同序列进行对。对比的大致逻辑是，先获取到 c1，c2 公共长度，把公共长度进行 patch。然后就是超出的部分就进行卸载。或者挂载。当 c2 长度超过 c1，也就是说有新元素加入近来，那么调用 mountChildren 进行挂载，反之则调用 unmountChildren 卸载 c1 多余的组件。

### 比较新旧节点长度

由于没有 key 来确定组件关系，因此就只能进行全量对比了。

### 卸载或者挂载组件

卸载与挂载是两种情况

#### 卸载组件

当进入卸载分支时候，这说明 c2 子序列比 c1 短，那需要卸载掉超出的部分。从 `commonLength`位置开始卸载。

```typescript
const commonLength = Math.min(oldLength, newLength);
// .... other code
if (oldLength > newLength) {
  // remove old
  unmountChildren(
    c1,
    parentComponent,
    parentSuspense,
    true,
    false,
    commonLength
  );
}
```

#### 挂载组件

当进入挂载组件分支时，说明 c2 比 c1 长，那这个时候其实需要挂载超出的那一部分。那这里也是从 `commonLength`开始挂载。需要注意的是，挂载锚点`anchor`，`anchor`是序列的最后一个元素节点。

```typescript
else {
  // mount new
  mountChildren(
    c2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    slotScopeIds,
    optimized,
    commonLength
  )
}
```
