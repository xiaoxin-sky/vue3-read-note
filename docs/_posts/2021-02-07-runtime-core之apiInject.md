这个模块主要用来提供 vue 内 `provide` 和 `inject` API，这也是 vuex4.0、pinia 能够提供函数式 useStore 的关键。

provide 函数

通过 key 来给 vue app 实例中添加 provides。provides 可以来自两部分：

1. app 实例上的 provides
2. 自身组件上创建的 provides

默认情况下，一个实例继承它的父 provides 对象，但是当他需要他自身的值的时候，它会创建属于自己的 provides 对象，通过父 provides 对象作为原型。在 inject 中，这种方法我们可以简单的找到来自直接父节点的注入并且让原型链正常工作。

**具体过程**：

先拿到当前实例的 provides，并父节点的 provides，这时候有 2 种情况：

1. 当前节点与父节点的 provides 不是同一个引用。

如果父节点不存在，那就说明当前实例就是根节点，直接在根节点添加相应的 provides 值。

1. 当前节点与父节点是同一个 provides 引用

```typescript
if (parentProvides === provides) {
  provides = currentInstance.provides = Object.create(parentProvides);
}
provides[key as string] = value;
```

这里当前 provides 与 parentProvides 相等，说明当前组件实例上的 provides 一直是来自父节点的。那么当需要给当前组件实例添加 provides 的时候，需要保持父节点的原型链，并且再给当前节点添加新值。

其实默认情况下，在子组件中没有调用 provide 函数时，所有的组件实例的 provides 都来自父组件（`currentInstance.parent.provides`），那么也就是说，都来自顶层的 app 实例。

inject 函数

inject 支持多个参数用来配置默认值，当 inject 的 key 在祖先组件中没有提供对应的 provide 的时候，就走默认的配置，思考一下，如果刚开始祖先组件没有设置 provide，那子组件将永远在 setup 里面获取到 provide。

```typescript
if (provides && (key as string | symbol) in provides) {
  return provides[key as string];
} else if (arguments.length > 1) {
  return treatDefaultAsFactory && isFunction(defaultValue)
    ? defaultValue.call(instance.proxy)
    : defaultValue;
}
//... other code
```
