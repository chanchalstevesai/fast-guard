
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Container, Row, Col } from "react-bootstrap";
import { CheckToken, generateTokenData, getTokenData } from "../../Networking/APIs/TokenApi";
import ScopesBox from "./ScopesBox";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const TokenGenerator = () => {
  const [showModal, setShowModal] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [authorization, setAuthorization] = useState("");
  const [tokenStatusMessage, setTokenStatusMessage] = useState("");
  const [tokenStatusType, setTokenStatusType] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTokenDataAndCheck = async () => {
      try {
        const data = await getTokenData();
        if (data) {
          setClientId(data.client_id || "");
          setClientSecret(data.client_secret || "");
        }

        const checkResponse = await CheckToken()
        setTokenStatusMessage(checkResponse.message);
        setTokenStatusType(checkResponse.status);

      } catch (error) {
        console.error("Error fetching token data or checking token:", error);

        const backendMessage =
          error.response?.data?.message || error.message || "Unknown error occurred";

        setTokenStatusMessage(backendMessage);
        setTokenStatusType("error");
      }
    };

    fetchTokenDataAndCheck();
  }, []);

  const handleGenerateToken = async () => {
    const isConfirmed = window.confirm("Are you sure want to generate Token?");
    if (!isConfirmed) return;

    try {
      setLoading(true);
      const result = await generateTokenData({
        clientId,
        clientSecret,
        authorizationCode: authorization
      });
      setClientId(result.client_id || "");
      setClientSecret(result.client_secret || "");
      setAuthorization("");
      console.log(result);
    }
    catch (error) {
      console.log("Full error response:", error.response);
      const errorMessage = error?.response?.data?.error || error.message || "Something went wrong!";
      alert(errorMessage);

      setAuthorization("");
    }
    finally {
      setLoading(false);

    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>

          {tokenStatusMessage && (
            <div
              className={`mb-3 p-2 rounded d-flex align-items-center gap-2 ${tokenStatusType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
            >

              {tokenStatusType === "success" ? (
                <FaCheckCircle size={20} />
              ) : (
                <FaExclamationTriangle size={20} />
              )}


              <span>{tokenStatusMessage}</span>
            </div>
          )}

          <div className="p-4 border rounded shadow-sm bg-light">
            <h4 className="text-center mb-4">Token Generator</h4>
            <Form.Group className="mb-3">
              <Form.Label className="px-2">Client ID</Form.Label>
              <Form.Control type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="px-2">Client Secret</Form.Label>
              <Form.Control type="text" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} />
            </Form.Group>

            <div className="mb-3 text-start">
              <Button variant="link" onClick={() => setShowModal(true)} className="p-0">
                Instructions to generate authorization code
              </Button>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="px-2">Authorization Code</Form.Label>
              <Form.Control type="text" placeholder="Enter Authorization Code from Zoho" value={authorization} onChange={(e) => setAuthorization(e.target.value)} required />
            </Form.Group>

            <div className="text-start">
              <Button variant="primary" className="px-4" onClick={handleGenerateToken}>
                Generate Token
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Modal
        show={showModal}
        centered
        onHide={() => setShowModal(false)}
        dialogClassName="!max-w-[1000px] !mx-auto flex justify-center"
      >
        <Modal.Header closeButton>
          <Modal.Title>Instructions to Generate Token</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="font-semibold mb-2">
            Steps to Generate Authorization Code (Zoho Self Client)
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Click the link below:
              <br />
              <a
                href={`https://api-console.zoho.com/client/${clientId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all"
              >
                {`https://api-console.zoho.com/client/${clientId}`}
              </a>

            </li>
            <li>
              Click on “Self Client”
            </li>
            <li>
              In the Generate Code section, do the following:
              <p> Add the following Scopes:</p>
              <ScopesBox />
              <p>Time Duration: 10 minutes</p>
              <p> * Scope Description: Text</p>
            </li>
            <li>Click Create.</li>
            <li>Once the code is generated, copy the AUTHORIZATION CODE shown on the screen.</li>
            <li>Paste the Authorization Code into the required input field in your application or tool.</li>
            <li>Finally, click on “Generate” to complete the process.</li>
          </ol>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>

  );
};

export default TokenGenerator;



