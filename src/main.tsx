import './createPost.js';

import { Devvit, useChannel, useState, useWebView } from '@devvit/public-api';

import type { DevvitMessage, WebViewMessage } from './message.js';
import { deleteBrick, getCreation, updateCreation } from './utils/gameUtils.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  http:true,
  realtime: true
});

Devvit.addMenuItem({
  label: 'Launch a Reggggo Builder',
  location: 'subreddit',
  onPress: async (event, context) =>{
    const { reddit, ui } = context;

    const opName = await reddit.getCurrentUsername() || 'anon';

    const subreddit = await reddit.getCurrentSubredditName();

    const post = await reddit.submitPost({
      title: `Leggggo | ${opName}`,
      subredditName: subreddit,
      preview: <vstack>
        <text>Loading...</text>
      </vstack>
    });
    const currentUsername = await reddit.getCurrentUsername();
    if (!currentUsername) {
      ui.showToast('Failed to create challenge');
      return;
    }

    // await storePostCreator(post.id, currentUsername, context);

    ui.showToast('Challenge created!');
    ui.navigateTo(post);
  }
})

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Web View Example',
  height: 'tall',
  render: (context) => {
    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });
    // Load latest counter from redis with `useAsync` hook
    const [counter, setCounter] = useState(async () => {
      const redisCount = await context.redis.get(`counter_${context.postId}`);
      return Number(redisCount ?? 0);
    });

   

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      // URL of your web view content
      url: 'index.html',

      // Handle messages sent from the web view
      async onMessage(message, webView) {
        console.log("Message from web view:", message)
        switch (message.type) {
          case 'webViewReady':
            console.log("WebView ready")
            const creation = await getCreation(context)
            webView.postMessage({
              type: 'initialData',
              data: {
                username: username,
                creation: {
                  bricks: creation.bricks || [],
                  creationId: context.postId || '',
                },
              },
            });
            break;
            case 'brickAdded': 
                await updateCreation(context, message.data.brick)
                if(!context.postId) break;
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
              if(!context.postId) break;
              await context.realtime.send(`creation_${context.postId.toString()}_updates`, {
                type: 'brickDeleted',
                username: username,
                data: {
                  brick: message.data.brick,
                  index: message.data.index,
                }
              })
              break;
          default:
            console.log(message)
            throw new Error(`Unknown message type: ${message satisfies never}`);
        }
      },
      onUnmount() {
        context.ui.showToast('Web view closed!');
      },
    });
    if(context.postId) {
      const channel = useChannel({
        name: `creation_${context.postId.toString()}_updates`,
        onMessage: (message: any) => {
          console.log("Message from channel:", message)
          if(!message || !webView) return;
          if(message.username === username) return;
          if(message.type === 'brickAdded') {
            console.log("Sending brickAdded message to web view")
            webView.postMessage({
              type: 'brickAdded',
              data: {
                brick: message.data.brick,
              }
            })
          }
          if(message.type === 'brickDeleted') {
            console.log("Sending brickDeleted message to web view")
            webView.postMessage({
              type: 'brickDeleted',
              data: message.data,
            })
          }
        }
      })
      channel.subscribe()
    }
    // Render the custom post type
    return (
      <vstack grow padding="small">
        <vstack grow alignment="middle center">
          <text size="xlarge" weight="bold">
            Example App
          </text>
          <spacer />
          <vstack alignment="start middle">
            <hstack>
              <text size="medium">Username:</text>
              <text size="medium" weight="bold">
                {' '}
                {username ?? ''}
              </text>
            </hstack>
            <hstack>
              <text size="medium">Current counter:</text>
              <text size="medium" weight="bold">
                {' '}
                {counter ?? ''}
              </text>
            </hstack>
          </vstack>
          <spacer />
          <button onPress={() => webView.mount()}>Launch App</button>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
