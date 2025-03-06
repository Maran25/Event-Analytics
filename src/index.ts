import app from "./app";

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`[server]: Server is running on PORT:${port}`);
});

export const closeServer = async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        console.log("Server closed.");
        resolve();
      });
    });
  }
};

export default server;
