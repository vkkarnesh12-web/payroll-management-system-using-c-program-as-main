// Payroll Management System - Frontend Application

let employees = [];
let taxRate = 10;
let pfRate = 12;

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) { window.location.href = "login.html"; return; }

    document.getElementById("userName").textContent =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

    loadData();
    initializeEvents();
    updateDashboard();
    renderEmployees();
    updateReports();
});

function getEmployeeKey() {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    return `employees_${user.id || 1}`;
}

function loadData() {
    employees = JSON.parse(localStorage.getItem(getEmployeeKey()) || "[]");
    taxRate = Number(localStorage.getItem("taxRate") || 10);
    pfRate = Number(localStorage.getItem("pfRate") || 12);
    const tax = document.getElementById("taxRate");
    const pf = document.getElementById("pfRate");
    if (tax) tax.value = taxRate;
    if (pf) pf.value = pfRate;
}

function saveData() {
    localStorage.setItem(getEmployeeKey(), JSON.stringify(employees));
}

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency", currency: "INR", maximumFractionDigits: 2
    }).format(Number(value) || 0);
}

function calculatePayroll(emp) {
    const base = Number(emp.baseSalary) || 0;
    const da = Number(emp.da) || 0;
    const hra = Number(emp.hra) || 0;
    const ma = Number(emp.ma) || 0;
    const convey = Number(emp.convey) || 0;
    const gross = base + da + hra + ma + convey;
    const pf = gross * (pfRate / 100);
    const tax = gross * (taxRate / 100);
    const totalDeductions = pf + tax;
    const net = gross - totalDeductions;
    return { gross, pf, tax, totalDeductions, net };
}

function initializeEvents() {
    document.getElementById("employeeForm").addEventListener("submit", e => e.preventDefault());

    document.getElementById("taxRate").addEventListener("change", e => {
        taxRate = Math.max(0, Number(e.target.value) || 0);
        localStorage.setItem("taxRate", taxRate);
        refreshAll();
    });

    document.getElementById("pfRate").addEventListener("change", e => {
        pfRate = Math.max(0, Number(e.target.value) || 0);
        localStorage.setItem("pfRate", pfRate);
        refreshAll();
    });
}

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    const section = document.getElementById(sectionId);
    if (section) section.classList.add("active");
    document.querySelectorAll(".nav-item").forEach(n => {
        if (n.getAttribute("onclick")?.includes(`'${sectionId}'`)) n.classList.add("active");
    });
    if (sectionId === "dashboard") updateDashboard();
    if (sectionId === "employees") renderEmployees();
    if (sectionId === "reports") updateReports();
    return false;
}

function addNewEmployee() {
    const id = Number(document.getElementById("empId").value);
    const name = document.getElementById("empName").value.trim();
    const dept = document.getElementById("empDept").value.trim();
    const position = document.getElementById("empPos").value.trim();
    const baseSalary = Number(document.getElementById("baseSalary").value);
    const joinDate = document.getElementById("joinDate").value;
    const da = Number(document.getElementById("da").value) || 0;
    const hra = Number(document.getElementById("hra").value) || 0;
    const ma = Number(document.getElementById("ma").value) || 0;
    const convey = Number(document.getElementById("convey").value) || 0;

    if (!id || !name || !dept || !position || !baseSalary || !joinDate) {
        alert("Please fill all required employee fields.");
        return;
    }
    if (employees.some(e => e.id === id)) {
        alert("Employee ID already exists.");
        return;
    }

    employees.push({ id, name, department: dept, position, baseSalary, joinDate, da, hra, ma, convey });
    saveData();
    document.getElementById("employeeForm").reset();
    refreshAll();
    showSection("employees");
    alert("Employee added successfully!");
}

function renderEmployees(list = employees) {
    const tbody = document.querySelector("#employeeTable tbody");
    tbody.innerHTML = "";
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">No employees found</td></tr>`;
        return;
    }

    list.forEach(emp => {
        const p = calculatePayroll(emp);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${escapeHtml(emp.name)}</td>
            <td>${escapeHtml(emp.department)}</td>
            <td>${escapeHtml(emp.position)}</td>
            <td>${money(emp.baseSalary)}</td>
            <td>${money(p.net)}</td>
            <td>
                <button class="action-btn view-btn" onclick="viewEmployee(${emp.id})">View</button>
                <button class="action-btn delete-btn" onclick="deleteEmployee(${emp.id})">Delete</button>
            </td>`;
        tbody.appendChild(row);
    });
}

function updateDashboard() {
    const totals = getTotals();
    document.getElementById("totalEmployees").textContent = employees.length;
    document.getElementById("totalGross").textContent = money(totals.gross);
    document.getElementById("totalNet").textContent = money(totals.net);
    document.getElementById("avgSalary").textContent = money(employees.length ? totals.net / employees.length : 0);

    const tbody = document.querySelector("#recentTable tbody");
    tbody.innerHTML = "";
    employees.slice(-5).reverse().forEach(emp => {
        const p = calculatePayroll(emp);
        tbody.innerHTML += `<tr>
            <td>${emp.id}</td><td>${escapeHtml(emp.name)}</td>
            <td>${escapeHtml(emp.department)}</td><td>${escapeHtml(emp.position)}</td>
            <td>${money(p.net)}</td></tr>`;
    });
    if (!employees.length) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">No employees added yet</td></tr>`;
}

function getTotals() {
    return employees.reduce((t, e) => {
        const p = calculatePayroll(e);
        t.gross += p.gross; t.deductions += p.totalDeductions; t.net += p.net;
        return t;
    }, {gross:0, deductions:0, net:0});
}

function searchEmployee() {
    const q = document.getElementById("searchInput").value.trim().toLowerCase();
    const result = employees.filter(e =>
        String(e.id).includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
    renderEmployees(result);
}

function deleteEmployee(id) {
    if (!confirm("Delete this employee?")) return;
    employees = employees.filter(e => e.id !== id);
    saveData();
    refreshAll();
}

function viewEmployee(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    const p = calculatePayroll(emp);
    document.getElementById("modalBody").innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><strong>Employee ID</strong>${emp.id}</div>
            <div class="detail-item"><strong>Name</strong>${escapeHtml(emp.name)}</div>
            <div class="detail-item"><strong>Department</strong>${escapeHtml(emp.department)}</div>
            <div class="detail-item"><strong>Position</strong>${escapeHtml(emp.position)}</div>
            <div class="detail-item"><strong>Date Joined</strong>${emp.joinDate}</div>
            <div class="detail-item"><strong>Base Salary</strong>${money(emp.baseSalary)}</div>
            <div class="detail-item"><strong>Allowances</strong>${money(emp.da+emp.hra+emp.ma+emp.convey)}</div>
            <div class="detail-item"><strong>Gross Salary</strong>${money(p.gross)}</div>
            <div class="detail-item"><strong>PF</strong>${money(p.pf)}</div>
            <div class="detail-item"><strong>Income Tax</strong>${money(p.tax)}</div>
            <div class="detail-item"><strong>Total Deductions</strong>${money(p.totalDeductions)}</div>
            <div class="detail-item"><strong>Net Salary</strong>${money(p.net)}</div>
        </div>`;
    document.getElementById("detailsModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("detailsModal").style.display = "none";
}

function generatePayroll() {
    if (!employees.length) {
        document.getElementById("payrollResult").innerHTML = "<div class='report-card'>No employees available.</div>";
        return;
    }
    const totals = getTotals();
    let html = `<div class="report-card"><h3>Generated Payroll</h3><table>
        <thead><tr><th>ID</th><th>Name</th><th>Gross</th><th>PF</th><th>Tax</th><th>Net</th></tr></thead><tbody>`;
    employees.forEach(e => {
        const p = calculatePayroll(e);
        html += `<tr><td>${e.id}</td><td>${escapeHtml(e.name)}</td><td>${money(p.gross)}</td>
        <td>${money(p.pf)}</td><td>${money(p.tax)}</td><td>${money(p.net)}</td></tr>`;
    });
    html += `</tbody></table><div class="payroll-total">Total Net Payroll: ${money(totals.net)}</div></div>`;
    document.getElementById("payrollResult").innerHTML = html;
}

function exportPayroll() {
    if (!employees.length) { alert("No payroll data to export."); return; }
    const rows = [["ID","Name","Department","Position","Base Salary","Gross Salary","PF","Tax","Net Salary"]];
    employees.forEach(e => {
        const p = calculatePayroll(e);
        rows.push([e.id,e.name,e.department,e.position,e.baseSalary,p.gross,p.pf,p.tax,p.net]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "payroll_report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
}

function updateReports() {
    const t = getTotals();
    document.getElementById("summaryEmployees").textContent = employees.length;
    document.getElementById("summaryGross").textContent = money(t.gross);
    document.getElementById("summaryDeductions").textContent = money(t.deductions);
    document.getElementById("summaryNet").textContent = money(t.net);

    const groups = {};
    employees.forEach(e => {
        const p = calculatePayroll(e);
        if (!groups[e.department]) groups[e.department] = {count:0, net:0};
        groups[e.department].count++;
        groups[e.department].net += p.net;
    });
    const box = document.getElementById("deptBreakdown");
    box.innerHTML = Object.keys(groups).length ? Object.entries(groups).map(([d,v]) =>
        `<div class="dept-row"><span>${escapeHtml(d)} (${v.count})</span><strong>${money(v.net)}</strong></div>`
    ).join("") : "<p>No department data available.</p>";
}

function clearAllData() {
    if (!confirm("This will permanently remove all employee data for this account. Continue?")) return;
    employees = [];
    saveData();
    refreshAll();
    alert("Employee data cleared.");
}

function downloadBackup() {
    const backup = {
        exportedAt: new Date().toISOString(),
        employees,
        taxRate,
        pfRate
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "payroll_backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

function refreshAll() {
    updateDashboard();
    renderEmployees();
    updateReports();
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
}

window.addEventListener("click", e => {
    if (e.target === document.getElementById("detailsModal")) closeModal();
});
