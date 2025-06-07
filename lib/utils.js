// ========================================================================
//                           lib/utils.js
// ========================================================================
export const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
  };
  
  export const createExcerpt = (markdownContent) => {
      if (!markdownContent) return '';
      const withoutHtml = markdownContent.replace(/<[^>]+>/g, '');
      const plainText = withoutHtml
        .replace(/!\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
        .replace(/#+\s/g, '')
        .replace(/-{3,}/g, '')
        .replace(/`{3}.*?`{3}/gs, '')
        .replace(/[>\s*+-`_~#]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  }
  