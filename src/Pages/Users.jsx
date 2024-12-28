import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";
import userRole from "../data/roles";
import Select from "react-select";

const VITE_API_URL = import.meta.env.VITE_API_URL;
const now = new Date();
const DateNow = format(now, "yyyy-MM-dd HH:mm:ss");

const Users = () => {
  const [Users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [usersOption, setUsersOption] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal untuk tambah user baru
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    role: "",
    category: "",
    upline : "",
    enabled: 1,
  });
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");


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
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/users`, { headers });

        // Ubah data ke format options untuk react-select
        const userOptions = response.data.data.map((usersOption) => ({
          value: usersOption.user_id,
          label: `${usersOption.name} (${usersOption.username})`,
        }));

        setUsersOption(userOptions);

        // Sinkronkan nilai awal jika ada user_id di selectedShift
        if (selectedUser.user_id) {
          const initialUser = userOptions.find(
            (usersOption) => usersOption.value === selectedUser.user_id
          );
          setSelectedUser(initialUser || null);
        }
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchUsers();
  }, [selectedUser.user_id]);

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

  const handleRoleChange = (roleId) => {
    setSelectedRoleId(roleId);
    setSelectedCategoryId(""); // Reset category ketika role berubah
  };

  const handleUserChange = (selectedOption) => {
    setSelectedUser(selectedOption);
    setSelectedUser({
      ...selectedUser,
      user_id: selectedOption ? selectedOption.value : "",
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
          role: selectedRoleId,
          category: selectedCategoryId,
          password : 'Oscar2024',
          created_by: userId,
          created_at: DateNow,
        },
        { headers }
      );

      setUsers((prev) => [...prev, response.data.data]);
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
      setNewUser({ name: "", username: "", role: "", category_user:"", enabled: 1 });
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
          category_user: selectedUser.category_user,
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
        <h3 className="page-title">Data Users</h3>
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Table Users</h4>
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
                  Add New User
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
                      <p>No User data available.</p>
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
          <Modal.Title>Add User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Nama User</label>
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
              value={newUser.selectedRoleId}
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
                  <label>Nama Karyawan</label>
                  <Select
                    options={usersOption} // Data karyawan
                    value={newUser.selectedUser} // Nilai yang dipilih
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
            Add User
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="card">
            <div className="card-body">
        
              <form className="forms-sample">
                <div className="form-group">
                  <label>Nama User</label>
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
                  <label>Role</label>
                 
                    <select
                    className="form-select" 
                    value={selectedUser.role}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        role: e.target.value,
                      })
                    }
                  >
                    
                    {userRole.map((roles, index)=>(
                    <option value={roles.value} key={index} >{roles.label}</option>
                  ))}
                  </select>
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
