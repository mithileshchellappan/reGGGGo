import V0Blocks from "./components/v0-blocks"
import { ThemeProvider } from "./components/theme-provider"
import { useEffect } from "react"
import { onMessage, sendMessage } from "./lib/real-time"

function App() {
  useEffect(() => {
    try {
      sendMessage({
        type: "webViewReady",
        message: "Hello from Regggo!",
      })
    } catch (error) {
      console.error(error)
    }
  }, [])

  return (
    <ThemeProvider defaultTheme="dark">
      <V0Blocks />
    </ThemeProvider>
  )
}

export default App

