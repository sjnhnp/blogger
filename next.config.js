const nextConfig = {
    reactStrictMode: true,
    // 讓客戶端程式碼也能讀取到環境變數
    env: {
      CLOUDFLARE_DEPLOY_HOOK: process.env.CLOUDFLARE_DEPLOY_HOOK,
    },
  };
  
  module.exports = nextConfig;