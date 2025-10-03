import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { GetuserDetail } from "../../Networking/APIs/UserGetDetails";
import { GetCountryStateApi } from "../../Networking/APIs/UserGetDetails";
import { ApprovedList } from "../../Networking/APIs/ApprovedApi";
import { useNavigate } from "react-router-dom";
import NoData from "../../../Images/NoData.png";
import Loader from "../../Component/Loader";

export const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [users, setUsers] = useState([]);
  const [isAnimated, setIsAnimated] = useState(false);
  // Debounced setters for server-side filtering
  const setSearchQueryDebounced = useMemo(
    () =>
      debounce((value) => {
        setSearchQuery(value);
      }, 500),
    []
  );
  const setSelectedCountryDebounced = useMemo(
    () =>
      debounce((value) => {
        setSelectedCountry(value);
      }, 300),
    []
  );
  const setSelectedStateDebounced = useMemo(
    () =>
      debounce((value) => {
        setSelectedState(value);
      }, 300),
    []
  );

  // Local state for dropdowns
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  // Fetch paginated users with the same pattern as Approved list (limit 10)
  useEffect(() => {
    const controller = new AbortController();
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = { page, status: "None" };
        if (searchQuery.trim()) {
          const q = searchQuery.trim();
          params.search = q; // some backends expect 'search'
          params.name = q; // maintain compatibility with endpoints using 'name'
        }
        if (selectedCountry) params.country = selectedCountry;
        if (selectedState) params.state = selectedState;

        const res = await dispatch(ApprovedList({ params })).unwrap();
        const pageData = res?.data || [];

        if (page === 1) {
          setUsers(pageData);
        } else {
          setUsers((prev) => [
            ...prev,
            ...pageData.filter(
              (item) => !prev.some((prevItem) => prevItem.id === item.id)
            ),
          ]);
        }

        // Determine if more pages exist; fallback to length check
        const meta = res?.pagination;
        if (
          meta &&
          meta.current_page !== undefined &&
          meta.last_page !== undefined
        ) {
          setHasMore(meta.current_page < meta.last_page);
        } else {
          setHasMore(pageData.length >= 10);
        }
        setIsAnimated(true);
      } catch (err) {
        console.error(err);
        if (page === 1) setUsers([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, [dispatch, page, searchQuery, selectedCountry, selectedState]);

  // Fetch countries and states using your thunk
  useEffect(() => {
    dispatch(GetCountryStateApi())
      .unwrap()
      .then((res) => {
        setCountries(res.countries || []); // adjust based on API response structure
        setStates(res.states || []);
      })
      .catch(console.error);
  }, [dispatch]);

  // When filters/search change, reset pagination
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [searchQuery, selectedCountry, selectedState]);

  const handleView = useCallback(
    (id) => {
      dispatch(GetuserDetail({ id }));
      navigate(`/UserDetailView/${id}`);
    },
    [dispatch, navigate]
  );

  const handleScroll = useCallback(
    debounce(() => {
      if (!hasMore || loading) return;
      const scrollTop = document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.offsetHeight;
      if (scrollTop + windowHeight + 50 >= fullHeight) {
        setPage((prev) => prev + 1);
      }
    }, 300),
    [hasMore, loading]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div
      className="p-5 d-flex justify-content-center"
      style={{
        background: "linear-gradient(135deg, #fffbe6, #f7e0b5)",
        minHeight: "100vh",
      }}
    >
      <div
        className="card w-100 shadow"
        style={{ borderRadius: "12px", maxWidth: "1200px" }}
      >
        <div
          className="card-header text-center fw-bold text-black"
          style={{
            backgroundColor: "#d4a52e",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            fontSize: "20px",
            padding: "15px",
          }}
        >
          GUARD LIST
        </div>
        <div className="card-body">
          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label">Search by Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter first or last name"
                defaultValue={searchQuery}
                onChange={(e) => setSearchQueryDebounced(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Filter by Country</label>
              <select
                className="form-select"
                defaultValue={selectedCountry}
                onChange={(e) => setSelectedCountryDebounced(e.target.value)}
              >
                <option value="">All Countries</option>
                {countries.map((country, i) => (
                  <option key={i} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Filter by State</label>
              <select
                className="form-select"
                defaultValue={selectedState}
                onChange={(e) => setSelectedStateDebounced(e.target.value)}
              >
                <option value="">All States</option>
                {states.map((state, i) => (
                  <option key={i} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading / Data / No Data */}
          {loading && page === 1 ? (
            <div className="d-flex flex-column align-items-center justify-content-center text-center mt-5">
              <Loader />
              <h5 className="mt-3 text-muted">Loading Guard list...</h5>
            </div>
          ) : users.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Cell Phone</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Country</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id || index}>
                      <td>{index + 1}</td>
                      <td>{user.first_name}</td>
                      <td>{user.last_name}</td>
                      <td>{user.cell_phone}</td>
                      <td>{user.city}</td>
                      <td>{user.state}</td>
                      <td>{user.country}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleView(user.id)}
                        >
                          <i className="bi bi-eye"> View</i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && page > 1 && (
                <div className="d-flex justify-content-center my-3">
                  <Loader />
                </div>
              )}
              {!hasMore && (
                <div className="text-center text-muted my-2">
                  <small>No more data to load</small>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center text-center mt-5">
              <img
                src={NoData}
                style={{ maxWidth: "300px" }}
                alt="No Data Found"
                className="img-fluid"
              />
              <h4 className="mt-3 text-muted">No Data Found</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
