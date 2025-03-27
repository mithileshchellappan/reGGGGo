import { Devvit } from '@devvit/public-api'
import { createCreation } from './utils/gameUtils.js';


export const regggoForm = Devvit.createForm(
    {
        title: 'Reggggo Builder',
        description: 'Build a Reggggo with the community!',
        acceptLabel: 'Build',
        cancelLabel: 'Cancel',
        fields: [
            {
                type: 'string',
                name: 'what',
                label: 'What do you want to build with the community?',
                required: true,
            },
            {
                type: 'select',
                name: 'canvasSize',
                label: 'Canvas Size',
                options: [
                    {
                        label: '20x20',
                        value: '20'
                    },
                    {
                        label: '50x50',
                        value: '50'
                    },
                    {
                        label: '80x80',
                        value: '80'
                    },
                    {
                        label: '100x100',
                        value: '100'
                    },
                    {
                        label: '150x150',
                        value: '150'
                    },
                    {
                        label: '200x200',
                        value: '200'
                    },
                    {
                        label: '250x250',
                        value: '250'
                    },
                    {
                        label: '300x300',
                        value: '300'
                    }                        
                ],
                multiSelect: false,
                required: true,
            }
        ],
    },
    async (event, context) => {
        const { reddit, ui } = context;
        const subreddit = await reddit.getCurrentSubredditName();
        const { what, canvasSize } = event.values;
        console.log("canvasSize", canvasSize)
        const post = await reddit.submitPost({
            title: `Build: ${what}`,
            subredditName: subreddit,
            preview: <vstack alignment='center middle' grow>
                <image
                    url="loading.gif"
                    imageWidth={1200}
                    imageHeight={640}
                    resizeMode="cover"
                />
            </vstack>
        });
        const currentUsername = await reddit.getCurrentUsername();
        if (!currentUsername) {
            ui.showToast('Failed to create challenge');
            return;
        }
        await createCreation(context, post.id, parseInt(canvasSize[0] ?? '20'), what)
        ui.navigateTo(post);
    }
);