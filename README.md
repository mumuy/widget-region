# 基于Web component的二维码组件

## 演示地址
[https://passer-by.com/widget-region/](https://passer-by.com/widget-region/)


## 组件安装
```javascript
npm run widget-region
```


## 组件使用
```html
<widget-region value="浙江省杭州市钱塘区"></widget-region>
```


## 属性说明
<table>
    <caption><h3>组件属性</h3></caption>
    <thead>
        <tr><th>属性</th><th>说明</th></tr>
    </thead>
    <tbody>
        <tr><td>value</td><td>行政区划名称</td></tr>
        <tr><td>code</td><td>行政区划代码</td></tr>
        <tr><td>province</td><td>省级行政单元名称</td></tr>
        <tr><td>city</td><td>地级行政单元名称</td></tr>
        <tr><td>district</td><td>区县级行政单元名称</td></tr>
    </tbody>
</table>

## 事件说明
<table>
    <caption><h3>组件属性</h3></caption>
    <thead>
        <tr><th>事件</th><th>说明</th></tr>
    </thead>
    <tbody>
        <tr><td>onSelect</td><td>用户点击选择行政单元的时候触发</td></tr>
        <tr><td>onChange</td><td>用户完成选择并发生改变时触发</td></tr>
    </tbody>
</table>