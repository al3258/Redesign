// store the link plus the API key in a variable
const key = "AbGJb6XIGRNvoQRnYZdFOfBVtIqAj641";
const API = `https://api.nytimes.com/svc/topstories/v2/nyregion.json?api-key=${key}`;

function getStories() {
  fetch(API)
    .then((response) => response.json())
    .then((data) => showData(data.results));
}

function showData(stories) {
  var looped = stories
    .map(
      (story) => `
    <div class="item">
    <img src="${story.multimedia ? story.multimedia[2].url : ""}" alt="${
        story.multimedia ? story.multimedia[2]?.caption : ""
      }" />
    <figcaption>${
      story.multimedia ? story.multimedia[2]?.caption : ""
    }</figcaption>
      <h3><a href="${story.url}">${story.title}</a></h3>
      <p>${story.abstract}</p>
    </div>
  `
    )
    .join("");

  document.querySelector(".stories").innerHTML = looped;
}

if (document.querySelector(".home")) {
  getStories();
}

//  show/hide nav

document.addEventListener('click', clickHandlers)

function clickHandlers(e){
  console.log(e.target);
  if(e.target.matches('#pull')){
    document.querySelector('body').classList.toggle("show-nav");
    e.preventDefault()
  }
}