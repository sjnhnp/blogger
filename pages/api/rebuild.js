// ========================================================================
//              pages/api/rebuild.js (FIXED for Edge Runtime)
// ========================================================================

// **FIX**: Add this line to specify the Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

// 這個 API 路由觸發您在 Cloudflare Pages 中設定的 Deploy Hook。
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        // 在 Edge Runtime 中，我們返回一個 Response 物件
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const hookUrl = process.env.CLOUDFLARE_DEPLOY_HOOK;

    if (!hookUrl) {
        console.error("Deploy hook URL is not configured. Please set CLOUDFLARE_DEPLOY_HOOK in your environment variables.");
        return new Response(JSON.stringify({ message: 'Deploy hook URL is not configured.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const response = await fetch(hookUrl, { method: 'POST' });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Deploy hook failed with status: ${response.status}. Body: ${errorText}`);
        }

        console.log("Cloudflare Pages deployment triggered successfully!");
        return new Response(JSON.stringify({ message: 'Rebuild triggered successfully!' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Failed to trigger rebuild:", error);
        return new Response(JSON.stringify({ message: 'Failed to trigger rebuild.', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}