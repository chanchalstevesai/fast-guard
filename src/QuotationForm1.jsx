import React, { useState, useRef, useEffect } from "react";
import logo from "../Images/logo.png";
import { FaUpload } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { submitForm } from "./Networking/APIs/ResgistrationFormApi";
import Loader from "./Component/Loader";
import { Country, State, City } from "country-state-city";

const initialFormData = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  country: "",
  state: "",
  zipCode: "",
  phone: "",
  resume: null,
  howHeard: "",
  onCallAcknowledge: "",
  hasSmartphone: "",
  canRespondAlerts: "",
  hasSecurityLicense: "",
  canPassBackgroundCheck: "",
  hasReliableTransport: "",
  unarmed: "",
  armed: "",
  english_language: "",
  privacyAccepted: false,
  gender: "",
  race: "",
  veteranStatus: "",
  disabilityStatus: "",
  fullName: "",
  images: [],
  imagePreviews: [],
  license_number: "",
  expiration_date: "",
  security_guard_license: { files: [], previews: [], base64Map: {} },
  driver_license: { files: [], previews: [], base64Map: {} },
  social_security_card: { files: [], previews: [], base64Map: {} },
  firewatch_certificate: { files: [], previews: [], base64Map: {} },
};

const QuotationForm1 = () => {
  // Hooks
  const dispatch = useDispatch();
  const resumeInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [showResumeError, setShowResumeError] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const [showDefinitions, setShowDefinitions] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);
  console.log(cities, selectedCity, selectedState, "cities");

  useEffect(() => {
    const allCountries = Country.getAllCountries();

    // Filter out Dominican Republic and Puerto Rico
    const filtered = allCountries.filter(
      (c) => c.name !== "Dominican Republic" && c.name !== "Puerto Rico"
    );

    setCountries(filtered);
  }, []);

  const refs = {
    security_guard_license: useRef(null),
    driver_license: useRef(null),
    social_security_card: useRef(null),
    firewatch_certificate: useRef(null),
  };

  const toggleDefinitions = (e) => {
    e.preventDefault();
    setShowDefinitions(!showDefinitions);
  };

  // Redux
  const { loading } = useSelector((state) => state.formSlice);

  // States
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "veteranStatusOption") {
        setFormData((prev) => ({
          ...prev,
          veteranStatus: checked
            ? value
            : prev.veteranStatus === value
            ? ""
            : prev.veteranStatus,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum size is 5MB.");
        e.target.value = null;
        setFormData((prev) => ({ ...prev, resume: null }));
        return;
      }
      const allowedExtensions = /(\.doc|\.docx|\.rtf|\.pdf|\.txt|\.html)$/i;
      if (!allowedExtensions.exec(file.name)) {
        alert(
          "Invalid file type. Allowed formats: DOC, DOCX, RTF, PDF, TXT, HTML."
        );
        e.target.value = null;
        setFormData((prev) => ({ ...prev, resume: null }));
        return;
      }
      setFormData((prev) => ({ ...prev, resume: file }));
    } else {
      setFormData((prev) => ({ ...prev, resume: null }));
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleCodeChange = (e) => {
    setSelectedCode(e.target.value);
  };

  const handleCountryChange = (e) => {
    const countryIsoCode = e.target.value;
    setSelectedCountry(countryIsoCode);

    const selectedCountryData = countries.find(
      (c) => c.isoCode === countryIsoCode
    );
    if (selectedCountryData) {
      setSelectedCode(`+${selectedCountryData.phonecode}`);
    } else {
      setSelectedCode("");
    }

    const statesList = State.getStatesOfCountry(countryIsoCode);
    console.log(statesList,"statelist");
    
    setStates(statesList);
    setSelectedState("");
    setCities([]);
    setSelectedCity("");
  };

  // State change
  const handleStateChange = (e) => {
    const stateIsoCode = e.target.value;
    setSelectedState(stateIsoCode);

    // Load cities for the selected state
    const citiesList = City.getCitiesOfState(selectedCountry, stateIsoCode);
    setCities(citiesList);
    setSelectedCity("");
  };

  // City change
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.resume) {
      alert("Resume file is required.");
      return;
    }
    const countryName =
      countries.find((c) => c.isoCode === selectedCountry)?.name || "";
    const stateName =
      states.find((s) => s.isoCode === selectedState)?.name || "";
    const cityName = cities.find((c) => c.name === selectedCity)?.name || "";

    const Data = {
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      street_address: formData.address,
      city: cityName,
      country: countryName,
      state: stateName,
      zip_code: formData.zipCode,
      cell_phone: `${selectedCode}${formData.phone}`,
      referral: formData.howHeard,
      on_call: formData.onCallAcknowledge,
      smartphone: formData.hasSmartphone,
      job_alerts: formData.canRespondAlerts,
      license: formData.hasSecurityLicense,
      background: formData.canPassBackgroundCheck,
      transport: formData.hasReliableTransport,
      unarmed: formData.unarmed,
      armed: formData.armed,
      english_language: formData.english_language,
      gender: formData.gender,
      ethnicity: formData.race,
      disability_status: formData.disabilityStatus,
      full_name: formData.fullName,
      privacy_consent: formData.privacyAccepted,
      veteran_status: formData.veteranStatus,
      expiration_date: formData.expiration_date,
      license_number: formData.license_number,
      security_guard_license:
        Object.values(formData.security_guard_license.base64Map)[0] || null,
      driver_license:
        Object.values(formData.driver_license.base64Map)[0] || null,
      social_security_card:
        Object.values(formData.social_security_card.base64Map)[0] || null,
      firewatch_certificate:
        Object.values(formData.firewatch_certificate.base64Map)[0] || null,
    };
    console.log(Data, "DataData");

    const formPayload = new FormData();

    for (const key in Data) {
      if (Data[key] !== undefined && Data[key] !== null) {
        formPayload.append(key, Data[key]);
      }
    }

    if (formData.resume) {
      formPayload.append("resume", formData.resume);
    }
    if (formData.imageBase64Map) {
      formPayload.append("images", JSON.stringify(formData.imageBase64Map));
    }
    try {
      const response = await dispatch(submitForm(formPayload));
      console.log(response, "response");

      if (response.payload.msg == "data inserted") {
        toast.success("Form submitted successfully!");
        handleCancel();

        setSelectedCountry("");
        setSelectedState("");
        console.log("Server response:", response.data);
      } else if (response.payload.error) {
        toast.error(response.payload.error);
      }
    } catch (error) {
      toast.error(response.payload.error);
      console.error("Submission error:", response.payload.error);
    }
  };

  const handleImageUpload = async (e, documentKey = "headshot_image") => {
    const files = Array.from(e.target.files);
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

    const validFiles = files.filter((file) => file.size <= maxSizeInBytes);
    const oversizedFiles = files.filter((file) => file.size > maxSizeInBytes);

    if (oversizedFiles.length > 0) {
      alert(
        `Some files were skipped because they exceed the 5MB size limit:\n${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
    }

    if (validFiles.length === 0) return;

    const previews = validFiles.map((file) => URL.createObjectURL(file));
    const base64Images = {};

    await Promise.all(
      validFiles.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            base64Images[file.name] = reader.result;
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );

    if (documentKey === "headshot_image") {
      setFormData((prev) => ({
        ...prev,
        images: validFiles,
        imagePreviews: previews,
        imageBase64Map: base64Images,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [documentKey]: {
          files: validFiles,
          previews,
          base64Map: base64Images,
        },
      }));
    }

    toast.success(
      `${validFiles.length} image(s) uploaded for ${documentKey.replace(
        /_/g,
        " "
      )}`
    );
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="d-flex justify-content-end mb-3 w-100 ">
        <Link to="/login" className="btn btn-outline-primary me-5">
          Login
        </Link>
      </div>
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        {!loading ? (
          <form
            onSubmit={handleSubmit}
            className="py-5 px-4 shadow bg-white rounded"
            style={{ width: "80vw", maxWidth: "1000px" }}
          >
            <header className="mb-5">
              <a
                href="/"
                className="d-inline-block"
                style={{ maxWidth: "232px" }}
              >
                <img src={logo} alt="Logo" className="img-fluid" />
              </a>
            </header>
            <label className="form-label text-dark fw-medium">
              Security Guard Armed/Unarmed
            </label>

            <div className="row mb-3">
              <div className="col-md-12 mb-3">
                <label
                  htmlFor="email"
                  className="form-label text-danger fw-medium small"
                >
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control border-danger"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="card p-3 mb-4">
              <h6 className="mb-1 fw-semibold">
                Upload Your Resume / CV{" "}
                <span className="text-danger">(Required)</span>
              </h6>
              <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
                Documents must be in one of the following formats:{" "}
                <strong>DOC, DOCX, RTF, PDF</strong>, <strong>TXT</strong> and{" "}
                <strong>HTML</strong> and less than <strong>5MB</strong>.
                {formData.resume && (
                  <span className="d-block text-success mt-1">
                    Selected: {formData.resume.name}
                  </span>
                )}
              </p>

              <input
                type="file"
                ref={resumeInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".doc,.docx,.rtf,.pdf,.txt,.html"
              />

              {showResumeError && (
                <p className="text-danger mt-2">
                  Please upload your resume. This field is required.
                </p>
              )}
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-light border d-flex align-items-center"
                  onClick={() => resumeInputRef.current?.click()}
                >
                  <FaUpload className="me-2" />
                  My computer
                </button>
              </div>
            </div>

            <div className="col-md-12 d-flex justify-content-start">
              <div className="col-md-3 pb-3 mr-5">
                <label htmlFor="license_number" className="form-label">
                  License Number<span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  id="license_number"
                  name="license_number"
                  className="form-control border-danger"
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3 pb-3">
                <label htmlFor="expiration_date" className="form-label">
                  Expiration Date<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="expiration_date"
                  name="expiration_date"
                  className="form-control border-danger"
                  value={formData.expiration_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="card p-3 mb-4">
              <h6 className="mb-1 fw-semibold">
                Documents & Credentials: (Please upload each of the documents /
                images requested below if you have the certifications. Failing
                to do so may delay or deny processing of your application)
              </h6>

              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImageUpload(e)}
              />

              {Object.entries(refs).map(([key, ref]) => (
                <input
                  key={key}
                  type="file"
                  accept="image/*"
                  ref={ref}
                  style={{ display: "none" }}
                  onChange={(e) => handleImageUpload(e, key)}
                />
              ))}

              <div className="d-flex flex-wrap gap-3 mt-2">
                <div className="d-flex flex-column">
                  <button
                    type="button"
                    className="btn btn-light border d-flex align-items-center"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <FaUpload className="me-2" />
                    Upload HeadShot Image
                  </button>
                  {formData.images && formData.images.length > 0 && (
                    <span
                      className="d-block text-success mt-1"
                      style={{ fontSize: "12px" }}
                    >
                      Selected: {formData.images[0].name}
                    </span>
                  )}
                </div>

                <div className="d-flex flex-column">
                  <button
                    type="button"
                    className="btn btn-light border d-flex align-items-center"
                    onClick={() => refs.security_guard_license.current?.click()}
                  >
                    <FaUpload className="me-2" />
                    Upload Security Guard License
                  </button>
                  {formData.security_guard_license &&
                    formData.security_guard_license.files.length > 0 && (
                      <span
                        className="d-block text-success mt-1"
                        style={{ fontSize: "12px" }}
                      >
                        Selected:{" "}
                        {formData.security_guard_license.files[0].name}
                      </span>
                    )}
                </div>

                <div className="d-flex flex-column">
                  <button
                    type="button"
                    className="btn btn-light border d-flex align-items-center"
                    onClick={() => refs.driver_license.current?.click()}
                  >
                    <FaUpload className="me-2" />
                    Upload Driver License
                  </button>
                  {formData.driver_license &&
                    formData.driver_license.files.length > 0 && (
                      <span
                        className="d-block text-success mt-1"
                        style={{ fontSize: "12px" }}
                      >
                        Selected: {formData.driver_license.files[0].name}
                      </span>
                    )}
                </div>

                <div className="d-flex flex-column">
                  <button
                    type="button"
                    className="btn btn-light border d-flex align-items-center"
                    onClick={() => refs.firewatch_certificate.current?.click()}
                  >
                    <FaUpload className="me-2" />
                    Upload Firewatch Certificate
                  </button>
                  {formData.firewatch_certificate &&
                    formData.firewatch_certificate.files.length > 0 && (
                      <span
                        className="d-block text-success mt-1"
                        style={{ fontSize: "12px" }}
                      >
                        Selected: {formData.firewatch_certificate.files[0].name}
                      </span>
                    )}
                </div>
              </div>
            </div>

            <div className="card p-3 mb-4">
              <h6 className="fw-bold">Contact Information</h6>
              <div className="row g-3 mt-2">
                <div className="col-md-3">
                  <label htmlFor="firstName" className="form-label">
                    First Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-control border-danger"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="lastName" className="form-label">
                    Last Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-control border-danger"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="address" className="form-label">
                    Street Address<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="form-control border-danger"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="country" className="form-label">
                    Country<span className="text-danger">*</span>
                  </label>
                  <select
                    id="country"
                    name="country"
                    className="form-select border-danger"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div className="col-md-3">
                  <label htmlFor="state" className="form-label">
                    State<span className="text-danger">*</span>
                  </label>
                  <select
                    id="state"
                    name="state"
                    className="form-select border-danger"
                    value={selectedState}
                    onChange={handleStateChange}
                    required
                    disabled={!selectedCountry}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="col-md-3">
                  <label htmlFor="city" className="form-label">
                    City<span className="text-danger">*</span>
                  </label>
                  <select
                    id="city"
                    name="city"
                    className="form-select border-danger"
                    value={selectedCity}
                    onChange={handleCityChange}
                    required
                    disabled={!selectedState}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="zipCode" className="form-label">
                    Zip Code<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    className="form-control border-danger"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="phone" className="form-label">
                    Cell Phone<span className="text-danger">*</span>
                  </label>
                  <div className="d-flex">
                    {/* Country Code */}
                    <div className="col-md-4">
                      <select
                        id="countryCode"
                        name="countryCode"
                        className="form-control border-danger"
                        value={selectedCode}
                        onChange={handleCodeChange}
                        required
                        disabled
                      >
                        <option value="">Code</option>
                        {countries.map((country) => (
                          <option
                            key={country.isoCode}
                            value={`+${country.phonecode}`}
                          >
                            (+{country.phonecode})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Country Name */}
                    <div className="col-md-8 mx-1">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-control border-danger"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-3"></div>
              </div>
            </div>

            <div className="card p-3 mb-4">
              <h6 className="fw-bold">Referral Information</h6>
              <div className="row g-3 mt-2">
                <label
                  htmlFor="howHeard"
                  className="form-label text-danger fw-medium small"
                >
                  How did you hear about us? *
                </label>
                <select
                  id="howHeard"
                  name="howHeard"
                  className="form-select border-danger"
                  value={formData.howHeard}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select...</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Employee Referral">Employee Referral</option>
                  <option value="Job Board">Job Board</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Website">Our Website</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="card p-3 mb-4">
              <h6 className="fw-bold">Additional Information</h6>
              {[
                {
                  label: "Do you acknowledge this position is ON CALL?*",
                  name: "onCallAcknowledge",
                },
                {
                  label: "Do you currently own and use a smartphone?*",
                  name: "hasSmartphone",
                },
                {
                  label:
                    "Are you available and willing to promptly respond to job alerts, specifically within a 4-hour timeframe?*",
                  name: "canRespondAlerts",
                },
                {
                  label:
                    "Do you hold a valid security guard license as required for professional security work?*",
                  name: "hasSecurityLicense",
                },
                {
                  label:
                    "Are you eligible to successfully pass a comprehensive background check as part of the employment screening process?*",
                  name: "canPassBackgroundCheck",
                },
                {
                  label: "Do you have a reliable mode of transportation?*",
                  name: "hasReliableTransport",
                },
                {
                  label:
                    "Do you hold a valid Unarmed security guard license as required for professional security work?*",
                  name: "unarmed",
                },
                {
                  label:
                    "Do you hold a valid Armed security guard license as required for professional security work?*",
                  name: "armed",
                },
                {
                  label: "Are you proficient in speaking English?*",
                  name: "english_language",
                },
              ].map((q) => (
                <div className="pb-3" key={q.name}>
                  <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                    {q.label}
                  </p>
                  <select
                    name={q.name}
                    id={q.name}
                    className="form-select border-danger"
                    value={formData[q.name]}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="card p-3 mb-4">
              <h6 className="fw-bold">Privacy Policy</h6>
              <p>
                By clicking the checkbox below, you agree to the terms of our
                privacy policy.
              </p>

              <button
                type="button"
                className="btn btn-link text-primary d-block mb-2 p-0 text-start"
                onClick={openModal}
              >
                Click here to read our Privacy Policy
              </button>

              {showModal && (
                <div
                  className="modal-backdrop-blur"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backdropFilter: "blur(6px)",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    zIndex: 1040,
                  }}
                  onClick={closeModal}
                >
                  <div
                    className="modal show fade d-block"
                    tabIndex="-1"
                    role="dialog"
                  >
                    <div className="modal-dialog modal-lg" role="document">
                      <div className="modal-content">
                        <div
                          className="modal-body"
                          style={{
                            maxHeight: "80vh",
                            overflowY: "auto",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        >
                          <div classname="modal_cnt">
                            <h3>
                              Fast Guard Service - Candidate Privacy Notice
                            </h3>
                            <p>
                              Fast Guard Service is committed to respecting your
                              online privacy and recognize your need for
                              appropriate protection and management of any
                              personally identifiable information ("Personal
                              Information") you share with us.
                            </p>
                            <p>
                              Fast Guard Service is a “data controller”. This
                              means that we are responsible for deciding how we
                              hold and use personal information about you. This
                              privacy notice makes you aware of how and why your
                              personal data will be used, namely for the
                              purposes of the Fast Guard Service employment
                              recruitment process, and how long it will usually
                              be retained for. It provides you with certain
                              information that must be provided under the
                              General Data Protection Regulation ((EU)
                              2016/679).
                            </p>
                            <h4>Data protection principles</h4>
                            <ul>
                              <li>
                                We will comply with data protection law and
                                principles, which means that your data will be:
                              </li>
                              <li>
                                Used lawfully, fairly and in a transparent way.
                              </li>
                              <li>
                                Collected only for valid purposes that we have
                                clearly explained to you and not used in any way
                                that is incompatible with those purposes.
                              </li>
                              <li>
                                Relevant to the purposes we have told you about
                                and limited only to those purposes.
                              </li>
                              <li>Accurate and kept up to date.</li>
                              <li>
                                Kept only as long as necessary for the purposes
                                we have told you about.
                              </li>
                              <li>Kept securely.</li>
                            </ul>
                            <h3>The kind of information we hold about you</h3>
                            <p>
                              In connection with your application for work with
                              us, we will collect, store, and use the following
                              categories of personal information about you:
                            </p>
                            <ul>
                              <li>
                                The information you have provided to us in your
                                curriculum vitae and cover letter.
                              </li>
                              <li>
                                The information you have provided on our
                                application form, including name, title,
                                address, telephone number, personal email
                                address, employment history, qualifications.
                              </li>
                              <li>
                                Any information you provide to us during an
                                interview.
                              </li>
                            </ul>
                            <h4>How is your personal information collected?</h4>
                            <h5>
                              We collect personal information about candidates
                              from the following sources:
                            </h5>
                            <ul>
                              <li>You, the candidate.</li>
                              <li>
                                Recruitment agencies and vendors we have agreed
                                terms in place with
                              </li>
                              <li>Professional networking profile</li>
                              <li>Employees and others who refer you to us</li>
                            </ul>
                            <h4>How we will use information about you?</h4>
                            <p>
                              We will use the personal information we collect
                              about you to:
                            </p>
                            <ul>
                              <li>
                                Assess your skills, qualifications, and
                                suitability for the role.
                              </li>
                              <li>
                                Carry out background and reference checks, where
                                applicable.
                              </li>
                              <li>
                                Communicate with you about the recruitment
                                process.
                              </li>
                              <li>
                                Keep records related to our hiring processes.
                              </li>
                              <li>
                                Comply with legal or regulatory requirements.
                              </li>
                            </ul>
                            <p>
                              We also need to process your personal information
                              to decide whether to enter into a contract of
                              employment with you.
                            </p>
                            <p>
                              Having received your CV, cover letter and/or your
                              application form, we will then process that
                              information to decide whether you meet the basic
                              requirements to be screened by our in-house
                              recruitment team for the role. If you do, we will
                              decide whether your application is strong enough
                              to invite you for an interview, be it by
                              telephone, in person or other electronic means. If
                              we decide to engage you for an interview, we will
                              use the information you provide to us at the
                              interview to decide whether to offer you the role.
                              If we decide to offer you the role, we will then
                              take up references before confirming your
                              appointment.
                            </p>

                            <h4>If you fail to provide personal information</h4>
                            <p>
                              If you fail to provide information when requested,
                              which is necessary for us to consider your
                              application (such as evidence of qualifications or
                              work history), we will not be able to process your
                              application successfully and we will not be able
                              to take your application further.
                            </p>

                            <h4>Automated decision-making</h4>
                            <p>
                              You will not be subject to decisions that will
                              have a significant impact on you based solely on
                              automated decision-making.
                            </p>

                            <h4>Data sharing With third parties</h4>
                            <p>
                              We will only share your personal information with
                              the following third parties for the purposes of
                              processing your application; this may involve
                              sharing your information with other companies
                              within our ownership group, if we consider they
                              may have other relevant vacancies and only if you
                              consent to such sharing.
                            </p>
                            <p>
                              All our third-party service providers and other
                              entities in the group are required to take
                              appropriate security measures to protect your
                              personal information in line with our policies. We
                              do not allow our third-party service providers to
                              use your personal data for their own purposes. We
                              only permit them to process your personal data for
                              specified purposes and in accordance with our
                              instructions.
                            </p>

                            <h4>Data security</h4>
                            <p>
                              We have put in place appropriate security measures
                              to prevent your personal information from being
                              accidentally lost, used or accessed in an
                              unauthorised way, altered or disclosed. In
                              addition, we limit access to your personal
                              information to those employees, agents,
                              contractors and other third parties who have a
                              business need-to-know. They will only process your
                              personal information on our instructions and they
                              are subject to a duty of confidentiality.
                            </p>
                            <p>
                              We have put in place procedures to deal with any
                              suspected data security breach and will notify you
                              and any applicable regulator of a suspected breach
                              where we are legally required to do so.
                            </p>

                            <h4>
                              Data retention (how long will you use my
                              information for)
                            </h4>
                            <p>
                              We will retain your personal information for a
                              period of X years after we have communicated to
                              you our decision about whether to appoint you to
                              the role. We will retain your personal information
                              so that we can make you aware of any suitable
                              alternative roles that arise during this period.
                            </p>
                            <p>
                              We further retain your personal information for
                              that period so that we can show, in the event of a
                              legal claim, that we have not discriminated
                              against candidates on prohibited grounds and that
                              we have conducted the recruitment exercise in a
                              fair and transparent way. After this period, we
                              will securely destroy your personal information in
                              accordance with applicable laws and regulations.
                            </p>
                            <p>
                              If you would prefer that we did not retain your
                              personal information, you can notify us at any
                              time and we will delete your personal information.
                            </p>

                            <h4>
                              Rights of access, correction, erasure, and
                              restriction
                            </h4>
                            <p>
                              Under certain circumstances, by law you have the
                              right to:
                            </p>
                            <ul>
                              <li>
                                Request access to your personal information
                                (commonly known as a “data subject access
                                request”). This enables you to receive a copy of
                                the personal information we hold about you and
                                to check that we are lawfully processing it.
                              </li>
                              <li>
                                Request correction of the personal information
                                that we hold about you. This enables you to have
                                any incomplete or inaccurate information we hold
                                about you corrected.
                              </li>
                              <li>
                                Request erasure of your personal information.
                                This enables you to ask us to delete or remove
                                personal information where there is no good
                                reason for us continuing to process it. You also
                                have the right to ask us to delete or remove
                                your personal information where you have
                                exercised your right to object to processing
                                (see below).
                              </li>
                              <li>
                                Object to processing of your personal
                                information where we are relying on a legitimate
                                interest (or those of a third party) and there
                                is something about your particular situation
                                which makes you want to object to processing on
                                this ground. You also have the right to object
                                where we are processing your personal
                                information for direct marketing purposes.
                              </li>
                              <li>
                                Request the restriction of processing of your
                                personal information. This enables you to ask us
                                to suspend the processing of personal
                                information about you, for example if you want
                                us to establish its accuracy or the reason for
                                processing it.
                              </li>
                            </ul>

                            <h4>Right to withdraw consent</h4>
                            <p>
                              When you applied for this role, you provided
                              consent to us processing your personal information
                              for the purposes of the recruitment exercise. You
                              have the right to withdraw your consent for
                              processing for that purpose at any time.
                            </p>
                            <p>
                              To withdraw your consent, please contact the
                              Recruitment Manager. Once we have received
                              notification that you have withdrawn your consent,
                              we will no longer process your application and,
                              subject to our policies, we will dispose of your
                              personal data securely.
                            </p>

                            <h4>Data protection officer</h4>
                            <p>
                              We have appointed a data protection officer (DPO)
                              to oversee compliance with this privacy notice. If
                              you have any questions about this privacy notice
                              or how we handle your personal information, please
                              contact the DPO by email, at{" "}
                              <a href="mailto:privacy@FastGuardService.com">
                                privacy@FastGuardService.com
                              </a>
                              .
                            </p>
                            <p>
                              You have the right to make a complaint at any time
                              to the Information Commissioner’s Office (ICO),
                              the UK supervisory authority for data protection
                              issues.
                            </p>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={closeModal}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-check">
                <input
                  className="form-check-input border-danger"
                  type="checkbox"
                  id="privacyAccepted"
                  name="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onChange={handleChange}
                  required
                />
                <label
                  className="form-check-label text-danger"
                  htmlFor="privacyAccepted"
                >
                  I have read the terms of the privacy policy and consent to the
                  processing of my information
                </label>
              </div>
            </div>

            <div className="card p-3 mb-4">
              <h6 className="fw-bold">Voluntary Self-Identification</h6>
              <p>
                Qualified resume submissions are considered for employment
                without regard to race, religion, sex, national origin, marital
                status, sexual orientation, veteran status, or disability.
                Completion of this form is <strong>VOLUNTARY</strong> and your
                failure to complete it will <strong>NOT</strong> preclude you
                from employment consideration. This information will be kept in
                a confidential file separate from your resume.
              </p>
              <div className="row col-md-12">
                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="gender"
                    className="form-label text-danger text-uppercase small"
                  >
                    Gender / Género*
                  </label>
                  <select
                    className="form-select border-danger"
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="not_disclosed_gender">
                      I choose Not To Disclose
                    </option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="race"
                    className="form-label text-danger text-center text-uppercase small"
                  >
                    Race/Ethnicity / Raza/Etnicidad *
                  </label>
                  <select
                    className="form-select border-danger"
                    id="race"
                    name="race"
                    value={formData.race}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="white">White</option>
                    <option value="black">Black or African American</option>
                    <option value="hispanic">Hispanic or Latino</option>
                    <option value="asian">Asian</option>
                    <option value="native">
                      American Indian or Alaska Native
                    </option>
                    <option value="other">Other</option>
                    <option value="not_disclosed_race">
                      I choose Not To Disclose
                    </option>
                  </select>
                </div>
                <div className="col-md-12 mb-4">
                  <div className="d-flex justify-content-between">
                    <a
                      href="#"
                      onClick={toggleDefinitions}
                      className="text-primary text-decoration-underline"
                    >
                      Click To View Race/Ethnicity Definitions
                    </a>
                    <a
                      href="#"
                      onClick={toggleDefinitions}
                      className="text-primary text-decoration-underline"
                    >
                      Haga clic para ver la raza / origen étnico Definiciones
                    </a>
                  </div>

                  {showDefinitions && (
                    <>
                      <div className="card mt-3 p-4 bg-light border">
                        <div className="mb-4">
                          <h5>Hispanic or Latino</h5>
                          <p>
                            A person of Cuban, Mexican, Puerto Rican, South or
                            Central American, or other Spanish culture or origin
                            regardless of race.
                          </p>

                          <h5>
                            American Indian or Alaska Native (Not Hispanic or
                            Latino)
                          </h5>
                          <p>
                            A person having origins in any of the original
                            peoples of North and South America (including
                            Central America), and who maintain tribal
                            affiliation or community attachment.
                          </p>

                          <h5>Asian (Not Hispanic or Latino)</h5>
                          <p>
                            A person having origins in any of the original
                            peoples of the Far East, Southeast Asia, or the
                            Indian Subcontinent, including Cambodia, China,
                            India, Japan, Korea, Malaysia, Pakistan, the
                            Philippines, Thailand, and Vietnam.
                          </p>

                          <h5>
                            Black or African American (Not Hispanic or Latino)
                          </h5>
                          <p>
                            A person having origins in any of the black racial
                            groups of Africa.
                          </p>

                          <h5>
                            Native Hawaiian or Other Pacific Islander (Not
                            Hispanic or Latino)
                          </h5>
                          <p>
                            A person having origins in any of the peoples of
                            Hawaii, Guam, Samoa, or other Pacific Islands.
                          </p>

                          <h5>White (Not Hispanic or Latino)</h5>
                          <p>
                            A person having origins in any of the original
                            peoples of Europe, the Middle East, or North Africa.
                          </p>

                          <h5>Two or More Races (Not Hispanic or Latino)</h5>
                          <p>
                            Persons who identify with two or more race/ethnic
                            categories named above.
                          </p>
                        </div>
                      </div>
                      <div className="card mt-3 p-4 bg-light border">
                        <div className="mb-4">
                          <h5>Hispano o Latino</h5>
                          <p>
                            Una persona de cultura Cubana, Mexicana,
                            Puertorriqueña, América del Sur o Central o de otra
                            cultura hispana u origen independiente de la raza.
                          </p>

                          <h5>
                            Indígena Americano o Nativo de Alaska (No Hispano o
                            Latino)
                          </h5>
                          <p>
                            Una persona con su origen en cualquiera de la gente
                            original de la América del Norte y del Sur
                            (incluyendo la América Central) y que mantenga una
                            afiliación tribal o asociación comunitaria.
                          </p>

                          <h5>Asiático ( No Hispano o Latino)</h5>
                          <p>
                            Una persona con su origen en cualquiera de la gente
                            del Oriente Medio, Sudeste Asiático o el
                            Subcontinente Indio incluyendo Cambodia, China,
                            India, Japón, Corea, Malasia, Pakistán, las Islas
                            Filipinas, Tailandia, y Vietnam.
                          </p>

                          <h5>
                            Negro o Americano Africano (No Hispano o Latino)
                          </h5>
                          <p>
                            Una persona con su origen en cualquiera de los
                            grupos raciales negros de África.
                          </p>

                          <h5>
                            Nativo del Hawái o de Otras Islas del Pacífico (No
                            Hispano o Latino)
                          </h5>
                          <p>
                            Una persona con su origen en cualquiera de la gente
                            de Hawái, Guam, Samoa, u otra Isla del Pacífico.
                          </p>

                          <h5>Blanco (No Hispano o Latino)</h5>
                          <p>
                            Una persona con su origen en personas de Europa,
                            Oriente Medio o África del Norte.
                          </p>

                          <h5>Dos o más razas (No Hispano o Latino)</h5>
                          <p>
                            Personas que se identifican con dos o más categorías
                            de raza/etnicidad mencionadas arriba.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-3 mb-4">
              <h6 className="fw-bold">Veteran Status</h6>
              {[
                { label: "YES I am a veteran", value: "yes", id: "veteranYes" },
                {
                  label: "NO I am not a veteran",
                  value: "no",
                  id: "veteranNo",
                },
                {
                  label: "I choose to not disclose",
                  value: "undisclosed",
                  id: "veteranUndisclosed",
                },
              ].map((option) => (
                <div className="form-check" key={option.id}>
                  <input
                    className="form-check-input border-dark"
                    type="checkbox"
                    id={option.id}
                    name="veteranStatusOption"
                    value={option.value}
                    checked={formData.veteranStatus === option.value}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label text-danger"
                    htmlFor={option.id}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>

            {/* Disability Status Section - NEW */}
            <div className="card p-3 mb-4">
              <h6 className="fw-bold">Disability Status</h6>
              {[
                {
                  labelText: "YES I have a disability",
                  value: "yes",
                  id: "disabilityYes",
                },
                {
                  labelText: "NO I do not have a disability",
                  value: "no",
                  id: "disabilityNo",
                },
                {
                  labelText: "I choose to not disclose",
                  value: "undisclosed_disability",
                  id: "disabilityUndisclosed",
                },
              ].map((option) => (
                <div className="form-check" key={option.id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="disabilityStatus"
                    id={option.id}
                    value={option.value}
                    checked={formData.disabilityStatus === option.value}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor={option.id}>
                    <span className="text-danger">{option.labelText}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="card p-3 mb-4">
              <h6 className="fw-bold">Candidate Acknowledgment</h6>
              <p className="mb-2">
                The information that I am submitting in this application is true
                and correct. I understand that in the event of my employment by
                the Company, I shall be subject to dismissal if any information
                that I have given in this application is false or misleading or
                if I have failed to give any information herein requested,
                regardless of the time elapsed after discovery.
              </p>
              <p className="mb-3">
                I understand that nothing in this employment application, the
                granting of an interview or my subsequent employment with the
                Company is intended to create an employment contract between
                myself and the Company under which my employment could be
                terminated only for cause.
              </p>
              <div className="mb-3">
                <label
                  htmlFor="fullName"
                  className="form-label text-danger fw-semibold"
                >
                  Type Your Full Name Here*
                </label>
                <input
                  type="text"
                  className="form-control border-danger"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <div className="d-flex align-items-center gap-3">
                <div className="flex-shrink-0">
                  <p
                    className="text-primary cursor-pointer m-0"
                    onClick={() => setShowDisclaimer(true)}
                  >
                    Disclaimer – On-Call Job Policy
                  </p>
                </div>
              </div>
              <div className="flex-grow-1 d-flex justify-content-center gap-3">
                <button type="submit" className="btn btn-primary px-4">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>

              {showDisclaimer && (
                <div
                  className="modal fade show"
                  style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
                >
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          Disclaimer – On-Call Job Policy
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowDisclaimer(false)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <p>
                          <strong>An on-call job means:</strong>
                        </p>
                        <ul
                          style={{ listStyleType: "disc", paddingLeft: "20px" }}
                        >
                          <li>
                            You are not scheduled for fixed, regular hours like
                            a full-time or part-time employee.
                          </li>
                          <li>
                            The company may contact you only when work is needed
                            (for example, to cover a shift, handle an event, or
                            fill in for someone).
                          </li>
                          <li>
                            Work hours may be irregular and unpredictable — some
                            weeks you may be offered several shifts, while other
                            weeks you may not be offered any.
                          </li>
                          <li>
                            You are expected to be available and ready on short
                            notice, though the amount of notice depends on the
                            employer’s needs.
                          </li>
                          <li>
                            In security work, this often includes being called
                            for special events, emergency coverage, or
                            last-minute posts.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        ) : (
          <Loader />
        )}
      </div>
    </>
  );
};

export default QuotationForm1;
