# keygate-js

## `@keygate/client`

`@keygate/client` is the client library for interacting with a keygate server from a web browser, or a node.js application. It provides a simple interface for interacting with the keygate server, has no external dependencies, and is written in typescript.

### Usage

```typescript
import { createKeygateClient } from "@keygate/client";
const client = createKeygateClient({
  domain: "https://example.com",
  apiKey: "my-api-key",
  apiURL: "https://accounts.example.com/api/v1",
});
```

## `@keygate/server`

`@keygate/server` is the client library for interacting with a keygate server from a `node.js` or `deno` server.

## `@keygate/ui` - keygate UI (Webcomponent)

`@keygate/ui` provides ready-to-use UI components for keygate. It is based on [lit-element](https://lit-element.polymer-project.org/). It is not required to use keygate, but enables you to quickly get started.

## `@keygate/react` - keygate React

`@keygate/react` provides ready-to-use React components for keygate. It is built on top of `@keygate/ui`.
