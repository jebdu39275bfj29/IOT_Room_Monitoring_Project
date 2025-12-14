console.log("🌟 Frontend script is loaded!");

const API_BASE = "http://localhost:3001";

function formatTimestamp(ts) {
  if (!ts) return "-";
  // SQLite datetime('now') gives "YYYY-MM-DD HH:MM:SS"
  return ts;
}

function applyFilters(rooms) {
  const search = (document.getElementById("searchInput")?.value || "")
    .trim()
    .toLowerCase();
  const filter = document.getElementById("filterSelect")?.value || "all";

  return rooms.filter((r) => {
    const nameOk = !search || String(r.name).toLowerCase().includes(search);
    const statusOk =
      filter === "all" ||
      (filter === "occupied" && r.occupied) ||
      (filter === "free" && !r.occupied);
    return nameOk && statusOk;
  });
}

async function loadRooms() {
  const tbody = document.querySelector("#roomsTable tbody");
  const statusLabel = document.getElementById("statusMessage");
  const summaryLabel = document.getElementById("summaryText");

  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");

  const query = (searchInput?.value || "").trim().toLowerCase();
  const filterValue = (statusFilter?.value || "all").toLowerCase();

  //（ID, Name, Status, Last Updated, Action）
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  try {
    const res = await fetch(`${API_BASE}/rooms`);
    const rooms = await res.json();

    // Summary
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => !!r.occupied).length;
    if (summaryLabel) {
      summaryLabel.textContent = `${occupiedRooms} of ${totalRooms} rooms occupied`;
    }

    //（Search + Status）
    const filtered = rooms.filter((room) => {
      const roomName = (room.name || "").toLowerCase();
      const nameMatch = query === "" ? true : roomName.includes(query);

      let statusMatch = true;
      if (filterValue === "occupied") statusMatch = !!room.occupied;
      if (filterValue === "free") statusMatch = !room.occupied;

      return nameMatch && statusMatch;
    });

    tbody.innerHTML = "";

    if (filtered.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>No rooms match your search.</td></tr>";
      if (statusLabel) statusLabel.textContent = "";
      return;
    }

    filtered.forEach((room) => {
      const tr = document.createElement("tr");

      // ID
      const idTd = document.createElement("td");
      idTd.textContent = room.id;
      tr.appendChild(idTd);

      // Name
      const nameTd = document.createElement("td");
      nameTd.textContent = room.name;
      tr.appendChild(nameTd);

      // Status badge
      const statusTd = document.createElement("td");
      const badge = document.createElement("span");
      badge.classList.add("badge");
      if (room.occupied) {
        badge.classList.add("badge-occupied");
        badge.textContent = "Occupied";
      } else {
        badge.classList.add("badge-free");
        badge.textContent = "Free";
      }
      statusTd.appendChild(badge);
      tr.appendChild(statusTd);

      // Last Updated
      const updatedTd = document.createElement("td");
      updatedTd.textContent = room.last_updated ? room.last_updated : "-";
      tr.appendChild(updatedTd);

      // Action
      const actionTd = document.createElement("td");

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = room.occupied ? "Set Free" : "Set Occupied";
      toggleBtn.onclick = () => toggleRoom(room.id, room.occupied);
      actionTd.appendChild(toggleBtn);

      actionTd.appendChild(document.createTextNode(" "));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.onclick = () => deleteRoom(room.id);
      actionTd.appendChild(deleteBtn);

      tr.appendChild(actionTd);
      tbody.appendChild(tr);
    });

    if (statusLabel) statusLabel.textContent = "";
  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='5'>Failed to load rooms</td></tr>";
    if (statusLabel) statusLabel.textContent = "Error contacting backend.";
  }
}


// --- Toggle room status and reload table ---
async function toggleRoom(id, currentlyOccupied) {
  const statusLabel = document.getElementById("statusMessage");
  statusLabel.textContent = "Updating...";

  try {
    await fetch(`${API_BASE}/updateRoom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_id: id,
        occupied: currentlyOccupied ? 0 : 1,
      }),
    });

    statusLabel.textContent = "Room updated.";
    await loadRooms();
  } catch (err) {
    console.error(err);
    statusLabel.textContent = "Failed to update room.";
  }
}

async function addRoom() {
  const input = document.getElementById("newRoomName");
  const statusLabel = document.getElementById("statusMessage");
  const name = input.value.trim();

  if (!name) {
    statusLabel.textContent = "Please enter a room name.";
    return;
  }

  statusLabel.textContent = "Adding room...";

  try {
    const res = await fetch(`${API_BASE}/addRoom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.status === 409) {
      statusLabel.textContent = "Room name already exists.";
      return;
    }
    if (!res.ok) throw new Error("Server error");

    input.value = "";
    statusLabel.textContent = "Room added.";
    await loadRooms();
  } catch (err) {
    console.error(err);
    statusLabel.textContent = "Failed to add room.";
  }
}

async function deleteRoom(id) {
  const statusLabel = document.getElementById("statusMessage");

  const sure = confirm("Are you sure you want to delete this room?");
  if (!sure) return;

  statusLabel.textContent = "Deleting room...";

  try {
    await fetch(`${API_BASE}/deleteRoom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: id }),
    });

    statusLabel.textContent = "Room deleted.";
    await loadRooms();
  } catch (err) {
    console.error(err);
    statusLabel.textContent = "Failed to delete room.";
  }
}

/// --- Init on page load ---
document.addEventListener("DOMContentLoaded", () => {
  // Basic buttons
  document.getElementById("refreshBtn")?.addEventListener("click", loadRooms);
  document.getElementById("addRoomBtn")?.addEventListener("click", addRoom);

  // Search / Filter / Clear
  document.getElementById("searchBtn")?.addEventListener("click", loadRooms);

  document.getElementById("statusFilter")?.addEventListener("change", loadRooms);

  document.getElementById("clearBtn")?.addEventListener("click", () => {
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    if (searchInput) searchInput.value = "";
    if (statusFilter) statusFilter.value = "all";
    loadRooms();
  });

  // enter
  document.getElementById("searchInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadRooms();
  });

  // First load
  loadRooms();
});
