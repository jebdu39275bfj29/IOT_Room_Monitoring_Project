const API_BASE = "http://localhost:3001";

async function loadRooms() {
  const tbody = document.querySelector("#roomsTable tbody");
  const statusLabel = document.getElementById("statusMessage");

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

      // Status (badge)
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

      // Action button
      const actionTd = document.createElement("td");
      const btn = document.createElement("button");
      btn.textContent = room.occupied ? "Set Free" : "Set Occupied";
      btn.onclick = () => toggleRoom(room.id, room.occupied);
      actionTd.appendChild(btn);
      tr.appendChild(actionTd);

      tbody.appendChild(tr);
    });

    statusLabel.textContent = "";
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      "<tr><td colspan='4'>Failed to load rooms</td></tr>";
    statusLabel.textContent = "Error contacting backend.";
  }
}

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

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("refreshBtn")
    .addEventListener("click", loadRooms);

  loadRooms(); // Ladda direkt när sidan öppnas
});
