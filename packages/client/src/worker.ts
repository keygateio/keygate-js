import * as kv from 'idb-keyval';

console.log('worker loaded');

onmessage = async (event) => {
  const { key, value } = event.data;
  await kv.set(key, value);
  postMessage('done');
}