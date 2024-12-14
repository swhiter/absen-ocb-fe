

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

const CatAbsen = () => {
  const [catabsen, setcatabsen] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCatabsen, setSelectedCatabsen] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal untuk tambah user baru
  const [newCatabsen, setnewCatabsen] = useState({
    name: "",
    description: "",
    fee: "",
    
  });

  useEffect(() => {
    const fetchcatabsen = async () => {
      setLoading(true);
      try {
        
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/absen-management`, { headers });
        const fetchedData = response.data.data || [];
        const validData = fetchedData.filter((item) => item && item.name);
        setcatabsen(validData);
        
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchcatabsen();
  }, []);

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const userId = userData?.id;

      const response = await axios.post(
        `${VITE_API_URL}/absen-management/create`,
        {
          ...newCatabsen,
          created_by: userId,
          created_at: DateNow,
        },
        { headers }
      );

      setcatabsen((prev) => [...prev, response.data.data]);
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
      setnewCatabsen({ name: "", latitude: "", longitude: "", radius: "", is_active: 1 });
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.message || error.message, "error");
    }
  };

  const handleUpdate = (row) => {
    setSelectedCatabsen(row);
    setModalVisible(true);
  };

  const handleDelete = async (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete Retail : ${row.name} ?`,
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
          const responseDelete = await axios.post(`${VITE_API_URL}/absen-management/delete/${row.retail_id}`,
            {
              deleted_by : userId,
              deleted_at: DateNow
            }, { headers });
          Swal.fire("Deleted!", `${responseDelete.data.message}`, "success");
          setcatabsen((prev) => prev.filter((item) => item.retail_id !== row.retail_id));
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
        `${VITE_API_URL}/absen-management/update/${selectedCatabsen.retail_id}`,
        {
          name: selectedCatabsen.name,
          description: selectedCatabsen.description,
          fee: selectedCatabsen.fee,
          updated_by : userId,
          updated_at: DateNow

        },
        { headers }
      );
      // setcatabsen(responseUpdate.data.data);
      Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
      setcatabsen((prev) =>
        prev.map((item) =>
          item.absen_id === selectedCatabsen.absen_id ? selectedCatabsen : item
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
    { name: "Tipe Absen", selector: (row) => row.name },
    { name: "Deskripsi", selector: (row) => row.description },
    { name: "Fee", selector: (row) => row.fee },
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
        <h3 className="page-title">Data Tipe Absen</h3>
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Table Category Absen</h4>
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
                  Add Tipe Absen
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
                  
                    
                    {catabsen && catabsen.length > 0 ? (
                      <DataTable
                        keyField="absen-id"
                        columns={columns}
                        data={catabsen.filter((item) => item && item.name)}
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
          <Modal.Title>Add Tipe Absen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Katgori Absen</label>
            <input
              type="text"
              className="form-control"
              value={newCatabsen.name}
              onChange={(e) => setnewCatabsen({ ...newCatabsen, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              className="form-control"
              value={newCatabsen.description}
              onChange={(e) => setnewCatabsen({ ...newCatabsen, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>fee</label>
            <input
              type="text"
              className="form-control"
              value={newCatabsen.fee}
              onChange={(e) => setnewCatabsen({ ...newCatabsen, fee: e.target.value })}
            />
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
          <Modal.Title>Update Tipe Absen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="card">
            <div className="card-body">
              <form className="forms-sample">
                <div className="form-group">
                  <label>kategori Absen</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedCatabsen.name || ""}
                    onChange={(e) =>
                      setSelectedCatabsen({
                        ...selectedCatabsen,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    className="form-control"
                    type="text"
                    value={selectedCatabsen.description || ""}
                    onChange={(e) =>
                      setSelectedCatabsen({
                        ...selectedCatabsen,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Fee</label>
                  <input
                    className="form-control"
                    type="text"
                    value={selectedCatabsen.fee || ""}
                    onChange={(e) =>
                      setSelectedCatabsen({
                        ...selectedCatabsen,
                        fee: e.target.value,
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

export default CatAbsen