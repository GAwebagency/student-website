
// DISPLAY CURRENT DATE
const dateElement = document.getElementById("current-date");

if (dateElement) {
    dateElement.textContent = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// LOAD NEWS FROM BACKEND
async function loadNews() {
    const newsContainer = document.getElementById("news-container");

    if (!newsContainer) return;

    try {
        const response = await fetch("/api/news");

        if (!response.ok) {
            throw new Error("Unable to load news");
        }

        const news = await response.json();

        newsContainer.innerHTML = "";

        if (news.length === 0) {
            newsContainer.innerHTML = "<p>No news published yet.</p>";
            return;
        }

        news.forEach(article => {
            const card = document.createElement("article");
            card.className = "news-card";

            if (article.image) {
                const image = document.createElement("img");
                image.src = article.image;
                image.alt = article.title;
                image.className = "news-image";
                card.appendChild(image);
            }

            const category = document.createElement("p");
            category.className = "category-label";
            category.textContent = article.category;

            const title = document.createElement("h3");
            title.textContent = article.title;

            const author = document.createElement("p");
            author.textContent = "By " + article.author;

            const date = document.createElement("small");
            date.textContent = article.date;

            const preview = document.createElement("p");
            preview.textContent =
                article.content.length > 160
                    ? article.content.substring(0, 160) + "..."
                    : article.content;

            const readMore = document.createElement("a");
            readMore.href = `article.html?id=${encodeURIComponent(article.id)}`;
            readMore.textContent = "Read More";
            readMore.className = "read-more-button";

            card.append(
                category,
                title,
                author,
                date,
                preview,
                readMore
            );

            newsContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        newsContainer.innerHTML =
            "<p>Could not load news. Please refresh the page.</p>";
    }
}

loadNews();
