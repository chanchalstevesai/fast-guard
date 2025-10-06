import React, { useEffect, useState, useCallback } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { ApprovedList, DeleteUserApi } from "../../../Networking/APIs/ApprovedApi";
import { GetuserDetail } from "../../../Networking/APIs/UserGetDetails";
import Loader from "../../../Component/Loader";
import NoData from "../../../../Images/NoData.png";
import userImage from "../../../../Images/userImage.jpg";
import './Approvedlist.css';

export const ApprovedListComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isAnimated, setIsAnimated] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [localList, setLocalList] = useState([]);

  const [search, setSearch] = useState("");
  const { Approvedlist, loading, error } = useSelector((state) => state.ApprovedSlice);
  const listApprovedGuard = Approvedlist.data;

  useEffect(() => {
    const params = { status: 'approved', page };
    if (search.trim()) params.name = search.trim();

    dispatch(ApprovedList({ params }));
  }, [dispatch, page, search]);

  useEffect(() => {
    if (listApprovedGuard && listApprovedGuard.length > 0) {
      if (page === 1) {
        setLocalList([...listApprovedGuard]);
      } else {
        setLocalList((prev) => [
          ...prev,
          ...listApprovedGuard.filter(item =>
            !prev.some(prevItem => prevItem.id === item.id)
          )
        ]);
      }
      setIsAnimated(true);
    } else {
      if (page > 1) setHasMore(false);
      if (page === 1) setLocalList([]);
    }
  }, [listApprovedGuard, page]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await dispatch(DeleteUserApi(id)).unwrap();
        setPage(1);
        fetchUsers(1, true);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleView = (id) => {
    const data = { userId: id };
    dispatch(GetuserDetail({ id_: id }));
    navigate('/ApprovedView', { state: data });
  };

  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

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

  const handleSearch = useCallback(
    debounce((value) => {
      setPage(1);
      setHasMore(true);
      setSearch(value);
    }, 500),
    []
  );

  const renderContent = () => {
    if (loading && page === 1) {
      return (
        <div className="d-flex justify-content-center mt-5">
          <Loader />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center mt-5">
          <h4 className="text-danger">Failed to load data. Please try again later.</h4>
        </div>
      );
    }

    if (!localList || localList.length === 0) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center text-center mt-5">
          <img src={NoData} style={{ maxWidth: "300px" }} alt="No Data Found" className="img-fluid" />
          <h4 className="mt-3 text-muted">No Approved Guards Found</h4>
        </div>
      );
    }

    return (
      <>
        <div className={`row ${isAnimated ? 'visible' : ''}`}>
          {localList.map((user) => (
            <div className="col-lg-4 col-md-6 mb-4" key={user.id}>
              <div
                className="card approved_card card-hover shadow-sm h-100 border-0"
                style={{ borderRadius: "15px", cursor: 'pointer' }}
                onClick={() => handleView(user.id)}
              >
                <div
                  className="card-body p-3 d-flex align-items-center"
                  style={{
                    background: "linear-gradient(145deg, #fffbe6, #fdf5d3)",
                    borderRadius: "15px",
                  }}
                >
                  <img
                    src={user.profile_image || userImage}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="rounded-circle shadow-sm flex-shrink-0"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      border: "3px solid #d4a52e",
                    }}
                  />
                  <div className="ms-3 flex-grow-1">
                    <div className="d-flex justify-content-end mt-2">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(user.id);
                        }}
                      >
                        <i className="bi bi-trash me-1"></i>
                      </button>
                    </div>
                    <h5 className="card-title fw-bold mb-1">
                      {user.first_name} {user.last_name}
                    </h5>
                    <h6 className="card-subtitle mb-2 text-muted">
                      <i className="bi bi-geo-alt-fill me-1 text-secondary"></i>
                      {user.country || 'N/A'}
                    </h6>
                    <p className="card-text small mt-2 mb-0 text-dark">
                     
                       <i className="bi bi-envelope-fill me-2 text-secondary"></i>{user.email}<br />
                       <i className="bi bi-telephone-fill me-2 text-secondary"></i>{user.cell_phone}<br />
                      <i className="bi bi-person-check-fill me-2 text-success"></i>{user.status_change_by || 'Null'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && page > 1 && (
          <div className="d-flex justify-content-center my-3">
            <Loader />
          </div>
        )}
        {!hasMore && (
          <div className="text-center text-muted my-3">
            <small>No more data to load</small>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="text-center my-4">
        <h2 className="fw-bold text-dark">
          <i className="bi bi-person-check-fill me-2 text-success"></i>
          APPROVED GUARDS
        </h2>
        <hr className="" style={{ borderTop: '2px solid #d4a51a' }} />
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search by name or email..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

