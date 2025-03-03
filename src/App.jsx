import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  "https://febb-2405-201-3009-d88a-8c80-756c-ee71-b938.ngrok-free.app";

const axiosConfig = {
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
};

const retryAutomation = async (setMessage) => {
  let attempts = 0;
  while (attempts < 5) {
    try {
      setMessage(
        attempts === 0
          ? "Running automation..."
          : "Automation failed. Retrying..."
      );
      await axios.get(`${API_BASE_URL}/automation`, axiosConfig);
      setMessage("Automation completed successfully!");
      return true;
    } catch (error) {
      console.log(error);
      attempts++;
      if (attempts >= 5) {
        setMessage("Automation failed after 5 attempts.");
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

const Dashboard = () => {
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [fileUrl1, setFileUrl1] = useState(null);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        console.log("Running scheduled tasks...");
        await axios.get(`${API_BASE_URL}/scrape`, axiosConfig);
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
          await retryAutomation(setMessage);
          setMessage("Automation completed. Fetching updated output file...");
          const outputResponse = await axios.get(`${API_BASE_URL}/outputfile`, {
            ...axiosConfig,
            responseType: "blob",
          });
          const url = window.URL.createObjectURL(
            new Blob([outputResponse.data])
          );
          setFileUrl(url);
          setMessage("Fetched output file, fetching input file!");
          const inputFileResponse = await axios.get(
            `${API_BASE_URL}/inputfile`,
            {
              ...axiosConfig,
              responseType: "blob",
            }
          );
          const url1 = window.URL.createObjectURL(
            new Blob([inputFileResponse.data])
          );
          setFileUrl1(url1);
          setMessage("Process completed successfully");
        }
      } catch (error) {
        console.error("Error in scheduled tasks:", error);
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
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
      await axios.post(`${API_BASE_URL}/upload`, formData, axiosConfig);
      setMessage("File uploaded successfully! Scraping in progress...");
      await axios.get(`${API_BASE_URL}/scrape`, axiosConfig);
      setMessage("Scraping completed. Fetching output file...");
      const outputResponse = await axios.get(`${API_BASE_URL}/outputfile`, {
        ...axiosConfig,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([outputResponse.data]));
      setFileUrl(url);
      setMessage("Output file ready! Checking Amazon credentials...");
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
        await retryAutomation(setMessage);
        setMessage("Automation completed. Fetching updated output file...");
        const outputResponse = await axios.get(`${API_BASE_URL}/outputfile`, {
          ...axiosConfig,
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([outputResponse.data]));
        setFileUrl(url);
        setMessage("Fetched output file, fetching input file!");
        const inputFileResponse = await axios.get(`${API_BASE_URL}/inputfile`, {
          ...axiosConfig,
          responseType: "blob",
        });
        const url1 = window.URL.createObjectURL(
          new Blob([inputFileResponse.data])
        );
        setFileUrl1(url1);
        setMessage("Process completed successfully");
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
      await retryAutomation(setMessage);
      setMessage("Automation completed. Fetching updated output file...");
      const outputResponse = await axios.get(`${API_BASE_URL}/outputfile`, {
        ...axiosConfig,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([outputResponse.data]));
      setFileUrl(url);
      setMessage("Fetched output file, fetching input file!");
      const inputFileResponse = await axios.get(`${API_BASE_URL}/inputfile`, {
        ...axiosConfig,
        responseType: "blob",
      });
      const url1 = window.URL.createObjectURL(
        new Blob([inputFileResponse.data])
      );
      setFileUrl1(url1);
      setMessage("Process completed successfully");
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleClearCredentials = async () => {
    setProcessing(true);
    setMessage("Clearing credentials...");
    try {
      await axios.get(`${API_BASE_URL}/clear_amazon_credentials`, axiosConfig);
      setMessage("Amazon credentials cleared successfully!");
    } catch (error) {
      setMessage(
        `Error clearing credentials: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setProcessing(false);
    }
  };

  const LoadingDots = () => {
    return (
      <span style={{ display: "inline-flex" }}>
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
        <style>
          {`
            .dot {
              font-size: 24px;
              font-weight: bold;
              animation: jump 1.5s infinite;
            }
  
            .dot:nth-child(1) { animation-delay: 0s; }
            .dot:nth-child(2) { animation-delay: 0.2s; }
            .dot:nth-child(3) { animation-delay: 0.4s; }
  
            @keyframes jump {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}
        </style>
      </span>
    );
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
        color: "black",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          width: "600px",
          border: "2px solid red",
          borderRadius: "10px",
          paddingBottom: "40px",
        }}
      >
        <h2>API Automation Dashboard</h2>
        <div>
          <label
            htmlFor="file-upload"
            style={{
              display: "inline-block",
              padding: "8px 20px",
              backgroundColor: processing ? "#888" : "#4CAF50",
              color: "white",
              borderRadius: "4px",
              cursor: processing ? "not-allowed" : "pointer",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {processing ? "Processing" : "Upload File"}{" "}
            {processing && <LoadingDots />}
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={processing}
            style={{ display: "none" }} // Hide default file input
          />
        </div>
        {message && (
          <p style={{ fontStyle: "italic", fontWeight: "bold" }}>{message}</p>
        )}
        <div style={{ margin: "10px 0px" }}>
          {fileUrl && (
            <a
              href={fileUrl}
              download="output.xlsx"
              style={{ margin: "0px 10px" }}
            >
              <button style={{ backgroundColor: "#ccc" }}>
                Download Output File
              </button>
            </a>
          )}
          {fileUrl1 && (
            <a href={fileUrl1} download="input.xlsx">
              <button style={{ backgroundColor: "#ccc" }}>
                Download Input File
              </button>
            </a>
          )}
        </div>
        <div>
          <button
            onClick={handleClearCredentials}
            disabled={processing}
            style={{
              padding: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: processing ? "not-allowed" : "pointer",
              marginTop: "20px",
            }}
          >
            Clear Credentials
          </button>
        </div>
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
