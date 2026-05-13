// ─── MOCK MODE ───────────────────────────────────────────────────────────────
// Replace this entire file with your original api.js when the backend is ready.

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
let BOOKS = [
  { fld_book_id:1,  fld_title:'Noli Me Tangere',         fld_author:'Jose Rizal',         fld_isbn:'978-9710800010', fld_category:'Fiction',     fld_publisher:'Anvil Publishing', fld_year_pub:1887, fld_total_copies:5, fld_available_copies:3, fld_description:'A novel about Philippine society under Spanish rule.' },
  { fld_book_id:2,  fld_title:'El Filibusterismo',        fld_author:'Jose Rizal',         fld_isbn:'978-9710800027', fld_category:'Fiction',     fld_publisher:'Anvil Publishing', fld_year_pub:1891, fld_total_copies:4, fld_available_copies:0, fld_description:'The sequel to Noli Me Tangere.' },
  { fld_book_id:3,  fld_title:'Florante at Laura',        fld_author:'Francisco Balagtas', fld_isbn:'978-9710800034', fld_category:'Fiction',     fld_publisher:'Rex Bookstore',    fld_year_pub:1838, fld_total_copies:6, fld_available_copies:4, fld_description:'A classic awit in Filipino literature.' },
  { fld_book_id:4,  fld_title:'Ibong Adarna',             fld_author:'Jose de la Cruz',    fld_isbn:'978-9710800041', fld_category:'Fiction',     fld_publisher:'Rex Bookstore',    fld_year_pub:1800, fld_total_copies:3, fld_available_copies:2, fld_description:'A famous corrido about a magical bird.' },
  { fld_book_id:5,  fld_title:'A Brief History of Time',  fld_author:'Stephen Hawking',    fld_isbn:'978-0553380163', fld_category:'Science',     fld_publisher:'Bantam Books',     fld_year_pub:1988, fld_total_copies:3, fld_available_copies:1, fld_description:'A landmark book on cosmology.' },
  { fld_book_id:6,  fld_title:'Sapiens',                  fld_author:'Yuval Noah Harari',  fld_isbn:'978-0062316097', fld_category:'History',     fld_publisher:'Harper Collins',   fld_year_pub:2011, fld_total_copies:4, fld_available_copies:2, fld_description:'A brief history of humankind.' },
  { fld_book_id:7,  fld_title:'Atomic Habits',            fld_author:'James Clear',        fld_isbn:'978-0735211292', fld_category:'Self-Help',   fld_publisher:'Avery',            fld_year_pub:2018, fld_total_copies:5, fld_available_copies:3, fld_description:'How tiny changes lead to remarkable results.' },
  { fld_book_id:8,  fld_title:'Rich Dad Poor Dad',        fld_author:'Robert Kiyosaki',    fld_isbn:'978-1612680194', fld_category:'Finance',     fld_publisher:'Plata Publishing', fld_year_pub:1997, fld_total_copies:4, fld_available_copies:0, fld_description:'What the rich teach their kids about money.' },
  { fld_book_id:9,  fld_title:'The Pragmatic Programmer', fld_author:'David Thomas',       fld_isbn:'978-0135957059', fld_category:'Technology',  fld_publisher:'Addison-Wesley',   fld_year_pub:1999, fld_total_copies:3, fld_available_copies:2, fld_description:'A guide to software craftsmanship.' },
  { fld_book_id:10, fld_title:'Clean Code',               fld_author:'Robert C. Martin',   fld_isbn:'978-0132350884', fld_category:'Technology',  fld_publisher:'Prentice Hall',    fld_year_pub:2008, fld_total_copies:3, fld_available_copies:1, fld_description:'A handbook of agile software craftsmanship.' },
  { fld_book_id:11, fld_title:'The Alchemist',            fld_author:'Paulo Coelho',       fld_isbn:'978-0062315007', fld_category:'Fiction',     fld_publisher:'HarperOne',        fld_year_pub:1988, fld_total_copies:6, fld_available_copies:4, fld_description:'A story about following your dreams.' },
  { fld_book_id:12, fld_title:'Thinking, Fast and Slow',  fld_author:'Daniel Kahneman',    fld_isbn:'978-0374533557', fld_category:'Non-Fiction', fld_publisher:'Farrar Straus',    fld_year_pub:2011, fld_total_copies:2, fld_available_copies:1, fld_description:'How we think: two systems.' },
];

let MEMBERS = [
  { fld_user_id:1, fld_fname:'Allyson',  fld_lname:'Soritcho',    fld_username:'ally',   fld_email:'allysonsoritcho@gmail.com',  fld_role:'admin',  fld_status:'active',   fld_date_created:'2026-01-15T00:00:00' },
  
];

let LOANS = [
  { fld_loan_id:1, fld_book_id:2,  fld_title:'El Filibusterismo',        fld_author:'Jose Rizal',       fld_fname:'Juan',   fld_lname:'Dela Cruz', fld_loan_date:'2026-04-01', fld_due_date:'2026-04-15', fld_return_date:null,         user_id:2 },
  { fld_loan_id:2, fld_book_id:8,  fld_title:'Rich Dad Poor Dad',        fld_author:'Robert Kiyosaki',  fld_fname:'Ana',    fld_lname:'Reyes',     fld_loan_date:'2026-04-05', fld_due_date:'2026-04-19', fld_return_date:null,         user_id:3 },
  { fld_loan_id:3, fld_book_id:5,  fld_title:'A Brief History of Time',  fld_author:'Stephen Hawking',  fld_fname:'Rosa',   fld_lname:'Garcia',    fld_loan_date:'2026-03-20', fld_due_date:'2026-04-03', fld_return_date:null,         user_id:5 },
  { fld_loan_id:4, fld_book_id:1,  fld_title:'Noli Me Tangere',          fld_author:'Jose Rizal',       fld_fname:'Miguel', fld_lname:'Torres',    fld_loan_date:'2026-04-10', fld_due_date:'2026-04-24', fld_return_date:'2026-04-20', user_id:6 },
  { fld_loan_id:5, fld_book_id:7,  fld_title:'Atomic Habits',            fld_author:'James Clear',      fld_fname:'Juan',   fld_lname:'Dela Cruz', fld_loan_date:'2026-03-15', fld_due_date:'2026-03-29', fld_return_date:'2026-03-28', user_id:2 },
  { fld_loan_id:6, fld_book_id:10, fld_title:'Clean Code',               fld_author:'Robert C. Martin', fld_fname:'Carlo',  fld_lname:'Bautista',  fld_loan_date:'2026-03-01', fld_due_date:'2026-03-15', fld_return_date:null,         user_id:4 },
];

let nextBookId = 13;
let nextLoanId = 7;

// ─── MOCK API ─────────────────────────────────────────────────────────────────
export const api = {
  // Auth
  login: async (email, password) => {
    await delay();
    const user = MEMBERS.find((m) => m.fld_email === email);
    if (!user || password !== 'password') throw new Error('Invalid email or password.');
    return { data: { session_id: 'mock-session-123', user: { user_id: user.fld_user_id, fname: user.fld_fname, lname: user.fld_lname, email: user.fld_email, role: user.fld_role, username: user.fld_username, status: user.fld_status } } };
  },
  register: async (payload) => {
    await delay();
    const exists = MEMBERS.find((m) => m.fld_email === payload.email || m.fld_username === payload.username);
    if (exists) throw new Error('Email or username already taken.');
    MEMBERS.push({ fld_user_id: MEMBERS.length + 10, fld_fname: payload.fname, fld_lname: payload.lname, fld_username: payload.username, fld_email: payload.email, fld_role: 'member', fld_status: 'active', fld_date_created: new Date().toISOString() });
    return { message: 'Registered successfully.' };
  },
  logout: async () => { await delay(); return { message: 'Logged out.' }; },

  // Books
  getBooks: async (search, category) => {
    await delay();
    let result = [...BOOKS];
    if (search) result = result.filter((b) => b.fld_title.toLowerCase().includes(search.toLowerCase()) || b.fld_author.toLowerCase().includes(search.toLowerCase()) || (b.fld_isbn || '').includes(search));
    if (category) result = result.filter((b) => b.fld_category === category);
    return { data: result, count: result.length };
  },
  getBook: async (id) => {
    await delay();
    const book = BOOKS.find((b) => b.fld_book_id === Number(id));
    if (!book) throw new Error('Book not found.');
    return { data: book };
  },
  addBook: async (book) => {
    await delay();
    const newBook = { ...book, fld_book_id: nextBookId++, fld_available_copies: parseInt(book.total_copies) || 1 };
    BOOKS.push(newBook);
    return { data: newBook };
  },
  updateBook: async (id, book) => {
    await delay();
    BOOKS = BOOKS.map((b) => b.fld_book_id === Number(id) ? { ...b, ...book } : b);
    return { message: 'Updated.' };
  },
  deleteBook: async (id) => {
    await delay();
    BOOKS = BOOKS.filter((b) => b.fld_book_id !== Number(id));
    return { message: 'Deleted.' };
  },

  // Users
  getProfile: async () => {
    await delay();
    const saved = localStorage.getItem('user');
    const u = saved ? JSON.parse(saved) : {};
    const member = MEMBERS.find((m) => m.fld_user_id === u.user_id) || MEMBERS[0];
    return { data: { user_id: member.fld_user_id, fname: member.fld_fname, lname: member.fld_lname, email: member.fld_email, role: member.fld_role, username: member.fld_username, status: member.fld_status, phone: '09171234567', address: '123 Rizal St., Olongapo City', date_created: member.fld_date_created } };
  },
  updateProfile: async () => { await delay(); return { message: 'Profile updated.' }; },
  changePassword: async (current) => {
    await delay();
    if (current !== 'password') throw new Error('Current password is incorrect.');
    return { message: 'Password changed.' };
  },

  // Loans
  createLoan: async (userId, bookId, loanDate, dueDate) => {
    await delay();
    const book = BOOKS.find((b) => b.fld_book_id === Number(bookId));
    const member = MEMBERS.find((m) => m.fld_user_id === Number(userId));
    if (!book) throw new Error('Book not found.');
    if (!member) throw new Error('Member not found.');
    if (book.fld_available_copies <= 0) throw new Error('No copies available.');
    book.fld_available_copies -= 1;
    const newLoan = { fld_loan_id: nextLoanId++, fld_book_id: book.fld_book_id, fld_title: book.fld_title, fld_author: book.fld_author, fld_fname: member.fld_fname, fld_lname: member.fld_lname, fld_loan_date: loanDate, fld_due_date: dueDate, fld_return_date: null, user_id: member.fld_user_id };
    LOANS.push(newLoan);
    return { data: newLoan };
  },
  getLoan: async (id) => { await delay(); return { data: LOANS.find((l) => l.fld_loan_id === Number(id)) }; },
  getUserLoans: async (userId) => { await delay(); return { data: LOANS.filter((l) => l.user_id === Number(userId)) }; },
  returnLoan: async (id) => {
    await delay();
    const loan = LOANS.find((l) => l.fld_loan_id === Number(id));
    if (!loan) throw new Error('Loan not found.');
    loan.fld_return_date = new Date().toISOString().split('T')[0];
    const book = BOOKS.find((b) => b.fld_book_id === loan.fld_book_id);
    if (book) book.fld_available_copies += 1;
    return { message: 'Returned.' };
  },

  // Admin
  adminBooks: async () => { await delay(); return { data: BOOKS }; },
  adminMembers: async () => { await delay(); return { data: MEMBERS }; },
  adminLoans: async () => { await delay(); return { data: LOANS }; },
  toggleMemberStatus: async (userId) => {
    await delay();
    const member = MEMBERS.find((m) => m.fld_user_id === Number(userId));
    if (!member) throw new Error('Member not found.');
    member.fld_status = member.fld_status === 'active' ? 'inactive' : 'active';
    return { message: 'Status updated.' };
  },

  // Reports
  stats: async () => {
    await delay();
    const activeLoans  = LOANS.filter((l) => !l.fld_return_date).length;
    const overdueLoans = LOANS.filter((l) => !l.fld_return_date && new Date(l.fld_due_date) < new Date()).length;
    const categoryCounts = BOOKS.reduce((acc, b) => { acc[b.fld_category] = (acc[b.fld_category] || 0) + 1; return acc; }, {});
    return { data: { total_borrowed: LOANS.length, active_loans: activeLoans, overdue_loans: overdueLoans, total_members: MEMBERS.length, categories: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })), monthly: [ { month:'Nov', borrowed:4, returned:3 }, { month:'Dec', borrowed:6, returned:5 }, { month:'Jan', borrowed:8, returned:7 }, { month:'Feb', borrowed:5, returned:4 }, { month:'Mar', borrowed:9, returned:8 }, { month:'Apr', borrowed:6, returned:3 } ] } };
  },
  recentLoans: async () => { await delay(); return { data: [...LOANS].sort((a, b) => new Date(b.fld_loan_date) - new Date(a.fld_loan_date)).slice(0, 5) }; },
  allLoans: async () => { await delay(); return { data: LOANS }; },
  borrowedBooks: async () => { await delay(); return { data: LOANS.filter((l) => !l.fld_return_date) }; },
  overdueBooks: async () => { await delay(); return { data: LOANS.filter((l) => !l.fld_return_date && new Date(l.fld_due_date) < new Date()) }; },
};