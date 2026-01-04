const axios = require('axios');

const API_BASE = "http://localhost:3001";

/**
 * ======================
 * IoT Device Information
 * ======================
 */
const DEVICE_ID = "sensor-node-001";
const SENSOR_INTERVAL = 5000;      // 5 秒采样
const HEARTBEAT_INTERVAL = 15000;  // 15 秒心跳

/**
 * ======================
 * Finite State Machine
 * ======================
 */
const STATES = {
    EMPTY: "EMPTY",
    POSSIBLE: "POSSIBLY_OCCUPIED",
    OCCUPIED: "OCCUPIED"
};

/**
 * 本地缓存（模拟 IoT 设备断网）
 */
let cachedState = {};

/**
 * ======================
 * Simulate IoT Sensors
 * ======================
 * 5% 概率模拟传感器故障
 */
function simulateSensorData() {
    if (Math.random() < 0.05) {
        return null; // 传感器故障
    }

    return {
        pir: Math.random() > 0.7 ? 1 : 0,
        co2: 400 + Math.random() * 800,
        sound: 20 + Math.random() * 50,
        light: Math.random() * 500
    };
}

/**
 * ======================
 * Edge-side FSM Inference
 * ======================
 */
function inferState(sensors, lastState) {
    if (!sensors) {
        console.log(`[IoT][${DEVICE_ID}] Sensor failure → keep last state`);
        return lastState;
    }

    if (sensors.pir === 1) {
        return STATES.OCCUPIED;
    }

    if (sensors.co2 > 800) {
        return STATES.POSSIBLE;
    }

    if (sensors.co2 < 600 && sensors.sound < 35) {
        return STATES.EMPTY;
    }

    return lastState;
}

/**
 * FSM → occupied (DB compatible)
 */
function stateToOccupied(state) {
    return state === STATES.OCCUPIED ? 1 : 0;
}

/**
 * ======================
 * Main Sensor Simulation
 * ======================
 */
async function simulateSensors() {
    try {
        const res = await axios.get(`${API_BASE}/rooms`);
        const rooms = res.data;

        if (rooms.length === 0) {
            console.log(`[IoT][${DEVICE_ID}] No rooms available`);
            return;
        }

        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const sensors = simulateSensorData();

        const lastState = cachedState[room.id] || STATES.EMPTY;
        const newState = inferState(sensors, lastState);
        const occupied = stateToOccupied(newState);

        try {
            await axios.post(`${API_BASE}/updateRoom`, {
                room_id: room.id,
                occupied: occupied
            });

            cachedState[room.id] = newState;

        } catch (netErr) {
            console.log(`[IoT][${DEVICE_ID}] Network error → using cached state`);
            cachedState[room.id] = lastState;
        }

        if (sensors) {
            console.log(
                `[IoT][${DEVICE_ID}] Room:${room.name} ` +
                `PIR:${sensors.pir} ` +
                `CO2:${sensors.co2.toFixed(0)}ppm ` +
                `Sound:${sensors.sound.toFixed(0)}dB ` +
                `State:${newState}`
            );
        } else {
            console.log(
                `[IoT][${DEVICE_ID}] Room:${room.name} ` +
                `State unchanged (${newState})`
            );
        }

    } catch (err) {
        console.error(
            `[IoT][${DEVICE_ID}] Simulator Error:`,
            err.response?.data || err.message
        );
    }
}

/**
 * ======================
 * Device Heartbeat
 * ======================
 */
async function sendHeartbeat() {
    try {
        await axios.post(`${API_BASE}/heartbeat`, {
            device_id: DEVICE_ID,
            timestamp: new Date().toISOString()
        });
        console.log(`[IoT][${DEVICE_ID}] Heartbeat sent`);
    } catch (err) {
        console.log(`[IoT][${DEVICE_ID}] Heartbeat failed`);
    }
}

/**
 * ======================
 * Start IoT Simulator
 * ======================
 */
console.log(`[IoT][${DEVICE_ID}] Simulator started`);
setInterval(simulateSensors, SENSOR_INTERVAL);
setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
