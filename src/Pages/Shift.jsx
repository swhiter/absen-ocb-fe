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

const Shift = () => {
  const [Shifts, setShifts] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal untuk tambah user baru
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [retails, setRetails] = useState([]);
  const [selectedRetail, setSelectedRetail] = useState(null);
  const [newShift, setNewShift] = useState({
    start_date: "",
    end_date: "",
    user_id: "",
    retail_id: "",
  });

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/shift-management`, {
          headers,
        });
        const fetchedData = response.data.data || [];
        const validData = fetchedData.filter((item) => item && item.name);
        setShifts(validData);

        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  const filteredShift= Shifts.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.retail_name?.toLowerCase().includes(search.toLowerCase()) 
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/users`, { headers });

        // Ubah data ke format options untuk react-select
        const userOptions = response.data.data.map((user) => ({
          value: user.user_id,
          label: `${user.name} (${user.username})`,
        }));

        setUsers(userOptions);

        // Sinkronkan nilai awal jika ada user_id di selectedShift
        if (selectedShift.user_id) {
          const initialUser = userOptions.find(
            (user) => user.value === selectedShift.user_id
          );
          setSelectedUser(initialUser || null);
        }
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchUsers();
  }, [selectedShift.user_id]);

  useEffect(() => {
    const fetchRetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/retail`, { headers });
        const retailOptions = response.data.data.map((retail) => ({
          value: retail.retail_id,
          label: retail.name,
        }));
        setRetails(retailOptions);
        if (selectedShift.retail_id) {
          const initialRetail = retailOptions.find(
            (retail) => retail.value === selectedShift.retail_id
          );
          setSelectedRetail(initialRetail || null);
        } // Sesuaikan key sesuai struktur respons API
      } catch (error) {
        console.error("Failed to fetch retail:", error);
      }
    };

    fetchRetail();
  }, [selectedShift.retail_id]);

  const handleAddShift = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const userId = userData?.id;
  
      const response = await axios.post(
        `${VITE_API_URL}/shift-management/create`,
        {
          ...newShift,
          created_by: userId,
          created_at: DateNow,
        },
        { headers }
      );
  
      // Ambil data baru dari respons API
      const addedShift = response.data.data;
  
      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setShifts((prev) => [
        ...prev,
        {
          ...addedShift,
          name: users.find((u) => u.value === addedShift.user_id)?.label || "", // Nama user
          retail_name: retails.find((r) => r.value === addedShift.retail_id)?.label || "", // Nama retail
        },
      ]);
  
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
  
      // Reset form tambah
      setNewShift({
        start_date: "",
        end_date: "",
        user_id: "",
        retail_id: "",
      });
      setSelectedUser(null);
      setSelectedRetail(null);
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };
  

  const handleUpdate = (row) => {
    
    setSelectedShift(row);
    setModalVisible(true);
  };

  const handleUserChange = (selectedOption) => {
    setSelectedUser(selectedOption);
    setSelectedShift({
      ...selectedShift,
      user_id: selectedOption ? selectedOption.value : "",
    });
  };

  const handleRetailChange = (selectedOption) => {
    setSelectedRetail(selectedOption);
    setSelectedShift({
      ...selectedShift,
      retail_id: selectedOption ? selectedOption.value : "",
    });
  };

  const handleDelete = async (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete: ${row.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const userData = JSON.parse(sessionStorage.getItem("userData"));
          const userId = userData?.id;
          const headers = { Authorization: `Bearer ${token}` };
          await axios.post(
            `${VITE_API_URL}/shift-management/delete/${row.shifting_id}`,
            {
              deleted_by: userId,
              deleted_at: DateNow,
            },
            { headers }
          );
          Swal.fire("Deleted!", "Shift has been deleted.", "success");
          setShifts((prev) =>
            prev.filter((item) => item.shifting_id !== row.shifting_id)
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
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const userId = userData?.id;
  
      const responseUpdate = await axios.post(
        `${VITE_API_URL}/shift-management/update/${selectedShift.shifting_id}`,
        {
          start_date: selectedShift.start_date,
          end_date: selectedShift.end_date,
          user_id: selectedShift.user_id,
          retail_id: selectedShift.retail_id,
          updated_by: userId,
          updated_at: DateNow,
        },
        { headers }
      );
  
      Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
  
      // Perbarui state Shifts
      setShifts((prevShifts) =>
        prevShifts.map((item) =>
          item.shifting_id === selectedShift.shifting_id
            ? {
                ...selectedShift,
                name: users.find((u) => u.value === selectedShift.user_id)?.label || "",
                retail_name: retails.find((r) => r.value === selectedShift.retail_id)?.label || "",
              }
            : item
        )
      );
  
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
    {
      name: "Start Date",
      selector: (row) => format(new Date(row.start_date), "yyyy-MM-dd"), // Format start_date using date-fns
    },
    {
      name: "End Date",
      selector: (row) => format(new Date(row.end_date), "yyyy-MM-dd"),
    },
    { name: "Nama Karyawan", selector: (row) => row.name },
    { name: "Retail", selector: (row) => row.retail_name },
    {
      name: "Action",
      cell: (row) => (
        <div style={{ display: "flex", gap: "10px" }}>
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
    },
  ];

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h3 className="page-title">Data Shifts</h3>
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Table Shift</h4>
              <div className="table-responsive">
                {loading ? (
                  <p>Loading data...</p>
                ) : error ? (
                  <p className="text-danger">Error: {error}</p>
                ) : (
                  <>
                    <div className="row">
                      <div className="col-sm-9">
                        <button
                          className="btn btn-gradient-primary btn-sm"
                          onClick={() => setAddModalVisible(true)}
                        >
                          Add New Shift
                        </button>
                      </div>
                      <div className="col-sm-3">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          style={{
                            marginBottom: "10px",
                            padding: "5px",
                            width: "250px",
                          }}
                        />
                      </div>
                    </div>

                    {filteredShift && filteredShift.length > 0 ? (
                      <DataTable
                        keyField="shifting_id"
                        columns={columns}
                        data={filteredShift}
                        pagination
                      />
                    ) : (
                      <p>No Shift data available.</p>
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
          <Modal.Title>Add Shift</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Start Date</label>
            <input
              //   type="datetime-local"
              type="date"
              className="form-control"
              value={newShift.start_date}
              onChange={(e) =>
                setNewShift({ ...newShift, start_date: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={newShift.end_date}
              onChange={(e) =>
                setNewShift({ ...newShift, end_date: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Nama Karyawan</label>
            <Select
              options={users}
              value={
                newShift.user_id
                  ? {
                      value: newShift.user_id,
                      label: users.find((u) => u.value === newShift.user_id)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedUser(option);
                setNewShift({
                  ...newShift,
                  user_id: option ? option.value : "",
                });
              }}
              placeholder="Pilih Karyawan..."
              isClearable
            />
          </div>
          <div className="form-group">
            <label>Nama Retail</label>
            <Select
              options={retails}
              value={
                newShift.retail_id
                  ? {
                      value: newShift.retail_id,
                      label: retails.find((r) => r.value === newShift.retail_id)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedRetail(option);
                setNewShift({
                  ...newShift,
                  retail_id: option ? option.value : "",
                });
              }}
              placeholder="Pilih Retail..."
              isClearable
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
            onClick={handleAddShift}
          >
            Add User
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Shift</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card">
            <div className="card-body">
              <form className="forms-sample">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedShift.start_date ? format(new Date(selectedShift.start_date), "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setSelectedShift({
                        ...selectedShift,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>End_Date</label>
                  <input
                    className="form-control"
                    type="date"
                    value={selectedShift.end_date ? format(new Date(selectedShift.end_date), "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setSelectedShift({
                        ...selectedShift,
                        end_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Nama Karyawan</label>
                  <Select
                    options={users} // Data karyawan
                    value={selectedUser} // Nilai yang dipilih
                    onChange={handleUserChange} // Fungsi ketika berubah
                    placeholder="Pilih Karyawan..."
                    isClearable // Tambahkan tombol untuk menghapus pilihan
                  />
                </div>
                <div className="form-group">
                  <label> Retail / Outlet</label>
                  <Select
                    options={retails} // Data karyawan
                    value={selectedRetail} // Nilai yang dipilih
                    onChange={handleRetailChange} // Fungsi ketika berubah
                    placeholder="Pilih retail..."
                    isClearable // Tambahkan tombol untuk menghapus pilihan
                  />
                </div>
              </form>
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
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Shift;
