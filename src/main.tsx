import { Devvit, useChannel, useState, useWebView } from '@devvit/public-api';

import type { DevvitMessage, WebViewMessage } from './message.js';
import { addUser, deleteBrick, deleteUser, getCreation, getUsers, updateCreation, User } from './utils/gameUtils.js';
import { regggoForm } from './form.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  http: true,
  realtime: true
});

Devvit.addMenuItem({
  label: 'Launch a Reggggo Builder',
  location: 'subreddit',
  onPress: async (event, context) => {
    const { ui } = context;
    ui.showForm(regggoForm);

    ui.showToast('Challenge created!');
  }
})

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Web View Example',
  height: 'tall',
  render: (context) => {
    const [[username, snoovatarURL]] = useState<[string, string]>(
      async () => {
        const user = await context.reddit.getCurrentUser()
        const url = await user?.getSnoovatarUrl()
        return [
          user?.username ?? 'anon',
          url ?? 'https://www.redditstatic.com/shreddit/assets/thinking-snoo.png'
        ]
      }
    )
    const [creation, setCreation] = useState(async () => await getCreation(context))
    const [users, setUsers] = useState<User[]>(async () => await getUsers(context))


    const webView = useWebView<WebViewMessage, DevvitMessage>({
      // URL of your web view content
      url: 'index.html',

      // Handle messages sent from the web view
      async onMessage(message, webView) {
        console.log("current user in web view:", username)
        console.log("Message from web view:", message.type)
        switch (message.type) {
          case 'webViewReady':
            console.log("WebView ready")
            const creation = await getCreation(context)
            setCreation(creation)
            webView.postMessage({
              type: 'initialData',
              data: {
                username: username,
                creation,
              },
            });
            break;
          case 'brickAdded':
            await updateCreation(context, message.data.brick)
            if (!context.postId) break;
            await context.realtime.send(`creation_${context.postId.toString()}_updates`, {
              type: 'brickAdded',
              username: username,
              data: {
                brick: message.data.brick,
              }
            })
            break;
          case 'brickDeleted':
            console.log("Brick deleted:", message.data.brick)
            await deleteBrick(context, message.data.brick)
            if (!context.postId) break;
            await context.realtime.send(`creation_${context.postId.toString()}_updates`, {
              type: 'brickDeleted',
              username: username,
              data: {
                brick: message.data.brick,
                index: message.data.index,
                brickId: message.data.brick.id,
              }
            })
            break;
          default:
            console.log(message)
            throw new Error(`Unknown message type: ${message satisfies never}`);
        }
      },
      async onUnmount() {
        const newUsers = await deleteUser(context, { username: username, snoovatarUrl: snoovatarURL })
        setUsers(newUsers)
      },
    });
    if (context.postId) {
      const channel = useChannel({
        name: `creation_${context.postId.toString()}_updates`,
        onMessage: (message: any) => {
          console.log("current user in channel:", username)
          console.log("Message from channel:", message.type)
          if (!message || !webView) return;

          if (message.username === username) {
            console.log("Ignoring message from self");
            return;
          }

          if (message.type === 'brickAdded') {
            console.log("Sending brickAdded message to web view")
            webView.postMessage({
              type: 'channelBrickAdded',
              data: {
                brick: message.data.brick,
                fromChannel: true // Add flag to indicate this came from channel
              }
            })
          }

          if (message.type === 'brickDeleted') {
            console.log("Sending brickDeleted message to web view")
            webView.postMessage({
              type: 'channelBrickDeleted',
              data: {
                ...message.data,
                fromChannel: true // Add flag to indicate this came from channel
              }
            })
          }
        }
      })
      channel.subscribe()
    }

    async function onMountPress() {
      webView.mount()
      const newUsers = await addUser(context, { username: username, snoovatarUrl: snoovatarURL })
      setUsers(newUsers)
    }
    // Render the custom post type
    return (
      <vstack grow padding="small">
        <vstack grow alignment="middle center">
          <text size="xlarge" weight="bold">
            Build {creation?.creationName ?? ''}
          </text>
          <text size="medium"> Builders Building: {users && users.length > 0 ? users.length : 0}</text>
          <spacer />
          <vstack alignment="start middle">
            <hstack>
              {users &&  users.length>0 && users.slice(0, 5).map((user) => (
                <vstack>
                  <image url={user.snoovatarUrl} imageWidth={30} imageHeight={30} />
                </vstack>
              ))}
              {users && users.length > 5 && users.slice(5).map((user) => (
                <vstack>
                  <image url={user.snoovatarUrl} imageWidth={30} imageHeight={30} />
                </vstack>
              ))}
              {users && users.length > 10 && <text size="medium">+{users.length - 10}</text>}
            </hstack>
          </vstack>
          <spacer />
          <button onPress={onMountPress}>Start Building</button>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
