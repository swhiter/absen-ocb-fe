import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";
// import userRole from "../data/roles";
import Select from "react-select";

const VITE_API_URL = import.meta.env.VITE_API_URL;
const VITE_API_IMAGE = import.meta.env.VITE_API_IMAGE;
const now = new Date();
const DateNow = format(now, "yyyy-MM-dd HH:mm:ss");

const Users = () => {
  const [Users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal untuk tambah user baru
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    role: "",
    category_user: "",
    upline : "",
    enabled: 1,
  });
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [uplines, setUplines] = useState([]);
  const [selectedUpline, setSelectedUpline] = useState(null);


  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/users`, { headers });
        const fetchedData = response.data.data || [];
        const validData = fetchedData.filter((item) => item && item.name);
        setUsers(validData);
        
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUser= Users.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchUpline = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/users`, { headers });

        // Ubah data ke format options untuk react-select
        const userOptions = response.data.data.map((upline) => ({
          value: upline.user_id,
          label: `${upline.name} (${upline.username})`,
        }));

        setUplines(userOptions);

        // Sinkronkan nilai awal jika ada user_id di selectedShift
        if (selectedUser.id_upline) {
          const initialUser = userOptions.find(
            (upline) => upline.value === selectedUser.id_upline
          );
          setSelectedUpline(initialUser || null);
        }
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchUpline();
  }, [selectedUser.id_upline]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/users/roles-with-categories`, {
          headers,
        });
        setRoles(response.data);
      } catch (error) {
        console.error("Failed to fetch roles:", error.message);
      }
    };

    fetchRoles();
  }, []);
  console.log("Selected selectedUser:", selectedUser);

  const handleRoleChange = (roleId) => {
    setSelectedRoleId(roleId);
    setSelectedCategoryId(""); // Reset category ketika role berubah
  };

  const handleUserChange = (selectedOption) => {
    setSelectedUpline(selectedOption);
    setNewUser({
      ...newUser,
      id_upline: selectedOption ? selectedOption.value : null, // Pastikan data upline terupdate
    });
  };

  

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const userId = userData?.id;

      const response = await axios.post(
        `${VITE_API_URL}/users/create`,
        {
          ...newUser,
          category_user :selectedCategoryId,
          role : selectedRoleId,
          created_by: userId,
          created_at: DateNow,
          upline: selectedUpline ? selectedUpline.value : null,
        },
        { headers }
      );
      const newUserWithLabel = {
        ...response.data.data,
        // category_user:
        //   categories.find((cat) => cat.id_category === response.data.data.category_user)?.category_user || null,
        role:
          roles.find((role) => role.value === response.data.data.role_id)?.label || null,
        upline:
          uplines.find((upline) => upline.value === response.data.data.id_upline)?.label || null,
      };
      
      setUsers((prev) => [...prev, newUserWithLabel]);
      Swal.fire({
        title: "Success!",
        text: `${response.data.message}`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // Reload halaman setelah tombol OK ditekan
        window.location.reload(); // Memuat ulang halaman
      });
      setAddModalVisible(false);
      setNewUser({ name: "", username: "", role: "", upline:"", user_category:"", enabled: 1 });
      // window.location.reload();
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.message || error.message, "error");
    }

  };

  const handleUpdate = (row) => {
    setSelectedUser(row);
    setModalVisible(true);
  };

  const handleDelete = async (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete User : ${row.name} ?`,
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
          const responseDelete = await axios.post(`${VITE_API_URL}/users/delete/${row.user_id}`,
            {
              deleted_by : userId,
              deleted_at: DateNow
            }, { headers });
          Swal.fire("Deleted!", `${responseDelete.data.message}`, "success");
          setUsers((prev) => prev.filter((item) => item.user_id !== row.user_id));
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
        `${VITE_API_URL}/users/update/${selectedUser.user_id}`,
        {
          name: selectedUser.name,
          username: selectedUser.username,
          role: selectedUser.role,
          enabled: selectedUser.enabled,
          updated_by : userId,
          updated_at: DateNow

        },
        { headers }
      );
      // setUsers(responseUpdate.data.data);
      Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
      setUsers((prev) =>
        prev.map((item) =>
          item.user_id === selectedUser.user_id ? selectedUser : item
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
    { name: "Nama Karyawan", selector: (row) => row.name },
    { name: "Username", selector: (row) => row.username },
    { name: "Role", selector: (row) => row.role },
    { name: "Job Tittle", selector: (row) => row.category_user },
    { name: "Upline", selector: (row) => row.upline },
    {
      name: "Photo",
      cell: (row) => (
        <div>
          <img
             src={row.photo_url ? `${VITE_API_IMAGE}${row.photo_url}` : "https://via.placeholder.com/50"}
             alt="Profile"
            style={{ width: "50px", height: "50px", borderRadius: "10%" }}
          />
        </div>
      ),
    },


    // { name: "Status", selector: (row) => row.enabled },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge ${
            row.enabled ? "badge-success" : "badge-danger"
          }`}
        >
          {row.enabled ? "Active" : "Non Active"}
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
        <h3 className="page-title">Data Karyawan</h3>
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Table List Karyawan</h4>
              <div className="table-responsive">
              {loading ? (
                  <p>Loading data...</p>
                ) : error ? (
                  <p className="text-danger">Error: {error}</p>
                ) : (
                  <>
                <div className="row">
                  <div className="col-sm-8">
                  <button className="btn btn-gradient-primary btn-sm"
                          onClick={() => setAddModalVisible(true)}
                        >
                  Tambah Karyawan
                </button>
                  </div>
                  <div className="col-sm-4">
                        <div className="input-group">
                          <div className="input-group-prepend bg-transparent">
                            <i className="input-group-text border-0 mdi mdi-magnify" style={{margin: "10px",}}></i>
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
                  
                    
                    {filteredUser && filteredUser.length > 0 ? (
                      <DataTable
                        keyField="User_id"
                        columns={columns}
                        data={filteredUser}
                        pagination
                      />
                    ) : (
                      <p>Data Karaywan tidak tersedia.</p>
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
          <Modal.Title>Tambah Karyawan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Nama Karyawan</label>
            <input
              type="text"
              className="form-control"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>User Role</label>
            <select
              className="form-select"
              value={selectedRoleId}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.name_role}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Job Title</label>
            <select
              className="form-select"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={!selectedRoleId} // Disable jika Role belum dipilih
            >
              <option value="">Select Category</option>
              {roles
                .find((role) => role.role_id === parseInt(selectedRoleId))
                ?.categories.map((category) => (
                  <option
                    key={category.id_category}
                    value={category.id_category}
                  >
                    {category.category_user}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
                  <label>Nama Atasan</label>
                  <Select
                    options={uplines} // Data Atasan
                    value={selectedUpline} // Nilai yang dipilih
                    onChange={handleUserChange} // Fungsi ketika berubah
                    placeholder="Pilih Atasan..."
                    isClearable // Tambahkan tombol untuk menghapus pilihan
                  />
                </div>
          
        
          <div className="form-group">
            <label>Status</label>
            <select
              className="form-select"
              value={newUser.enabled}
              onChange={(e) =>
                setNewUser({ ...newUser, enabled: e.target.value === "1" ? 1 : 0 })
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
            Tambah Karyawan
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Data Karyawan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="card">
            <div className="card-body">
        
              <form className="forms-sample">
                <div className="form-group">
                  <label>Nama Karyawan</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedUser.name || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    className="form-control"
                    type="text"
                    value={selectedUser.username || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        username: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
            <label>User Role</label>
            <select
              className="form-select"
              value={selectedUser.role_id}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  role: e.target.value,
                })
              }
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.name_role}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Job Title</label>
            <select
              className="form-select"
              value={selectedUser.id_category}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  category_user: e.target.value,
                })
              }
              disabled={!selectedRoleId} // Disable jika Role belum dipilih
            >
              <option value="">Select Category</option>
              {roles
                .find((role) => role.role_id === parseInt(selectedRoleId))
                ?.categories.map((category) => (
                  <option
                    key={category.id_category}
                    value={category.id_category}
                  >
                    {category.category_user}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
                  <label>Nama Karyawan</label>
                  <Select
                    options={uplines} // Data karyawan
                    value={selectedUpline} // Nilai yang dipilih
                    onChange={handleUserChange} // Fungsi ketika berubah
                    placeholder="Pilih Atasan..."
                    isClearable // Tambahkan tombol untuk menghapus pilihan
                  />
                </div>
          
                
               
                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-select"
                    value={selectedUser.enabled ? "1" : "0"}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        enabled: e.target.value === "1" ? 1 : 0,
                      })
                    }
                  >
                    <option value="1">Active</option>
                    <option value="0">Non Active</option>
                  </select>
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

export default Users;
