import React, { useEffect, useState } from 'react';
import { BaseURl, Fastguard_IDForm } from './Networking/APIs/NWconfig';
import { toast } from 'react-toastify';
import Loader from './Component/Loader';

const PassportUploadForm = ({ email, setShowBadgeModal }) => {

    const [formData, setFormData] = useState({
        name: '',
        badge: '',
        date_new: '',
        expiry_new: '',
        email: ''
    });
    const [passportImage, setPassportImage] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setPassportImage(e.target.files[0]);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!passportImage) newErrors.passportImage = 'Passport image is required';
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.badge) newErrors.badge = 'Badge field is required';
        if (!formData.date_new) newErrors.date_new = 'Issue date is required';
        if (!formData.expiry_new) newErrors.expiry_new = 'Expiry date is required';

        if (formData.date_new && formData.expiry_new) {
            const issueDate = new Date(formData.date_new);
            const expiryDate = new Date(formData.expiry_new);
            if (issueDate > expiryDate) {
                newErrors.date_new = 'Issue date cannot be after expiry date';
                newErrors.expiry_new = 'Expiry date must be after issue date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Sync email prop
    useEffect(() => {
        if (email) {
            setFormData(prev => ({ ...prev, email }));
        }
    }, [email]);

    // Animate form
    useEffect(() => {
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formatDate = (inputDate) => {
            const date = new Date(inputDate);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year}`;
        };

        const data = new FormData();
        data.append('passport_image', passportImage);
        data.append('name', formData.name);
        data.append('badge', formData.badge);
        data.append('date_new', formatDate(formData.date_new));
        data.append('expiry_new', formatDate(formData.expiry_new));
        data.append('email', formData.email);

        setLoading(true);

        try {
            const response = await fetch(BaseURl + Fastguard_IDForm, {
                method: 'POST',
                body: data,
            });

            setLoading(false);

            if (response.ok) {
                const resJson = await response.json();
                if (resJson.guard_badge) {
                    setImageBase64(resJson.guard_badge);
                    setShowModal(true);
                    setPassportImage(null);
                    setErrors({});
                }
                if (setShowBadgeModal) setShowBadgeModal(false);
                toast.success('Form submitted successfully!');
            } else {
                toast.error('Form submission failed.');
            }
        } catch (error) {
            setLoading(false);
            console.error('Error submitting form:', error);
            toast.error('Error submitting form');
        }
    };

    return (
        <>
            <div className="d-flex justify-content-center align-items-center mb-3 bg-light" style={{ background: "#fff" }}>
                {!loading ? (
                    <div className={`col-md-12 bg-white p-3 rounded ${isAnimated ? 'visible' : ''}`}>
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Passport Image:</label>
                                <input type="file" className="form-control" onChange={handleFileChange} />
                                {errors.passportImage && <div className="text-danger small">{errors.passportImage}</div>}
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Name:</label>
                                        <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} />
                                        {errors.name && <div className="text-danger small">{errors.name}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Issue Date:</label>
                                        <input type="date" className="form-control" name="date_new" value={formData.date_new} onChange={handleChange} />
                                        {errors.date_new && <div className="text-danger small">{errors.date_new}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Badge Type:</label>
                                        <input type="text" className="form-control" name="badge" value={formData.badge} onChange={handleChange} />
                                        {errors.badge && <div className="text-danger small">{errors.badge}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Expiry Date:</label>
                                        <input type="date" className="form-control" name="expiry_new" value={formData.expiry_new} onChange={handleChange} />
                                        {errors.expiry_new && <div className="text-danger small">{errors.expiry_new}</div>}
                                    </div>
                                </div>
                            </div>

                            <hr className='text-warning' />
                            <div className="text-center">
                                <button type="submit" className="btn btn-warning px-5 rounded-pill fw-bold">
                                    <i className="bi bi-upload me-2"></i>Submit
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="d-flex justify-content-center h-100vh">
                        <Loader />
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" id="exampleModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header d-flex justify-content-between">
                                <h5 className="modal-title">Processed Image</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body text-center">
                                <img
                                    src={imageBase64}
                                    alt="Processed"

                                    className="img-fluid border p-2 mx-auto"
                                    style={{ maxHeight: '400px' }}
                                />
                                <a
                                    href={imageBase64}
                                    download={`${formData.name || 'badge'}.png`}
                                    className="btn btn-outline-success mt-3"
                                    onClick={() => {
                                        setFormData({
                                            name: '',
                                            badge: '',
                                            date_new: '',
                                            expiry_new: '',
                                            email: email,
                                        });
                                        setPassportImage(null);
                                        setShowModal(false);
                                    }}
                                >
                                    <i className="bi bi-download me-1"></i> Download Image
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PassportUploadForm;
