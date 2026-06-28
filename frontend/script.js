const API = "http://127.0.0.1:5000/birthdays";

let birthdays = [];
let editId = null;

/* ================= TOKEN ================= */

function getToken() {
    return localStorage.getItem("token");
}

if (!getToken()) {
    window.location.href = "login.html";
}

/* ================= FETCH ================= */

async function apiFetch(url, options = {}) {

    const token = getToken();

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {

        localStorage.removeItem("token");

        alert("Session expired. Login again.");

        window.location.href = "login.html";

        throw new Error("Unauthorized");
    }

    return response;
}

/* ================= LOAD ================= */

async function loadBirthdays() {

    try {

        const res = await apiFetch(API);

        if (!res.ok) {
            throw new Error(await res.text());
        }

        birthdays = await res.json();

        renderBirthdays();

        updateStats();

        updateCountdown();

    } catch (err) {

        console.error(err);

    }

}

/* ================= RENDER ================= */

function renderBirthdays() {

    const list = document.getElementById("birthdayList");

    list.innerHTML = "";

    const search =
        document
        .getElementById("search")
        .value
        .toLowerCase();

    birthdays
        .filter(b =>
            b.name.toLowerCase().includes(search)
        )
        .forEach(b => {

            const li = document.createElement("li");

            li.innerHTML = `

            <div class="birthday-card">

                <img
                src="${b.image ||
                    "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"}">

                <h3>${b.name}</h3>

                <p>📅 ${b.date}</p>

                <p>📞 ${b.contact || "N/A"}</p>

               

                <p>🎁 ${b.gift || "N/A"}</p>

                <p>⏰ Reminder: ${b.reminder || 0} days before</p>

                <div class="card-buttons">

                    <button onclick="editBirthday('${b._id}')">
                    ✏ Edit
                    </button>

                    <button onclick="deleteBirthday('${b._id}')">
                    🗑 Delete
                    </button>

                </div>

            </div>

            `;

            list.appendChild(li);

        });

}

/* ================= SAVE ================= */

async function addBirthday() {

    const birthday = {

        name:
            document
            .getElementById("name")
            .value
            .trim(),

        date:
            document
            .getElementById("birthday")
            .value,

        contact:
            document
            .getElementById("contact")
            .value
            .trim(),


        gift:
            document
            .getElementById("gift")
            .value
            .trim(),

        reminder:
            Number(
                document
                .getElementById("reminder")
                .value
            ) || 0

    };

    if (!birthday.name || !birthday.date) {

        alert("Please fill Name and Birthday");

        return;

    }

    try {

        let res;

        if (editId) {

            res = await apiFetch(`${API}/${editId}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(birthday)

            });

        } else {

            res = await apiFetch(API, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(birthday)

            });

        }

        const data = await res.json();

        if (!res.ok) {

            alert(data.message || data.error);

            return;

        }

        clearForm();

        editId = null;

        document.getElementById("saveBtn").innerText =
            "💾 Save Birthday";

        await loadBirthdays();

    } catch (err) {

        console.error(err);

        alert("Save Failed");

    }

}

/* ================= EDIT ================= */

function editBirthday(id) {

    const b = birthdays.find(x => x._id === id);

    if (!b) return;

    editId = id;

    document.getElementById("name").value = b.name;

    document.getElementById("birthday").value = b.date;

    document.getElementById("contact").value = b.contact;

    
    document.getElementById("gift").value = b.gift;

    document.getElementById("reminder").value = b.reminder;

    document.getElementById("saveBtn").innerText =
        "✏ Update Birthday";

}
/* ================= DELETE ================= */

async function deleteBirthday(id) {

    if (!confirm("Delete this birthday?")) return;

    try {

        const res = await apiFetch(`${API}/${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || data.error || "Delete failed");
            return;
        }

        birthdays = birthdays.filter(b => b._id !== id);

        renderBirthdays();

        updateStats();

        updateCountdown();

    } catch (err) {

        console.error(err);

        alert("Delete failed");

    }

}

/* ================= COUNTDOWN ================= */

function updateCountdown() {

    const today = new Date();

    let html = "";

    birthdays.forEach(b => {

        const birth = new Date(b.date);

        let nextBirthday = new Date(
            today.getFullYear(),
            birth.getMonth(),
            birth.getDate()
        );

        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        const diff = nextBirthday - today;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        );

        const minutes = Math.floor(
            (diff % (1000 * 60 * 60)) /
            (1000 * 60)
        );

        const seconds = Math.floor(
            (diff % (1000 * 60)) /
            1000
        );

        html += `
            🎉 <b>${b.name}</b> →
            ${days}d ${hours}h ${minutes}m ${seconds}s
            <br>
        `;

    });

    document.getElementById("countdown").innerHTML =
        html || "No birthdays yet 🎂";

}

/* ================= STATS ================= */

function updateStats() {

    document.getElementById("totalCount").innerText =
        birthdays.length;

    const month = new Date().getMonth();

    const monthCount = birthdays.filter(b =>
        new Date(b.date).getMonth() === month
    ).length;

    document.getElementById("monthCount").innerText =
        monthCount;

    if (birthdays.length === 0) {

        document.getElementById("nextBirthday").innerText = "-";

        return;

    }

    const today = new Date();

    const sorted = [...birthdays].sort((a, b) => {

        const da = new Date(a.date);
        const db = new Date(b.date);

        let na = new Date(
            today.getFullYear(),
            da.getMonth(),
            da.getDate()
        );

        let nb = new Date(
            today.getFullYear(),
            db.getMonth(),
            db.getDate()
        );

        if (na < today)
            na.setFullYear(today.getFullYear() + 1);

        if (nb < today)
            nb.setFullYear(today.getFullYear() + 1);

        return na - nb;

    });

    document.getElementById("nextBirthday").innerText =
        sorted[0].name;

}

/* ================= CLEAR FORM ================= */

function clearForm() {

    document.getElementById("name").value = "";

    document.getElementById("birthday").value = "";

    document.getElementById("contact").value = "";

    

    document.getElementById("gift").value = "";

    document.getElementById("reminder").value = "";

}

/* ================= SEARCH ================= */

document
.getElementById("search")
.addEventListener("input", renderBirthdays);

/* ================= DARK MODE ================= */

document
.getElementById("darkModeBtn")
.addEventListener("click", () => {

    document.body.classList.toggle("dark");

});

/* ================= LIVE COUNTDOWN ================= */

setInterval(updateCountdown, 1000);

/* ================= START ================= */

loadBirthdays();