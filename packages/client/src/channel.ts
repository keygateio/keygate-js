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

  onLogout = (callback: () => void) =>
    this.channel.addEventListener("message", (e) => {
      if (e.data === "_logout") callback();
    });

  onLogin = (callback: () => void) =>
    this.channel.addEventListener("message", (e) => {
      if (e.data === "_login") callback();
    });

  login() {
    this.channel.postMessage("_login");
  }

  logout() {
    this.channel.postMessage(`_logout`);
  }
}
