import V0Blocks from "./components/v0-blocks"
import { ThemeProvider } from "./components/theme-provider"
import { useEffect } from "react"
import { onMessage, sendMessage } from "./lib/message-devvit"

function App() {
  useEffect(() => {
    sendMessage({
      type: "webViewReady",
      message: "Hello from Regggo!",
    })
    onMessage((msg) => {
      console.log("Message from Devvit:", msg)
    })
  }, [])

  return (
    <ThemeProvider defaultTheme="dark">
      <V0Blocks />
    </ThemeProvider>
  )
}

export default App

