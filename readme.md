# Redesign Project

## Homework

Prepare your final project.

## Exercise - A Site Redesign

Our hypothetical company has a site the looks outdated, is not responsive and needs to be broken up into multiple pages.

![site](ignore/other/wide.png)

We will be starting out with many of the same files and techniques we looked at previously. Before beginning, examine the files.

- `.gitignore` - includes the `_site` directory
- `pages` - our base directory
- `layouts` - our `layout.html` file now references partials via `include`
- `.eleventyignore` - instructs 11ty to not process `readme.md` (this file) and the ignore directory
- `.eleventy.js` - passthroughs for images, css and JS
- `home.md` has a front matter variable: permalink (`/`) in the front matter which means it will always render to the top level

## LocalStorage and SessionStorage

It seems excessive to check the NY Times API every time we go to the home page.

The localStorage and sessionStorage browser APIs let you presistently store data locally in the browser. You use the storage APIs to store data that the browser can access later.

Some examples include:

- storing user settings offline for a website, such as enabling dark mode
- remembering user search history
- remembering items in shopping cart

Data is stored indefinitely, and it must be a string.

```js
var value = "data that I want to store permanently";
localStorage.setItem("test", value); // set the item
localStorage.getItem("test"); // retrieve the item
localStorage.removeItem("test"); // delete the item
```

The data is persistent. You can close the browser and it will still be available the next time the user accesses the site.

Session storage works just like localStorage, except the data is cleared when the browser session ends.

```js
var value = "data that I want to store temporarily";
sessionStorage.setItem("myTempDataKey", value);
sessionStorage.getItem("myTempDataKey");
sessionStorage.removeItem("myTempDatakey");
```

Browsers provide differing levels of storage space for localStorage and sessionStorage, averaging around 5mb.

We begin by creating a key for our nytimes data and then checking for the data in local storage. If it exists then we'll use that data. Otherwise we'll fetch the data from the nytimes api:

```js
// the key
const storagePrefix = "nyt-autosave";
// omitted for brevity

function showData(stories) {
  // omitted for brevity
  // document.querySelector(".stories").innerHTML = looped;
  sessionStorage.setItem(storagePrefix, looped);
}

// if (document.querySelector(".home")) {
//   getStories();
// }

if (document.querySelector(".home")) {
  var saved = sessionStorage.getItem(storagePrefix);
  if (saved) {
    console.log("loading from sessionStorage");
    document.querySelector(".stories").innerHTML = saved;
  } else {
    console.log("fetching from nytimes");
    getStories();
  }
}
```

### Using Local Storage with TTL (Time To Live)

Adapted from [https://www.sohamkamani.com/blog/javascript-localstorage-with-ttl-expiry/](https://www.sohamkamani.com/blog/javascript-localstorage-with-ttl-expiry/)

```js
const key = "XJYe53T8oZ9wRgPqxGVAs2NtPqId5pdL";
const API = `https://api.nytimes.com/svc/topstories/v2/nyregion.json?api-key=${key}`;
const storagePrefix = "nyt-autosave";

function setWithExpiry(key, value, ttl) {
  const now = new Date();
  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  // if the item doesn't exist, return null
  if (!itemStr) {
    console.log("no item string");
    return null;
  }
  console.log("item string found!", itemStr);
  const item = JSON.parse(itemStr);
  const now = new Date();
  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    // If the item is expired, delete the item from storage
    // and return null
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

function getStories() {
  const stories = getWithExpiry(storagePrefix);
  if (!stories) {
    console.warn(" stories expired - fetching again ");
    fetch(API)
      .then((response) => response.json())
      .then((data) => showData(data.results));
  } else {
    console.warn(" stories not expired - no fetching ");
    document.querySelector(".stories").innerHTML = stories;
  }
}

function showData(stories) {
  const looped = stories
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
  setWithExpiry(storagePrefix, looped, 1000 * 60);
}

if (document.querySelector(".home")) {
  getStories();
}
```

## JavaScript Modules

Use modules in `layouts/layout.html`:

```html
<script type="module" src="/js/scripts.js"></script>
```

Create `src/js/modules/localStorageHelpers.js`

Cut and paste the setWithExpiry and getWithExpiry functions into the new file and export them:

```js
export function setWithExpiry(key, value, ttl) {
  const now = new Date();
  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  // if the item doesn't exist, return null
  if (!itemStr) {
    console.log("no item string");
    return null;
  }
  // console.log("item string found!", itemStr);
  const item = JSON.parse(itemStr);
  const now = new Date();
  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    // If the item is expired, delete the item from storage
    // and return null
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}
```

Import them into scripts.js:

```js
import { setWithExpiry, getWithExpiry } from "./modules/localStorageHelpers.js";
```

And test.

## Header

Add the first component to `layout.html` after the nav include, e.g.:

```
{% include "components/nav.html" %}
{% include "components/header.html" %}
```

Add header CSS to `styles.scss`:

```css
header {
  width > 980px;
  margin: 0 auto;
  padding-top: 2rem;
  h1 {
    font-size: 2.5rem;
  }
  p {
    font-size: 1.5rem;
    text-transform: uppercase;
    line-height: 1.1;
    margin-bottom: 1rem;
  }
  h1 + p {
    padding-top: 1rem;
    border-top: 3px double #dbd1b5;
  }
  p + p {
    font-size: 1rem;
    line-height: 1.1;
    color: #999;
  }
}
```

Inspect the header in the developer tools.

Add a media query to hide the header paragraphs on small screens.

Normally this would be written as:

```css
@media (width < 780px) {
  header p {
    display: none;
  }
}
```

Because we are nesting we can simply write:

```css
p {
  /* ...  */
  @media (width < 780px) {
    display: none;
  }
}
```

Note: this is _not_ a mobile first design pattern. It uses `width >` to add display attributes to small screens.

Change it to use a `width <` mobile first design pattern:

```css
p {
  display: none;
  @media (width > 780px) {
    display: block;
    font-size: 1.5rem;
    text-transform: uppercase;
    line-height: 1.1;
    margin-bottom: 1rem;
  }
}
```

### Variables

Add some CSS variables to the top of `styles.css`:

```css
:root {
  --link: #007eb6;
  --link-light: #02a1e6;
  --link-dark: #005275;
  --hover: #df3030;
  --text: #333;
  --med-gray: #666;
  --light-gray: #ddd;
  --dk-yellow: #dbd1b5;
}
```

Apply the color variables to the CSS.

## Responsive Main Nav

### Active Class for the Navigation

Update the [navigation](https://www.11ty.io/docs/) to include an active class using a Liquid `if` statement:

```html
<nav>
  <ul>
    {% for nav in collections.nav %}
    <li class="{% if nav.url == page.url %} active{% endif %}">
      <a href="{{ nav.url | url }}">{{ nav.data.navTitle }}</a>
    </li>
    {%- endfor -%}
  </ul>
</nav>
```

Add a link `<a href="#" id="pull"></a>` to the nav:

```html
<nav>
  <a href="#" id="pull"></a>
  <ul>
    ...
  </ul>
</nav>
```

We will use this to show a menu on small screens.

Small screen first - show and format the hamburger menu:

```css
#pull {
  display: block;
  background-color: var(--link);
  padding-top: 12px;
  padding-left: 12px;
  width: 100vh;
}

#pull::after {
  content: "";
  background: url(../img/nav-icon.png) no-repeat;
  width: 22px;
  height: 22px;
  background-size: cover;
  display: inline-block;
}
```

Format the ul for the small screen:

```css
nav ul {
  /* display: none; */
  padding: 0;
  margin: 0;
  list-style: none;
  background-color: var(--link);
}

nav a {
  padding: 1rem;
  color: #fff;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  &:hover {
    text-decoration: none;
  }
}

nav li:hover:not(.active) {
  background-color: var(--link-light);
}

nav .active {
  background-color: var(--link-dark);
}

nav .active a {
  font-weight: bold;
}
```

### Show/Hide Nav

Add to `scripts.js`:

```js
var hamburger = document.querySelector("#pull");
var body = document.querySelector("body");

hamburger.addEventListener("click", showMenu);

function showMenu(event) {
  body.classList.toggle("show-nav");
  event.preventDefault();
}
```

or, using event delegation:

```js
// var hamburger = document.querySelector("#pull");
// var body = document.querySelector("body");

document.addEventListener("click", clickHandlers);

function clickHandlers(event) {
  console.log(event.target);
  if (event.target.matches("#pull")) {
    document.querySelector("body").classList.toggle("show-nav");
    event.preventDefault();
  }
  // event.preventDefault();
}
```

Enable the `display: none` property on `nav ul` and add a `.show-nav` class in `_nav.scss`:

```css
.show-nav nav ul {
  display: block;
}
```

Note that the content shifts down when the nav is visible.

```css
.show-nav nav ul {
  display: block;
  position: absolute;
  width: 100%;
}
```

We can use flex with a column direction instead of display block:

```css
.show-nav nav ul {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
}
```

### Large Screen

Add media queries for medium and larger screens.

Hide the hamburger on wider screens:

```css
#pull {
  display: block;
  background-color: var(--link);
  padding-top: 12px;
  padding-left: 12px;
  @media (width > 781px) {
    display: none;
  }
}
```

Show the navigation on large screens:

```css
nav ul {
  display: none;
  padding: 0;
  margin: 0;
  list-style: none;
  background-color: var(--link);
  @media (width > 781px) {
    display: flex;
    justify-content: space-around;
    background: var(--link);
    text-align: center;
  }
}
```

Format the flex children with `flex-grow` to allow the li's to expand.

```scss
// nav li:hover:not(.active) {
//   background-color: var(--link-light);
// }

nav li {
  &:hover:not(.active) {
    background-color: var(--link-light);
  }
  @media (width > 781px) {
    flex-grow: 1;
  }
}
```

Check the navigation on both sizes and make adjustments as necessary.

Note: if we were making a single page app (SPA) we would have to code the menu to disappear when a selection was made. But because we are actually navigating to a new URL, the menu collapses naturally.

## Create Posts

Create a new posts folder in src.

Create two posts.

1. `services.md`:

```md
---
layout: layouts/layout.html
date: 2010-01-01
postTitle: Services
---

![rando image](/img/images-9.jpg)

# Our Services

Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment.

Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution. User generated content in real-time will have multiple touchpoints for offshoring.
```

2. `people.md`:

```md
---
layout: layouts/layout.html
date: 2010-01-01
postTitle: People
---

![rando image](/img/images-10.jpg)

# People

Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution. User generated content in real-time will have multiple touchpoints for offshoring.

Capitalize on low hanging fruit to identify a ballpark value added activity to beta test. Override the digital divide with additional clickthroughs from DevOps. Nanotechnology immersion along the information highway will close the loop on focusing solely on the bottom line.
```

Create `posts/posts.json`:

```js
{
  "layout": "layouts/layout.html",
  "tags": ["posts"]
}
```

Use the content on the existing blog page.

`blog.md`:

```md
---
pageTitle: About Us
date: 2019-03-01
navTitle: About Us
pageClass: blog
---

<section>
  {% for post in collections.posts %}
  <article>
    {{ post.templateContent }} {{ post.date | date: "%Y-%m-%d" }}
  </article>
  {% endfor %}
</section>
```

## Videos Component

In order to create the videos page we will leverage a subtemplate - a template that uses another template.

Create `videos.html` in `_includes/layouts`:

```md
---
layout: layouts/layout.html
---

<section>{% include "components/video.html" %}</section>
```

In `pages/videos.md` add `pageClass: videos` to the front matter.

```md
---
layout: layouts/videos.html
pageTitle: Videos
navTitle: Videos
pageClass: videos
date: 2019-01-01
---

[Home](/)
```

Go to the videos section of the website and examine the component's HTML using the dev tools.

Format the video and buttons:

```css
.content-video {
  iframe {
    background: #222;
    height: 320px;
    width: 100%;
  }
  .btn-list {
    padding: 6px;
    display: flex;
    list-style: none;
    li {
      margin: 1rem;
    }
    .active {
      border-radius: 4px;
      background: var(--link);
      color: #fff;
      padding: 0.5rem;
    }
  }
}
```

Change the iframe `height` to use `aspect-ratio`:

```css
/* height: 320px; */
aspect-ratio: 20 / 9;
```

Clicking the buttons should reveal a different video.

One method for doing this might look like:

```js
const iFrame = document.querySelector("iframe");
const videoLinks = document.querySelectorAll(".content-video a");

for (let i = 0; i < videoLinks.length; i++) {
  videoLinks[i].addEventListener("click", selectVideo);
}

function selectVideo(event) {
  removeActiveClass();
  this.classList.add("active");
  const videoToPlay = event.target.getAttribute("href");
  iFrame.setAttribute("src", videoToPlay);
  event.preventDefault();
}

function removeActiveClass() {
  for (let i = 0; i < videoLinks.length; i++) {
    videoLinks[i].classList.remove("active");
  }
}
```

But since a NodeList offers a `forEach` method we could elect to use that:

```js
const iFrame = document.querySelector("iframe");
const videoLinks = document.querySelectorAll(".content-video a");

// NEW
videoLinks.forEach((videoLink) =>
  videoLink.addEventListener("click", selectVideo)
);

function selectVideo(event) {
  removeActiveClass();
  this.classList.add("active");
  const videoToPlay = event.target.getAttribute("href");
  iFrame.setAttribute("src", videoToPlay);
  event.preventDefault();
}

// NEW
function removeActiveClass() {
  videoLinks.forEach((videoLink) => videoLink.classList.remove("active"));
}
```

Since we already have event delegation set up for click events we can add an if statement to handle clicks on our video buttons:

```js
function clickHandlers(event) {
  if (event.target.matches("#pull")) {
    document.querySelector("body").classList.toggle("show-nav");
    event.preventDefault();
  }
  if (event.target.matches(".content-video a")) {
    const iFrame = document.querySelector("iframe");
    const videoLinks = document.querySelectorAll(".content-video a");
    videoLinks.forEach((videoLink) => videoLink.classList.remove("active"));
    event.target.classList.add("active");
    const videoToPlay = event.target.getAttribute("href");
    iFrame.setAttribute("src", videoToPlay);
    event.preventDefault();
  }
}
```

Our clickHandlers function is becoming overly complex. Let's use it to call separate functions:

```js
function clickHandlers(event) {
  if (event.target.matches("#pull")) {
    showMenu();
    event.preventDefault();
  }
  if (event.target.matches(".content-video a")) {
    videoSwitch(event);
    event.preventDefault();
  }
}

function showMenu() {
  document.querySelector("body").classList.toggle("show-nav");
}

function videoSwitch(event) {
  const iFrame = document.querySelector("iframe");
  const videoLinks = document.querySelectorAll(".content-video a");
  videoLinks.forEach((videoLink) => videoLink.classList.remove("active"));
  event.target.classList.add("active");
  const videoToPlay = event.target.getAttribute("href");
  iFrame.setAttribute("src", videoToPlay);
}
```

## Image Carousel

Add a new layout file `images.html` to `_includes/layouts`:

```md
---
layout: layouts/layout.html
---

{% include "components/images.html" %}
```

In `pages/images.md`

```md
---
layout: layouts/images.html
pageTitle: Images
navTitle: Images
date: 2019-02-01
---

[Home](/)
```

Do a DOM review of `_includes/components/images.html`.

Format the images:

```css
.secondary aside {
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    align-content: space-around;
    li {
      flex-basis: 28%;
      margin: 2px;
      padding: 4px;
      background-color: #fff;
      border: 1px solid var(--dk-yellow);
      transition: all 0.2s linear;
      &:hover {
        transform: scale(1.1);
        box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
      }
    }
  }
}
```

Note the transition.

### Content Slider

Style the large image on the images page

<!-- // HERE -->

```css
figure {
  position: relative;
  margin: 0;
  figcaption {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    position: absolute;
    bottom: 20px;
  }
}
```

## Event Delegation

Let's see what we are clicking on when we click on a thumbnail.

```js
function clickHandlers(event) {
  event.preventDefault(); // NEW
  console.log(event.target); //NEW
  if (event.target.matches("#pull")) {
    showMenu();
    event.preventDefault();
  }
  if (event.target.matches(".content-video a")) {
    videoSwitch();
    event.preventDefault();
  }
}
```

We are getting the image node.

Block the default event on the click and call a new `runCarousel` function:

```js
function clickHandlers(event) {
  if (event.target.matches("#pull")) {
    showMenu(event);
    event.preventDefault();
  }
  if (event.target.matches(".content-video a")) {
    videoSwitch(event);
    event.preventDefault();
  }
  if (event.target.matches(".image-tn img")) {
    runCarousel(event);
    event.preventDefault();
  }
}
```

The function:

```js
function runCarousel(event) {
  const imageHref = event.target.parentNode.getAttribute("href");
  console.log(imageHref);
}
```

Our clicks now capture the href value of the linked thumbnails.

Capture the title text:

```js
function runCarousel(event) {
  const imageHref = event.target.parentNode.getAttribute("href");
  const titleText = event.target.title;
  console.log(titleText);
}
```

Finallly, use those two variables to set the large image and caption:

```js
function runCarousel(event) {
  const imageHref = event.target.parentNode.getAttribute("href");
  const titleText = event.target.title;
  document.querySelector("figure img").setAttribute("src", imageHref);
  // document.querySelector("figure img").src = imageHref;
  document.querySelector("figcaption").innerHTML = titleText;
}
```

## Forms

Create `src/_includes/components/contact.html` with the following HTML.

```html
<form name="contact" method="POST" action="/" autocomplete="true">
  <fieldset>
    <legend>Enter your info</legend>
    <label for="name">Your name</label>
    <input
      type="text"
      name="name"
      id="name"
      placeholder="Name"
      required
      autocomplete="off"
      autofocus
    />

    <label for="email">Email address</label>
    <input
      type="email"
      name="email"
      id="email"
      placeholder="Email"
      required
      autocomplete="off"
    />

    <label for="website">Website</label>
    <input
      type="url"
      name="website"
      required
      placeholder="http://www.example.com"
    />

    <label for="number">Number</label>
    <input
      type="number"
      name="number"
      min="0"
      max="10"
      step="2"
      required
      placeholder="An even num less than 10"
    />

    <label for="range">Range</label>
    <input type="range" name="range" min="0" max="10" step="2" />

    <label for="message">Your message</label>
    <textarea
      name="message"
      id="message"
      placeholder="Your message"
      rows="7"
    ></textarea>

    <button type="submit" name="submit">Send Message</button>
  </fieldset>
</form>
```

Create a layout `src/_includes/layouts/contact.html` (which in turn uses `layouts/layout.html`):

```md
---
layout: layouts/layout.html
---

{{ content }}

<article>{% include "components/contact.html" %}</article>
```

Edit the content `pages/contact.md` to use the new layout:

```md
---
layout: layouts/contact.html
pageTitle: Contact Us
navTitle: Contact
---

Not certain if we'll ever get back to you but its worth a try.
```

### Form CSS

Create and link a new sass partial called `_form.scss`:

```css
form {
  padding: 2em 0;
}

label {
  display: block;
}

input,
textarea {
  border: 1px solid $med-gray;
  border-radius: 5px;
}

input,
textarea {
  width: 90%;
  padding: 1em;
  margin-bottom: 1em;
}

button {
  padding: 6px;
  border: 1px solid var(--link);
  background-color: var(--link);
  color: #fff;
  cursor: pointer;
}
```

There are a number of useful pseudo selectors associated with forms that you should be aware of:

```css
input:focus,
textarea:focus {
  box-shadow: 0 0 15px lighten(var(--link), 40%);
}

input:required,
textarea:required {
  background-color: lighten(var(--link), 60%);
}

input:valid,
textarea:valid {
  background-color: lighten(green, 60%);
}

input:focus:invalid,
textarea:focus:invalid {
  background-color: lighten(red, 40%);
}
```

### Form Elements

The `<form>` tag:

- action - specifies where to send the user when a form is submitted
- method - specifies the HTTP method to use when sending form-data
- novalidate - turns validation off, typically used when you provide your own custom validation routines

`<fieldset>`:

- allows the form to be split into multiple sections (e.g. shipping, billing)
- not really needed here

`<label>`:

- identifies the field's purpose to the user
- the `for` attribute of the `<label>` tag should be the same as the id attribute of the related input to bind them together
- Clicking on a properly bound form selects its linked input

`<input>`:

- specifies an input field where the user can enter data.
- can accept autocomplete and autofocus
- is empty (`/>`) and consists of attributes only, no children

`<input>` attributes:

- `name` - Specifies the name of an `<input>` element used to reference form data after a form is submitted
- `type` - the [type](https://www.w3schools.com/tags/att_input_type.asp) attribute determines the nature of the input
- `required` - the data is required, works with native HTML5 validation
- `placeholder` - the text the user sees before typing

Additional input attributes we will be using:

- `pattern` - uses a [regular expression](https://www.w3schools.com/TAGS/att_input_pattern.asp) that the `<input>` element's value is checked against on form submission
- `title` - use with pattern to specify extra information about an element, not form specific, often shown as a tooltip text, here - describes the pattern to help the user

DELETE the website, number and range FIELDS LEAVING ONLY name, email and textarea.

Edit the name field:

```html
<label for="name">Name</label>
<input
  type="text"
  name="name"
  id="name"
  required
  autocomplete="name"
  title="Please enter your name"
/>
```

Note the tooltip and autocomplete action.

Add the email field:

```html
<label for="email">Email</label>
<input
  type="email"
  name="email"
  id="email"
  autocomplete="email"
  title="The domain portion of the email address is invalid (the portion after the @)."
  pattern="^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$"
  required
/>
```

Add a data attribute to allow Netlify to process the posting:

```html
<form action="/" data-netlify="true"></form>
```

Note: the form will not function correctly on localhost.

(In order to run the form locally we might try installing [Netlify Dev](https://www.netlify.com/products/dev/) but for today we'll deploy and test the deployed form.)

## Notes

Redering multiple pages from data.

products.json in \_data folder

```js
[
  {
    name: "Electric toasters ",
    price: 2.99,
    description: "something",
    shippingTimeInDays: 9,
  },
  {
    name: "goo",
    price: 9.99,
    description: "something else",
    shippingTimeInDays: 8,
  },
  {
    name: "zoo",
    price: 1.5,
    description: "something more",
    shippingTimeInDays: 10,
  },
];
```

```
<ul>
{% for product in products %}
	<li><a href="/product/{{product.name | slug}}">{{product.name}}</a></li>
{% endfor %}
</ul>
```

Using pagination

```html
---
layout: "layouts/layout.html"
tags: "products"
pagination:
  data: products
  size: 1
  alias: product
permalink: "/product/{{product.name | slug}}/"
eleventyComputed:
  title: "{{product.name}}"
---

<h2>{{ product.name }}</h2>

<p>{{product.description}}</p>

<p>
  It costs ${{product.price}} and ships in {{product.shippingTimeInDays}} days.
</p>
```

---

```js
document.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  // The Object.fromEntries() method transforms a list of key-value pairs into an object.
  // The FormData interface constructs a set of key/value pairs representing form fields and their values
  const body = Object.fromEntries(new FormData(event.target));
  // const body = JSON.stringify(Object.fromEntries(new FormData(event.target)));
  console.log(" form data ", body);
}
```

## NEW

CSS refresh:

`eleventyConfig.addPassthroughCopy("src/css");`

```js
"sass": "sass src/scss/styles.scss src/css/styles.css --watch --source-map --style=compressed",
```

Contact.html

```html
<form action="/" data-netlify="true" id="myform">
  <fieldset>
    <legend>Enter your info</legend>

    <label for="name">Name</label>
    <input
      type="text"
      name="name"
      id="name"
      value="Daniel"
      required
      autocomplete="name"
      title="Please enter your name"
    />

    <div style="margin: 1rem 0">
      <label for="selectMe">Select a Profession</label>
      <select name="selectme" id="selectMe">
        <option value="doctor">Doctor</option>
        <option value="lawyer">Lawyer</option>
        <option value="beggarman">Beggarman</option>
        <option value="thief">Thief</option>
      </select>
    </div>

    <div>
      <label for="vehicle1"> I have a bike</label>
      <input type="checkbox" id="vehicle1" name="vehicle1" value="Bike" />

      <label for="vehicle2"> I have a car</label>
      <input type="checkbox" id="vehicle2" name="vehicle2" value="Car" />
    </div>

    <div>
      <label for="vehiclePref1"> I prefer a bike</label>
      <input
        type="radio"
        id="vehiclePref1"
        name="vehiclePref"
        value="Bike"
        checked
      />
      <label for="vehiclePref2"> I prefer a car</label>
      <input type="radio" id="vehiclePref2" name="vehiclePref" value="Car" />
    </div>

    <div>
      <input list="browsers" name="browser" />
      <datalist id="browsers">
        <option value="Firefox"></option>
        <option value="Chrome"></option>
        <option value="Opera"></option>
        <option value="Safari"></option>
      </datalist>
    </div>

    <label for="email">Email</label>
    <input
      type="email"
      name="email"
      id="email"
      value="daniel@nyu.edu"
      autocomplete="email"
      title="The domain portion of the email address is invalid (the portion after the @)."
      pattern="^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$"
      required
    />

    <label for="message">Your message</label>
    <textarea
      name="message"
      id="message"
      placeholder="Your message"
      rows="7"
      required
    >
Just testing</textarea
    >

    <button type="submit" name="submit">Send Message</button>
    <button type="reset" name="reset">Reset</button>
  </fieldset>
</form>
```

`_form.scss`

```css
form {
  padding: 2em 0;
}

label {
  display: block;
}

input,
textarea {
  width: 90%;
  padding: 1em;
  margin-bottom: 1em;
  border: 1px solid $med-gray;
  border-radius: 5px;
}

input[type="checkbox"],
input[type="radio"] {
  display: inline;
  width: auto;
}

button {
  padding: 6px;
  border: 1px solid var(--link);
  background-color: var(--link);
  color: #fff;
  cursor: pointer;
}

input:focus,
textarea:focus {
  box-shadow: 0 0 15px lighten(var(--link), 40%);
}

input:required,
textarea:required {
  background-color: lighten(var(--link), 60%);
}

input:valid,
textarea:valid {
  background-color: lighten(green, 60%);
}

input:focus:invalid,
textarea:focus:invalid {
  background-color: lighten(red, 40%);
}
```

Scripts.js

```js
document.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  // The Object.fromEntries() method transforms a list of key-value pairs into an object.
  // The FormData interface constructs a set of key/value pairs representing form fields and their values
  const formData = Object.fromEntries(new FormData(event.target));
  console.log(" form data ", formData);
  fetch(`http://localhost:3456/api`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
}
```
