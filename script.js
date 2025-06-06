document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('new-post-form');
    const postsSection = document.getElementById('blog-posts-section');
    const noPostsMessageId = 'no-posts-message'; // ID for the "no posts" message

    // Load posts from local storage when the page loads
    loadPosts();

    if (postForm) {
        postForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const titleInput = document.getElementById('post-title');
            const contentInput = document.getElementById('post-content');

            const title = titleInput.value.trim();
            const content = contentInput.value.trim();

            if (title && content) {
                const newPost = {
                    title: title,
                    content: content,
                    date: new Date().toISOString() // Store date in ISO format
                };

                addPostToDOM(newPost);
                savePost(newPost);

                titleInput.value = ''; // Clear the form
                contentInput.value = '';
            } else {
                alert('Please fill in both title and content.');
            }
        });
    }

    function addPostToDOM(post, atBeginning = true) {
        // Remove "No posts yet" message if it exists
        const noPostsEl = document.getElementById(noPostsMessageId);
        if (noPostsEl) {
            noPostsEl.remove();
        }

        const article = document.createElement('article');
        article.classList.add('blog-post');

        const meta = document.createElement('p');
        meta.classList.add('post-meta');
        const postDate = new Date(post.date);
        meta.innerHTML = `Published on: <time datetime="${post.date}">${postDate.toLocaleDateString()} ${postDate.toLocaleTimeString()}</time> by You`;

        const h2 = document.createElement('h2');
        h2.textContent = post.title;

        const p = document.createElement('p');
        p.textContent = post.content;

        article.appendChild(meta);
        article.appendChild(h2);
        article.appendChild(p);

        if (atBeginning) {
            // Add the new post at the beginning of the posts section, after the "Posts" H2
            const postsHeading = postsSection.querySelector('h2');
            if (postsHeading) {
                postsHeading.insertAdjacentElement('afterend', article);
            } else { // Fallback if H2 isn't there for some reason
                postsSection.prepend(article);
            }
        } else {
            postsSection.appendChild(article);
        }
    }

    function savePost(post) {
        const posts = getPostsFromStorage();
        posts.unshift(post); // Add new post to the beginning of the array
        localStorage.setItem('blogPosts', JSON.stringify(posts));
    }

    function loadPosts() {
        const posts = getPostsFromStorage();
        // Clear existing placeholder/static posts first, except for the form and H2
        const existingArticles = postsSection.querySelectorAll('article.blog-post');
        existingArticles.forEach(article => article.remove());

        if (posts.length === 0) {
            // Display a message if there are no posts
            const postsHeading = postsSection.querySelector('h2');
            if (postsHeading && !document.getElementById(noPostsMessageId)) {
                const noPostsEl = document.createElement('p');
                noPostsEl.id = noPostsMessageId;
                noPostsEl.textContent = 'No posts yet. Write one above!';
                postsHeading.insertAdjacentElement('afterend', noPostsEl);
            }
        } else {
            // Add posts from storage, oldest first, so they appear in chronological order on load.
            // However, our savePost unshifts, meaning newest are first in storage.
            // So, we iterate normally to display newest first as per current DOM addition logic.
             posts.forEach(post => addPostToDOM(post, true)); // Add to DOM, newest first
        }
    }

    function getPostsFromStorage() {
        const posts = localStorage.getItem('blogPosts');
        return posts ? JSON.parse(posts) : [];
    }

    // Initial console log to confirm script is running
    console.log("Blog script loaded and DOM fully parsed.");
});
