import { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";

const API_BASE_URL =
  "https://167f-2405-201-3009-d88a-74a2-fd86-ac31-dede.ngrok-free.app";

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
      // await axios.get(`${API_BASE_URL}/automation`, axiosConfig);
      await streamAPIResponse(`${API_BASE_URL}/automation`, setMessage);
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

const streamAPIResponse = async (url, setMessage) => {
  try {
    const response = await fetch(url, axiosConfig);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    setMessage("Processing...");

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder
        .decode(value, { stream: true })
        .replace("data: ", "");

      setMessage(chunk);
    }
  } catch (error) {
    setMessage(`Error: ${error.message}`);
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
        setMessage("Running scheduled tasks...");
        await streamAPIResponse(`${API_BASE_URL}/scrape`, setMessage);
        setMessage("Scraping completed. Fetching output file...");

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
      setMessage("File uploaded successfully! Scraping started...");

      await streamAPIResponse(`${API_BASE_URL}/scrape`, setMessage);
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
      setShowCredentialsForm(false);
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
    <div className="bg_main">
      <div className="smell">
        <h2>API Automation Dashboard</h2>
        <div>
          <label htmlFor="file-upload">
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
        {message && <p>{message}</p>}
        <div>
          {fileUrl && (
            <a href={fileUrl} download="output.xlsx">
              <button>Download Output File</button>
            </a>
          )}
          {fileUrl1 && (
            <a href={fileUrl1} download="input.xlsx">
              <button>Download Input File</button>
            </a>
          )}
        </div>
        {!processing && (
          <div>
            <button onClick={handleClearCredentials} disabled={processing}>
              Clear Credentials
            </button>
          </div>
        )}
        {showCredentialsForm && (
          <div className="smell2">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSetCredentials} disabled={processing}>
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
