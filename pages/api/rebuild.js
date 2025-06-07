// ========================================================================
//              pages/api/rebuild.js (This version is OK)
// ========================================================================

export const runtime = 'experimental-edge';

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }
  
    const hookUrl = process.env.CLOUDFLARE_DEPLOY_HOOK;

    if (!hookUrl) {
        console.error("Deploy hook URL is not configured.");
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