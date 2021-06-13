function render(){
  return h('div',{
    h('div',[
      h('span','hello')
    ])
  })
}


const vdom = {
  tag:'div',
  children:[
    {
      tag:'div',
      children:[
        {
          tag:'span',
          children:'hello'
        }
      ]
    }
  ]
}