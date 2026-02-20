// Biến chung
// 1. lấy dữ liệu từ sản phẩm localStorage
let products = JSON.parse(localStorage.getItem("products")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = localStorage.getItem("currentUser");

// 2.Biến lưu vị trí sản phẩm đang sửa

let editIndex = -1;

// 3.lấy các ô input + nút

// getElementById("id") sẽ tìm phần tử HTML có id trùng với giá trị truyền vào
let nameInput = document.getElementById("name");
let priceInput = document.getElementById("price");
let quantityInput = document.getElementById("quantity");
let btnAdd = document.getElementById("btnAdd");
let btnUpdate = document.getElementById("btnUpdate");

// Hàm lưu dữ liệu vào localStorage
/*JSON.stringify(products)
products là một mảng hoặc đối tượng JavaScript (ví dụ mảng các sản phẩm {name, price, quantity}).
localStorage chỉ lưu được chuỗi (string).
JSON.stringify(products) chuyển mảng JS → chuỗi JSON để lưu. */
// Hàm save() sẽ chuyển mảng products thành chuỗi JSON và lưu vào localStorage, để dữ liệu vẫn tồn tại khi bạn tải lại trang hoặc tắt trình duyệt.

function save() {
  localStorage.setItem("products", JSON.stringify(products));
}

// Hàm hiển thị bảng sản phẩm
function render(arr = products) {
  // list là id của <tbody> trong bảng HTML.
  // innerHTML là thuộc tính chứa HTML bên trong thẻ, mình sẽ gán vào để tạo các hàng <tr>.
  document.getElementById("list").innerHTML = arr

    /*Duyệt từng phần tử trong mảng arr.
  p = sản phẩm hiện tại.
  i = chỉ số của sản phẩm trong mảng (bắt đầu từ 0).
  Trả về chuỗi HTML cho mỗi sản phẩm. */
    .map(
      (p, i) =>
        `<tr>
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.price}</td>
      <td>${p.quantity}</td>
      <td>
          <button onclick="sell(${p.index ?? i})">販売</button>
          <button onclick="editProduct(${p.index ?? i})">編集</button>
          <button onclick="removeProduct(${p.index ?? i})">削除</button>

        </td>
      </tr>
      `,
    )
    /*.map() trả về mảng các chuỗi HTML.
      .join("") ghép tất cả thành một chuỗi HTML liền nhau, 
      để gán vào innerHTML. */
    .join("");
  updateDashboard();
}

// Thêm sản phẩm mới

/*nameInput.value → lấy giá trị từ ô nhập tên sản phẩm.
.trim() → loại bỏ khoảng trắng đầu và cuối.
+priceInput.value → chuyển chuỗi giá thành số.
+quantityInput.value → chuyển chuỗi số lượng thành số. */

function addProduct() {
  let name = nameInput.value.trim();
  let price = +priceInput.value;
  let quantity = +quantityInput.value;

  if (!name || price <= 0 || quantity <= 0) {
    return alert("必要事項を入力してください！");
  }
  // kiểm tra trùng tên (không phân biệt hoa thường)
  // some() → hàm kiểm tra, trả về true nếu ít nhất 1 phần tử thỏa
  let exists = products.some(
    (p) => p.name.toLowerCase() === name.toLowerCase(),
  );
  if (exists) {
    return alert("この名前の製品は既に存在します！");
  }

  /*products là mảng sản phẩm hiện tại.
    push() → thêm 1 đối tượng sản phẩm mới vào mảng. */
  products.push({ name, price, quantity });
  save(); //lưu
  render(); //hiển thị
  clearForm(); // xóa

  /*Mục đích: chuẩn bị cho lần nhập tiếp theo, 
  tránh dữ liệu cũ vẫn còn trong form.*/
}

function clearForm() {
  nameInput.value = "";
  priceInput.value = "";
  quantityInput.value = "";
}
// Hàm editProduct(i)

function editProduct(i) {
  /*let p = products[i]
    Lấy sản phẩm thứ i trong mảng products. */
  let p = products[i];

  // Gán giá trị sản phẩm vào form input:
  nameInput.value = p.name;
  priceInput.value = p.price;
  quantityInput.value = p.quantity;

  // Lưu chỉ số sản phẩm đang chỉnh sửa vào biến toàn cục
  editIndex = i;

  // Ẩn nút "Thêm" và hiện nút "Cập nhật":

  btnAdd.style.display = "none";
  btnUpdate.style.display = "inline-block";
}

function updateProduct() {
  if (editIndex < 0) return;
  // Cập nhật sản phẩm trong mảng:
  products[editIndex] = {
    //Lấy giá trị mới từ form và ghi vào vị trí editIndex trong mảng.
    name: nameInput.value,
    price: +priceInput.value,
    quantity: +quantityInput.value,
  };
  // Reset editIndex:
  editIndex = -1;
  btnAdd.style.display = "inline-block";
  btnUpdate.style.display = "none";

  save();
  render();
  clearForm();
}

function removeProduct(i) {
  // Hiển thị hộp thoại xác nhận cho người dùng.
  if (confirm("本当に削除しますか？")) {
    // splice(index, count) là hàm xóa phần tử trong mảng.
    products.splice(i, 1);
    save();
    render();
  }
}

// hàm bán sản phẩm

function sell(i) {
  // hiện hộp thoại yêu cầu người dùng nhập dữ liệu.
  // + → chuyển giá trị nhập từ chuỗi → số.
  let num = +prompt("販売数量を入力してください：");
  if (!num || num <= 0) return;
  if (num > products[i].quantity) return alert("在庫が足りません！");
  // Trừ đi số lượng bán khỏi products[i].quantity.
  products[i].quantity -= num;

  save();
  render();
}

// hàm tìm kiếm

function searchProduct() {
  // Lấy từ khóa tìm kiếm
  let key = document.getElementById("search").value.toLowerCase();
  if (!key) return render();

  // products.filter(...) → duyệt mảng products, chỉ lấy những sản phẩm thỏa điều kiện.
  let result = products
    //...p = spread operator, copy tất cả thuộc tính của sản phẩm p sang một object mới
    .map((p, i) => ({ ...p, index: i })) // thêm chỉ số gốc
    .filter(
      (p) =>
        //tên sản phẩm có chứa key (không phân biệt hoa/thường).
        p.name.toLowerCase().includes(key) ||
        // giá chuyển thành chuỗi, kiểm tra có chứa key không.
        p.price.toString().includes(key) ||
        // số lượng chuyển thành chuỗi, kiểm tra có chứa key không.
        p.quantity.toString().includes(key),
    );
  // hiển thị
  render(result);
}

/*
Biến	Ý nghĩa
totalProducts	Tổng số loại sản phẩm
totalQuantity	Tổng số lượng tồn
totalValue	Tổng tiền của kho
lowStock	Mảng chứa sản phẩm sắp hết
*/
function updateDashboard() {
  let totalProducts = products.length;
  let totalQuantity = 0;
  let totalValue = 0;
  let lowStock = [];

  // forEach() → duyệt từng phần tử trong mảng products
  products.forEach((p) => {
    totalQuantity += p.quantity;
    totalValue += p.price * p.quantity;

    if (p.quantity <= 5) {
      lowStock.push(`${p.name} (${p.quantity})`);
    }
  });

  /*id	Hiển thị
totalProducts	Tổng sản phẩm
totalQuantity	Tổng tồn
totalValue	Tổng tiền
lowStockAlert	Cảnh báo */
  let el1 = document.getElementById("totalProducts");
  let el2 = document.getElementById("totalQuantity");
  let el3 = document.getElementById("totalValue");
  let alertBox = document.getElementById("lowStockAlert");

  // innerText là thuộc tính trong JavaScript dùng để lấy hoặc thay đổi nội dung chữ
  // (text) hiển thị bên trong một phần tử HTML.
  if (el1) el1.innerText = totalProducts;
  if (el2) el2.innerText = totalQuantity;
  if (el3) el3.innerText = totalValue.toLocaleString() + " ¥";

  if (alertBox) {
    if (lowStock.length) {
      alertBox.innerHTML = "⚠ <b>在庫僅少:</b> " + lowStock.join(", ");
      alertBox.style.display = "block";
    } else {
      alertBox.style.display = "none";
    }
  }
}

// render bảng khi load trang
render();
updateDashboard();
// kiến thức
/*1️⃣ map()
Mục đích:
Dùng khi bạn muốn tạo một mảng mới dựa trên mảng cũ, nhưng giữ số lượng phần tử bằng mảng gốc.
Nó biến đổi mỗi phần tử theo cách bạn muốn. */

/*2️⃣ filter()
Mục đích:
Dùng khi bạn muốn lọc các phần tử thỏa mãn điều kiện nào đó, tạo ra một mảng mới nhưng có thể ít hơn số phần tử ban đầu.
Nó không thay đổi giá trị, chỉ chọn ra phần tử đúng điều kiện. */
