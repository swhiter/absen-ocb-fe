import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";

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
  const [newShift, setNewShift] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: "",
    is_active: 1,
  });

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      try {
        
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/shift-management`, { headers });
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

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const userId = userData?.id;

      const response = await axios.post(
        `${VITE_API_URL}/Shift/create`,
        {
          ...newShift,
          created_by: userId,
          created_at: DateNow,
        },
        { headers }
      );

      setShifts((prev) => [...prev, response.data.data]);
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
      setNewShift({ name: "", latitude: "", longitude: "", radius: "", is_active: 1 });
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.message || error.message, "error");
    }
  };

  const handleUpdate = (row) => {
    setSelectedShift(row);
    setModalVisible(true);
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
          await axios.post(`${VITE_API_URL}/shift-management/delete/${row.Shift_id}`,
            {
              deleted_by : userId,
              deleted_at: DateNow
            }, { headers });
          Swal.fire("Deleted!", "Shift has been deleted.", "success");
          setShifts((prev) => prev.filter((item) => item.Shift_id !== row.Shift_id));
        } catch (error) {
          Swal.fire("Error!", error.response?.data?.message || error.message, "error");
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
        `${VITE_API_URL}/shift-management/update/${selectedShift.Shift_id}`,
        {
          name: selectedShift.name,
          latitude: selectedShift.latitude,
          longitude: selectedShift.longitude,
          radius: selectedShift.radius,
          is_active: selectedShift.is_active,
          updated_by : userId,
          updated_at: DateNow

        },
        { headers }
      );
      // setShifts(responseUpdate.data.data);
      Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
      setShifts((prev) =>
        prev.map((item) =>
          item.Shift_id === selectedShift.Shift_id ? selectedShift : item
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
    { name: "Start Date", selector: (row) => row.start_date },
    { name: "End Date", selector: (row) => row.end_date },
    { name: "Nama Karyawan", selector: (row) => row.name },
    { name: "Retail", selector: (row) => row.retail_name },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge ${
            row.is_active ? "badge-success" : "badge-danger"
          }`}
        >
          {row.is_active ? "Active" : "Non Active"}
        </span>
      ),
    },
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
                  <button className="btn btn-gradient-primary btn-sm"
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
                  
                    
                    {Shifts && Shifts.length > 0 ? (
                      <DataTable
                        keyField="Shift_id"
                        columns={columns}
                        data={Shifts.filter((item) => item && item.name)}
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
            <label>Nama Shift</label>
            <input
              type="text"
              className="form-control"
              value={newShift.name}
              onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="text"
              className="form-control"
              value={newShift.latitude}
              onChange={(e) => setNewShift({ ...newShift, latitude: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input
              type="text"
              className="form-control"
              value={newShift.longitude}
              onChange={(e) => setNewShift({ ...newShift, longitude: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Radius</label>
            <input
              type="text"
              className="form-control"
              value={newShift.radius}
              onChange={(e) => setNewShift({ ...newShift, radius: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              className="form-select"
              value={newShift.is_active}
              onChange={(e) =>
                setNewShift({ ...newShift, is_active: e.target.value === "1" ? 1 : 0 })
              }
            >
              <option value="1">Active</option>
              <option value="0">Non Active</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-light" onClick={() => setAddModalVisible(false)}>
            Close
          </Button>
          <Button className="btn btn-gradient-primary me-2" onClick={handleAddUser}>
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
                    type="text"
                    className="form-control"
                    value={selectedShift.start_date || ""}
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
                    type="text"
                    value={selectedShift.end_date || ""}
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
                  <input
                    className="form-control"
                    type="text"
                    value={selectedShift.name || ""}
                    onChange={(e) =>
                      setSelectedShift({
                        ...selectedShift,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label> retail / Outlet</label>
                  <input
                    className="form-control"
                    type="text"
                    value={selectedShift.retail_name || ""}
                    onChange={(e) =>
                      setSelectedShift({
                        ...selectedShift,
                        retail_name: e.target.value,
                      })
                    }
                  />
                </div>
                
              </form>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-light" onClick={() => setModalVisible(false)}>
            Close
          </Button>
          <Button className="btn btn-gradient-primary me-2" onClick={handleSaveUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Shift