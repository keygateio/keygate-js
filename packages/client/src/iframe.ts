export type Iframe = {
    postMessage: <T>(data: any) => Promise<T>;
};

export const createIframeConnection = async (src: string): Promise<Iframe> => {

  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  await new Promise((resolve) => {
    iframe.onload = resolve;
  });

  return {
    postMessage: (data) => {
      const id = Date.now() + ( (Math.random()*100000).toFixed());
      iframe.contentWindow?.postMessage({
        data,
        id,
      }, src);

      return new Promise((resolve, reject) => {
        const listener = (e: MessageEvent) => {
          if (e.data.id === id) {
            try {
              resolve(e.data.data);
            } catch (error) {
              reject(error);
            }
            window.removeEventListener("message", listener);
          }
        };
        window.addEventListener("message", listener);
      });
    }
  }
};
