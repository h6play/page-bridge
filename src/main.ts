import './style.css';
import { PageBridge, PageMessage } from '../lib/main';

/**
 * @desc Get page name
 * @path http://localhost:5173/a
 * @path http://localhost:5173/b
 */
const name = window.location.pathname.substring(1).trim();

// Set title
setTimeout(() => {
  document.title = `${bridge.getName()}:${bridge.getId()}`;
  const title = document.getElementById('title');
  title && (title.innerHTML = document.title);
}, 100);

// Create page bridge
const bridge = new PageBridge({ name });
(window as any).bridge = bridge;

// Listen for access events (no result returned)
bridge.on('visit', async (vo: PageMessage) => {
  console.log(`#/visit/# origin=${vo.origin}, target=${vo.target}`, vo.getData());
});

// Listen for query events (with results returned)
bridge.on('say', async (vo: PageMessage) => {
  console.log(`#/say/# origin=${vo.origin}, target=${vo.target}`);
  return `form Say:${bridge.getName()}:${bridge.getId()}`;
});

// Listen for initialization events
bridge.ready(async () => {
  console.log(`** ready:${bridge.getName()}:${bridge.getId()} **`);

  setInterval(() => {
    console.log(`---- pages(${bridge.getPages().length}) -----`);
    console.table(bridge.getPages());
  }, 3000);

  // Start
  if (name === 'a') {
    /** @dsec page a */

    // Send broadcast
    setTimeout(() => {
      console.log('** send visit **');
      bridge.send({
        method: 'visit',
        data: { from: bridge.manager.getId() },
      });
    }, 300);
  } else {

    /** @desc page b */

    // Send request
    setTimeout(() => {
      console.log('** request say **');
      const target = bridge.getPage('a');
      if (target) {
        bridge.request({
          method: 'say',
          data: { from: bridge.manager.getId() },
          target: target.id,
        }).then((vo) => {
          console.log('** request say:then:', vo);
        }).catch((vo) => {
          console.log('** request say:catch:', vo);
        });
      } else {
        console.log('** request say: target not found **');
      }
    }, 300);
  }
});

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1 id="title">Vite + TypeScript</h1>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`
