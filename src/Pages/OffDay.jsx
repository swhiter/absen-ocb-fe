import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";
import Select from "react-select";

const VITE_API_URL = import.meta.env.VITE_API_URL;
const now = new Date();
const DateNow = format(now, "yyyy-MM-dd HH:mm:ss");

const OffDay = () => {
  const [offDay, setoffDay] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedoffDay, setSelectedoffDay] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal untuk tambah user baru
  const [newoffDay, setnewoffDay] = useState({
    user_id: "",
    type_off: "",
    tanggal: "",
    reason: "",
  });
  const [typeOff, settypeOff] = useState([]);
  const [selectedTypeOff, setSelectedTypeOff] = useState(null);
  const [users, setusers] = useState([]);
  const [selecteduser, setSelecteduser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
  
      try {
        // Fetch Off Day
        const offDayResponse = await axios.get(`${VITE_API_URL}/management/offday`, { headers });
        const fetchedOffDayData = offDayResponse.data.data || [];
        const validOffDayData = fetchedOffDayData.filter((item) => item && item.name);
        setoffDay(validOffDayData);
  
        // Fetch Type Off
        const typeOffResponse = await axios.get(`${VITE_API_URL}/management/type-off`, { headers });
        const typeOffOptions = typeOffResponse.data.data.map((typeoff) => ({
          value: typeoff.id,
          label: typeoff.type_off,
        }));
        settypeOff(typeOffOptions);
  
        if (selectedoffDay.id_type_off) {
          const initialTypeOff = typeOffOptions.find(
            (typeoff) => typeoff.value === selectedoffDay.id_type_off
          );
          setSelectedTypeOff(initialTypeOff || null);
        }
  
        // Fetch Users
        const userResponse = await axios.get(`${VITE_API_URL}/users`, { headers });
        const userOptions = userResponse.data.data.map((user) => ({
          value: user.user_id,
          label: user.name,
        }));
        setusers(userOptions);
  
        if (selectedoffDay.user_id) {
          const initialUser = userOptions.find(
            (user) => user.value === selectedoffDay.user_id
          );
          setSelecteduser(initialUser || null);
        }
        
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [selectedoffDay.id_type_off, selectedoffDay.user_id]);
  
  // Filtered OffDay
  const filteredoffDay = offDay.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
  );
  
  console.log("Selected offDay:", selectedoffDay);
  console.log("typeOff:", typeOff);
  console.log("Selected typeOff:", selectedTypeOff);

  const handleAddoffDay = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userProfile = sessionStorage.getItem("userProfile");
      const userData = JSON.parse(userProfile); // Parse JSON
      const userId = userData[0]?.user_id;

      //   const userData = JSON.parse(sessionStorage.getItem("userData"));
      //   const userId = userData?.id;

      const response = await axios.post(
        `${VITE_API_URL}/management/addoffday`,
        {
          ...newoffDay,
          created_by: userId,
          created_at: DateNow,
        },
        { headers }
      );
      // Ambil data baru dari respons API
      const addedOffday = response.data.data;

      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setoffDay((prev) => [
        ...prev,
        {
          ...addedOffday,
          // name: users.find((u) => u.value === addedAbsen.user_id)?.label || "", // Nama user
          type_off:
            typeOff.find((r) => r.value === addedOffday.type_off)?.label || "", // Nama retail
          name: users.find((r) => r.value === addedOffday.user_id)?.label || "",
        },
      ]);

      // setoffDay((prev) => [...prev, response.data.data]);
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
      setnewoffDay({ user_id: "", tanggal: "", type_off: "", reason: "" });
      setSelectedTypeOff(null);
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  const handleUpdate = (row) => {
    setSelectedoffDay(row);
    setModalVisible(true);
  };

  // const handleRetailChange = (selectedOption) => {
  //   setSelectedRetail(selectedOption);
  //   setSelectedoffDay({
  //     ...selectedoffDay,
  //     retail_id: selectedOption ? selectedOption.value : "",
  //   });
  // };

  const handleuserChange = (selectedOption) => {
    setSelecteduser(selectedOption);
    setSelectedoffDay({
      ...selectedoffDay,
      user_id: selectedOption ? selectedOption.value : "",
    });
  };

  const handleTypeoffChange = (selectedOption) => {
    setSelectedTypeOff(selectedOption);
    setSelectedoffDay({
      ...selectedoffDay,
      id_type_off: selectedOption ? selectedOption.value : "",
    });
  };

  const handleDelete = async (row) => {
    Swal.fire({
      title: "Kamu Yakin ?",
      text: `Delete Off Day untuk User : ${row.name} ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const userProfile = sessionStorage.getItem("userProfile");
      const userData = JSON.parse(userProfile); // Parse JSON
      const userId = userData[0]?.user_id;
          const headers = { Authorization: `Bearer ${token}` };
          const responseDelete = await axios.post(
            `${VITE_API_URL}/management/deleteoffday/${row.id_off}`,
            {
              deleted_by: userId,
              deleted_at: DateNow,
            },
            { headers }
          );
          Swal.fire("Deleted!", `${responseDelete.data.message}`, "success");
          setoffDay((prev) =>
            prev.filter((item) => item.id_off !== row.id_off)
          );
        } catch (error) {
          Swal.fire(
            "Error!",
            error.response?.data?.message || error.message,
            "error"
          );
        }
      }
    });
  };

  const handleSaveUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userProfile = sessionStorage.getItem("userProfile");
      const userData = JSON.parse(userProfile); // Parse JSON
      const userId = userData[0]?.user_id;
      const responseUpdate = await axios.post(
        `${VITE_API_URL}/management/updateoffday/${selectedoffDay.id_off}`,
        {
          user_id: selectedoffDay.user_id,
          tanggal: selectedoffDay.tanggal,
          type_off: selectedoffDay.id_type_off,
          reason: selectedoffDay.reason,
          updated_by: userId,
          updated_at: DateNow,
        },
        { headers }
      );
      //const updatedAbsen = responseUpdate.data.data;

      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setoffDay((prevOffday) =>
        prevOffday.map((item) =>
          item.id_off === selectedoffDay.id_off
            ? {
                ...selectedoffDay,
                // name: users.find((u) => u.value === selectedoffDay.user_id)?.label || "",
                type_off:
                  typeOff.find((r) => r.value === selectedoffDay.id_type_off)
                    ?.label || "",
                name:
                  users.find((r) => r.value === selectedoffDay.user_id)
                    ?.label || "",
              }
            : item
        )
      );
      // setoffDay(responseUpdate.data.data);
      Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
      // setoffDay((prev) =>
      //   prev.map((item) =>
      //     item.absen_id === selectedoffDay.absen_id ? selectedoffDay : item
      //   )
      // );
      setModalVisible(false);
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  const columns = [
    {
      name: "#",
      cell: (row, index) => <span>{index + 1}</span>,
      width: "50px",
    },
    { name: "Nama Karyawan", selector: (row) => row.name },
    {
      name: "Tanggal",
      selector: (row) => format(new Date(row.tanggal), "yyyy-MM-dd"),
    },
    { name: "Tipe Off", selector: (row) => row.type_off },
    { name: "Keterangan", selector: (row) => row.reason },

    {
      name: "Action",
      cell: (row) => (
        <div className="action-buttons">
          <button
            className="btn btn-gradient-warning btn-sm"
            onClick={() => handleUpdate(row)}
          >
            Update
          </button>
          <button
            className="btn btn-gradient-danger btn-sm"
            onClick={() => handleDelete(row)}
          >
            Delete
          </button>
        </div>
      ),
    }
  ];

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h3 className="page-title">Management Hari Libur</h3>
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Table Hari Libur</h4>
              <div className="table-responsive">
                {loading ? (
                  <p>Loading data...</p>
                ) : error ? (
                  <p className="text-danger">Error: {error}</p>
                ) : (
                  <>
                    <div className="row">
                      <div className="col-sm-8">
                        <button
                          className="btn btn-gradient-primary btn-sm"
                          onClick={() => setAddModalVisible(true)}
                        >
                          Tambah Hari Libur
                        </button>
                      </div>
                      <div className="col-sm-4">
                        <div className="input-group">
                          <div className="input-group-prepend bg-transparent">
                            <i
                              className="input-group-text border-0 mdi mdi-magnify"
                              style={{ margin: "10px" }}
                            ></i>
                          </div>
                          <input
                            className="form-control bg-transparent border-0"
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                              margin: "10px",
                              padding: "5px",
                              width: "200px",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {filteredoffDay && filteredoffDay.length > 0 ? (
                      <DataTable
                        keyField="offday-id"
                        columns={columns}
                        data={filteredoffDay}
                        pagination
                      />
                    ) : (
                      <p>No data available.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah User */}
      <Modal show={addModalVisible} onHide={() => setAddModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Hari Libur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Karyawan</label>
            <Select
              options={users}
              value={
                newoffDay.user_id
                  ? {
                      value: newoffDay.user_id,
                      label: users.find((r) => r.value === newoffDay.user_id)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelecteduser(option);
                setnewoffDay({
                  ...newoffDay,
                  user_id: option ? option.value : "",
                });
              }}
              placeholder="Pilih Karyawan..."
              isClearable
            />
          </div>

          <div className="form-group">
            <label>Tanggal</label>
            <input
              type="date"
              className="form-control"
              value={newoffDay.tanggal}
              onChange={(e) =>
                setnewoffDay({ ...newoffDay, tanggal: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Kategori Libur</label>
            <Select
              options={typeOff}
              value={
                newoffDay.type_off
                  ? {
                      value: newoffDay.type_off,
                      label: typeOff.find((r) => r.value === newoffDay.type_off)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedTypeOff(option);
                setnewoffDay({
                  ...newoffDay,
                  type_off: option ? option.value : "",
                });
              }}
              placeholder="Pilih Kategori tidak Masuk..."
              isClearable
            />
          </div>
          <div className="form-group">
            <label>Keterangan </label>
            <textarea
              type="text"
              className="form-control"
              value={newoffDay.reason}
              onChange={(e) =>
                setnewoffDay({ ...newoffDay, reason: e.target.value })
              }
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn btn-light"
            onClick={() => setAddModalVisible(false)}
          >
            Close
          </Button>
          <Button
            className="btn btn-gradient-primary me-2"
            onClick={handleAddoffDay}
          >
            Tambah
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Hari Libur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card">
            <div className="card-body">
              <div className="form-group">
                <label> Karyawan</label>
                <Select
                  options={users} // Data karyawan
                  value={selecteduser} // Nilai yang dipilih
                  onChange={handleuserChange} // Fungsi ketika berubah
                  placeholder="Pilih Karyawan..."
                  isClearable // Tambahkan tombol untuk menghapus pilihan
                />
              </div>
              <div className="form-group">
                <label>Tanggal</label>
                <input
                  className="form-control"
                  type="date"
                  value={
                    selectedoffDay.tanggal
                      ? new Date(selectedoffDay.tanggal)
                          .toISOString()
                          .split("T")[0] // Format ke yyyy-MM-dd
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedoffDay({
                      ...selectedoffDay,
                      tanggal: e.target.value, // Nilai langsung dari input date
                    })
                  }
                />
              </div>
              
              <div className="form-group">
                <label> Kageori Libur</label>
                <Select
                  options={typeOff} // Data karyawan
                  value={selectedTypeOff} // Nilai yang dipilih
                  onChange={handleTypeoffChange} // Fungsi ketika berubah
                  placeholder="Pilih kategory Libur..."
                  isClearable // Tambahkan tombol untuk menghapus pilihan
                />
              </div>
              <div className="form-group">
                <label>Keterangan</label>
                <textarea
                  type="text"
                  className="form-control"
                  value={selectedoffDay.reason}
                  onChange={(e) =>
                    setSelectedoffDay({
                      ...selectedoffDay,
                      reason: e.target.value,
                    })
                  }
                />
              </div>
              {/* <div className="form-group">
                  <label> Retail / Outlet</label>
                  <Select
                    options={retails} // Data karyawan
                    value={selectedRetail} // Nilai yang dipilih
                    onChange={handleRetailChange} // Fungsi ketika berubah
                    placeholder="Pilih retail..."
                    isClearable // Tambahkan tombol untuk menghapus pilihan
                  />
                </div> */}
              {/* <div className="form-group">
            <label>user Absen</label>
            <Select
              options={users}
              value={
                selectedoffDay.user_absen
                  ? {
                      value: selectedoffDay.user_absen,
                      label: users.find(
                        (r) => r.value === selectedoffDay.user_absen
                      )?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelecteduser(option);
                setSelectedoffDay({
                  ...selectedoffDay,
                  user_absen: option ? option.value : "",
                });
              }}
              placeholder="Pilih user Absen..."
              isClearable
            />
            
          </div> */}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn btn-light"
            onClick={() => setModalVisible(false)}
          >
            Close
          </Button>
          <Button
            className="btn btn-gradient-primary me-2"
            onClick={handleSaveUpdate}
          >
            Simpan Perubahan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OffDay;
