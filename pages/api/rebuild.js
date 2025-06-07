// ========================================================================
//              pages/api/rebuild.js (Correct & Simplified Version)
// ========================================================================
// 這個 API 路由觸發您在 Cloudflare Pages 中設定的 Deploy Hook。

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 從您在 Cloudflare Pages UI 中設定的環境變數讀取 Hook URL
    const hookUrl = process.env.CLOUDFLARE_DEPLOY_HOOK;

    if (!hookUrl) {
        console.error("Deploy hook URL is not configured. Please set CLOUDFLARE_DEPLOY_HOOK in your environment variables.");
        return res.status(500).json({ message: 'Deploy hook URL is not configured.' });
    }

    try {
        // 向您的部署掛鉤發送 POST 請求，這就足夠觸發部署了
        const response = await fetch(hookUrl, { method: 'POST' });

        if (!response.ok) {
            // 如果出錯，嘗試讀取錯誤訊息
            const errorText = await response.text();
            throw new Error(`Deploy hook failed with status: ${response.status}. Body: ${errorText}`);
        }

        console.log("Cloudflare Pages deployment triggered successfully!");
        res.status(200).json({ message: 'Rebuild triggered successfully!' });

    } catch (error) {
        console.error("Failed to trigger rebuild:", error);
        res.status(500).json({ message: 'Failed to trigger rebuild.', error: error.message });
    }
}