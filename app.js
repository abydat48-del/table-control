const TABLE_COUNT = 50;
const STORAGE_KEY = "table-control-demo-v1";
const statusNames = { free: "فاضية", reserved: "محجوزة", arrived: "وصل الزبون", seated: "جلسوا" };
let bookings = [];
let selectedTable = null;
let editingTable = null;

const $ = id => document.getElementById(id);
const load = () => { try { bookings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { bookings = []; } };
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
const getBooking = n => bookings.find(b => b.table === n);
const tableStatus = n => getBooking(n)?.status || "free";
const timeLabel = t => { if (!t) return ""; const [h,m]=t.split(":").map(Number); const suffix=h>=12?"PM":"AM"; return `${((h+11)%12)+1}:${String(m).padStart(2,"0")} ${suffix}`; };
const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function renderStats() {
  const counts = {free:0,reserved:0,arrived:0,seated:0};
  for(let n=1;n<=TABLE_COUNT;n++) counts[tableStatus(n)]++;
  $("totalCount").textContent = TABLE_COUNT;
  $("freeCount").textContent = counts.free;
  $("reservedCount").textContent = counts.reserved;
  $("arrivedCount").textContent = counts.arrived + counts.seated;
}
function renderFloor() {
  const filter = $("statusFilter").value;
  const grid = $("tableGrid"); grid.innerHTML = "";
  for(let n=1;n<=TABLE_COUNT;n++) {
    const b = getBooking(n), status = tableStatus(n);
    if(filter !== "all" && filter !== status) continue;
    const btn = document.createElement("button");
    btn.className = `table-tile ${status}`;
    btn.innerHTML = `<b>T${String(n).padStart(2,"0")}</b><small>${escapeHtml(statusNames[status])}</small>${b?`<small>${escapeHtml(b.name)}</small>`:""}`;
    btn.addEventListener("click",()=>openBooking(n));
    grid.appendChild(btn);
  }
}
function renderBookings() {
  const rows = $("bookingRows");
  const list = [...bookings].sort((a,b)=>a.time.localeCompare(b.time));
  rows.innerHTML = list.map(b => `<tr>
    <td><strong>T${String(b.table).padStart(2,"0")}</strong></td>
    <td>${escapeHtml(b.name)}${b.phone?`<br><small>${escapeHtml(b.phone)}</small>`:""}</td>
    <td>${escapeHtml(timeLabel(b.time))}</td><td>${b.people}</td>
    <td><span class="status-pill ${b.status}">${escapeHtml(statusNames[b.status])}</span></td>
    <td><div class="row-actions"><button class="small-btn" data-edit="${b.table}">تعديل</button><button class="small-btn" data-delete="${b.table}">إلغاء</button></div></td>
  </tr>`).join("");
  $("emptyBookings").classList.toggle("hidden", list.length > 0);
  rows.querySelectorAll("[data-edit]").forEach(btn=>btn.addEventListener("click",()=>openBooking(Number(btn.dataset.edit))));
  rows.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>deleteBooking(Number(btn.dataset.delete))));
}
function render(){renderStats();renderFloor();renderBookings();}
function fillTableSelect() {
  const sel=$("bookingTable");
  sel.innerHTML = Array.from({length:TABLE_COUNT},(_,i)=>`<option value="${i+1}">T${String(i+1).padStart(2,"0")}</option>`).join("");
}
function openBooking(n=null) {
  editingTable = n;
  const b = n ? getBooking(n) : null;
  $("dialogTitle").textContent = b ? `تعديل حجز T${String(n).padStart(2,"0")}` : "حجز طاولة جديدة";
  $("bookingTable").value = String(n || nextFreeTable());
  $("guestName").value = b?.name || "";
  $("arrivalTime").value = b?.time || "22:00";
  $("guestCount").value = b?.people || 4;
  $("guestPhone").value = b?.phone || "";
  $("bookingNotes").value = b?.notes || "";
  $("bookingStatus").value = b?.status || "reserved";
  $("bookingDialog").showModal();
}
function nextFreeTable(){for(let n=1;n<=TABLE_COUNT;n++)if(!getBooking(n))return n;return 1;}
function closeDialog(){$("bookingDialog").close();}
function deleteBooking(n){
  const b=getBooking(n); if(!b)return;
  if(confirm(`إلغاء حجز ${b.name} على الطاولة T${String(n).padStart(2,"0")}؟`)){
    bookings=bookings.filter(x=>x.table!==n);save();render();
  }
}
$("bookingForm").addEventListener("submit",e=>{
  e.preventDefault();
  const table=Number($("bookingTable").value);
  const old=getBooking(table);
  if(old && table!==editingTable){alert("هاي الطاولة عليها حجز بالفعل. اختار طاولة ثانية أو عدّل الحجز الموجود.");return;}
  const record={table,name:$("guestName").value.trim(),time:$("arrivalTime").value,people:Number($("guestCount").value),phone:$("guestPhone").value.trim(),notes:$("bookingNotes").value.trim(),status:$("bookingStatus").value,updatedAt:new Date().toISOString()};
  if(!record.name){alert("اكتب اسم الزبون.");return;}
  bookings=bookings.filter(b=>b.table!==editingTable && b.table!==table);
  bookings.push(record);save();closeDialog();render();
});
$("addBookingBtn").addEventListener("click",()=>openBooking());
$("closeDialog").addEventListener("click",closeDialog);
$("cancelDialog").addEventListener("click",closeDialog);
$("statusFilter").addEventListener("change",renderFloor);
document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===tab));
  $("floorView").classList.toggle("hidden",tab.dataset.view!=="floor");
  $("bookingsView").classList.toggle("hidden",tab.dataset.view!=="bookings");
}));
$("todayLabel").textContent = new Date().toLocaleDateString("ar-JO",{weekday:"short",day:"numeric",month:"short"});
load();fillTableSelect();render();
