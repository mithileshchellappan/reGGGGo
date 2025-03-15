export function sendMessage(msg: any): void {
    parent.postMessage(msg, document.referrer)
}

export function onMessage(callback: (msg: any) => void): void {
    console.log("Listening for messages")
    window.addEventListener("message", (event) => {
        if(event.data.type === 'devvit-message') {
            callback(event.data.data)
        }
    })
}