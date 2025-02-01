import { useState, useRef, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);
  const [selectedoffDay, setSelectedoffDay] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal untuk tambah user baru
  const [newoffDay, setnewoffDay] = useState({
    user_id: "",
    type_off: "",
    tanggal: "",
    reason: "",
    employes_id : "",
    name: "",
  });
  const [typeOff, settypeOff] = useState([]);
  const [selectedTypeOff, setSelectedTypeOff] = useState(null);
  const [users, setusers] = useState([]);
  const [selecteduser, setSelecteduser] = useState(null);

  const [filterText, setFilterText] = useState({
    name: "",
    tanggal: "",
    type_off: "",
    reason: "",
    
  

  });
  const inputRefs = useRef({});
  const [activeInput, setActiveInput] = useState(null);
  
  const formatOffDayData = (data) => {
    if (!Array.isArray(data)) {
      if (typeof data === "object" && data !== null) {
        data = [data]; // Ubah objek menjadi array tunggal
      } else {
        return []; // Return array kosong jika bukan array atau objek
      }
    }

    return data.map((item,) => {
      return {
        id: item.id_offday,
        tanggal: item.tanggal || "",
        type_off: item.type_off || "Unknown",
        reason: item.reason || "Unknown",
        id_type_off : item.id_type_off,
        name: item.detail_user
          ? item.detail_user.map((group) => `${group.name}`).join(", ")
          : "-",
        employes_id: item.detail_user
          ? item.detail_user.map((group) => `${group.user_id}`).join(", ")
          : "-",
      };
    });
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
  
      try {
        // Fetch Off Day
        const offDayResponse = await axios.get(`${VITE_API_URL}/management/offday`, { headers });
        const formattedData = formatOffDayData(offDayResponse.data.data);
        setoffDay(formattedData);
        
        setError(null);
      } catch (error) {
        
        setError(error.response?.data?.message || error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSelect = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
  
        const typeOffResponse = await axios.get(`${VITE_API_URL}/management/type-off`, { headers });
        const typeOffOptions = typeOffResponse.data.data.map((typeoff) => ({
          value: typeoff.id,
          label: typeoff.type_off,
        }));
        settypeOff(typeOffOptions);
  
        // Update selected group jika ada group_absen di selectedCatabsen
        if (selectedoffDay?.id_type_off) {
          const initialTypeOff = typeOff.find(
            (typeoff) => typeoff.value === selectedoffDay.id_type_off
          );
          setSelectedTypeOff(initialTypeOff || null);
        }

        const userResponse = await axios.get(`${VITE_API_URL}/users`, { headers });
        const userOptions = userResponse.data.data.map((user) => ({
          value: user.user_id,
          label: user.name,
        }));
        setusers(userOptions);
        if (selectedoffDay?.employes_id) {
          const groupIds = selectedoffDay.employes_id
            .split(", ")
            .map((user_id) => Number(user_id.trim())); // Konversi ke number
          
        
          const initialGroups = userOptions.filter((group) =>
            groupIds.includes(group.value)
          );
        
          setSelecteduser(initialGroups);
        }
      } catch (error) {
        console.error("Failed to fetch group:", error);
      }
    };
  
    fetchSelect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedoffDay?.employes_id, selectedoffDay?.id_type_off]);


  const filteredoffDay = offDay.filter((item) =>
    Object.keys(filterText).every((key) => {
      const itemValue = String(item[key])?.toLowerCase(); // Pastikan item selalu jadi string kecil
      const filterValue = filterText[key].toLowerCase(); // Pastikan filter input menjadi huruf kecil
  
      // Pastikan bahwa itemValue mengandung filterValue
      return itemValue.includes(filterValue);
    })
  );

  

  const handleInputChange = (field, value) => {
    setFilterText((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  
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

      let employes_offday = [];
      if (selecteduser?.length > 0) {
        employes_offday = selecteduser.map((user) => ({
          user_id: user.value,
        }));
      }

      const payload = {
        ...newoffDay,
        created_by: userId,
        created_at: DateNow,
        employes_offday,
      };

      const response = await axios.post(
        `${VITE_API_URL}/management/addoffday`,
        payload,
        { headers }
      );
      // Ambil data baru dari respons API
      const addedOffday = response.data.data;

      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setoffDay((prev) => [
       
        {
          ...addedOffday,
          // name: users.find((u) => u.value === addedAbsen.user_id)?.label || "", // Nama user
          type_off:
            typeOff.find((r) => r.value === addedOffday.type_off)?.label || "", // Nama retail
            name: Array.isArray(selecteduser) && selecteduser.length > 0
            ? selecteduser.map((g) => g.label).join(", ") 
            : "Semua Karyawan",
        },
        ...prev,
      ]);

      // setoffDay((prev) => [...prev, response.data.data]);
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
      setnewoffDay({ user_id: "", tanggal: "", type_off: "", reason: "", employes_id: "" });
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

  const handleCloseUpdate = () =>
  {
    setSelectedoffDay([]);
    setModalVisible(false);
  };

  // const handleRetailChange = (selectedOption) => {
  //   setSelectedRetail(selectedOption);
  //   setSelectedoffDay({
  //     ...selectedoffDay,
  //     retail_id: selectedOption ? selectedOption.value : "",
  //   });
  // };

  const handleuserChange = (selectedOption) => {
    setSelecteduser(selectedOption ||[]);
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
      text: `Delete Off Day untuk Tanggal : ${format(new Date(row.tanggal), "yyyy-MM-dd")} ?`,
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
            `${VITE_API_URL}/management/deleteoffday/${row.id}`,
            {
              deleted_by: userId,
              deleted_at: DateNow,
            },
            { headers }
          );
          Swal.fire("Deleted!", `${responseDelete.data.message}`, "success");
          setoffDay((prev) =>
            prev.filter((item) => item.id!== row.id)
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


      let employes_offday = [];
      if (selecteduser?.length > 0) {
        employes_offday = selecteduser.map((group) => ({
          user_id: group.value,
        }));
      }

      const payload = {
        tanggal: selectedoffDay.tanggal,
        type_off: selectedoffDay.id_type_off,
        reason: selectedoffDay.reason,
        employes_offday,
        updated_by: userId,
        updated_at: DateNow,
      };

      const responseUpdate = await axios.post(
        `${VITE_API_URL}/management/updateoffday/${selectedoffDay.id}`,
        payload,
        { headers }
      );
      //const updatedAbsen = responseUpdate.data.data;

      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setoffDay((prevOffday) =>
        prevOffday.map((item) =>
          item.id === selectedoffDay.id
            ? {
                ...selectedoffDay,
                // name: users.find((u) => u.value === selectedoffDay.user_id)?.label || "",
                type_off:
                  typeOff.find((r) => r.value === selectedoffDay.id_type_off)
                    ?.label || "",
                    name: Array.isArray(selecteduser)&& selecteduser.length > 0
                    ? selecteduser.map((g) => g.label).join(", ")
                    : "Semua Karyawan",
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
      name: (
        <span style={{ marginBottom: "45px" }}>#</span>
      ),
      cell: (row, index) => <span>{index + 1}</span>,
      width: "50px",
    },
    { name: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ marginBottom: "6px" }}>Nama Karyawan</span>
        <input
          type="text"
          value={filterText.name}
          className="form-control mt-1 filter-header"
          ref={(el) => (inputRefs.current.name = el)}
          onChange={(e) => handleInputChange("name", e.target.value)}
          onFocus={() => setActiveInput('name')} // Set active input
        />
      </div>
    ),
     selector: (row) => row.name },
    {
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Tanggal</span>
          <input
            type="text"
            value={filterText.tanggal}
            className="form-control mt-1 filter-header"
            ref={(el) => (inputRefs.current.tanggal = el)}
            onChange={(e) => handleInputChange("tanggal", e.target.value)}
            onFocus={() => setActiveInput('tanggal')} // Set active input
          />
        </div>
      ),
      selector: (row) => format(new Date(row.tanggal), "yyyy-MM-dd"),
      // selector: (row) => row.tanggal,
    },
    { name: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ marginBottom: "6px" }}>Type Off/Libur</span>
        <input
          type="text"
          value={filterText.type_off}
          className="form-control mt-1 filter-header"
          ref={(el) => (inputRefs.current.type_off = el)}
          onChange={(e) => handleInputChange("type_off", e.target.value)}
          onFocus={() => setActiveInput('type_off')} // Set active input
        />
      </div>
    ),selector: (row) => row.type_off },
    { name: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ marginBottom: "6px" }}>Keterangan</span>
        <input
          type="text"
          value={filterText.reason}
          className="form-control mt-1 filter-header"
          ref={(el) => (inputRefs.current.reason = el)}
          onChange={(e) => handleInputChange("reason", e.target.value)}
          onFocus={() => setActiveInput('reason')} // Set active input
        />
      </div>
    ), selector: (row) => row.reason },

    {
      name: (
        <span style={{ marginBottom: "45px" }}>Action</span>
      ),
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

  useEffect(() => {
    if (activeInput && inputRefs.current[activeInput]) {
      inputRefs.current[activeInput].focus();
    }
  }, [filterText, activeInput]);

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
              <div className="">
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
                          style={{marginBottom:"30px"}}
                        >
                          Tambah Hari Libur
                        </button>
                      </div>
                      <div className="col-sm-4">
                        <div className="input-group">
                          <div className="input-group-prepend bg-transparent">
                            
                          </div>
                          
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
                      <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            {columns.map((col, index) => (
                              <th key={index} style={{fontSize:"12px"}}>{col.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredoffDay.length > 0 ? (
                            filteredoffDay.map((row, index) => (
                              <tr key={index}>
                                {columns.map((col, colIndex) => (
                                  <td key={colIndex} >
                                    {col.cell ? col.cell(row) : col.selector(row)}
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                                <em>No data found</em>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah User */}
      <Modal show={addModalVisible} onHide={() => setAddModalVisible(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tambah Hari Libur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         

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
            <label>Karyawan (
                <span className="text-secondary text-small">
                  Kosongkan karyawan jika tujuan nya untuk Semua Karyawan
                </span>
                )</label>
            <Select
                options={users}
                isMulti
                value={selecteduser}
                onChange={handleuserChange}
                placeholder="Pilih Karyawan..."
                isClearable
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

      <Modal show={modalVisible} onHide={() => setModalVisible(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Hari Libur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card">
            <div className="card-body">
             
              <div className="form-group">
                <label>Tanggal</label>
                <input
                  className="form-control"
                  type="date"
                  value={
                    selectedoffDay.tanggal
                      ? new Date(selectedoffDay.tanggal).toLocaleDateString("en-CA") // Format YYYY-MM-DD
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
                <label> Karyawan (
                <span className="text-secondary text-small">
                  Kosongkan karyawan jika tujuan nya untuk Semua Karyawan
                </span>
                )</label>
                <Select
                  options={users} 
                  isMulti
                  value={selecteduser} // Nilai yang dipilih
                  onChange={(selectedOption) => setSelecteduser(selectedOption)} // Fungsi ketika berubah
                  placeholder="Pilih Karyawan..."
                  isClearable // Tambahkan tombol untuk menghapus pilihan
                />
              </div>
              
              <div className="form-group">
                <label> Kageori Libur </label>
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
             
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn btn-light"
            onClick={handleCloseUpdate}
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
