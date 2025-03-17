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
                        label: '30x30',
                        value: '30'
                    },
                    {
                        label: '40x40',
                        value: '40'
                    },
                    {
                        label: '50x50',
                        value: '50'
                    },
                    {
                        label: '60x60',
                        value: '60'
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
            preview: <vstack>
                <text>Loading...</text>
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