import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';

import type { DevvitMessage, WebViewMessage } from './message.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  http:true
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
            webView.postMessage({
              type: 'initialData',
              data: {
                username: username,
                currentCounter: counter,
              },
            });
            break;
          case 'setCounter':
            await context.redis.set(
              `counter_${context.postId}`,
              message.data.newCounter.toString()
            );
            setCounter(message.data.newCounter);

            webView.postMessage({
              type: 'updateCounter',
              data: {
                currentCounter: message.data.newCounter,
              },
            });
            break;
            case 'brickAdded': 
              console.log("Brick added:", message.data.brick)
              break;
          default:
            throw new Error(`Unknown message type: ${message satisfies never}`);
        }
      },
      onUnmount() {
        context.ui.showToast('Web view closed!');
      },
    });

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
