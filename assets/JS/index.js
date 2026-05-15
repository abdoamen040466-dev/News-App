"use strict";
// * HTML Elements
const newsContainer = document.querySelector(".news-container");
const CountryLinks = document.querySelectorAll("header nav ul a");
const CategoryLinks = document.querySelectorAll("main aside  a");
const errorSection = document.querySelector("main .error");
const dataRecieved = document.querySelector("main .data");
// ^ app variables

const apiKey = "634f9c2dfaa924ba8689db124f77adfb";
const cache = {};
const placeHolder = "./assets/img/placeholder.png";

// & functions

// helper functions

function saveToCache(key, data) {
  localStorage.setItem(
    key,
    JSON.stringify({
      data: data,
      time: Date.now(),
    }),
  );
}

function getFromCache(key) {
  const item = localStorage.getItem(key);
  if (!item) return null;

  const { data, time } = JSON.parse(item);

  const isExpired = Date.now() - time > 600000;

  if (isExpired) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
}
// function with LocalStorage cashe
async function getNews(countryCode, category) {
  errorSection.classList.add("d-none");
  dataRecieved.classList.add("d-none");

  const key = `${countryCode}-${category}`;
  const dataFromCashe = getFromCache(key);
  try {
    if (!dataFromCashe) {
      const response = await fetch(
        `https://gnews.io/api/v4/top-headlines?category=${category}&country=${countryCode}&apikey=${apiKey}`,
      );
      const { articles: data } = await response.json();
      if (!response.ok || data === null || data.length === 0) {
        throw new Error("API error");
      }
      displayArticles(data);
      dataRecieved.classList.remove("d-none");

      saveToCache(key, data);
    } else {
      console.log("from cache");
      displayArticles(dataFromCashe);
      dataRecieved.classList.remove("d-none");
    }
  } catch (e) {
    console.log(e);
    errorSection.classList.remove("d-none");
  }
}

getNews("eg", "general");

// image, title, description, url

function displayArticles(arr) {
  newsContainer.innerHTML = "";


  const fragement = document.createDocumentFragment();
  for (const { image, title, description, url } of arr) {
    // atrticle

    
    const article = document.createElement("article");
    article.className = "col-md-4 col-sm-6";

    // inner
    const inner = document.createElement("div");
    inner.className = "inner shadow h-100 d-flex flex-column";

    // image
    
    const img = document.createElement("img");
    img.src = image || placeHolder;
    img.className = "w-100";
    img.alt = "news image";
    img.loading = "lazy";
    img.onerror = function () {
      this.onerror = null;
      this.src = placeHolder;
    };
    img.onload = function () {
      if (!this.complete || this.naturalWidth < 50) {
        this.src = placeHolder;
      }
    };

    // article body
    const body = document.createElement("div");
    body.className = "article-body p-3 flex-grow-1 d-flex flex-column";

    // title
    const mainTitle = document.createElement("h2");
    mainTitle.className = "h5";
    mainTitle.textContent = title;

    // description
    const desc = document.createElement("p");
    desc.textContent = description || "";

    // link
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.className = "btn btn-primary mt-auto align-self-center w-50";
    link.textContent = "Read More";

    // build tree
    body.appendChild(mainTitle);
    body.appendChild(desc);
    body.appendChild(link);

    inner.appendChild(img);
    inner.appendChild(body);

    article.appendChild(inner);

    fragement.appendChild(article);
  }

  newsContainer.appendChild(fragement);
}

// ? events

for (const country of CountryLinks) {
  country.addEventListener("click", function (e) {
    const activeLink = document.querySelector("header nav ul .active");
    activeLink.classList.remove("active");
    e.target.classList.add("active");
    const country = e.target.getAttribute("data-country");
    const category = document
      .querySelector("aside nav ul .active")
      .getAttribute("data-category");

    getNews(country, category);
  });
}

for (const category of CategoryLinks) {
  category.addEventListener("click", function (e) {
    const activeLink = document.querySelector("aside nav ul .active");
    activeLink.classList.remove("active");
    e.target.classList.add("active");
    const category = e.target.getAttribute("data-category");
    const country = document
      .querySelector("header nav ul .active")
      .getAttribute("data-country");

    getNews(country, category);
  });
}
