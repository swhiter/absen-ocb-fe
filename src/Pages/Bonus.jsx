import { useState,useRef, useEffect } from "react";
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

const Bonus = () => {
  const [bonus, setbonus] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedbonus, setSelectedbonus] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal untuk tambah user baru
  const [newbonus, setnewbonus] = useState({
    user_id: "",
    bonus: "",
    month: "",
  });
  const [users, setusers] = useState([]);
  const [selecteduser, setSelecteduser] = useState(null);
  const [typePB, settypePB] = useState([]);
  const [selectedTypePB, setSelectedTypePB] = useState(null);
  const [filterText, setFilterText] = useState({
    name: "",
    month: "",
    type_pb: "",
    reason: "",
    bonus: "",

  });
  const inputRefs = useRef({});
  const [activeInput, setActiveInput] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
  
        // Fetch bonus data
        const bonusResponse = await axios.get(`${VITE_API_URL}/management/bonus`, {
          headers,
        });
        const bonusData = bonusResponse.data.data || [];
        // const validBonusData = bonusData.filter((item) => item && item.name);
        setbonus(bonusData);
  
        // Fetch user data
        const userResponse = await axios.get(`${VITE_API_URL}/users`, { headers });
        const userOptions = userResponse.data.data.map((user) => ({
          value: user.user_id,
          label: user.name,
        }));
        setusers(userOptions);
  
        // Set selected user if `selectedbonus.user_id` exists
        if (selectedbonus.user_id) {
          const initialuser = userOptions.find(
            (user) => user.value === selectedbonus.user_id
          );
          setSelecteduser(initialuser || null);
        }

        // Fetch Type Off
        const typePBResponse = await axios.get(`${VITE_API_URL}/management/type-pb`, { headers });
        const typePBOptions = typePBResponse.data.data.map((typepb) => ({
          value: typepb.id,
          label: typepb.type_pb,
        }));
        settypePB(typePBOptions);
  
        if (selectedbonus.id_type_pb) {
          const initialTypePB = typePBOptions.find(
            (typepb) => typepb.value === selectedbonus.id_type_pb
          );
          setSelectedTypePB(initialTypePB|| null);
        }
  
        // Clear errors
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [selectedbonus.user_id, selectedbonus.id_type_pb]);
  

  // const filteredbonus = bonus.filter(
  //   (item) =>
  //     item.name?.toLowerCase().includes(search.toLowerCase())
  // );

  const filteredbonus = bonus.filter((item) =>
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
  


 

  console.log("Selected bonus:", selectedbonus);


  

  const handleAddbonus = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userProfile = sessionStorage.getItem("userProfile");
      const userData = JSON.parse(userProfile); // Parse JSON
      const userId = userData[0]?.user_id;

      //   const userData = JSON.parse(sessionStorage.getItem("userData"));
      //   const userId = userData?.id;

      const response = await axios.post(
        `${VITE_API_URL}/management/addbonus`,
        {
          ...newbonus,
          created_by: userId,
          created_at: DateNow,
        },
        { headers }
      );
      // Ambil data baru dari respons API
      const addedbonus = response.data.data;

      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setbonus((prev) => [
        
        {
          ...addedbonus,
          // name: users.find((u) => u.value === addedAbsen.user_id)?.label || "", // Nama user
          type_pb:
          typePB.find((r) => r.value === addedbonus.type_pb)?.label || "",
          name: users.find((r) => r.value === addedbonus.user_id)?.label || "",

        },
        ...prev,
      ]);

      // setbonus((prev) => [...prev, response.data.data]);
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
      setnewbonus({ user_id: "", bonus: "", month: ""});
      setSelecteduser(null);
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  const handleUpdate = (row) => {
    setSelectedbonus(row);
    setModalVisible(true);
  };

  const handleTypePBChange = (selectedOption) => {
    setSelectedTypePB(selectedOption);
    setSelectedbonus({
      ...selectedbonus,
      id_type_pb: selectedOption ? selectedOption.value : "",
    });
  };

  const handleuserChange = (selectedOption) => {
    setSelecteduser(selectedOption);
    setSelectedbonus({
      ...selectedbonus,
      user_id: selectedOption ? selectedOption.value : "",
    });
  };

  const handleDelete = async (row) => {
    Swal.fire({
      title: "Kamu Yakin ?",
      text: `Delete Bonus untuk User : ${row.name} ?`,
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
            `${VITE_API_URL}/management/deletebonus/${row.id_bonus}`,
            {
              deleted_by: userId,
              deleted_at: DateNow,
            },
            { headers }
          );
          Swal.fire("Deleted!", `${responseDelete.data.message}`, "success");
          setbonus((prev) =>
            prev.filter((item) => item.id_bonus !== row.id_bonus)
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
        `${VITE_API_URL}/management/updatebonus/${selectedbonus.id_bonus}`,
        {
          user_id: selectedbonus.user_id,
          month: selectedbonus.month,
          bonus: selectedbonus.bonus,
          type_pb : selectedbonus.id_type_pb,
          reason : selectedbonus.reason,
          updated_by: userId,
          updated_at: DateNow,
        },
        { headers }
      );
      //const updatedAbsen = responseUpdate.data.data;

      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setbonus((prevbonus) =>
        prevbonus.map((item) =>
          item.id_bonus === selectedbonus.id_bonus
            ? {
                ...selectedbonus,
                type_pb:
                typePB.find((r) => r.value === selectedbonus.id_type_pb)
                  ?.label || "",
                name:
                  users.find((r) => r.value === selectedbonus.user_id)
                    ?.label || "",
              }
            : item
        )
      );
      // setbonus(responseUpdate.data.data);
      Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
      // setbonus((prev) =>
      //   prev.map((item) =>
      //     item.absen_id === selectedbonus.absen_id ? selectedbonus : item
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
    ), selector: (row) => row.name },
    {
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Tanggal</span>
          <input
            type="text"
            value={filterText.month}
            className="form-control mt-1 filter-header"
            ref={(el) => (inputRefs.current.month = el)}
            onChange={(e) => handleInputChange("month", e.target.value)}
            onFocus={() => setActiveInput('month')} // Set active input
          />
        </div>
      ),
      selector: (row) => format(new Date(row.month), "yyyy-MM-dd"),
    },
    { 
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Type Bonus/Punishment</span>
          <input
            type="text"
            value={filterText.type_pb}
            className="form-control mt-1 filter-header"
            ref={(el) => (inputRefs.current.type_pb = el)}
            onChange={(e) => handleInputChange("type_pb", e.target.value)}
            onFocus={() => setActiveInput('type_pb')} // Set active input
          />
        </div>
      ), selector: (row) => row.type_pb },
    { 
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Bonus/Punishment</span>
          <input
            type="text"
            value={filterText.bonus}
            className="form-control mt-1 filter-header"
            ref={(el) => (inputRefs.current.bonus = el)}
            onChange={(e) => handleInputChange("bonus", e.target.value)}
            onFocus={() => setActiveInput('bonus')} // Set active input
          />
        </div>
      ), selector: (row) => row.bonus },
    { 
      name: (
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
        <h3 className="page-title">Management Bonus Karyawan</h3>
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Table Bonus</h4>
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
                          style={{marginBottom:"20px"}}
                        >
                          Tambah Bonus/Punishment
                        </button>
                      </div>
                      <div className="col-sm-4 d-flex align-items-center">
                      <div className="input-group me-2 w-100">
                          <div className="input-group-prepend bg-transparent">
                            <span className="input-group-text border-0 bg-transparent">
                             
                            </span>
                          </div>
                          
                        </div>
                      </div>
                    </div>

                    {filteredbonus && filteredbonus.length > 0 ? (
                      <DataTable
                        keyField="bonus-id"
                        columns={columns}
                        data={filteredbonus}
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
                          {filteredbonus.length > 0 ? (
                            filteredbonus.map((row, index) => (
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
      <Modal show={addModalVisible} onHide={() => setAddModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Bonus/Punishment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Karyawan</label>
            <Select
              options={users}
              value={
                newbonus.user_id
                  ? {
                      value: newbonus.user_id,
                      label: users.find((r) => r.value === newbonus.user_id)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelecteduser(option);
                setnewbonus({
                  ...newbonus,
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
              value={newbonus.month}
              onChange={(e) =>
                setnewbonus({ ...newbonus, month: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Kategori Bonus/Punishment</label>
            <Select
              options={typePB}
              value={
                newbonus.type_pb
                  ? {
                      value: newbonus.type_pb,
                      label: typePB.find((r) => r.value === newbonus.type_pb)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedTypePB(option);
                setnewbonus({
                  ...newbonus,
                  type_pb: option ? option.value : "",
                });
              }}
              placeholder="Pilih Kategori tidak Masuk..."
              isClearable
            />
          </div>

          <div className="form-group">
            <label>Bonus/Punishment </label>
            <input
              type="number"
              className="form-control"
              value={newbonus.bonus}
              onChange={(e) =>
                setnewbonus({ ...newbonus, bonus: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Keterangan</label>
            <textarea
              type="text"
              className="form-control"
              value={newbonus.reason}
              onChange={(e) =>
                setnewbonus({ ...newbonus, reason: e.target.value })
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
            onClick={handleAddbonus}
          >
            Tambah
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Bonus/Punishment</Modal.Title>
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
                    selectedbonus.month
                      ? new Date(selectedbonus.month)
                          .toISOString()
                          .split("T")[0] // Format ke yyyy-MM-dd
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedbonus({
                      ...selectedbonus,
                      month: e.target.value, // Nilai langsung dari input date
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label> Kageori Libur</label>
                <Select
                  options={typePB} // Data karyawan
                  value={selectedTypePB} // Nilai yang dipilih
                  onChange={handleTypePBChange} // Fungsi ketika berubah
                  placeholder="Pilih kategory Bonus/Punishment..."
                  isClearable // Tambahkan tombol untuk menghapus pilihan
                />
              </div>
              <div className="form-group">
                <label>Bonus/Punishment</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedbonus.bonus}
                  onChange={(e) =>
                    setSelectedbonus({
                      ...selectedbonus,
                      bonus: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Keterangan</label>
                <textarea
                  type="text"
                  className="form-control"
                  value={selectedbonus.reason}
                  onChange={(e) =>
                    setSelectedbonus({
                      ...selectedbonus,
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

export default Bonus;
