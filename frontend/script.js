console.log("🌟 Frontend script is loaded!");

const API_BASE = "http://localhost:3001";

function getQuery() {
  return (document.getElementById("searchInput")?.value || "")
    .trim()
    .toLowerCase();
}

function getFilterValue() {
  return (document.getElementById("statusFilter")?.value || "all").toLowerCase();
}

async function loadRooms() {
  const tbody = document.querySelector("#roomsTable tbody");
  const statusLabel = document.getElementById("statusMessage");
  const summaryLabel = document.getElementById("summaryText");

  const query = getQuery();
  const filterValue = getFilterValue();

  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  try {
    const res = await fetch(`${API_BASE}/rooms`, { cache: "no-store" });
    if (!res.ok) throw new Error(`GET /rooms failed: ${res.status}`);
    const rooms = await res.json();

    // Summary ska baseras på ALLA rooms
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => !!r.occupied).length;
    if (summaryLabel) summaryLabel.textContent = `${occupiedRooms} of ${totalRooms} rooms occupied`;

    // Filter + Search
    const filtered = rooms.filter((room) => {
      const roomName = String(room.name || "").toLowerCase();
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

    filtered.forEach((room, index) => {
      const tr = document.createElement("tr");

      // ID
      const idTd = document.createElement("td");
      idTd.textContent = index + 1;// radnummer i tabellen
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

      // Last updated
      const updatedTd = document.createElement("td");
      updatedTd.textContent = room.last_updated ? room.last_updated : "-";
      tr.appendChild(updatedTd);

      // Action
      const actionTd = document.createElement("td");

      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.textContent = room.occupied ? "Set Free" : "Set Occupied";
      toggleBtn.addEventListener("click", () => toggleRoom(Number(room.id), !!room.occupied));
      actionTd.appendChild(toggleBtn);

      actionTd.appendChild(document.createTextNode(" "));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.addEventListener("click", () => deleteRoom(Number(room.id)));
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

async function toggleRoom(id, currentlyOccupied) {
  const statusLabel = document.getElementById("statusMessage");
  statusLabel.textContent = "Updating...";

  try {
    const res = await fetch(`${API_BASE}/updateRoom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: id, occupied: currentlyOccupied ? 0 : 1 }),
    });
    if (!res.ok) throw new Error(`POST /updateRoom failed: ${res.status}`);

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
  const name = (input?.value || "").trim();

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
    if (!res.ok) throw new Error(`POST /addRoom failed: ${res.status}`);

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

  const sure = confirm(`Är du säker att du vill ta bort room id=${id}?`);
  if (!sure) return;

  statusLabel.textContent = "Deleting room...";

  try {
    console.log("🗑️ Deleting room id:", id);

    const res = await fetch(`${API_BASE}/deleteRoom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: id }),
    });

    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text };
    }

    if (!res.ok) {
      console.error("Delete failed:", res.status, data);
      statusLabel.textContent = data.error || `Failed to delete room (${res.status}).`;
      return;
    }

    statusLabel.textContent = "Room deleted.";
    await loadRooms();
  } catch (err) {
    console.error(err);
    statusLabel.textContent = "Failed to delete room.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshBtn")?.addEventListener("click", loadRooms);
  document.getElementById("addRoomBtn")?.addEventListener("click", addRoom);

  document.getElementById("searchBtn")?.addEventListener("click", loadRooms);
  document.getElementById("statusFilter")?.addEventListener("change", loadRooms);

  document.getElementById("clearBtn")?.addEventListener("click", () => {
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    if (searchInput) searchInput.value = "";
    if (statusFilter) statusFilter.value = "all";
    loadRooms();
  });

  document.getElementById("searchInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadRooms();
  });

  loadRooms();
});
