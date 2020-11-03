const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const movies = [];
const MOVIES_PER_PAGE = 12;
let filteredMovies = [];
let mode = "card";
let currentPage = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const changeMode = document.querySelector("#change-mode");

//card mode的模板
function renderMovieList(data) {
  mode = "card";
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
   <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" 
              data-toggle="modal" data-target="#movie-modal" 
              data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${
                item.id
              }">+</button>
            </div>
          </div>
        </div>
    </div>    
  `;
  });
  dataPanel.innerHTML = rawHTML;
}

//list mode的模板
function renderMovieListListMode(data) {
  mode = "list";
  let rawHTML = `
  <table class="table">
   <tbody>
  `;
  data.forEach((item) => {
    rawHTML += `
   <tr>
    <td>
      <h5 class="card-title">${item.title}</h5>
    </td>
    <td>
       <button class="btn btn-primary btn-show-movie"
        data-toggle="modal" data-target="#movie-modal"
        data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
    </td>
   </tr>
  `;
  });
  rawHTML += `
   </tbody>
  </table>
  `;
  dataPanel.innerHTML = rawHTML;
}

//電影詳情
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerHTML = data.title;
    modalImage.innerHTML = `<img
      src="${POSTER_URL + data.image}"
      alt="movie-poster" class="img-fluid">`;
    modalDate.innerHTML = "Release date: " + data.release_date;
    modalDescription.innerHTML = data.description;
  });
}

//加入喜愛清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("這部電影已經在收藏清單裡了。");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//每頁抓12部電影
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//製作分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="javascript:;" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

//監聽: 點擊事件 More按鈕 / +按鈕
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
    return alert("成功加入收藏清單。");
  }
});

//監聽: 點擊事件 頁碼按鈕
paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;
  //更新畫面 分成cardmode/listmode
  //透過 dataset 取得'被點擊的頁數'
  currentPage = Number(event.target.dataset.page);
  if (mode === "card") {
    renderMovieList(getMoviesByPage(currentPage));
  } else if (mode === "list") {
    renderMovieListListMode(getMoviesByPage(currentPage));
  }
});

//監聽事件: 點擊事件 模式按鈕
changeMode.addEventListener("click", function switchMode(event) {
  if (event.target.matches("#card-button")) {
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(currentPage));
  } else if (event.target.matches("#list-button")) {
    renderPaginator(movies.length);
    renderMovieListListMode(getMoviesByPage(currentPage));
  }
});

//監聽: 表單事件 提交關鍵字
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();

  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  //重製分頁器
  renderPaginator(filteredMovies.length);
  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1));
});

//串接API 取得所有電影
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err));
