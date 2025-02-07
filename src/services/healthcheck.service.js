import axios from "axios";

const API_BASE_URL = `http://localhost:${process.env.PORT}`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const checkHealthCheckEndpoint = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/healthcheck/healthCheck`
        );

        responseOutput(response);
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
        const response = await axios.get(
            `${API_BASE_URL}/healthCheck/systemMetrics`
        );
        responseOutput(response);
        if (response.status !== 200) {
            alertAdmin(
                "SystemMetrics endpoint returned status code:",
                response
            );
        }
    } catch (error) {
        alertAdmin("SystemMetrics endpoint error: ", error);
        console.log("SystemMetrics endpoint error: ", error.message);
    }
};

const alertAdmin = (message) => {
    console.log(`Alert: ${message}`);
};
const responseOutput = (response) => {
    console.log("Response : ", response);
};
setInterval(() => {
    checkHealthCheckEndpoint();
    checkSystemMetricsEndpoint();
}, 60000);

console.log("Health check monitoring started...");

export { checkHealthCheckEndpoint, checkSystemMetricsEndpoint };
