import V0Blocks from "./components/v0-blocks"
import { ThemeProvider } from "./components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <V0Blocks />
    </ThemeProvider>
  )
}

export default App

