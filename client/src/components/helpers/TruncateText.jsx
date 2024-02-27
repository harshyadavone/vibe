export const truncateText = (text, maxLength) => {
  // Check if text is null, undefined, or not provided
  if (!text) {
    text = "user"; // Set default text to "user"
  }
  // Check if maxLength is not provided or not a number
  if (!maxLength || typeof maxLength !== "number") {
    maxLength = 15; // Set default maxLength to 15
  }
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  } else {
    return text;
  }
};
