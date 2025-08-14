// ===============================
// CONFIGURATION
// ===============================
const SHEETDB_URL = 'https://sheetdb.io/api/v1/ji8u767etbjge';
const CODES_SHEET_URL = "https://sheetdb.io/api/v1/YOUR_CODES_SHEET_ID"; // Replace with your codes sheet ID

// ===============================
// LOCAL STORAGE FOR CODES
// ===============================
function loadCodes() {
  try {
    return JSON.parse(localStorage.getItem('secureCodes') || '{}');
  } catch (e) {
    return {};
  }
}
function saveCodes(obj) {
  localStorage.setItem('secureCodes', JSON.stringify(obj));
}

// ===============================
// GLOBAL VARIABLES
// ===============================
let members = [];
const wardSel = document.getElementById('filterWard');
const unitSel = document.getElementById('filterUnit');
const searchEl = document.getElementById('searchName');
const tbody = document.querySelector('#membersTable tbody');

// ===============================
// FETCH REGISTRATION DATA
// ===============================
async function fetchData() {
  try {
    const res = await fetch(SHEETDB_URL);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    members = data.map(item => ({
      FullName: item.FullName || item.fullname || '',
      phoneNumber: item.phoneNumber || item.phone || '',
      address: item.address || '',
      ward: item.ward || '',
      pollingUnit: item.pollingUnit || item.unit || '',
      vin: item.vin || ''
    }));
    populateFilters();
    renderTable();
  } catch (err) {
    console.error(err);
    alert('Could not load registrations.');
  }
}

// ===============================
// POPULATE FILTERS
// ===============================
function populateFilters() {
  const wards = Array.from(new Set(members.map(m => m.ward).filter(Boolean))).sort();
  const units = Array.from(new Set(members.map(m => m.pollingUnit).filter(Boolean))).sort();
  wardSel.innerHTML = '<option value="">-- Filter by Ward --</option>' + wards.map(w => `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`).join('');
  unitSel.innerHTML = '<option value="">-- Filter by Polling Unit --</option>' + units.map(u => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join('');
}

// ===============================
// ESCAPE HTML
// ===============================
function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===============================
// RENDER TABLE
// ===============================
function renderTable() {
  const codes = loadCodes();
  const wardFilter = wardSel.value;
  const unitFilter = unitSel.value;
  const q = searchEl.value.trim().toLowerCase();
  const filtered = members.filter(m => {
    if (wardFilter && m.ward !== wardFilter) return false;
    if (unitFilter && m.pollingUnit !== unitFilter) return false;
    if (q && !m.FullName.toLowerCase().includes(q) && !m.phoneNumber.includes(q)) return false;
    return true;
  });
  tbody.innerHTML = filtered.map(m => {
    const keyGen = `${m.ward}::general`;
    const keyInd = `${m.ward}::${m.FullName}`;
    const code = codes[keyInd] || codes[keyGen] || '';
    return `<tr>
      <td>${escapeHtml(m.FullName)}</td>
      <td>${escapeHtml(m.phoneNumber)}</td>
      <td>${escapeHtml(m.address)}</td>
      <td>${escapeHtml(m.ward)}</td>
      <td>${escapeHtml(m.pollingUnit)}</td>
      <td>${escapeHtml(m.vin)}</td>
      <td>${escapeHtml(code)}</td>
      <td><button class="assignBtn" data-name="${encodeURIComponent(m.FullName)}" data-ward="${encodeURIComponent(m.ward)}">Assign Code</button></td>
    </tr>`;
  }).join('');

  document.querySelectorAll('.assignBtn').forEach(btn => btn.addEventListener('click', onAssignClick));
}

// ===============================
// ASSIGN INDIVIDUAL CODE
// ===============================
function onAssignClick(e) {
  const btn = e.currentTarget;
  const name = decodeURIComponent(btn.dataset.name);
  const ward = decodeURIComponent(btn.dataset.ward);
  const codes = loadCodes();
  const current = codes[`${ward}::${name}`] || codes[`${ward}::general`] || '';
  const input = prompt(`Set secure code for ${name} (Ward: ${ward}). Leave empty to clear. Current: ${current}`, current);
  if (input === null) return;
  const key = `${ward}::${name}`;
  if (input.trim() === '') { delete codes[key]; }
  else codes[key] = input.trim();
  saveCodes(codes);
  renderTable();
}

// ===============================
// ASSIGN GENERAL CODE TO WARD — SHEETDB
// ===============================
document.getElementById("assignGeneralBtn").addEventListener("click", () => {
  const ward = document.getElementById("assignWard")?.value.trim() || wardSel.value.trim();
  const code = document.getElementById("assignGeneralCode").value.trim();

  if (!ward || !code) {
    alert("Please enter/select both Ward and Code.");
    return;
  }

  // Check if ward exists in SheetDB
  fetch(`${CODES_SHEET_URL}/search?ward=${encodeURIComponent(ward)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        // Ward exists → Update
        fetch(`${CODES_SHEET_URL}/ward/${encodeURIComponent(ward)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code })
        })
          .then(() => alert(`Code updated for ${ward}`))
          .catch(err => console.error(err));
      } else {
        // Ward doesn't exist → Create new
        fetch(CODES_SHEET_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([{ ward: ward, code: code }])
        })
          .then(() => alert(`Code assigned to ${ward}`))
          .catch(err => console.error(err));
      }
    });

  // Also store locally
  const codes = loadCodes();
  codes[`${ward}::general`] = code;
  saveCodes(codes);
  document.getElementById('assignGeneralCode').value = '';
  renderTable();
});

// ===============================
// FILTER EVENTS
// ===============================
wardSel.addEventListener('change', renderTable);
unitSel.addEventListener('change', renderTable);
searchEl.addEventListener('input', debounce(renderTable, 250));
document.getElementById('refreshBtn').addEventListener('click', fetchData);

// ===============================
// PREVIEW PDF
// ===============================
document.getElementById('previewPdfBtn').addEventListener('click', () => {
  const codes = loadCodes();
  const wardFilter = wardSel.value;
  const unitFilter = unitSel.value;
  const q = searchEl.value.trim().toLowerCase();
  const rows = members.filter(m => {
    if (wardFilter && m.ward !== wardFilter) return false;
    if (unitFilter && m.pollingUnit !== unitFilter) return false;
    if (q && !m.FullName.toLowerCase().includes(q) && !m.phoneNumber.includes(q)) return false;
    return true;
  }).map(m => [m.FullName, m.phoneNumber, m.address, m.ward, m.pollingUnit, m.vin, (codes[`${m.ward}::${m.FullName}`] || codes[`${m.ward}::general`] || '')]);

  if (rows.length === 0) { alert('No records to preview.'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const title = `Registrations${wardFilter ? ' - ' + wardFilter : ''}${unitFilter ? ' - ' + unitFilter : ''}`;
  doc.setFontSize(14);
  doc.text(title, 40, 40);

  doc.autoTable({
    startY: 60,
    head: [['FullName', 'Phone', 'Address', 'Ward', 'Polling Unit', 'VIN', 'Secure Code']],
    body: rows,
    styles: { fontSize: 9 }
  });

  const blob = doc.output('bloburl');
  window.open(blob, '_blank');
});

// ===============================
// DEBOUNCE FUNCTION
// ===============================
function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

// ===============================
// INITIAL LOAD
// ===============================
fetchData();
