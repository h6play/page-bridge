# PageBridge

使浏览器页面之间的通信像计算机网络一样简单，采用 `localStorage` 来实现通讯。

## 快速开始

将其添加到现有的 `Vue` 或 `React` 项目中：

```bash
# npm
npm install bridge-page
# pnpm
pnpm install bridge-page
# yarn
yarn add bridge-page
```

## 系统协议

- `@bridge/pages` 获取在线页面列表
- `@bridge/update` 注册/更新页面数据
- `@bridge/delete` 删除指定页面

## 使用示例

下面展示一些常用的方法

### 桥接页面

- 页面A `a.html`

```html
<h1>A</h1>
```

```javascript
import { PageBridge } from 'bridge-page';

// 创建桥接对象
const bridge = new PageBridge({ name: 'A' });
```

- 页面B `b.html`

```html
<h1>B</h1>
```

```javascript
import { PageBridge } from 'bridge-page';

// 创建桥接对象
const bridge = new PageBridge({ name: 'B' });
```

### 页面信息

```javascript
// 获取当前页面信息
bridge.getId(); // 当前页面ID
bridge.getName(); // 当前页面名称
bridge.getData(); // 当前页面数据
bridge.getPage(); // 当前页面对象
// 获取指定页面信息
bridge.getPage(); // 当前页面
bridge.getPage('LVXJ7I56-CAV9930MH3A'); // 指定ID页面
bridge.getPage('Name'); // 指定名称页面
bridge.getPage((vo) => vo.data.label === 'Good' && vo.name === 'A'); // 指定条件页面
// 获取指定页面列表
bridge.getPages(); // 所有页面列表
bridge.getPages('LVXJ7I56-CAV9930MH3A'); // 指定ID页面列表
bridge.getPages('Name'); // 指定名称页面列表
bridge.getPages((vo) => vo.data.label === 'Good' && vo.name === 'A'); // 指定条件页面列表
// 设置当前页面信息
bridge.setName('A'); // 设置当前页面名称
bridge.setData({ label: 'Good' }); // 设置当前页面数据
```

### 订阅/发布

- 窗口初始化

```javascript
// 当前窗口初始化
bridge.ready(async () => {
    console.log('Ready');
});
```

- 订阅消息

```javascript
// 订阅事件（广播）
bridge.on('visit', async (vo: PageMessage) => {
    // vo.getData(); # 获取请求数据
});

// 订阅事件（请求）
bridge.on('say', async (vo: PageMessage) => {
    // vo.getData(); # 获取请求数据
    return '我是 Main';
});

// 取消订阅事件
bridge.off('say');
```

- 发布广播

```javascript
bridge.send({
    method: 'visit', // 方法名称
    data: { from: 'Main' }, // 请求数据
    page?: 'LVXJ7I56-CAV9930MH3A', // 指定窗口ID
    page?: null, // 所有窗口
    page?: 'Name', // 指定窗口名称
    page?: (vo) => vo.data.label === 'Good' && vo.name === 'A', // 指定条件窗口
});
```

- 请求&响应

```javascript
// 请求指定窗口
bridge.request({
    method: 'say', // 方法名称
    data: { from: 'Main' }, // 请求数据
    target?: 'LVXJ7I56-CAV9930MH3A', // 指定窗口ID
    target?: undefined, // 当前窗口
}).then((vo: any) => {
    console.log('say.then', vo);
}).catch((error: Error) => {
    console.log('say.catch', vo);
});
```
