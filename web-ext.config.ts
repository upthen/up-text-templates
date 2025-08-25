import { defineWebExtConfig } from "wxt";

export default defineWebExtConfig({
  binaries: {
    chrome: "D:/Software/Doubao/app/Doubao.exe", // Use Chrome Beta instead of regular Chrome
    firefox: "firefoxdeveloperedition", // Use Firefox Developer Edition instead of regular Firefox
    edge: "/path/to/edge", // Open MS Edge when running "wxt -b edge"
  },
});
