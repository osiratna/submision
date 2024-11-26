// Do your work here...
console.log('Hello, world!');

document.addEventListener('DOMContentLoaded', function () {
    bookListener();
    document.dispatchEvent(new Event(RENDER_EVENT)); 
});


//Array untuk menyimpan daftar buku 
let books = [];

//Fungsi generate ID 
function generateId() { 
    return +new Date(); 
}

//ID untuk event render 
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';


//Penambahan buku baru
function addBook() {
    const judulBuku = document.getElementById("bookFormTitle").value;
    const penulisBuku = document.getElementById("bookFormAuthor").value;
    const tahunBuku = Number(document.getElementById("bookFormYear").value);
    const isCompleted = document.getElementById("bookFormIsComplete").checked;

    const generatedID = generateId();
    const bookObject = generateBooksObject(
       generatedID,
       judulBuku,
       penulisBuku,
       tahunBuku,
       isCompleted
    );
    
    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    clearForm();
}

// Membuat objek buku 
function generateBooksObject(id, title, author, year, isComplete) { 
    return { 
        id, 
        title, 
        author, 
        year, 
        isComplete 
    }; 
}

function bookListener() {
    const book_form = document.getElementById('bookForm');

    book_form.addEventListener('submit', function (event) {
      event.preventDefault();

      const bookId = document.getElementById('bookId') ? document.getElementById('bookId').value : '';
      if (bookId) {
        saveEditedBooks(parseInt(bookId));
      } else {
        addBook();
      }

      document.getElementById('bookForm').reset();
      if(document.getElementById('bookId')) {
        document.getElementById('bookId').value = '';
      }
    });
}

function createBookElement(bookObject) {
    const titleBook = document.createElement("h3");
    titleBook.setAttribute("data-testid", "bookItemTitle");
    titleBook.innerText = bookObject.title;

    const authorBook = document.createElement("p");
    authorBook.setAttribute("data-testid", "bookItemAuthor");
    authorBook.innerText = "Penulis: " + bookObject.author;

    const yearBook = document.createElement("p");
    yearBook.setAttribute("data-testid", "bookItemYear");
    yearBook.innerText = "Tahun: " + bookObject.year;

    const container = document.createElement("div");
    container.setAttribute("data-bookid", bookObject.id);
    container.setAttribute("data-testid", "bookItem");
    container.classList.add("itemBook");
    container.append(titleBook, authorBook, yearBook);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("item", "shadow");
    buttonContainer.append(container);
    buttonContainer.setAttribute("id", `book-${bookObject.id}`);

    const buttonEdit = document.createElement("button");
    buttonEdit.setAttribute("data-testid", "bookItemEditButton");
    buttonEdit.classList.add("edit-Button");
    buttonEdit.innerText = "Edit Buku";
    buttonEdit.addEventListener("click", function() {
        editBooks(bookObject.id);
    });

    const buttonDelete = document.createElement("button");
    buttonDelete.setAttribute("data-testid", "bookItemDeleteButton");
    buttonDelete.classList.add("delete-Button");
    buttonDelete.innerText = "Hapus Buku";
    buttonDelete.addEventListener("click", function() {
        removeBooksFromCompleted(bookObject.id);
    });

    if (bookObject.isComplete) {
        const buttonUndo = document.createElement("button");
        buttonUndo.setAttribute("data-testid", "bookItemIsCompleteButton");
        buttonUndo.classList.add("undo-button");
        buttonUndo.innerText = "Belum Dibaca";
        buttonUndo.addEventListener("click", function() {
            undoBooksFromCompleted(bookObject.id);
        });

        buttonContainer.append(buttonUndo, buttonDelete, buttonEdit);
    } else {
        const buttonComplete = document.createElement("button");
        buttonComplete.setAttribute("data-testid", "bookItemIsCompleteButton");
        buttonComplete.classList.add("complete-Button");
        buttonComplete.innerText = "Sudah Dibaca";
        buttonComplete.addEventListener("click", function() {
            addBooksToCompleted(bookObject.id);
        });

        buttonContainer.append(buttonComplete, buttonDelete, buttonEdit);
    }
    return buttonContainer;
}

//Memindahkan buku ke rak selesai dibaca 
function addBooksToCompleted(idBook) { 
    const bookTarget = findBook(idBook); 
    if (bookTarget == null) return; 
    bookTarget.isComplete = true; 
    document.dispatchEvent(new Event(RENDER_EVENT)); 
    saveData();
}

//Mengembalikan buku ke belum dibaca
function undoBooksFromCompleted(idBook) {
    const bookTarget = findBook(idBook);

    if (bookTarget === null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//Menghapus buku
function removeBooksFromCompleted(idBook) {
    const bookTarget = findBookIndex(idBook);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//Mengedit buku dalam daftar
function editBooks(idBook) {
    const bookTarget = findBook(idBook);
    if (bookTarget == null) return;

    document.getElementById('bookFormTitle').value = bookTarget.title;
    document.getElementById('bookFormAuthor').value = bookTarget.author;
    document.getElementById('bookFormYear').value = bookTarget.year;
    document.getElementById('bookFormIsComplete').checked = bookTarget.isComplete;
    document.getElementById('bookId').value = bookTarget.id;
}

// Fungsi untuk menyimpan perubahan buku yang diedit
function saveEditedBooks(idBook) {
    const bookTarget = findBook(idBook);
    if (bookTarget == null) return;

    bookTarget.title = document.getElementById('bookFormTitle').value;
    bookTarget.author = document.getElementById('bookFormAuthor').value;
    bookTarget.year = Number(document.getElementById('bookFormYear').value);
    bookTarget.isComplete = document.getElementById('bookFormIsComplete').checked;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Mencari index buku berdasarkan ID
function findBookIndex(idBook) {
    return books.findIndex(book => book.id === idBook);
}

// Mencari buku berdasarkan ID
function findBook(idBook) {
    return books.find(book => book.id === idBook) || null;
}

//Memfilter isi searchbox
let searchQuery = "";  

// Simpan data ke local storage 
function saveData() { 
    if (isStorageExist()) { 
        const parsed = JSON.stringify(books); 
        localStorage.setItem(STORAGE_KEY, parsed); 
        document.dispatchEvent(new Event(SAVED_EVENT)); 
    } 
} 

// Memuat data dari local storage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData !== null) {
        const data = JSON.parse(serializedData);
        books = data;
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

//Eksekusi fungsi loadDataStorage
    if (isStorageExist()) {
        loadDataFromStorage();
    }

//Function untuk mencari id buku
function findBook(idBook) {
    for (const bookItemCari of books) {
        if (bookItemCari.id === idBook) {
            return bookItemCari;
        }
    }
    return null;
}

// Merender buku ke HTML
document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = createBookElement(bookItem);
        if (bookItem.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
});

//Cek ketersediaan storage 
function isStorageExist() { 
    if (typeof(Storage) === undefined) { 
        alert('Browser kamu tidak mendukung local storage'); 
        return false; 
    } 
    return true; 
}

function clearForm() {
    document.getElementById('bookForm').reset();
}

