import { createSlice } from "@reduxjs/toolkit";

// Retrieve the initial theme from local storage if available, otherwise set it to 'light'
const storedTheme = localStorage.getItem("theme");
const initialTheme = storedTheme ? storedTheme : "light";

const initialState = {
  theme: initialTheme,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      // Store the updated theme preference in local storage
      localStorage.setItem("theme", state.theme);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
