const API_KEY = "563492ad6f91700001000001af5d93fda7494db1a99cf51cb0c1fa4e";
let PER_PAGE;
const TOTAL_IMAGES = 8000;
let ready = false;
let loadedImages = 0;
const imageContainer = document.querySelector(".image__container");
const loading = document.querySelector(".loading");
const errorDiv = document.querySelector(".error__div");
const backdrop = document.querySelector(".backdrop");

const authorisation = {
    method: "GET",
    headers: {
        Accept: "application/json",
        Authorization: API_KEY,
    },
};

const showLoading = () => {
    loading.classList.remove("hidden");
};

const hideLoading = () => {
    loading.classList.add("hidden");
};

const showBackdrop = () => {
    backdrop.classList.remove("hidden");
};

const hideBackdrop = () => {
    backdrop.classList.add("hidden");
};

const imageLoaded = () => {
    loadedImages++;
    ready = loadedImages === PER_PAGE ? true : false;
};

async function getImages() {
    showLoading();
    ready = false;
    loadedImages = 0;
    const mediaQuery = window.matchMedia("(min-width: 60rem)");
    if (mediaQuery.matches) {
        PER_PAGE = 25;
    } else {
        PER_PAGE = 16;
    }
    const pageCount = parseInt(TOTAL_IMAGES / PER_PAGE);
    const randomPage = Math.floor(Math.random() * pageCount + 1);
    try {
        const apiURL = `https://api.pexels.com/v1/curated?page=${randomPage}&per_page=${PER_PAGE}`;
        const data = await fetch(apiURL, authorisation);
        if (!data.ok) {
            if (data.status == 429) {
                throw new Error(`Fetch limit exceeded, please try again later!!\n
            (current maximum API request count is 200 / hour)`);
            }
        }
        const response = await data.json();
        response.photos.forEach((photo) => {
            const description = photo.alt;
            const hotlink = photo.url;
            const imageURL = photo.src.large2x;
            const photographer = photo.photographer;
            if (!photographer) {
                photographer = "Unknown";
            }

            const image = document.createElement("img");
            image.setAttribute("src", imageURL);
            image.setAttribute("alt", description);
            image.setAttribute("title", `Photo by ${photographer} on Pexels`);
            image.addEventListener("click", () => {
                window.open(hotlink, "_blank");
            });
            image.addEventListener("load", imageLoaded);
            imageContainer.appendChild(image);
        });
    } catch (error) {
        showBackdrop();
        console.log(error);
        errorDiv.style.top = "1rem";
        errorDiv.style.opacity = "1";
        const errorMessage = document.createElement("h3");
        errorMessage.innerHTML = error.message;
        errorMessage.style.textAlign = "center";
        errorDiv.appendChild(errorMessage);
    }
    hideLoading();
}

backdrop.addEventListener("click", () => {
    errorDiv.style.top = "-10rem";
    errorDiv.style.opacity = "0";
    hideBackdrop();
});

window.addEventListener("scroll", () => {
    if (
        window.scrollY + window.innerHeight >=
            document.querySelector(".image__container").scrollHeight - 700 &&
        ready
    ) {
        getImages();
    }
});

setTimeout(() => {
    getImages();
}, 3000);
