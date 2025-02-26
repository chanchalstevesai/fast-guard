import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  "https://9fb6-2405-201-3009-d88a-8d21-eba4-f7e7-9136.ngrok-free.app";

const axiosConfig = {
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
};

const Dashboard = () => {
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Run /scrape and /automation every hour
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        console.log("Running scheduled tasks...");

        // Call /scrape API
        await axios.get(`${API_BASE_URL}/scrape`, axiosConfig);

        // Call /automation API
        await axios.get(`${API_BASE_URL}/automation`, axiosConfig);

        console.log("Scheduled tasks completed.");
      } catch (error) {
        console.error("Error in scheduled tasks:", error);
      }
    }, 60 * 60 * 1000); // Runs every 1 hour

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setProcessing(true);
    setMessage("Uploading file...");
    setFileUrl(null);
    setShowCredentialsForm(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Step 1: Upload File
      await axios.post(`${API_BASE_URL}/upload`, formData, axiosConfig);
      setMessage("File uploaded successfully! Scraping in progress...");

      // Step 2: Scrape API
      await axios.get(`${API_BASE_URL}/scrape`, axiosConfig);
      setMessage("Scraping completed. Fetching output file...");

      // Step 3: Get Output File
      const outputResponse = await axios.get(`${API_BASE_URL}/outputfile`, {
        ...axiosConfig,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([outputResponse.data]));
      setFileUrl(url);
      setMessage("Output file ready! Checking Amazon credentials...");

      // Step 4: Check Amazon Credentials
      const { data } = await axios.get(
        `${API_BASE_URL}/get_amazon_credentials`,
        axiosConfig
      );

      if (
        data.message === "No Amazon credentials stored" &&
        data.status === "error"
      ) {
        setMessage("No Amazon credentials found. Please enter them below.");
        setShowCredentialsForm(true);
      } else {
        setMessage("Amazon credentials found! Running automation...");
        await axios.get(`${API_BASE_URL}/automation`, axiosConfig);
        setMessage("Process completed successfully!");
      }
    } catch (error) {
      setMessage(
        `Error: ${error.response?.data?.error || "An error occurred."}`
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleSetCredentials = async () => {
    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }

    setProcessing(true);
    setMessage("Saving credentials...");

    try {
      await axios.post(
        `${API_BASE_URL}/set_amazon_credentials`,
        { username, password },
        axiosConfig
      );
      setMessage("Credentials saved! Running automation...");

      await axios.get(`${API_BASE_URL}/automation`, axiosConfig);
      setMessage("Process completed successfully!");
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        flexDirection: "column",
        minWidth: "100vw",
        textAlign: "center",
        backgroundColor: "black",
        color: "white",
      }}
    >
      <div>
        <h2>API Automation Dashboard</h2>
        <input type="file" onChange={handleFileUpload} disabled={processing} />
        {message && <p>{message}</p>}
        {fileUrl && (
          <a href={fileUrl} download="output.xlsx">
            <button>Download Excel File</button>
          </a>
        )}
        {showCredentialsForm && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              width: "250px",
              margin: "0 auto",
              padding: "20px",
            }}
          >
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: "8px",
                fontSize: "14px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "8px",
                fontSize: "14px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handleSetCredentials}
              disabled={processing}
              style={{
                padding: "10px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: processing ? "not-allowed" : "pointer",
              }}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
