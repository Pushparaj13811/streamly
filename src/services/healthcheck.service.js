import axios from "axios";
import dotenv from "dotenv";

const API_BASE_URL = `http://localhost:${process.env.PORT}`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const checkHealthCheckEndpoint = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/healthCheck`);
        if (response.status !== 200) {
            alertAdmin(
                `HealthCheck endpoint returned status code: ${response.status}`
            );
        }
    } catch (error) {
        alertAdmin(`HealthCheck endpoint error: ${error.message}`);
    }
};

const checkSystemMetricsEndpoint = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/systemMetrics`);
        if (response.status !== 200) {
            alertAdmin(
                `SystemMetrics endpoint returned status code: ${response.status}`
            );
        }
    } catch (error) {
        alertAdmin(`SystemMetrics endpoint error: ${error.message}`);
    }
};

const alertAdmin = (message) => {
    console.log(`Alert: ${message}`);
};
setInterval(() => {
    checkHealthCheckEndpoint();
    checkSystemMetricsEndpoint();
}, 60000);

console.log("Health check monitoring started...");

export { checkHealthCheckEndpoint, checkSystemMetricsEndpoint };
