import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { guardPriceList, updateGuardPrice } from "../../Networking/APIs/GuardPriceApi";
import Loader from "../../Component/Loader";

export const GuardPriceList = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState({});
  const [loader, setLoader] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoader(true);
        const res = await dispatch(guardPriceList()).unwrap();
        if (res) setData(res);
      } catch (error) {
        console.error("Error fetching guard prices", error);
      } finally {
        setLoader(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleChange = (territory, state, service, value) => {
    setData((prev) => ({
      ...prev,
      [territory]: {
        ...prev[territory],
        [state]: {
          ...prev[territory][state],
          [service]: value === "" ? "" : Number(value),
        },
      },
    }));
  };

  const handleconfirm = async () => {
    try {
      await dispatch(updateGuardPrice(data)).unwrap();
      alert("Prices updated successfully");
    } catch (err) {
      console.error("Error updating prices:", err);
      alert("Update failed");
    }
  }

  const handleSubmit = async () => {
    const isConfirm = window.confirm("Are you sure you want to update the prices?");
    if (isConfirm) {
      await handleconfirm();
    }
  };


  const territories = Object.keys(data);
  const visibleData =
    selectedTerritory && data[selectedTerritory]
      ? { [selectedTerritory]: data[selectedTerritory] }
      : data;

  return (
    <div className="container mt-3">
      {loader ? (
        <div className="text-center my-4"><Loader /></div>
      ) : (
        <>
          <div className="mb-3 text-center">
            <h2 className="fw-bold text-dark">
              <i className="bi bi-cash-stack me-2 text-primary"></i>
              GUARDS PRICES
            </h2>
            <hr className="" style={{ borderTop: "2px solid #0e6efd" }} />
            <div className="d-flex row align-items-center justify-content-between">
              <div className="col-md-8">
              <select
                className="form-select"
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
              >
                <option value="">All Territories</option>
                {territories.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <button className="btn btn-primary m-3 w-50" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </div>
            </div>
          </div>

          {Object.entries(visibleData).map(([territory, states]) => (
            <div key={territory} className="mb-4">
              <h4 className="text-white p-2 rounded" style={{ backgroundColor: "#d4a52e" }}>
                {territory}
              </h4>
              <div className="row">
                {Object.entries(states).map(([state, services]) => (
                  <div key={state} className="col-md-4 mb-3">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <h5 className="card-title">{state}</h5>
                        {Object.entries(services).map(([service, price]) => (
                          <div
                            key={service}
                            className="d-flex justify-content-between align-items-center mb-2"
                          >
                            <span>{service}</span>
                            <input
                              type="number"
                              step="any"
                              className="form-control form-control-sm text-end"
                              value={price}
                              onChange={(e) =>
                                handleChange(territory, state, service, e.target.value)
                              }
                              style={{ width: "80px" }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}


        </>
      )}
    </div>
  );
};
