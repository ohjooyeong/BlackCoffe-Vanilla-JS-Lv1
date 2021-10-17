// 회고
// - 상태값의 중요성
// - 스텝 1하고 스텝 2하는 데 상태값을 사용해서 사용자 관점에서
//   페이지 렌더링될 때 어떻게 렌더링 되는지 처음 제대로 보게 된 것 같음.
//   this는 기본적으로 객체 자신을 가리킴. 실행되는 호출 맥락에 따라 달라짐

// TODO localStorage Read & Write
// - [x] localStorage에 데이터를 저장한다
//  - [x] 메뉴를 추가할 때
//  - [x] 메뉴를 수정할 떄
//  - [x] 메뉴를 삭제할 떄
// - [x] localStorage에 있는 데이터를 읽어온다.

// TODO 카테고리별 메뉴판 관리
// - [x] 에스프레소 메뉴판 관리
// - [x] 프라푸치노 메뉴판 관리
// - [x] 블렌디드 메뉴판 관리
// - [x] 티바나 메뉴판 관리
// - [x] 디저트 메뉴판 관리

// TODO 페이지 접근시 최초 데이터 Read & Rendering
// - [x] 페이지에 최초로 로딩될 때 localStorage에 에스프레소 메뉴를 읽어온다.
// - [x] 에스프레소 메뉴를 페이지에 그려준다.

// TODO 품절 상태 관리
// - [x] 품절 상태인 경우를 보여줄 수 있게, 품절 버튼을 추가하고 sold-out class를 추가하여 상태를 변경한다.
// - [x] 품절 버튼을 추가한다.
// - [x] 품절 버튼을 클릭하면 localStorage에 상태값이 저장된다.
// - [x] 클릭 이벤트에서 가장 가까운 li 태그의 class속성 값에 sold-out을 추가한다.

import { $ } from "./utils/dom.js";
import store from "./store/index.js";

function App() {
  // 상태는 변하는 데이터, 이 앱에서 변하는 것이 무엇인가? - 메뉴명
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };

  this.currentCategory = "espresso";

  this.init = () => {
    if (store.getLocalStorage()) {
      this.menu = store.getLocalStorage();
    }
    render();
    initEventListeners();
  };

  const render = () => {
    const template = this.menu[this.currentCategory]
      .map((item, index) => {
        return `
      <li data-menu-id="${index}" class="menu-list-item d-flex items-center py-2">
        <span class="w-100 pl-2 menu-name ${item.soldOut ? "sold-out" : ""}">${
          item.name
        }</span>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
        >
          품절
        </button>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
        >
          수정
        </button>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
        >
          삭제
        </button>
      </li>`;
      })
      .join("");

    // innerHTML 은 기존 값을 덮어쓴다.
    $("#menu-list").innerHTML = template;
    updateMenuCount();
  };

  const updateMenuCount = () => {
    const menuCount = this.menu[this.currentCategory].length;

    $(".menu-count").innerText = `총 ${menuCount} 개`;
  };

  const addMenuName = () => {
    if ($("#menu-name").value === "") {
      alert("값을 입력해주세요.");
      return;
    }

    const MenuName = $("#menu-name").value;
    this.menu[this.currentCategory].push({ name: MenuName });
    store.setLocalStorage(this.menu);
    render();
    $("#menu-name").value = "";
  };

  const updateMenuName = (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    const $menuName = e.target.closest("li").querySelector(".menu-name");
    const updatedMenuName = prompt("메뉴명을 수정하세요", $menuName.innerText);
    if (updatedMenuName) {
      this.menu[this.currentCategory][menuId].name = updatedMenuName;
      store.setLocalStorage(this.menu);
      render();
    } else {
      return;
    }
  };

  const removeMenuName = (e) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      const menuId = e.target.closest("li").dataset.menuId;
      this.menu[this.currentCategory].splice(menuId, 1);
      store.setLocalStorage(this.menu);
      render();
    }
  };

  const soldOutMenu = (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    this.menu[this.currentCategory][menuId].soldOut =
      !this.menu[this.currentCategory][menuId].soldOut;
    store.setLocalStorage(this.menu);
    render();
  };

  const initEventListeners = () => {
    $("#menu-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-edit-button")) {
        updateMenuName(e);
        return;
      }

      if (e.target.classList.contains("menu-remove-button")) {
        removeMenuName(e);
        return;
      }

      if (e.target.classList.contains("menu-sold-out-button")) {
        soldOutMenu(e);
        return;
      }
    });

    // form 태그가 자동으로 전송되는 걸 막아준다.
    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
    });

    $("#menu-submit-button").addEventListener("click", addMenuName);

    // 메뉴의 이름을 입력받는건
    $("#menu-name").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") {
        return;
      }
      addMenuName();
    });

    $("nav").addEventListener("click", (e) => {
      const isCategoryButton =
        e.target.classList.contains("cafe-category-name");
      if (isCategoryButton) {
        const categoryName = e.target.dataset.categoryName;
        this.currentCategory = categoryName;
        $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
        render();
      }
    });
  };

  // 이벤트 위임 최상위 노드를 이벤트를 지정해서 하위 노드의 이벤트들을 각각 접근할 수 있다.
}

const app = new App();
app.init();
