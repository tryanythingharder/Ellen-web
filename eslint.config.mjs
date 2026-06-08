import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["target-js/**", "target-unveil.html", "target-unveil.css", "target-node2.js"] },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
