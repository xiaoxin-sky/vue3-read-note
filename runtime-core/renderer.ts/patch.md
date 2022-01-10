n1 老 vnode

n2 新 vnode

### 流程图

![img](https://cdn.nlark.com/yuque/0/2022/jpeg/1738914/1641025992480-eae14f3b-83db-4011-b937-62ddca2f8860.jpeg)

### 默认 node 节点选项 nodeOps

![img](https://cdn.nlark.com/yuque/0/2021/jpeg/1738914/1640512131977-277187e9-d892-436d-b74d-159260f6e085.jpeg)

processText 函数处理

2 种情况

- n1 为 null，使用原生 `createTextNode` 创建文本节点。如果
- n1 不为 null，使用 `nodeValue` 把 n2 的 children 替换给 n1

processCommentNode 函数

2 种情况

- n1 为 null，使用 n2.children 创建一个注释节点，然后用 insertBefore 把节点 container
- n1 非 null，直接把 n2.el 的替换为 n1.el。 注释不支持动态内容。

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

patchKeyedChildren 函数

diff 算法

设置起始位置，i=0；

设置 c1，c2 的结束坐标。

1️⃣**第一步**：从最开始往右同步

while 循环，从 i=0，开始进行对比，取出 c1，c2 中下标为 i 的 vnode，n2 会先进行 normallize 为 Vnode。对比 n1 与 n2，有两种情况：

情况 ①：n1 与 n2 是同一种类型。直接调用 patch 进行对比两个 vnode。对比完成后，此时的 n2 已经完成是正确的内容了，i 指针移入下一位。最终某一方（e1、e2）彻底完毕。这时候 i 与该方的 length 相同。

情况 ②：n1 与 n2 类型不同，这时候会直接 break，结束第一步的序列对比。这时候 i 会小于等于 e1 、e2。

![img](https://cdn.nlark.com/yuque/0/2021/jpeg/1738914/1640838724278-f92f9dd3-678d-411d-a8a7-da7e79e129d6.jpeg)

**第二步**：从最后往左同步

同步条件是，第一步遍历时候遇到第一个 n1，n2 类型不同的位置 i，c1，c2 结束的坐标位置必须都没有走完。也就是第一步上图的情况。

遇到相同之后，并且两者都没有对比到最后，因为中间插入了类型不同的 vnode，那么，就从后往前进行对比。这个时候，其实 i 就作为终止的标志之一了。(第一步是 e1，e2 ，vnode 的类型作为终止标志)。接下来，从结尾开始对比 vnode。

对比也是两种情况：

情况 ①：n1，n2 类型想同，那么就直接 patch，完成一个 vnode 同步。e1，e2 指标往前移一位。直到遇到某一方的标志（e1、e2）小于 i 了，这时候说明两者中有一个已经被完全遍历完了，这时同样分为两种情况：

\1. e1 (p a b )被遍历完了，e2 还有剩余的(p x a b)。这代表着 e2 子序列中插入了新元素。

\2. e2 （p b）被遍历完了，e1 （p a b）还有剩余，这时候代表着，e2 的子序列中有元素被删除掉了。

这两种情况会分别在第三步和第四步被处理。

![img](https://cdn.nlark.com/yuque/0/2021/jpeg/1738914/1640838726263-102c0e17-ae68-4316-b84a-6beb20ce239d.jpeg)

情况 ②：n1，n2 类型不同了，结束对比，结束第二步，这个时候 i 是小于等于 e1，e2 的。

![img](https://cdn.nlark.com/yuque/0/2021/jpeg/1738914/1640838985295-ecc3d47a-c72d-4cd7-889b-9cee8e5215ca.jpeg)

第一步和第二步是用来处理 children 中间插入了一些其他类型的 vnode。如果是中间插入 vnode 的话，那其实，做法就是把左边和右边的顺序不变的 vnode 进行同步。不过中间插入 vnode 又分为好多情况，比如：中间有一段 vnode 的顺序发生改变，中间一段新增 vnode，或者在中间穿插加入一些 vnode，这些情况都会在第五步处理。

**第三步**：公共序列 + c2 比 c1 多出来的需要挂载新增的 vnode。（经过第一第二步已经找出公共序列）

比如：下面一组 vnode。

_// p (a b)_

_//p a x (a b)_

_i = 1, e1 = 0, e2 = 2_

必须满足，只有后面 a，b 想同，a 到 m 的组件都不同，因此需要重新挂载这几个组件。

想要挂载 a x，那必须有如下条件：

1. i 大于 e1，否则如下面的情况

x y (a b)

m d c (a b)

这种情况，i 小于了 e1，那么，前面的内容不是纯净的相同序列，因为 x y 与 m d c 序列不一致，无法进行直接挂载。

1. i 必须小于等于 e2。因为如果 i 大于 e2 的话，那说明，后面 e2 的序列较短。

```typescript
// i
if (i > e1) {
  if (i <= e2) {
    const nextPos = e2 + 1;
    const anchor = nextPos < l2 ? (c2[nextPos] as VNode).el : parentAnchor;
    while (i <= e2) {
      patch(
        null,
        (c2[i] = optimized
          ? cloneIfMounted(c2[i] as VNode)
          : normalizeVNode(c2[i])),
        container,
        anchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      );
      i++;
    }
  }
}
```

**第四步**：公共序列 + c1 比 c2 多出来的子节点，需要卸载多余子节点

这里第三、四、五步是互斥的，因此，在一次 patch 中，只会进三者之一。

由于第四步是处理 c2 比 c1 短的情况，也就是说处理 c1 中不存在于 c2 的元素，第二步的情况 ① 中已经分析过了，这就需要保证 i>e2。分别去挂载 c1[i]中不存在的。

**第五步**：patch 的保底操作，处理未知序列。

这一步是，i<e1、i<e2 ,那这一步就说明了有未知序列。这一步就是处理乱序的子序列，乱序操作比较复杂。如下的序列。

```typescript
// [i ... e1 + 1]: a b [c d e] f g
// [i ... e2 + 1]: a b [e d c h] f g
// i = 2, e1 = 4, e2 = 5
```

5.1 第一波循环，使用 `keyToNewIndexMap` 来记录新序列中的乱序下标和 vnode 的 key 之间的映射，如果有重复的 key，那会弹出 warn；

5.2 第二波循环，通过遍历遗留下来的老的子节点，然后给匹配节点打补丁、移除那些不再出现的节点。用变量 `maxNewIndexSoFar` 记录一些节点是否已经发生移动。用 `Map<newIndex, oldIndex>` 来记录新旧索引位置，注意：

老的索引需要+1，

并且老的索引为 0 时候，这是一个特别的值，用来表示新的节点已经不再对应老的节点了。

`newIndexToOldIndexMap`变量用于确定最长稳定子序列。

从 s1 开始遍历 e1，已经打补丁的节点数量大于等于需要被打补丁的节点，所有新的子节点已经被打补丁，因此这里只能是移除。

**查找设置 newIndex 为打补丁做准备**，这里会判断之前的节点的 key 是否是 null，

**如果不是 null**，那么 key 直接从 map 中找到对应 key 的新节点的索引位置。

​ **如果是 null**，即没有设置 key 的节点，尝试查找相同类型的无 key 节点。从 s2 开始遍历 e2（从 s2-e2 是因为乱序子序列是 s2 开头，e2 结尾），判断 `newIndexToOldIndexMap` 中的对应节点是否是 0（判断 j - s2 而不是 j，是因为乱序子序列是从 0 开始的，如果直接用 j，那就有可能忽略掉`newIndexToOldIndexMap`前面的几个元素），且类型是否相同。 查找新索引之后会有 2 种结果，1 没找到新索引，2 找到新索引。

1. 没找到新索引，那么 newIndex 肯定还是 undefined，因此，需要删除掉这个节点。
2. 找到新索引，会给对应的 `newIndexToOldIndexMap` 位置的值设置+1（这样在下次循环时候，就不会再找到这个节点了。），然后判断查找到的索引是不是目前为止最大的新索引，是的话就替换 maxNewIndexSoFar = newIndex。如果不是当前最大索引，那么就需要进行移动 moved =true。（maxNewIndexSoFar 作用是为了确定这个无序子序列是否发生的节点的移动，比如后面的节点移到前面了。试想一下，每次查找的时候，都会找到一个新的索引，当突然发现一个索引的位置居然没有超过当前最新节点的位置，那说明什么，很显然，是不是说明新找到的节点位置在最大节点位置之前，那就表示这个无序节点发生的位置移动。 ）。接下来会用老节点与 c2 新节点打补丁， patched 自增。

```typescript
patch(
  prevChild,
  // 这里是查找到的类型相同的新节点
  c2[newIndex] as VNode,
  container,
  null,
  parentComponent,
  parentSuspense,
  isSVG,
  slotScopeIds,
  optimized
);
```

5.3 移动和挂载

`increasingNewIndexSequence` 变量表示仅当节点已经被移动时，生成最长稳定子序列数组。向后遍历，因为这样我们可以使用最新的打过补丁的 node 作为锚点。

这一步会挂载所有 newIndexToOldIndexMap 中还是 0 的节点。如果节点不为 0，那就需要进行移动。如果不是 0，并且是移动的话，需要判断 j 是否小于 0，如果小于 0 了，说明
拿一个具体例子走一遍。

```typescript
test("moving single child forward", () => {
  elm = renderChildren([1, 2, 3, 4]);
  expect(elm.children.length).toBe(4);

  elm = renderChildren([2, 3, 1, 4]);
  expect(elm.children.length).toBe(4);
  expect((elm.children as TestElement[]).map(inner)).toEqual([
    "2",
    "3",
    "1",
    "4",
  ]);
});
```

c1 = [1,2,3,4];

c2 = [2,3,1,4];

第一步：循环结果，i=0,e1 = 3, e2 = 3;

第二步：i= 0 不变，e1 = 2，e2 = 2；

由于 i<e1=e2；因此不存在 挂载与卸载操作。

进入第五步完成已知序列 patch，处理未知序列。

5.1

s1 = s2 = 0;

keyToNewIndexMap = {};

从 s2 到 e2 进行遍历，结果是 keyToNewIndexMap 储存 3 个 key。

```typescript
// children key->children index
keyToNewIndexMap：{
	2:0,
  3:1,
  1:3,
}
```

5.2

patched = 0;

toBePatched = 3;

move = false;

maxNexIndexSoFar = 0;

newIndexToOldIndexMap = [];

经过循环 toBePatched ，结果 newIndexToOldIndexMap = [0,0,0,0];

循环 e1，找相同类型或者相同 key 的节点，进行 patch 找不到 unount；

结果是：newIndexToOldIndexMap[3] = 1;

newIndexToOldIndexMap[0] = 2;move = true;

newIndexToOldIndexMap[1]=3;

都进行过 patch 了。newIndexToOldIndexMap = [2,3,1];

5.3

increasingNewIndexSequence = [0,1] 获取最长子序列的索引。

j=1;

i = 2 increasingNewIndexSequence[1]=1;move;

i = 1 increasingNewIndexSequence[1]=1; j--;

i = 0 increasingNewIndexSequence[0]=0;j--;

最后 i=-1, j=-1;

5.3 的循环中，移动的条件是：没有稳定子序列(反序)或者当前节点不在稳定子序列中。
