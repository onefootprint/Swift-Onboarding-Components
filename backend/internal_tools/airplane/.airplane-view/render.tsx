import ReactDOM from "react-dom/client";

// A render function that works for React 18.
export const render = (content) => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    content,
    document.getElementById("root")
  );
};
