export function sendMessage(msg: any): void {
    parent.postMessage(msg, document.referrer)
}

export function onMessage(callback: (msg: any) => void): void {
    window.addEventListener("message", (event) => {
        callback(event.data)
    })
}