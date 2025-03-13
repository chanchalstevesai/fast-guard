import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./style.css";

const API_BASE_URL =
  "https://86da-2405-201-3009-d88a-ece6-66b1-7c1c-fbb9.ngrok-free.app";

const axiosConfig = {
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
};

const retryAutomation = async (setMessage, setOtpRequested, otpSubmitted) => {
  let attempts = 0;
  while (attempts < 5) {
    try {
      setMessage(
        attempts === 0
          ? "Running automation..."
          : "Automation failed. Retrying..."
      );
      await streamAPIResponse(
        `${API_BASE_URL}/automation`,
        setMessage,
        setOtpRequested,
        otpSubmitted
      );
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

const streamAPIResponse = async (
  url,
  setMessage,
  setOtpRequested,
  otpSubmitted
) => {
  try {
    const response = await fetch(url, axiosConfig);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    setMessage("Processing...");
    let waitingForOTP = false;
    const MAX_WAIT_TIME = 60;
    let elapsedTime = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder
        .decode(value, { stream: true })
        .replace("data: ", "");

      if (chunk.includes("Waiting for OTP submission via API...")) {
        if (!waitingForOTP) {
          setMessage("Please Enter OTP sent to your device");
          setOtpRequested(true);
          waitingForOTP = true;
        }

        while (!otpSubmitted.current && elapsedTime < MAX_WAIT_TIME) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          elapsedTime++;
        }

        if (!otpSubmitted.current) {
          setOtpRequested(false);
          setMessage("OTP submission timeout. Please try again.");
          return;
        }
        setMessage("OTP Submitted, Resuming automation...");
      } else {
        setMessage(chunk);
      }
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
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const otpSubmitted = useRef(false);
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setMessage("Running scheduled tasks...");
        setProcessing(true);
        await streamAPIResponse(`${API_BASE_URL}/scrape`, setMessage);
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
          await retryAutomation(setMessage, setOtpRequested, otpSubmitted);
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
      } finally {
        setProcessing(false);
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
      setMessage("Getting email, Please wait...");

      const emailResponse = await axios.get(
        `${API_BASE_URL}/get_email`,
        axiosConfig
      );

      if (emailResponse.data.message == "No email stored") {
        setShowEmailForm(true);
        setMessage("No email found. Please enter your email.");
        return;
      }

      await handleAutomation();
    } catch (error) {
      setMessage(
        `Error: ${error.response?.data?.error || "An error occurred."}`
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleSetEmail = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }
    setProcessing(true);
    setMessage("Saving email...");

    try {
      await axios.post(`${API_BASE_URL}/set_email`, { email }, axiosConfig);
      setShowEmailForm(false);
      setMessage("Email saved! Proceeding with tasks...");
      await handleAutomation();
    } catch (error) {
      setMessage(
        `Error saving email: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleAutomation = async () => {
    setProcessing(true);

    try {
      await streamAPIResponse(`${API_BASE_URL}/scrape`, setMessage);

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
        await retryAutomation(setMessage, setOtpRequested, otpSubmitted);
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
      setShowCredentialsForm(false);
      await retryAutomation(setMessage, setOtpRequested, otpSubmitted);

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

  const handleOtpSubmit = async () => {
    if (!otp) {
      setMessage("Please Enter OTP");
      return;
    }

    setMessage("Submitting OTP, Please wait...");

    try {
      await axios.post(`${API_BASE_URL}/submit_otp`, { otp }, axiosConfig);
      setOtp("");
      setOtpRequested(false);
      otpSubmitted.current = true;
    } catch (error) {
      setMessage(
        `Wrong OTP Entered: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const handleClearEmail = async () => {
    setProcessing(true);
    setMessage("Clearing emails...");
    try {
      await axios.get(`${API_BASE_URL}/clear_email`, axiosConfig);
      setMessage("Email cleared successfully!");
    } catch (error) {
      setMessage(
        `Error clearing email: ${error.response?.data?.error || error.message}`
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
        <h2>Amazon Automation Dashboard</h2>
        <div>
          <label htmlFor="file-upload">
            {processing ? "Processing" : "Upload File"}
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

            <button onClick={handleClearEmail} disabled={processing}>
              Clear Email
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
        {showEmailForm && (
          <div className="smell2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSetEmail} disabled={processing}>
              Submit Email
            </button>
          </div>
        )}
        {otpRequested && (
          <div className="smell2">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleOtpSubmit}>Submit OTP</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
