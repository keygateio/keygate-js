/**
 * A simple BroadcastChannel based message bus with automatic leader election.
 * * The channel with the highest ID is the leader
 * * Only the leader should respond to messages
 * * `leave()` should be called when the channel is no longer needed
 * 
 * isLeader() can be used to determine if the current channel is the leader, however this is not guaranteed to be accurate. It is possible for the leader to change between the time isLeader() is called and the time the message is sent. If no response is received, you should assume to be the leader.
 * 
 * @param channelName The name of the channel
 */
export class Channel {
  channel: BroadcastChannel;
  id = Math.floor(Math.random() * 10e12);
  leader: number | undefined = this.id;
  nodes = new Set<number>(); // set of node ids
  nodesLastSeen = new Map<number, number>(); // [id, timestamp]

  isLeader() {
    return this.leader === this.id;
  }

  ping = (isFirstMessage = false) => {
    this.channel.postMessage(`${isFirstMessage ? "alive" : "isnew"}:${this.id}:${Date.now()}`);
    this.refreshLeader()
  };

  refreshLeader = () => {
    const now = Date.now();
    for (const id of this.nodes)
      if (now - (this.nodesLastSeen.get(id) || 0) > 1500)
        this.nodes.delete(id);

    if (this.nodes.size === 0) {
      this.leader = this.id
    } else {
      const id = Array.from(this.nodes)?.sort((a, b) => a?.[0] - b?.[0])?.[0]?.[0];
      this.leader = typeof id === "number" ? id : this.id;
    }
  }
  
  postMessage = (message: string) =>
    this.channel.postMessage(message);

  onMessage = (callback: (event: MessageEvent) => void) =>
    this.channel.addEventListener("message", (e) => {
      if (e.data.startsWith("_")) return;
      callback(e);
    });

  leave() {
    this.channel.postMessage(`_left:${this.id}:${Date.now()}`);
    this.channel.close();
  }

  constructor(channelName: string = "keygate-session-token") {
    this.channel = new BroadcastChannel(channelName);

    this.channel.onmessage = (event) => {
      // update nodes
      if (event.data.startsWith("_alive:") || event.data.startsWith("_isnew:")) {
        const [id, timestamp] = event.data.slice(7).split(":").map(Number);
        this.nodes.add(id);
        this.nodesLastSeen.set(id, timestamp);
        this.refreshLeader()
      }

      // tell new nodes about the leader as soon as possible if someone new joins
      if (event.data.startsWith("_isnew:")) {
        this.ping();
      }

      if (event.data.startsWith("_left:")) {
        const [id, timestamp] = event.data.slice(6).split(":").map(Number);
        this.nodes.delete(id);
        this.nodesLastSeen.delete(id);
        this.refreshLeader()
      }
    };

    this.ping(true);
    
    // node should always advertise itself as alive to keep the leader up to date
    // this shouldn't be necessary, but we do it anyways in case something goes wrong
    // and the leader doesn't properly leave the channel
    setInterval(this.ping, 1000);
  }
}
