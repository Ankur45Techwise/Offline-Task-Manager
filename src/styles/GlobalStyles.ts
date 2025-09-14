import { createGlobalStyle, styled } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f5f6fa;
    color: #2c3e50;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  button {
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }
`;

export const OfflineIndicator = styled.div<{ isOnline: boolean }>`
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 1000;

  ${(props) =>
    props.isOnline
      ? `
    background: #27ae60;
    color: white;
  `
      : `
    background: #e74c3c;
    color: white;
  `}

  @media (max-width: 768px) {
    top: 70px;
    right: 10px;
    font-size: 0.8rem;
    padding: 6px 12px;
  }
`;
