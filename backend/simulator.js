const axios = require('axios'); // 我们需要安装这个库来发送请求

const API_BASE = "http://localhost:3001";

async function simulateSensors() {
    try {
        // 1. 获取所有房间
        const res = await axios.get(`${API_BASE}/rooms`);
        const rooms = res.data;

        if (rooms.length === 0) {
            console.log("No rooms found. Please add a room on the website first!");
            return;
        }

        // 2. 随机选择一个房间
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
        
        // 3. 随机切换状态 (0 为空闲, 1 为占用)
        const newStatus = randomRoom.occupied ? 0 : 1;

        // 4. 发送更新请求到后端
        await axios.post(`${API_BASE}/updateRoom`, {
            room_id: randomRoom.id,
            occupied: newStatus
        });

        console.log(`[Sensor] ${randomRoom.name} changed to ${newStatus ? 'Occupied' : 'Free'}`);
    } catch (error) {
        console.error("Simulator Error:", error.message);
    }
}

// 每 5 秒模拟一次传感器数据
console.log("IoT Sensor Simulator started...");
setInterval(simulateSensors, 5000);