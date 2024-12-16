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

const Absensies = () => {
  const [Absensies, setAbsensies] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAbsensi, setSelectedAbsensi] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal untuk tambah user baru
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [retails, setRetails] = useState([]);
  const [selectedRetail, setSelectedRetail] = useState(null);
  const [newAbsensi, setNewAbsensi] = useState({
    start_date: "",
    end_date: "",
    user_id: "",
    retail_id: "",
  });

  useEffect(() => {
    const fetchAbsensies = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/absensi`, {
          headers,
        });
        const fetchedData = response.data.data || [];
        const validData = fetchedData.filter((item) => item && item.name);
        setAbsensies(validData);

        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsensies();
  }, []);

  const filteredAbsensi= Absensies.filter((item) =>
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

        // Sinkronkan nilai awal jika ada user_id di selectedAbsensi
        if (selectedAbsensi.user_id) {
          const initialUser = userOptions.find(
            (user) => user.value === selectedAbsensi.user_id
          );
          setSelectedUser(initialUser || null);
        }
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchUsers();
  }, [selectedAbsensi.user_id]);

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
        if (selectedAbsensi.retail_id) {
          const initialRetail = retailOptions.find(
            (retail) => retail.value === selectedAbsensi.retail_id
          );
          setSelectedRetail(initialRetail || null);
        } // Sesuaikan key sesuai struktur respons API
      } catch (error) {
        console.error("Failed to fetch retail:", error);
      }
    };

    fetchRetail();
  }, [selectedAbsensi.retail_id]);

  const handleAddAbsensi = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const userId = userData?.id;
  
      const response = await axios.post(
        `${VITE_API_URL}/absensi/create`,
        {
          ...newAbsensi,
          created_by: userId,
          created_at: DateNow,
        },
        { headers }
      );
  
      // Ambil data baru dari respons API
      const addedAbsensi = response.data.data;
  
      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setAbsensies((prev) => [
        ...prev,
        {
          ...addedAbsensi,
          name: users.find((u) => u.value === addedAbsensi.user_id)?.label || "", // Nama user
          retail_name: retails.find((r) => r.value === addedAbsensi.retail_id)?.label || "", // Nama retail
        },
      ]);
  
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
  
      // Reset form tambah
      setNewAbsensi({
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
    
    setSelectedAbsensi(row);
    setModalVisible(true);
  };

  const handleUserChange = (selectedOption) => {
    setSelectedUser(selectedOption);
    setSelectedAbsensi({
      ...selectedAbsensi,
      user_id: selectedOption ? selectedOption.value : "",
    });
  };

  const handleRetailChange = (selectedOption) => {
    setSelectedRetail(selectedOption);
    setSelectedAbsensi({
      ...selectedAbsensi,
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
            `${VITE_API_URL}/absensi/delete/${row.Absensiing_id}`,
            {
              deleted_by: userId,
              deleted_at: DateNow,
            },
            { headers }
          );
          Swal.fire("Deleted!", "Absensi has been deleted.", "success");
          setAbsensies((prev) =>
            prev.filter((item) => item.Absensiing_id !== row.Absensiing_id)
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
        `${VITE_API_URL}/absensi/update/${selectedAbsensi.Absensiing_id}`,
        {
          start_date: selectedAbsensi.start_date,
          end_date: selectedAbsensi.end_date,
          user_id: selectedAbsensi.user_id,
          retail_id: selectedAbsensi.retail_id,
          updated_by: userId,
          updated_at: DateNow,
        },
        { headers }
      );
  
      Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
  
      // Perbarui state Absensies
      setAbsensies((prevAbsensies) =>
        prevAbsensies.map((item) =>
          item.Absensiing_id === selectedAbsensi.Absensiing_id
            ? {
                ...selectedAbsensi,
                name: users.find((u) => u.value === selectedAbsensi.user_id)?.label || "",
                retail_name: retails.find((r) => r.value === selectedAbsensi.retail_id)?.label || "",
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
      name: "Nama Karyawan",
      selector: (row) => format(new Date(row.nama_karyawan), "yyyy-MM-dd"), // Format start_date using date-fns
    },
    {
      name: "End Date",
      selector: (row) => format(new Date(row.retail_name), "yyyy-MM-dd"),
    },
    { name: "Code Absen", selector: (row) => row.category_absen },
    { name: "Deskripsi", selector: (row) => row.description },
    { name: "Fee", selector: (row) => row.fee },
   
  ];

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h3 className="page-title">Data Absensies</h3>
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Table Absensi</h4>
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
                          Add New Absensi
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

                    {filteredAbsensi && filteredAbsensi.length > 0 ? (
                      <DataTable
                        keyField="Absensi_id"
                        columns={columns}
                        data={filteredAbsensi}
                        pagination
                      />
                    ) : (
                      <p>No Absensi data available.</p>
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
          <Modal.Title>Add Absensi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Start Date</label>
            <input
              //   type="datetime-local"
              type="date"
              className="form-control"
              value={newAbsensi.start_date}
              onChange={(e) =>
                setNewAbsensi({ ...newAbsensi, start_date: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={newAbsensi.end_date}
              onChange={(e) =>
                setNewAbsensi({ ...newAbsensi, end_date: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Nama Karyawan</label>
            <Select
              options={users}
              value={
                newAbsensi.user_id
                  ? {
                      value: newAbsensi.user_id,
                      label: users.find((u) => u.value === newAbsensi.user_id)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedUser(option);
                setNewAbsensi({
                  ...newAbsensi,
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
                newAbsensi.retail_id
                  ? {
                      value: newAbsensi.retail_id,
                      label: retails.find((r) => r.value === newAbsensi.retail_id)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedRetail(option);
                setNewAbsensi({
                  ...newAbsensi,
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
            onClick={handleAddAbsensi}
          >
            Add User
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Absensi</Modal.Title>
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
                    value={selectedAbsensi.start_date ? format(new Date(selectedAbsensi.start_date), "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setSelectedAbsensi({
                        ...selectedAbsensi,
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
                    value={selectedAbsensi.end_date ? format(new Date(selectedAbsensi.end_date), "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setSelectedAbsensi({
                        ...selectedAbsensi,
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

export default Absensies;
