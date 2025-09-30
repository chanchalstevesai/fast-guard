import { useState, useEffect } from "react";
import "./QuotationForm.css"
import { BaseURl } from "./Networking/APIs/NWconfig";
import { securityTypes } from "./Datas";
import { Country, State, City } from 'country-state-city';
import { StateList } from "./Datas";
console.log(StateList,"StateList");

function App() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);

  const [cities, setCities] = useState([]);

  const [serviceStates, setServiceStates] = useState([]);

  const [serviceCities, setServiceCities] = useState([]);

  const initialFormData = {
    Company_Name: "",
    First_Name: "",
    Last_Name: "",
    Mobile: "",
    Email: "",
    Security_Type: "",
    No_of_Guards: "1",
    Job_Description: "",
    Start_Date: "",
    End_Date: "",
    Start_Time: "",
    End_Time: "",
    Location_Business_Name: "",
    Street: "",
    City: "",
    State: "",
    Zip_Code: "",
    Country: "",
    Service_Loc_Business: "",
    Service_Street: "",
    Service_City: "",
    Service_State: "",
    Service_Zip_Code: "",
    Service_Country: "United States",
    "is_24/7": false,
    is_per_day: false,
    include_weekdays: true, // New field - default true since weekdays are usually included
    include_weekends: false,
    saturday_selected: false,
    sunday_selected: false,
    "hours_per_day": "",
    total_hours: ""
  };
  const [formData, setFormData] = useState(initialFormData);



 const initializeLocation = () => {
  const allCountries = Country.getAllCountries();
  setCountries(allCountries);

  const us = allCountries.find(c => c.name === "United States");
  if (us) {
    const statesList = State.getStatesOfCountry(us.isoCode);

    // Use statesList directly
    const formattedStates = statesList.map(s => ({
      name: s.name,
      isoCode: s.isoCode
    }));

    setStates(formattedStates);
    setServiceStates(formattedStates);

    // Default state
    const defaultState = formattedStates.find(s => s.name === "California") || formattedStates[0];

    // Get cities for default state
    let citiesList = [];
    if (defaultState?.isoCode) {
      citiesList = City.getCitiesOfState(us.isoCode, defaultState.isoCode);
    }

    setCities(citiesList);
    setServiceCities(citiesList);

    // Set formData
    setFormData(prev => ({
      ...prev,
      Country: us.name,
      State: defaultState?.name || "",
      City: citiesList.length > 0 ? citiesList[0].name : "",
      Service_Country: us.name,
      Service_State: defaultState?.name || "",
      Service_City: citiesList.length > 0 ? citiesList[0].name : ""
    }));
  }
};

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    const usStates = State.getStatesOfCountry("US");
    setServiceStates(usStates);
  }, []);

  const handleCountryChange = (e) => {
    const countryIsoCode = e.target.value;
    const countryName = countries.find(c => c.isoCode === countryIsoCode)?.name || "";

    const statesList = State.getStatesOfCountry(countryIsoCode);
    setStates(statesList);

    setFormData(prev => ({
      ...prev,
      Country: countryName,
      State: "",
      City: ""
    }));
  };


  const handleStateChange = (e) => {
    const selectedValue = e.target.value;

    const stateLabel = StateList.find(s => s.value === selectedValue)?.label || "";
    setFormData(prev => ({
      ...prev,
      State: stateLabel
    }));

    setFormData(prev => ({
      ...prev,
      City: ""
    }));
  };


  const handleServiceStateChange = (e) => {
    const selectedState = e.target.value; 

    setFormData(prev => ({
      ...prev,
      Service_State: selectedState, 
      Service_City: ""             
    }));
  };

  const handleSameAsBillingChange = (e) => {
    const checked = e.target.checked;
    setSameAsBilling(checked);

    const us = countries.find(c => c.name === "United States");

    if (checked) {
      // Copy billing info to service info
      setFormData(prevData => ({
        ...prevData,
        Service_Loc_Business: prevData.Location_Business_Name,
        Service_Street: prevData.Street,
        Service_City: prevData.City,
        Service_State: prevData.State,
        Service_Zip_Code: prevData.Zip_Code,
        Service_Country: prevData.Country,
      }));

      // Directly use your StateList for dropdown
      setServiceStates(StateList.filter(s => s.value)); // Remove the "Select State" placeholder if needed
    } else {
      // Reset service info
      setFormData(prevData => ({
        ...prevData,
        Service_Loc_Business: "",
        Service_Street: "",
        Service_City: "",
        Service_State: "",
        Service_Zip_Code: "",
        Service_Country: us ? us.name : "",
      }));

      // Directly use StateList for Service States
      setServiceStates(StateList.filter(s => s.value)); // optional: exclude placeholder
      setServiceCities([]); // reset cities
    }
  };


  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);

    // Find United States
    const us = allCountries.find(c => c.name === "United States");
    if (us) {
      setSelectedCountry(us.isoCode);
    }
  }, []);

  useEffect(() => {
    if (formData.is_per_day) {
      setFormData(prev => ({
        ...prev,
        include_weekends: false,
        saturday_selected: false,
        sunday_selected: false,
        hours_per_day_saturday: "",
        startTime_saturday: "",
        endTime_saturday: "",
        hours_per_day_sunday: "",
        startTime_sunday: "",
        endTime_sunday: ""
      }));
    }
  }, [formData.Start_Date, formData.End_Date, formData.is_per_day]);



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'include_weekdays') {
      setFormData(prev => {
        if (checked) {
          return {
            ...prev,
            include_weekdays: true,
          };
        } else {
          return {
            ...prev,
            include_weekdays: false,
            hours_per_day_weekdays: "",
            startTime_weekdays: "",
            endTime_weekdays: ""
          };
        }
      });
      return;
    }

    if (name === 'include_weekends') {
      setFormData(prev => {
        if (checked) {
          return {
            ...prev,
            include_weekends: true,
            saturday_selected: true,
            sunday_selected: false,
          };
        } else {
          return {
            ...prev,
            include_weekends: false,
            saturday_selected: false,
            sunday_selected: false,
            hours_per_day_saturday: "",
            startTime_saturday: "",
            endTime_saturday: "",
            hours_per_day_sunday: "",
            startTime_sunday: "",
            endTime_sunday: ""
          };
        }
      });
      return;
    }


    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: type === 'checkbox' ? checked : value, };

      if (name.startsWith("startTime_")) {
        const groupKey = name.split("startTime_")[1];
        const hoursKey = `hours_per_day_${groupKey}`;
        const startTime = value;
        const hoursToAdd = parseFloat(updatedForm[hoursKey]);

        if (!isNaN(hoursToAdd) && startTime) {
          const [startH, startM] = startTime.split(":").map(Number);
          const startDate = new Date(1970, 0, 1, startH, startM);
          const endDate = new Date(startDate.getTime() + hoursToAdd * 60 * 60 * 1000);
          const endH = String(endDate.getHours()).padStart(2, '0');
          const endM = String(endDate.getMinutes()).padStart(2, '0');
          updatedForm[`endTime_${groupKey}`] = `${endH}:${endM}`;
        }
      }

      if (name.startsWith("hours_per_day_")) {
        const groupKey = name.split("hours_per_day_")[1];
        const startKey = `startTime_${groupKey}`;
        const startTime = updatedForm[startKey];
        const hoursToAdd = parseFloat(value);

        if (!isNaN(hoursToAdd) && startTime) {
          const [startH, startM] = startTime.split(":").map(Number);
          const startDate = new Date(1970, 0, 1, startH, startM);
          const endDate = new Date(startDate.getTime() + hoursToAdd * 60 * 60 * 1000);
          const endH = String(endDate.getHours()).padStart(2, '0');
          const endM = String(endDate.getMinutes()).padStart(2, '0');
          updatedForm[`endTime_${groupKey}`] = `${endH}:${endM}`;
        }
      }

      return updatedForm;
    });
  };

  const calculateTotalHoursForPayload = () => {
    if (!formData.Start_Date || !formData.End_Date || !formData.is_per_day) return 0;

    const dates = getDatesInRange(formData.Start_Date, formData.End_Date);
    const weekdays = dates.filter(d => new Date(d).getUTCDay() >= 1 && new Date(d).getUTCDay() <= 5);
    const saturdays = dates.filter(d => new Date(d).getUTCDay() === 6);
    const sundays = dates.filter(d => new Date(d).getUTCDay() === 0);

    const getHours = (groupKey, groupDates) => {
      const start = formData[`startTime_${groupKey}`];
      const end = formData[`endTime_${groupKey}`];
      if (!start || !end) return 0;
      return getTimeDifferenceInHours(start, end) * groupDates.length;
    };

    const weekdayHours = formData.include_weekdays ? getHours("weekdays", weekdays) : 0;
    const saturdayHours = formData.saturday_selected ? getHours("saturday", saturdays) : 0;
    const sundayHours = formData.sunday_selected ? getHours("sunday", sundays) : 0;

    return (weekdayHours + saturdayHours + sundayHours).toFixed(2);
  };


  const getDatesInRange = (start, end) => {
    if (!start || !end) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dates = [];

    const currentDate = new Date(startDate.valueOf());
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const getTimeDifferenceInHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    if (isNaN(start) || isNaN(end)) return 0;

    let diffMs = end - start;
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000;
    }
    return diffMs / (1000 * 60 * 60);
  };

  const validateForm = () => {
    const errors = {};

    const includeWeekdays = formData.include_weekdays;
    const includeWeekends = formData.include_weekends;
    const weekdayHours = parseFloat(formData.hours_per_day_weekdays || "0");
    const hasWeekdayHours = !isNaN(weekdayHours) && weekdayHours > 0;

    // ✅ Weekday hours required if weekdays are included
    if (includeWeekdays && !hasWeekdayHours && formData.is_per_day) {
      errors.hours_per_day_weekdays = "Weekday hours are required when weekdays are selected.";
    }

    // ✅ Start/End time (weekdays) — required if weekdays are included
    if (includeWeekdays && formData.is_per_day) {
      if (!formData.startTime_weekdays) {
        errors.startTime_weekdays = "Start time (weekdays) is required.";
      }
      if (!formData.endTime_weekdays) {
        errors.endTime_weekdays = "End time (weekdays) is required.";
      }
    }

    // ✅ At least one day type must be selected
    if (!includeWeekdays && !includeWeekends && formData.is_per_day) {
      errors.day_selection = "Select at least one day type (Weekdays or Weekends).";
    }

    // ✅ If weekends are included, at least one must be selected
    if (includeWeekends && !formData.saturday_selected && !formData.sunday_selected) {
      errors.weekends = "Select Saturday and/or Sunday.";
    }

    // ✅ If Saturday is selected, all its fields should be filled
    if (formData.saturday_selected) {
      if (!formData.startTime_saturday) {
        errors.startTime_saturday = "Start time (Saturday) is required.";
      }
      if (!formData.endTime_saturday) {
        errors.endTime_saturday = "End time (Saturday) is required.";
      }
      if (!formData.hours_per_day_saturday) {
        errors.hours_per_day_saturday = "Hours per day (Saturday) is required.";
      }
    }

    if (formData.sunday_selected) {
      if (!formData.startTime_sunday) {
        errors.startTime_sunday = "Start time (Sunday) is required.";
      }
      if (!formData.endTime_sunday) {
        errors.endTime_sunday = "End time (Sunday) is required.";
      }
      if (!formData.hours_per_day_sunday) {
        errors.hours_per_day_sunday = "Hours per day (Sunday) is required.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    let totalHours = null;
    let weekdaysCount = 0;
    let weekendsCount = 0;
    let onlyWeekends = false;

    let weekdayHours = 0;
    let hasWeekdayHours = false;

   if (formData["is_per_day"]) {
  const dates = getDatesInRange(formData.Start_Date, formData.End_Date);

  // Weekdays count
  const weekdays = dates.filter((d) => {
    const day = new Date(d).getUTCDay();
    return day >= 1 && day <= 5;
  });
  weekdaysCount = formData.include_weekdays ? weekdays.length : 0;

  // Weekends count based on checkbox selection
  let weekendDates = [];
  if (formData.saturday_selected) {
    weekendDates = weekendDates.concat(dates.filter((d) => new Date(d).getUTCDay() === 6));
  }
  if (formData.sunday_selected) {
    weekendDates = weekendDates.concat(dates.filter((d) => new Date(d).getUTCDay() === 0));
  }
  weekendsCount = weekendDates.length;

  totalHours = calculateTotalHoursForPayload();

  // Weekday hours
  weekdayHours = parseFloat(formData["hours_per_day_weekdays"] || "0");
  hasWeekdayHours = !isNaN(weekdayHours) && weekdayHours > 0;

  const weekendSelected = formData.saturday_selected || formData.sunday_selected;
  const onlyWeekendDaysSelected = weekendSelected && !hasWeekdayHours;

  onlyWeekends = formData.include_weekends && onlyWeekendDaysSelected && !formData.include_weekdays;
}

     else if (!formData["is_24/7"]) {
      const dates = getDatesInRange(formData.Start_Date, formData.End_Date);
      const hoursPerDay = getTimeDifferenceInHours(formData.Start_Time, formData.End_Time);
      totalHours = (dates.length * hoursPerDay).toFixed(2);
    }


    const mobileRegex = /^\+1-\d{3}-\d{3}-\d{4}$/;
    if (!mobileRegex.test(formData.Mobile)) {
      alert("Please enter a valid US phone number in the format +1-XXX-XXX-XXXX.");
      return;
    }

    const rawMobile = formData.Mobile.replace(/^\+1-/, "").replace(/-/g, "");

    const finalMobile = `+1${rawMobile}`;

    setLoading(true);

    const payload = {
      data: [
        {
          Billing_State1: formData.State,
          City: formData.City,
          Company: formData.Company_Name,
          Country: formData.Country,
          Currency: "USD",
          Description: formData.Job_Description,
          Email: formData.Email,
          First_Name: formData.First_Name,
          Last_Name: formData.Last_Name,
          Location_Business_Name: formData.Location_Business_Name,
          Mobile: finalMobile,
          Number_of_Guards: String(formData.No_of_Guards),
          Service_City: formData.Service_City,
          Service_Loc_Business_Name: formData.Service_Loc_Business,
          Service_State2: formData.Service_State,
          Service_Street_1: formData.Service_Street,
          Service_Zip_Code: formData.Zip_Code,
          Services_Needed_New: [formData.Security_Type],
          Street: formData.Street,
          Zip_Code: formData.Service_Zip_Code,
          "is_24/7": formData["is_24/7"],
          is_per_day: formData.is_per_day,
          hours_per_day: formData.hours_per_day,
          include_weekdays: formData.include_weekdays, // Add this field

          ...(formData["is_24/7"]
            ? {
              Start_date: formData.Start_Date.split("T")[0],
              Start_time: formData.Start_Date.split("T")[1],
              End_date: formData.End_Date.split("T")[0],
              End_time: formData.End_Date.split("T")[1],
              hours_per_day: null,
            }
        : formData.is_per_day
  ? {
      Start_date: formData.Start_Date,
      End_date: formData.End_Date,
      start_time_weekdays: formData.include_weekdays ? (formData.startTime_weekdays || null) : null,
      end_time_weekdays: formData.include_weekdays ? (formData.endTime_weekdays || null) : null,
      start_time_saturday: formData.saturday_selected ? formData.startTime_saturday || null : null,
      end_time_saturday: formData.saturday_selected ? formData.endTime_saturday || null : null,
      hours_per_day_saturday: formData.saturday_selected ? formData.hours_per_day_saturday || null : null,
      start_time_sunday: formData.sunday_selected ? formData.startTime_sunday || null : null,
      end_time_sunday: formData.sunday_selected ? formData.endTime_sunday || null : null,
      hours_per_day_sunday: formData.sunday_selected ? formData.hours_per_day_sunday || null : null,
      hours_per_day_weekdays: formData.include_weekdays ? (formData.hours_per_day_weekdays || null) : null,
      total_hours: parseFloat(totalHours),
      include_weekends: formData.include_weekends,
      only_weekends: onlyWeekends,
      weekdays_count: weekdaysCount,
      weekends_count: weekendsCount,
      saturday: formData.saturday_selected,
      sunday: formData.sunday_selected,
    }


              : {
                Start_date: formData.Start_Date,
                Start_time: formData.Start_Time,
                End_date: formData.End_Date,
                End_time: formData.End_Time,
                total_hours: totalHours,
              }),
        },
      ],
    };

    console.log("weekdayHours", weekdayHours);
    console.log("hasWeekdayHours", hasWeekdayHours);
    console.log("saturday_selected", formData.saturday_selected);
    console.log("sunday_selected", formData.sunday_selected);
    console.log("include_weekends", formData.include_weekends);
    console.log("include_weekdays", formData.include_weekdays);
    console.log("onlyWeekends", onlyWeekends);
    console.log("Final Payload:", payload)
    try {
      const response = await fetch(`${BaseURl}submit_lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      switch (response.status) {
        case 200:
          setLoading(false);
          alert(data.message || "Lead submitted successfully!");
          setFormData(initialFormData);
          initializeLocation();
          setShowForm(false);
          break;
        case 400:
          setLoading(false);
          alert(data.message || "Bad request. Please check your input.");
          break;
        case 401:
          setLoading(false);
          alert(data.message || "Unauthorized. Please login again.");
          break;
        case 500:
          setLoading(false);
          alert(data.message || "Internal server error. Please try again later.");
          break;
        default:
          setLoading(false);
          alert(data.message || `Unexpected error (Status ${response.status}).`);
          break;
      }
    } catch (error) {
      setLoading(false);
      console.error("Network/Error:", error);
      alert("Network error. Please check your internet connection and try again.");
    }
  };



  function getAvailabilityMessage(formData) {
    if (!formData.Start_Date || !formData.End_Date) return "";
    const startDate = new Date(formData.Start_Date).toLocaleDateString("en-GB");
    const endDate = new Date(formData.End_Date).toLocaleDateString("en-GB");

    if (formData["is_24/7"]) {
      return `Guard will be available from ${startDate} to ${endDate} for 24/7`;
    } else {
      const startTime = formData.Start_Time;
      const endTime = formData.End_Time;
      return `Guard will be available from ${startDate} to ${endDate} daily from ${startTime} to ${endTime}`;
    }
  }



  return (
    <>
 {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <div className="modal-overlay">

        <div className="modal-content">
          <form className="quotation-form" onSubmit={handleSubmit}>

            <h2>QUOTATION FORM</h2>

            <div className="form-content">
              <div className="form-field">
                <label>Company Name</label>
                <input
                  type="text"
                  name="Company_Name"
                  value={formData.Company_Name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="First_Name"
                    value={formData.First_Name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="Last_Name"
                    value={formData.Last_Name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Best Number To Contact You?</label>
                  <input
                    type="tel"
                    name="Mobile"
                    value={formData.Mobile}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, ""); // keep only digits
                      if (value.startsWith("1")) value = value.slice(1); // avoid double +1
                      if (value.length > 10) value = value.slice(0, 10);

                      // Format with dashes
                      let formatted = "";
                      if (value.length > 6) {
                        formatted = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
                      } else if (value.length > 3) {
                        formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
                      } else {
                        formatted = value;
                      }

                      // Always prepend +1
                      setFormData((prev) => ({
                        ...prev,
                        Mobile: `+1-${formatted}`,
                      }));
                    }}
                    placeholder="+1-XXX-XXX-XXXX"
                    required
                  />
                </div>


                <div className="form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Type Of Security Needed?</label>
                  <select
                    name="Security_Type"
                    value={formData.Security_Type}
                    onChange={handleInputChange}
                    required
                  >
                    {securityTypes.map((option, index) => (
                      <option
                        key={index}
                        value={option.value}
                        disabled={option.value === ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>How many Guards you want?</label>
                  <input
                    type="number"
                    name="No_of_Guards"
                    value={formData.No_of_Guards}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        No_of_Guards: String(e.target.value),
                      }));
                    }}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>
                  What Is The Job Description That You Would Like The Guard To
                  Perform?
                </label>
                <textarea
                  name="Job_Description"
                  value={formData.Job_Description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                />
              </div>
              <div className="form-field">
                <label>
                  Guard Needed for ?
                </label>
                <div className="form-row">

                  <div className="form-field">
                    <label>
                      <input
                        type="radio"
                        name="availability"
                        checked={formData["is_24/7"]}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            "is_24/7": true,
                            "is_per_day": false,
                          })
                        }
                      />
                      <span className="form-field-redio">24/7</span>
                    </label>
                  </div>
                  <div className="form-field">
                    <label>
                      <input
                        type="radio"
                        name="availability"
                        checked={formData["is_per_day"]}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            "is_24/7": false,
                            "is_per_day": true,
                          })
                        }
                      />
                      <span className="form-field-redio">Per day</span>
                    </label>
                  </div>
                </div>
              </div>
              {formData["is_24/7"] && (
                <>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Start Date</label>
                      <input
                        type="datetime-local"
                        name="Start_Date"
                        value={formData.Start_Date}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>End Date</label>
                      <input
                        type="datetime-local"
                        name="End_Date"
                        value={formData.End_Date}
                        onChange={handleInputChange}
                        min={formData.Start_Date || new Date().toISOString().slice(0, 16)}
                        required
                      />
                    </div>
                  </div>
                  <p>{getAvailabilityMessage(formData)}</p>
                </>
              )}

              {formData?.is_per_day && (
                <>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="Start_Date"
                        value={formData.Start_Date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>End Date</label>
                      <input
                        type="date"
                        name="End_Date"
                        value={formData.End_Date}
                        min={formData.Start_Date || new Date().toISOString().split("T")[0]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {formData.Start_Date && formData.End_Date && (() => {
                    const dates = getDatesInRange(formData.Start_Date, formData.End_Date);
                    const weekdays = dates.filter(d => new Date(d).getUTCDay() >= 1 && new Date(d).getUTCDay() <= 5);
                    const saturdays = dates.filter(d => new Date(d).getUTCDay() === 6);
                    const sundays = dates.filter(d => new Date(d).getUTCDay() === 0);

                    const renderGroupRow = (label, groupKey, groupDates) => {
                      if (groupDates.length === 0) return null;

                      const start = formData[`startTime_${groupKey}`] || '';
                      const end = formData[`endTime_${groupKey}`] || '';

                      return (
                        <div className="form-row col-md-12 day-row border p-3 rounded mb-4" key={groupKey}>
                          <div className="col-md-12 fw-bold mb-2">{label} ({groupDates.length} day/s)
                            <div className="row align-items-center mb-3">
                              <div className="col-md-6">
                                <label className="me-2 fw-bold">Hours per Day:</label>
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name={`hours_per_day_${groupKey}`}
                                  value={formData[`hours_per_day_${groupKey}`] || ''}
                                  onChange={handleInputChange}
                                  className="form-control"
                                  style={{ width: "80px" }}
                                  required={groupKey === 'weekdays' ? formData.include_weekdays : true}
                                  placeholder="e.g., 8.5"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="row align-items-center mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Start Time</label>
                              <input
                                type="time"
                                className="form-control"
                                name={`startTime_${groupKey}`}
                                value={start}
                                onChange={handleInputChange}
                                required={groupKey === 'weekdays' ? formData.include_weekdays : true}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">End Time</label>
                              <input
                                type="time"
                                className="form-control"
                                name={`endTime_${groupKey}`}
                                value={end}
                                onChange={handleInputChange}
                                required={groupKey === 'weekdays' ? formData.include_weekdays : true}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <>
                        {/* NEW: Weekdays Checkbox */}
                        {weekdays.length > 0 && (
                          <div className="form-check mb-3 border p-3 rounded">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                name="include_weekdays"
                                id="include_weekdays"
                                checked={formData.include_weekdays}
                                onChange={handleInputChange}
                              />
                              <label className="form-check-label fw-bold mb-2" htmlFor="include_weekdays">
                                Include Weekdays? (Monday to Friday)
                              </label>
                            </div>
                            {formErrors.day_selection && (
                              <div className="text-danger ps-4">{formErrors.day_selection}</div>
                            )}
                          </div>
                        )}

                        {formData.include_weekdays && renderGroupRow("Monday to Friday", "weekdays", weekdays)}

                        {/* Weekends Checkbox */}
                        {(saturdays.length > 0 || sundays.length > 0) && (
                          <div className="form-check mb-3 border p-3 rounded">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                name="include_weekends"
                                id="include_weekends"
                                checked={formData.include_weekends}
                                onChange={handleInputChange}
                              />
                              <label className="form-check-label fw-bold mb-2" htmlFor="include_weekends">
                                Include Weekends?
                              </label>
                            </div>
                            {formErrors.weekends && (
                              <div className="text-danger ps-4">{formErrors.weekends}</div>
                            )}
                            {/* Conditionally render Saturday/Sunday options */}
                            {formData.include_weekends && (
                              <div className="d-flex mt-2 ps-4">
                                {saturdays.length > 0 && (
                                  <div className="form-check me-3">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      name="saturday_selected"
                                      id="saturday"
                                      checked={formData.saturday_selected}
                                      onChange={handleInputChange}
                                    />
                                    <label className="form-check-label" htmlFor="saturday">
                                      Saturday
                                    </label>
                                  </div>
                                )}
                                {sundays.length > 0 && (
                                  <div className="form-check">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      name="sunday_selected"
                                      id="sunday"
                                      checked={formData.sunday_selected}
                                      onChange={handleInputChange}
                                    />
                                    <label className="form-check-label" htmlFor="sunday">
                                      Sunday
                                    </label>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {formData.saturday_selected && renderGroupRow("Saturday", "saturday", saturdays)}
                        {formData.sunday_selected && renderGroupRow("Sunday", "sunday", sundays)}
                      </>
                    );
                  })()}
                </>
              )}

              <div></div>
              {/* Address Sections */}
              <div className="form-row">
                {/* Billing Address Section */}
                <div className="form-row-box">
                  <h3 className="sub-heading">Billing Address</h3>

                  <div className="form-field">
                    <label>Company/Business Name</label>
                    <input
                      type="text"
                      name="Location_Business_Name"
                      value={formData.Location_Business_Name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Street</label>
                    <input
                      type="text"
                      name="Street"
                      value={formData.Street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Country</label>
                    <select
                      name="Country"
                      value={countries.find(c => c.name === formData.Country)?.isoCode || ""}
                      onChange={handleCountryChange}
                      required
                      disabled
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div className="form-field">
                    <label>State</label>
                    <select
                      name="State"
                      value={formData.State} 
                      onChange={handleStateChange}
                      required
                    >
                      {StateList.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                  </div>


                  <div className="form-field">
                    <label>City</label>
                    <input
                      type="text"
                      name="City"
                      value={formData.City}
                      onChange={handleInputChange}
                      required
                    />
                  </div>


                  <div className="form-field">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      name="Zip_Code"
                      value={formData.Zip_Code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Service Address Section */}
                <div className="form-row-box">
                  <div className="form-field checkbox-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={sameAsBilling}
                        onChange={handleSameAsBillingChange}
                        className="checkbox"
                      />
                      Same as Billing Address
                    </label>
                  </div>

                  <h3 className="sub-heading">Service Address</h3>

                  <div className="form-field">
                    <label>Company/Business Name</label>
                    <input
                      type="text"
                      name="Service_Loc_Business"
                      value={formData.Service_Loc_Business}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Street</label>
                    <input
                      type="text"
                      name="Service_Street"
                      value={formData.Service_Street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Country</label>
                    <select
                      name="Service_Country"
                      value="US" // always set to United States isoCode
                      disabled
                    >
                      <option value="US">United States</option>
                    </select>
                  </div>


                  <div className="form-field">
                    <label>Service State</label>
                    <select
                      name="Service_State"
                      value={formData.Service_State}
                      onChange={handleServiceStateChange}
                      required
                    >
                      {StateList.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                  </div>


                  <div className="form-field">
                    <label>City</label>
                    <input
                      type="text"
                      name="Service_City"
                      value={formData.Service_City}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      name="Service_Zip_Code"
                      value={formData.Service_Zip_Code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <p className="required-note">
                Note: Fields marked with * are required
              </p>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;