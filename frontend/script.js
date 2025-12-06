console.log("🌟 Frontend script is loaded!");

const API_BASE = "http://localhost:3001";

// --- Load and render rooms into the table ---
async function loadRooms() {
  const tbody = document.querySelector("#roomsTable tbody");
  const statusLabel = document.getElementById("statusMessage");
  const summaryLabel = document.getElementById("summaryText");

  // Temporary row while loading
  tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  try {
    const res = await fetch(`${API_BASE}/rooms`);
    const rooms = await res.json();

    tbody.innerHTML = "";

    rooms.forEach((room) => {
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

      // Action cell
      const actionTd = document.createElement("td");

      // Toggle-knapp
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = room.occupied ? "Set Free" : "Set Occupied";
      toggleBtn.onclick = () => toggleRoom(room.id, room.occupied);
      actionTd.appendChild(toggleBtn);

      // Mellanrum
      actionTd.appendChild(document.createTextNode(" "));

      // Delete-knapp
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.onclick = () => deleteRoom(room.id);
      actionTd.appendChild(deleteBtn);

      tr.appendChild(actionTd);

      // 🔴 Viktig rad: lägg in raden i tabellen!
      tbody.appendChild(tr);
    });

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.occupied).length;
    summaryLabel.textContent = `${occupiedRooms} of ${totalRooms} rooms occupied`;

    statusLabel.textContent = "";
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      "<tr><td colspan='4'>Failed to load rooms</td></tr>";
    statusLabel.textContent = "Error contacting backend.";
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

    if (!res.ok) {
      throw new Error("Server error");
    }

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
    await loadRooms(); // ladda om listan + summary
  } catch (err) {
    console.error(err);
    statusLabel.textContent = "Failed to delete room.";
  }
}

// --- Init on page load ---
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("refreshBtn")
    .addEventListener("click", loadRooms);

  document
    .getElementById("addRoomBtn")
    .addEventListener("click", addRoom);

  loadRooms(); // Load immediately when the page opens
});
