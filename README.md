# PageBridge

Make communication between browser pages as simple as a computer network, using `localStorage` to achieve communication.

## Quick start

Add this to an existing `Vue` or `React` project:

```bash
# npm
npm install bridge-page
# pnpm
pnpm install bridge-page
# yarn
yarn add bridge-page
```

## System protocol

- `@bridge/create` Register page data
- `@bridge/update` Update page data
- `@bridge/delete` Delete specified page

## Usage example

The following shows some commonly used methods

### bridge page

- PageA `a.html`

```html
<h1>A</h1>
```

```javascript
import { PageBridge } from 'bridge-page';

// Create bridge object
const bridge = new PageBridge({ name: 'A' });
```

- PageB `b.html`

```html
<h1>B</h1>
```

```javascript
import { PageBridge } from 'bridge-page';

// Create bridge object
const bridge = new PageBridge({ name: 'B' });
```

### Page information

```javascript
// Get current page information
bridge.getId(); // Current page ID
bridge.getName(); // Current page Name
bridge.getData(); // Current page Data
bridge.getPage(); // Current page Object
// Get specified page information
bridge.getPage(); // Current page
bridge.getPage('LVXJ7I56-CAV9930MH3A'); // Specify ID page
bridge.getPage('Name'); // Specify Name page
bridge.getPage((vo) => vo.data.label === 'Good' && vo.name === 'A'); // Specify Condition page
// Get a list of specified pages
bridge.getPages(); // All pages
bridge.getPages('LVXJ7I56-CAV9930MH3A'); // Specify ID pages
bridge.getPages('Name'); // Specify Name pages
bridge.getPages((vo) => vo.data.label === 'Good' && vo.name === 'A'); // Specify Condition pages
// Set current page information
bridge.setName('A'); // Set current page name
bridge.setData({ label: 'Good' }); // Set current page data
```

### Subscribe/Publish

- Page ready

```javascript
// Current page ready
bridge.ready(async () => {
    console.log('Ready');
});
```

- Subscribe

```javascript
// Subscribe to events (broadcast)
bridge.on('visit', async (vo: PageMessage) => {
    // vo.getData(); # Get request data
});

// Subscribe to events (request)
bridge.on('say', async (vo: PageMessage) => {
    // vo.getData(); # Get request data
    return 'My Name is Main';
});

// Unsubscribe from events
bridge.off('say');
```

- Publish broadcast

```javascript
bridge.send({
    method: 'visit', // Method name
    data: { from: 'Main' }, // Request data
    page?: 'LVXJ7I56-CAV9930MH3A', // Specify ID page
    page?: null, // All pages
    page?: 'Name', // Specify Name pages
    page?: (vo) => vo.data.label === 'Good' && vo.name === 'A', // Specify Condition pages
});
```

- Request & Response

```javascript
bridge.request({
    method: 'say', // Method name
    data: { from: 'Main' }, // Request data
    target?: 'LVXJ7I56-CAV9930MH3A', // Specify ID page
    target?: undefined, // Current page
}).then((vo: any) => {
    console.log('say.then', vo);
}).catch((error: Error) => {
    console.log('say.catch', vo);
});
```
