import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "~/hook/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEnvelope,
  faIdBadge,
  faLocationDot,
  faPen,
  faPhone,
  faPlus,
  faRotateRight,
  faStar,
  faTrashCan,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import axiosClient from "~/api/axiosClient";
import { setCredentials } from "~/store/slices/authSlice";
import styles from "./Profile.module.scss";

const cx = classNames.bind(styles);
const locationApi = "/api/location";

const emptyAddressForm = {
  address: "",
  provinceId: "",
  districtId: "",
  wardCode: "",
  isDefault: false,
};

const normalizePlaceName = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(tinh|thanh pho|quan|huyen|thi xa|phuong|xa)\s+/i, "")
    .trim()
    .toLowerCase();

function ProfileField({ icon, label, value }) {
  return (
    <div className={cx("field")}>
      <span className={cx("field-icon")} aria-hidden="true">
        <FontAwesomeIcon icon={icon} />
      </span>
      <div className={cx("field-copy")}>
        <span className={cx("field-label")}>{label}</span>
        <span className={cx("field-value")}>{value || "Chưa cập nhật"}</span>
      </div>
    </div>
  );
}

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState("");
  const [locationNotice, setLocationNotice] = useState("");
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [formError, setFormError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const { data } = await axiosClient.get("/api/auth/me");
      dispatch(setCredentials({ token, user: data.user }));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể tải thông tin tài khoản. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, token]);

  const loadLocations = useCallback(async () => {
    setLocationsLoading(true);
    setLocationsError("");
    try {
      const { data } = await axiosClient.get(`${locationApi}/user`);
      setLocations(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setLocationsError(
        requestError.response?.data?.message ||
          "Không thể tải danh sách địa chỉ. Vui lòng thử lại.",
      );
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    loadProfile();
    loadLocations();
  }, [loadLocations, loadProfile, navigate, token]);

  const openAddressForm = async (location = null) => {
    setIsAddressFormOpen(true);
    setActiveLocation(location);
    setLocationNotice("");
    setAddressForm({
      ...emptyAddressForm,
      address: location?.address || "",
      isDefault: location?.isDefault ?? locations.length === 0,
    });
    setDistricts([]);
    setWards([]);
    setFormError("");
    setFormLoading(true);

    try {
      const provinceData = await axiosClient.get(
        `${locationApi}/address/provinces`,
      );
      const provinceList = provinceData.data || [];
      setProvinces(provinceList);

      if (location) {
        const province = provinceList.find(
          (item) =>
            normalizePlaceName(item.ProvinceName) ===
            normalizePlaceName(location.provinceName),
        );
        if (province) {
          const districtData = await axiosClient.get(
            `${locationApi}/address/districts`,
            { params: { provinceId: province.ProvinceID } },
          );
          const districtList = districtData.data || [];
          setDistricts(districtList);
          const district = districtList.find(
            (item) =>
              normalizePlaceName(item.DistrictName) ===
              normalizePlaceName(location.districtName),
          );

          if (district) {
            const wardData = await axiosClient.get(
              `${locationApi}/address/wards`,
              {
                params: { districtId: district.DistrictID },
              },
            );
            const wardList = wardData.data || [];
            setWards(wardList);
            const ward = wardList.find(
              (item) => String(item.WardCode) === String(location.wardCode),
            );

            setAddressForm((current) => ({
              ...current,
              provinceId: String(province.ProvinceID),
              districtId: String(district.DistrictID),
              wardCode: ward ? String(ward.WardCode) : "",
            }));
          } else {
            setAddressForm((current) => ({
              ...current,
              provinceId: String(province.ProvinceID),
            }));
          }
        }
      }
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "Không thể tải dữ liệu tỉnh, quận, phường. Vui lòng thử lại.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const closeAddressForm = () => {
    if (savingAddress) return;
    setIsAddressFormOpen(false);
    setActiveLocation(null);
    setFormError("");
  };

  const handleProvinceChange = async (event) => {
    const provinceId = event.target.value;
    setAddressForm((current) => ({
      ...current,
      provinceId,
      districtId: "",
      wardCode: "",
    }));
    setDistricts([]);
    setWards([]);
    if (!provinceId) return;

    try {
      const { data } = await axiosClient.get(
        `${locationApi}/address/districts`,
        {
          params: { provinceId },
        },
      );
      setDistricts(data || []);
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "Không thể tải danh sách quận, huyện.",
      );
    }
  };

  const handleDistrictChange = async (event) => {
    const districtId = event.target.value;
    setAddressForm((current) => ({ ...current, districtId, wardCode: "" }));
    setWards([]);
    if (!districtId) return;

    try {
      const { data } = await axiosClient.get(`${locationApi}/address/wards`, {
        params: { districtId },
      });
      setWards(data || []);
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "Không thể tải danh sách phường, xã.",
      );
    }
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    setFormError("");

    const province = provinces.find(
      (item) => String(item.ProvinceID) === addressForm.provinceId,
    );
    const district = districts.find(
      (item) => String(item.DistrictID) === addressForm.districtId,
    );
    const ward = wards.find(
      (item) => String(item.WardCode) === addressForm.wardCode,
    );

    if (!addressForm.address.trim() || !province || !district || !ward) {
      setFormError("Vui lòng điền địa chỉ và chọn đầy đủ tỉnh, quận, phường.");
      return;
    }

    const payload = {
      address: addressForm.address.trim(),
      provinceName: province.ProvinceName,
      districtName: district.DistrictName,
      districtId: Number(district.DistrictID),
      wardName: ward.WardName,
      wardCode: String(ward.WardCode),
      isDefault: addressForm.isDefault,
    };

    setSavingAddress(true);
    try {
      if (activeLocation?._id) {
        await axiosClient.put(`${locationApi}/${activeLocation._id}`, payload);
      } else {
        await axiosClient.post(locationApi, payload);
      }
      await loadLocations();
      setLocationNotice(
        activeLocation ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ mới.",
      );
      setIsAddressFormOpen(false);
      setActiveLocation(null);
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "Không thể lưu địa chỉ. Vui lòng thử lại.",
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const setDefaultAddress = async (location) => {
    setLocationsError("");
    try {
      await axiosClient.put(`${locationApi}/${location._id}`, {
        isDefault: true,
      });
      await loadLocations();
      setLocationNotice("Đã cập nhật địa chỉ mặc định.");
    } catch (requestError) {
      setLocationsError(
        requestError.response?.data?.message ||
          "Không thể đặt địa chỉ mặc định.",
      );
    }
  };

  const deleteAddress = async (location) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    setLocationsError("");
    try {
      await axiosClient.delete(`${locationApi}/${location._id}`);
      await loadLocations();
      setLocationNotice("Đã xóa địa chỉ.");
    } catch (requestError) {
      setLocationsError(
        requestError.response?.data?.message || "Không thể xóa địa chỉ.",
      );
    }
  };

  const initials = (user?.fullname || user?.username || "U")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const roleLabel =
    user?.role === "admin"
      ? "Quản trị viên"
      : user?.role === "staff"
        ? "Nhân viên"
        : "Khách hàng";

  return (
    <main className={cx("page")}>
      <div className={cx("topline")}>
        <div>
          <p className={cx("eyebrow")}>TÀI KHOẢN CỦA BẠN</p>
          <h1>Thông tin cá nhân</h1>
        </div>
        <Link to="/order" className={cx("orders-link")}>
          Đơn hàng của tôi
          <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Link>
      </div>

      {error && (
        <div className={cx("error-banner")} role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadProfile} disabled={loading}>
            <FontAwesomeIcon icon={faRotateRight} aria-hidden="true" />
            Thử lại
          </button>
        </div>
      )}

      <section className={cx("profile-panel")} aria-label="Hồ sơ cá nhân">
        <div className={cx("identity")}>
          <div className={cx("avatar-wrap")}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Ảnh đại diện" />
            ) : (
              <span className={cx("avatar-fallback")}>{initials}</span>
            )}
          </div>
          <div className={cx("identity-copy")}>
            <span className={cx("account-label")}>HỒ SƠ</span>
            <h2>
              {loading && !user
                ? "Đang tải..."
                : user?.fullname || "Thành viên FastCare"}
            </h2>
            <p>{user?.email || ""}</p>
          </div>
          <span className={cx("account-status")}>{roleLabel}</span>
        </div>

        <div className={cx("details")}>
          <div className={cx("section-heading")}>
            <div>
              <span className={cx("section-kicker")}>01 / HỒ SƠ</span>
              <h3>Thông tin tài khoản</h3>
            </div>
            {loading && (
              <span className={cx("loading-indicator")}>Đang đồng bộ</span>
            )}
          </div>
          <div className={cx("field-grid")}>
            <ProfileField
              icon={faUser}
              label="Họ và tên"
              value={user?.fullname}
            />
            <ProfileField
              icon={faIdBadge}
              label="Tên đăng nhập"
              value={user?.username}
            />
            <ProfileField icon={faEnvelope} label="Email" value={user?.email} />
            <ProfileField
              icon={faPhone}
              label="Số điện thoại"
              value={user?.phone}
            />
          </div>
        </div>

        <div className={cx("panel-footer")}>
          <span>Thông tin tài khoản được bảo mật.</span>
          <Link to="/order">
            Theo dõi đơn hàng
            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        className={cx("address-section")}
        aria-labelledby="addresses-title"
      >
        <div className={cx("address-heading")}>
          <div>
            <span className={cx("section-kicker")}>02 / GIAO HÀNG</span>
            <h2 id="addresses-title">Địa chỉ nhận hàng</h2>
          </div>
          <button
            type="button"
            className={cx("add-address")}
            onClick={() => openAddressForm()}
          >
            <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
            Thêm địa chỉ
          </button>
        </div>

        {locationNotice && (
          <div className={cx("location-notice")} role="status">
            <span>{locationNotice}</span>
            <button
              type="button"
              onClick={() => setLocationNotice("")}
              aria-label="Đóng"
            >
              <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            </button>
          </div>
        )}
        {locationsError && (
          <div className={cx("error-banner")} role="alert">
            <span>{locationsError}</span>
            <button
              type="button"
              onClick={loadLocations}
              disabled={locationsLoading}
            >
              <FontAwesomeIcon icon={faRotateRight} aria-hidden="true" />
              Thử lại
            </button>
          </div>
        )}

        {locationsLoading ? (
          <div className={cx("address-empty")}>Đang tải địa chỉ...</div>
        ) : locations.length ? (
          <div className={cx("address-list")}>
            {locations.map((location) => (
              <article className={cx("address-card")} key={location._id}>
                <div className={cx("address-icon")} aria-hidden="true">
                  <FontAwesomeIcon icon={faLocationDot} />
                </div>
                <div className={cx("address-copy")}>
                  <div className={cx("address-card-heading")}>
                    <h3>{location.address}</h3>
                    {location.isDefault && (
                      <span className={cx("default-badge")}>
                        <FontAwesomeIcon icon={faStar} aria-hidden="true" />
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p>
                    {[
                      location.wardName,
                      location.districtName,
                      location.provinceName,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <div className={cx("address-actions")}>
                  {!location.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(location)}
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openAddressForm(location)}
                    aria-label="Sửa địa chỉ"
                  >
                    <FontAwesomeIcon icon={faPen} aria-hidden="true" />
                    Sửa
                  </button>
                  <button
                    type="button"
                    className={cx("delete-address")}
                    onClick={() => deleteAddress(location)}
                    aria-label="Xóa địa chỉ"
                  >
                    <FontAwesomeIcon icon={faTrashCan} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={cx("address-empty")}>
            <span>Chưa có địa chỉ nhận hàng</span>
            <p>Thêm địa chỉ để sử dụng khi đặt hàng.</p>
          </div>
        )}
      </section>

      {isAddressFormOpen ? (
        <div
          className={cx("modal-backdrop")}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAddressForm();
          }}
        >
          <section
            className={cx("address-modal")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-form-title"
          >
            <div className={cx("modal-heading")}>
              <div>
                <span className={cx("section-kicker")}>ĐỊA CHỈ GIAO HÀNG</span>
                <h2 id="address-form-title">
                  {activeLocation ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeAddressForm}
                aria-label="Đóng"
                disabled={savingAddress}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formLoading ? (
              <div className={cx("address-empty")}>
                Đang tải danh sách địa giới...
              </div>
            ) : (
              <form className={cx("address-form")} onSubmit={saveAddress}>
                <label className={cx("form-field", "full-width")}>
                  <span>Số nhà, tên đường</span>
                  <input
                    autoFocus
                    required
                    value={addressForm.address}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    placeholder="Ví dụ: 12 Nguyễn Huệ"
                  />
                </label>
                <label className={cx("form-field")}>
                  <span>Tỉnh / thành phố</span>
                  <select
                    value={addressForm.provinceId}
                    onChange={handleProvinceChange}
                    required
                  >
                    <option value="">Chọn tỉnh / thành phố</option>
                    {provinces.map((province) => (
                      <option
                        key={province.ProvinceID}
                        value={province.ProvinceID}
                      >
                        {province.ProvinceName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={cx("form-field")}>
                  <span>Quận / huyện</span>
                  <select
                    value={addressForm.districtId}
                    onChange={handleDistrictChange}
                    required
                    disabled={!districts.length}
                  >
                    <option value="">Chọn quận / huyện</option>
                    {districts.map((district) => (
                      <option
                        key={district.DistrictID}
                        value={district.DistrictID}
                      >
                        {district.DistrictName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={cx("form-field", "full-width")}>
                  <span>Phường / xã</span>
                  <select
                    value={addressForm.wardCode}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        wardCode: event.target.value,
                      }))
                    }
                    required
                    disabled={!wards.length}
                  >
                    <option value="">Chọn phường / xã</option>
                    {wards.map((ward) => (
                      <option key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={cx("default-toggle")}>
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        isDefault: event.target.checked,
                      }))
                    }
                  />
                  <span>Đặt làm địa chỉ mặc định</span>
                </label>
                {formError && (
                  <p className={cx("form-error")} role="alert">
                    {formError}
                  </p>
                )}
                <div className={cx("form-actions")}>
                  <button
                    type="button"
                    className={cx("cancel-button")}
                    onClick={closeAddressForm}
                    disabled={savingAddress}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={cx("save-button")}
                    disabled={savingAddress}
                  >
                    {savingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default Profile;
