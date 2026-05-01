import AsyncStorage from "@react-native-async-storage/async-storage";
const BASE_URL = 'https://buildio.co.nz/api'
export async function addDeviceId(deviceId) {
      const token = await AsyncStorage.getItem('authToken');
  const url = "http://4.245.1.145:4000/api/users/add_device_id";

  try {
    const response = await fetch(url, {
      method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({ device_id: deviceId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Device ID added:", data);
    return data;
  } catch (error) {
    console.error("❌ Error adding device ID:", error);
    throw error;
  }
}