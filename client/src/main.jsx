import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { store, persistor } from "./redux/store";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import ToasterComponent from "./components/helpers/ToasterComponent";
import { QueryClient, QueryClientProvider } from "react-query";

// Create a ThemeProvider component
function ThemeProvider({ children }) {
  const theme = useSelector((state) => state.theme.theme);

  React.useEffect(() => {
    document.querySelector("html").setAttribute("data-theme", theme);
  }, [theme]);

  return children;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter> 
    <QueryClientProvider client={queryClient}>
      <PersistGate persistor={persistor}>
        <Provider store={store}>
          <ThemeProvider>
            <App />
            <ToasterComponent />
          </ThemeProvider>
        </Provider>
      </PersistGate>
    </QueryClientProvider>
  </BrowserRouter>
);
