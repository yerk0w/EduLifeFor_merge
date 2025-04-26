import {
  ChakraProvider,
  ThemeProvider,
  theme,
  ColorModeProvider,
  CSSReset,
} from "@chakra-ui/react";
import Home from "../page/Home";
import { isIOS } from "mobile-device-detect";
import MapProvider from "./MapProvider";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
    <MapProvider>
      <ChakraProvider>
        <ThemeProvider theme={theme}>
          <ColorModeProvider>
            <CSSReset />
            <Home isIOS={isIOS} />
          </ColorModeProvider>
        </ThemeProvider>
      </ChakraProvider>
    </MapProvider>
    </BrowserRouter>
  );
}

export default App;
