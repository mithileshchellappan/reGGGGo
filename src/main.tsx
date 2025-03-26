import { Devvit, useAsync, useChannel, useState, useWebView } from '@devvit/public-api';
import type { Comment, Context } from '@devvit/public-api';
import type { DevvitMessage, WebViewMessage, } from './message.js';
import { addUser, deleteBrick, deleteUser, getCreation, getUsers, updateCreation, User } from './utils/gameUtils.js';
import { regggoForm } from './form.js';
import { ProductsList } from './store.js';
import { getUserPurchases, setupPaymentHandler } from './utils/paymentUtils.js';

// Helper function to check if a value is a Comment
function isComment(value: any): value is Comment {
  return value && 
    typeof value === 'object' && 
    'score' in value && 
    'body' in value && 
    'authorName' in value;
}

Devvit.configure({
  redditAPI: true,
  redis: true,
  realtime: true
});

setupPaymentHandler();

Devvit.addMenuItem({
  label: 'Launch a reGGGGoß Builder',
  location: 'subreddit',
  onPress: async (event, context) => {
    const { ui } = context;
    ui.showForm(regggoForm);

    ui.showToast('Challenge created!');
  }
})


// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Reggggo Builder',
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
    const [userPurchases, setUserPurchases] = useState(async () => await getUserPurchases(context))
    const [showStore, setShowStore] = useState(false)

    // Get the top comment
    const { data: commentData, loading, error } = useAsync(async () => {
      if (!context.postId) return null;
      
      try {
        const comments = await context.reddit
          .getComments({
            postId: context.postId,
            limit: 100,
          })
          .all();
        
        if (comments.length === 0) return null;
        
        // Sort comments and get the top one
        const topComment = comments.sort((a, b) => b.score - a.score)[0];
        
        // Return a simple object with only the needed properties
        const score = typeof topComment.score === 'number' ? topComment.score : 0;
        const body = typeof topComment.body === 'string' ? topComment.body : "";
        const authorName = typeof topComment.authorName === 'string' ? topComment.authorName : "unknown";
        
        return { score, body, authorName };
      } catch (e) {
        console.error("Error fetching comments:", e);
        return null;
      }
    });
    
    // Extract comment data in a type-safe way
    const topComment = commentData ? {
      score: commentData.score,
      body: commentData.body,
      authorName: commentData.authorName
    } : null;

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: 'index.html',

      async onMessage(message, webView) {
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
                userPurchases: userPurchases?.purchases ?? {}
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

    function onShopPress() {
      setShowStore(true)
    }

    // Render the custom post type
    return (
      <zstack grow alignment="middle center">
        <vstack
          grow
          backgroundColor="rgba(0, 0, 0, 0.6)"
          alignment="middle center"
          width="100%"
          height="100%"
        >
          <image
            url="loading.gif"
            imageWidth={1200}
            imageHeight={640}
            resizeMode="cover"
          />
        </vstack>
        {showStore ? (
          <vstack
            grow
            padding="medium"
            backgroundColor="rgba(0, 0, 0, 0.6)"
            cornerRadius="large"
            alignment="middle center"
            height="70%"
          >
            <hstack alignment="middle" width="100%">
              <text size="xlarge" weight="bold" color="#FFFFFF">Shop</text>
              <spacer />
              <button onPress={() => setShowStore(false)} appearance="bordered">Close</button>
            </hstack>
            <spacer size="medium" />
            <ProductsList purchases={userPurchases} setUserPurchases={setUserPurchases} context={context} />
          </vstack>
        ) : (
          <vstack
            grow
            padding="small"
            alignment="middle center"
            width="100%"
            height="100%"
          >
            <vstack alignment="middle center">
              <vstack
                padding="medium"
                backgroundColor="rgba(0, 0, 0, 0.6)"
                cornerRadius="large"
                alignment="middle center"
              >
                <hstack>
                  <text size="xxlarge" weight="bold" color="green" alignment="center">
                    Build:
                  </text>
                  <text size="xxlarge" weight="bold" color="#FFFFFF" alignment="center">
                    {creation?.creationName?.replace('Build ', '') ?? 'REGGGGO'}
                  </text>
                </hstack>
                <spacer size="medium" />
                <hstack gap="small">
                  <button onPress={onShopPress} appearance="secondary">
                    🛒 Shop
                  </button>
                  <button onPress={onMountPress} appearance="primary">
                    Start Building
                  </button>
                </hstack>
                <spacer size="medium" />
                <vstack>

                {loading && <text>Loading top comment...</text>}
                {error && <text color="red">Error loading comment: {error.message}</text>}
                {topComment && isComment(topComment) && (
                  <vstack padding="small" cornerRadius="medium" backgroundColor="rgba(0, 0, 0, 0.8)">
                    <text size="large" color="#108be8">Top Strategy:</text>
                    <spacer size="small" />
                    <text style="body" wrap>{topComment.body.slice(0, 250)}{topComment.body.length > 250 ? '...' : ''}</text>
                    <hstack>
                    <text size="small" color="#2d81c2">u/{topComment.authorName}</text>
                    <spacer />
                    <text size="xsmall">↑ {topComment.score}</text>
                    </hstack>
                  </vstack>
                )}
                {!loading && !error && !topComment && <text size="xsmall" color="#FFFFFF">Strategize in the comments!</text>}
                </vstack>
              </vstack>
              <spacer size="large" />
              <vstack alignment="middle center">
                <hstack gap="small">
                  {users && users.length > 0 && users.slice(0, 5).map((user) => (
                    <vstack alignment="center" gap="small">
                      <image url={user.snoovatarUrl} imageWidth={50} imageHeight={50} />
                      <text size="xsmall" color="#FFFFFF">{user.username}</text>
                    </vstack>
                  ))}
                  {users && users.length > 5 && users.slice(5).map((user) => (
                    <vstack alignment="center" gap="small">
                      <image url={user.snoovatarUrl} imageWidth={50} imageHeight={50} />
                      {/* <text size="small" color="#FFFFFF">{user.username}</text>  */}
                    </vstack>
                  ))}
                  {users && users.length > 10 && (
                    <text size="medium" color="#FFFFFF">+{users.length - 10}</text>
                  )}
                </hstack>
              </vstack>
            </vstack>
          </vstack>
        )}
      </zstack>
    );
  },
});

export default Devvit;
