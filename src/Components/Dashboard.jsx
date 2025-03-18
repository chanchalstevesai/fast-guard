import { useEffect, useRef, useState } from "react";
import {
  api,
  streamAPIResponse,
  retryAutomation,
} from "../Services/ApiService";
import "../style.css";
import Loader from "../LoaderComponent/Loader";

const Dashboard = () => {
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [inputFileUrl, setInputFileUrl] = useState(null);
  const [outputFileUrl, setOutputFileUrl] = useState(null);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [amazonCredentials, setAmazonCredentials] = useState({
    username: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const otpSubmitted = useRef(false);
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      setProcessing(true);
      setMessage("Running scheduled tasks...");
      try {
        const inputFileResponse = await api.get("/inputfle", {
          responseType: "blob",
        });

        if (inputFileResponse.status !== 200) {
          setMessage("Failed to retrieve file, scheduled task stopped");
          return;
        }

        setMessage("File retrieved successfully, checking email...");
        await checkRequirements();
      } catch (error) {
        console.error("Error in scheduled tasks:", error);
      } finally {
        setProcessing(false);
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAmazonCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const convertBlobToURL = (blob) => {
    return window.URL.createObjectURL(new Blob([blob]));
  };

  // Drag-and-Drop Handlers
  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default behavior (opening file in browser)
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileUpload = async (uploadedfile) => {
    let file;

    if (uploadedfile.target) {
      // get file when uploaded through an input
      file = uploadedfile.target.files[0];
    } else {
      // get file when using drag-and-drop file
      file = uploadedfile;
    }

    if (!file) return;

    setProcessing(true);
    setMessage("Uploading file, please wait...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/upload", formData);
      setMessage("File saved, checking email...");

      await checkRequirements();
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const checkRequirements = async () => {
    setProcessing(true);

    try {
      const emailData = await api.get("/get_email");

      if (
        emailData.message == "No email stored" &&
        emailData.status === "error"
      ) {
        setMessage("No email found, please enter your email");
        setShowEmailForm(true);
        return;
      }

      setMessage("Email found, checking amazon credentails...");

      const credentailsData = await api.get("/get_amazon_credentials");

      if (
        credentailsData.message === "No Amazon credentials stored" &&
        credentailsData.status === "error"
      ) {
        setMessage(
          "Amazon credentials not found, Please enter both username and password."
        );
        setShowCredentialsForm(true);
        return;
      }

      setMessage("Credentials found, running scraping...");
      await handleAutomationtask();
    } catch (error) {
      setMessage(`${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSetEmail = async () => {
    if (!email) return;

    setProcessing(true);
    setMessage("Saving email...");
    try {
      await api.post("/set_email", { email });
      setShowEmailForm(false);
      setEmail("");
      setMessage("Email saved! Checking amazon credentails...");

      const data = await api.get("/get_amazon_credentials");

      if (
        data.message === "No Amazon credentials stored" &&
        data.status === "error"
      ) {
        setMessage("Amazon credentials not found, Please enter them below.");
        setShowCredentialsForm(true);
        return;
      }

      setMessage("Credentials found, running scraping...");

      await handleAutomationtask();
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleAutomationtask = async () => {
    setProcessing(true);
    try {
      await streamAPIResponse("/scrape", setMessage);
      setMessage("Scraping completed, fetching output file...");
      setOutputFileUrl(null);
      setInputFileUrl(null);

      const outputResponse = await api.get("/outputfile", {
        responseType: "blob",
      });
      const outputFileUrl = convertBlobToURL(outputResponse);
      setOutputFileUrl(outputFileUrl);
      setMessage("Output file is ready! automation started...");

      const automationResponse = await retryAutomation(
        "/automation",
        setMessage,
        setOtpRequested,
        otpSubmitted
      );
      setMessage("Fetching updated output file...");
      const newOutputResponse = await api.get("/outputfile", {
        responseType: "blob",
      });
      const newOutputFileUrl = convertBlobToURL(newOutputResponse);
      setOutputFileUrl(newOutputFileUrl);
      setMessage("Fetched output file, fetching input file!");

      const inputFileResponse = await api.get("/inputfile", {
        responseType: "blob",
      });
      const inputFileUrl = convertBlobToURL(inputFileResponse);
      setInputFileUrl(inputFileUrl);

      setMessage(
        automationResponse.message || "Process completed successfully"
      );
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSetCredentials = async () => {
    if (!amazonCredentials.username || !amazonCredentials.password) return;

    setProcessing(true);
    setMessage("Saving credentials...");
    try {
      await api.post("/set_amazon_credentials", {
        username: amazonCredentials.username,
        password: amazonCredentials.password,
      });
      setMessage("Credentials saved! Running scraping...");
      setAmazonCredentials({ username: "", password: "" });
      setShowCredentialsForm(false);

      await handleAutomationtask();
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleClearCredentials = async () => {
    setProcessing(true);
    setMessage("Clearing credentials...");
    try {
      await api.get("/clear_amazon_credentials");
      setMessage("Amazon credentials cleared successfully!");
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp) return;

    setMessage("Submitting OTP, Please wait...");

    try {
      await api.post("/submit_otp", { otp });
      setOtp("");
      setOtpRequested(false);
      otpSubmitted.current = true;
    } catch (error) {
      setMessage(`Wrong OTP Entered: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleClearEmail = async () => {
    setProcessing(true);
    setMessage("Clearing emails...");
    try {
      await api.get("/clear_email");
      setMessage("Email cleared successfully!");
    } catch (error) {
      setMessage(`Error clearing email: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg_main">
      <div className="smell">
        <h2>Amazon Automation Dashboard</h2>
        <div
          className="file-upload-div"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="drag_drop">
            <img src="./files.svg" alt="" />
            <p>Drag & Drop your file here</p>
          </div>
          <p className="drag-and-drop-line">OR</p>
          <div>
            <label htmlFor="file-upload">
              {processing ? "Processing" : "Browse Files"}
              {processing && <Loader />}
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={processing}
              style={{ display: "none" }} // Hide default file input
            />
          </div>
        </div>
        {message && <p>{message}</p>}
        <div>
          {outputFileUrl && (
            <a href={outputFileUrl} download="output.xlsx">
              <button>Download Output File</button>
            </a>
          )}
          {inputFileUrl && (
            <a href={inputFileUrl} download="input.xlsx">
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
              name="username"
              value={amazonCredentials.username}
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={amazonCredentials.password}
              onChange={handleChange}
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
