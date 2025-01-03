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
    upline: "",
    enabled: 1,
  });
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uplines, setUplines] = useState([]);
  const [selectedUpline, setSelectedUpline] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Preview gambar
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const UsersResponse = await axios.get(`${VITE_API_URL}/users`, {
          headers,
        });
        const fetchedOffDayData = UsersResponse.data.data || [];
        const validOffDayData = fetchedOffDayData.filter(
          (item) => item && item.name
        );
        setUsers(validOffDayData);

        const rolesResponse = await axios.get(`${VITE_API_URL}/users/roles`, {
          headers,
        });
        const roleOptions = rolesResponse.data.data.map((role) => ({
          value: role.role_id,
          label: role.name_role,
        }));
        setRoles(roleOptions);

        if (selectedUser.role_id) {
          const initialTypeOff = roleOptions.find(
            (role) => role.value === selectedUser.role_id
          );
          setSelectedRoleId(initialTypeOff || null);
        }

        const categoryResponse = await axios.get(
          `${VITE_API_URL}/users/category-alluser`,
          { headers }
        );
        const categoryOptions = categoryResponse.data.data.map((category) => ({
          value: category.id_category,
          label: category.category_user,
        }));
        setCategory(categoryOptions);

        if (selectedUser.id_category) {
          const initialTypeOff = categoryOptions.find(
            (category) => category.value === selectedUser.id_category
          );
          setSelectedCategory(initialTypeOff || null);
        }

        // Fetch Users
        const uplineResponse = await axios.get(`${VITE_API_URL}/users`, {
          headers,
        });
        const uplineOptions = uplineResponse.data.data.map((upline) => ({
          value: upline.user_id,
          label: upline.name,
        }));
        setUplines(uplineOptions);

        if (selectedUser.id_upline) {
          const initialUser = uplineOptions.find(
            (upline) => upline.value === selectedUser.id_upline
          );
          setSelectedUpline(initialUser || null);
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
  }, [selectedUser.role_id, selectedUser.id_upline, selectedUser.id_category]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };
  // useEffect(() => {
  //   const fetchUpline = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const headers = { Authorization: `Bearer ${token}` };
  //       const response = await axios.get(`${VITE_API_URL}/users`, { headers });

  //       // Ubah data ke format options untuk react-select
  //       const userOptions = response.data.data.map((upline) => ({
  //         value: upline.user_id,
  //         label: `${upline.name} (${upline.username})`,
  //       }));

  //       setUplines(userOptions);

  //       // Sinkronkan nilai awal jika ada user_id di selectedShift
  //       if (selectedUser.id_upline) {
  //         const initialUser = userOptions.find(
  //           (upline) => upline.value === selectedUser.id_upline
  //         );
  //         setSelectedUpline(initialUser || null);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching users:", error.message);
  //     }
  //   };

  //   fetchUpline();
  //   fetchRoles();
  //   fetchUsers();
  //   fetchCategory();
  // }, [selectedUser.id_upline]);

  const filteredUser = Users.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  console.log("Selected selectedUser:", selectedUser);

  const handleRoleChange = (selectedOption) => {
    setSelectedRoleId(selectedOption);
    setSelectedUser({
      ...selectedUser,
      role_id: selectedOption ? selectedOption.value : null, // Pastikan data upline terupdate
    });
  };

  const handleUserChange = (selectedOption) => {
    setSelectedUpline(selectedOption);
    setSelectedUser({
      ...selectedUser,
      id_upline: selectedOption ? selectedOption.value : null, // Pastikan data upline terupdate
    });
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    setSelectedUser({
      ...selectedUser,
      id_category: selectedOption ? selectedOption.value : null, // Pastikan data upline terupdate
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedUser({ ...selectedUser, photo_url: file }); // Update file baru
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result); // Tampilkan preview
      reader.readAsDataURL(file);
    }
  };
  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userProfile = sessionStorage.getItem("userProfile");
      const userData = JSON.parse(userProfile); // Parse JSON
      const userId = userData[0]?.user_id;

      const formData = new FormData();
      formData.append("name", newUser.name);
      formData.append("username", newUser.username);
      formData.append("enabled", newUser.enabled);
      formData.append("role", newUser.role_id);
      formData.append("upline", newUser.upline);
      formData.append("category_user", newUser.id_category);
      formData.append("created_by", userId);
      formData.append("created_at", DateNow);
      // formData.append("upline", selectedUpline ? selectedUpline.value : 0);

      if (newUser.photo_url) {
        const file = newUser.photo_url;

        // Validasi ukuran dan tipe file
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire("Error", "File size exceeds 5MB!", "error");
          return;
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
          Swal.fire(
            "Error",
            "Invalid file type. Please upload an image.",
            "error"
          );
          return;
        }

        formData.append("photo_url", file);
      }

      const response = await axios.post(
        `${VITE_API_URL}/users/create`,
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const addedUsers = response.data.data;
      console.log(addedUsers);
      setUsers((prev) => [
        {
          ...addedUsers,
          category_user:
            category.find(
              (category) =>
                category.value ===
                (isNaN(addedUsers.category_user)
                  ? null
                  : parseInt(addedUsers.category_user))
            )?.label || null,
          role:
            roles.find(
              (r) =>
                r.value ===
                (isNaN(addedUsers.role) ? null : parseInt(addedUsers.role))
            )?.label || "",
          upline:
            uplines.find(
              (r) =>
                r.value ===
                (isNaN(addedUsers.upline) ? null : parseInt(addedUsers.upline))
            )?.label || "",
        },
        ...prev,
      ]);

      Swal.fire({
        title: "Success!",
        text: `${response.data.message}`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // window.location.reload();
      });
      setAddModalVisible(false);
      setNewUser({
        name: "",
        username: "",
        role: "",
        upline: "",
        category_user: "",
        enabled: 1,
      });
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  // const handleAddUser = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const headers = { Authorization: `Bearer ${token}` };
  //     const userData = JSON.parse(sessionStorage.getItem("userData"));
  //     const userId = userData?.id;

  //     const response = await axios.post(
  //       `${VITE_API_URL}/users/create`,
  //       {
  //         ...newUser,
  //         category_user :selectedCategoryId,
  //         role : selectedRoleId,
  //         created_by: userId,
  //         created_at: DateNow,
  //         upline: selectedUpline ? selectedUpline.value : null,
  //       },
  //       { headers }
  //     );
  //     const newUserWithLabel = {
  //       ...response.data.data,
  //       // category_user:
  //       //   categories.find((cat) => cat.id_category === response.data.data.category_user)?.category_user || null,
  //       role:
  //         roles.find((role) => role.value === response.data.data.role_id)?.label || null,
  //       upline:
  //         uplines.find((upline) => upline.value === response.data.data.id_upline)?.label || null,
  //     };

  //     setUsers((prev) => [...prev, newUserWithLabel]);
  //     Swal.fire({
  //       title: "Success!",
  //       text: `${response.data.message}`,
  //       icon: "success",
  //       confirmButtonText: "OK",
  //     }).then(() => {
  //       // Reload halaman setelah tombol OK ditekan
  //       window.location.reload(); // Memuat ulang halaman
  //     });
  //     setAddModalVisible(false);
  //     setNewUser({ name: "", username: "", role: "", upline:"", user_category:"", enabled: 1 });
  //     // window.location.reload();
  //   } catch (error) {
  //     Swal.fire("Error!", error.response?.data?.message || error.message, "error");
  //   }

  // };

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
          const responseDelete = await axios.post(
            `${VITE_API_URL}/users/delete/${row.user_id}`,
            {
              deleted_by: userId,
              deleted_at: DateNow,
            },
            { headers }
          );
          Swal.fire("Deleted!", `${responseDelete.data.message}`, "success");
          setUsers((prev) =>
            prev.filter((item) => item.user_id !== row.user_id)
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
      const userData = JSON.parse(userProfile);
      const userId = userData[0]?.user_id;

      const responseUpdate = await axios.post(
        `${VITE_API_URL}/users/update/${selectedUser.user_id}`,
        {
          name: selectedUser.name,
          role: selectedUser.role_id,
          category_user: selectedUser.id_category,
          upline: selectedUser.id_upline,
          enabled: selectedUser.enabled,
          updated_by: userId,
          updated_at: DateNow,
        },
        { headers }
      );

      // console.log("Form Data Content:");
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }

      Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
      setUsers((prevUsers) =>
        prevUsers.map((item) =>
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

  // console.log(selectedUser.photo_url)
  //   const handleSaveUpdate = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const headers = { Authorization: `Bearer ${token}` };
  //       const userProfile = sessionStorage.getItem("userProfile");
  //       const userData = JSON.parse(userProfile); // Parse JSON
  //       const userId = userData[0]?.user_id;

  //       const formData = new FormData();
  //       formData.append("name", selectedUser.name);
  //       formData.append("username", selectedUser.username);
  //       formData.append("enabled", selectedUser.enabled);
  //       formData.append("role", selectedUser.role_id);
  //       formData.append("upline", selectedUser.id_upline);
  //       formData.append("category_user", selectedUser.id_category);
  //       formData.append("updated_by", userId);
  //       formData.append("updated_at", DateNow);

  //       if (selectedUser.photo_url instanceof File) {
  //         const file = selectedUser.photo_url;

  //         // Validasi ukuran dan tipe file
  //         if (file.size > 5 * 1024 * 1024) {
  //           Swal.fire("Error", "File size exceeds 5MB!", "error");
  //           return;
  //         }

  //         const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  //         if (!allowedTypes.includes(file.type)) {
  //           Swal.fire(
  //             "Error",
  //             "Invalid file type. Please upload an image.",
  //             "error"
  //           );
  //           return;
  //         }

  //         formData.append("photo_url", file);
  //       }
  //       console.log("Form Data Content:");
  // for (let [key, value] of formData.entries()) {
  //   console.log(`${key}:`, value);
  // }

  //       const responseUpdate = await axios.post(
  //         `${VITE_API_URL}/users/update/${selectedUser.user_id}`,
  //         formData,
  //         {
  //           headers: {
  //             ...headers,
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //       );

  //       // const addedUsers = response.data.data;
  //       // console.log( addedUsers)

  //       setUsers((prevUsers) =>
  //         prevUsers.map((item) =>
  //           item.user_id === selectedUser.user_id
  //             ? {
  //                 ...selectedUser,
  //                 category_user:
  //                   category.find(
  //                     (category) =>
  //                       category.value ===
  //                       (isNaN(selectedUser.id_category)
  //                         ? null
  //                         : parseInt(selectedUser.id_category))
  //                   )?.label || null,
  //                 role:
  //                   roles.find(
  //                     (r) =>
  //                       r.value ===
  //                       (isNaN(selectedUser.role_id)
  //                         ? null
  //                         : parseInt(selectedUser.role_id))
  //                   )?.label || "",
  //                 upline:
  //                   uplines.find(
  //                     (r) =>
  //                       r.value ===
  //                       (isNaN(selectedUser.id_upline)
  //                         ? null
  //                         : parseInt(selectedUser.id_upline))
  //                   )?.label || "",
  //               }
  //             : item
  //         )
  //       );

  //       // setUsers(responseUpdate.data.data);
  //       Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
  //       setUsers((prev) =>
  //         prev.map((item) =>
  //           item.user_id === selectedUser.user_id ? selectedUser : item
  //         )
  //       );
  //       setModalVisible(false);
  //     } catch (error) {
  //       Swal.fire(
  //         "Error!",
  //         error.response?.data?.message || error.message,
  //         "error"
  //       );
  //     }
  //   };

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
    // {
    //   name: "Photo",
    //   cell: (row) => (
    //     <div>
    //       <img
    //         src={
    //           row?.photo_url
    //             ? `${VITE_API_IMAGE}${row.photo_url}`
    //             : "https://via.placeholder.com/50"
    //         }
    //         alt="Profile"
    //         style={{ width: "50px", height: "50px", borderRadius: "10%" }}
    //       />
    //     </div>
    //   ),
    // },
    {
      name: "Photo",
      cell: (row) => (
        <div>
          <img
            src={
              row?.photo_url
                ? `${VITE_API_IMAGE}${row.photo_url}`
                : "https://via.placeholder.com/50"
            }
            alt="Profile"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "10%",
              cursor: "pointer",
            }}
            onClick={() =>
              handleImageClick(
                row?.photo_url
                  ? `${VITE_API_IMAGE}${row.photo_url}`
                  : "https://via.placeholder.com/50"
              )
            }
          />
        </div>
      ),
    },

    // { name: "Status", selector: (row) => row.enabled },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge ${row.enabled ? "badge-success" : "badge-danger"}`}
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
                        <button
                          className="btn btn-gradient-primary btn-sm"
                          onClick={() => setAddModalVisible(true)}
                        >
                          Tambah Karyawan
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
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <img
            src={selectedImage}
            alt="Preview"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "10px" }}
          />
        </div>
      )}

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
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>User Role</label>
            <Select
              options={roles}
              value={
                newUser.role_id
                  ? {
                      value: newUser.role_id,
                      label: roles.find((r) => r.value === newUser.role_id)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedRoleId(option);
                setNewUser({
                  ...newUser,
                  role_id: option ? option.value : "",
                });
              }}
              placeholder="Pilih Role User..."
              isClearable
            />
          </div>
          <div className="form-group">
            <label>Job Title</label>
            <Select
              options={category}
              value={
                newUser.id_category
                  ? {
                      value: newUser.id_category,
                      label: category.find(
                        (r) => r.value === newUser.id_category
                      )?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedCategory(option);
                setNewUser({
                  ...newUser,
                  id_category: option ? option.value : "",
                });
              }}
              placeholder="Pilih Job Tittle sesuai Role..."
              isClearable
            />
          </div>

          <div className="form-group">
            <label>Nama Atasan</label>
            <Select
              options={uplines}
              value={
                newUser.upline
                  ? {
                      value: newUser.upline,
                      label: uplines.find((r) => r.value === newUser.upline)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedUpline(option);
                setNewUser({
                  ...newUser,
                  upline: option ? option.value : "",
                });
              }}
              placeholder="Pilih Atasan..."
              isClearable
            />
            {/* <Select
              options={uplines} // Data Atasan
              value={selectedUpline} // Nilai yang dipilih
              onChange={handleUserChange} // Fungsi ketika berubah
              placeholder="Pilih Atasan..."
              isClearable // Tambahkan tombol untuk menghapus pilihan
            /> */}
          </div>
          <div className="form-group">
            <label>Photo User</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) =>
                setNewUser({ ...newUser, photo_url: e.target.files[0] })
              }
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              className="form-select"
              value={newUser.enabled}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  enabled: e.target.value === "1" ? 1 : 0,
                })
              }
            >
              <option value="1">Active</option>
              <option value="0">Non Active</option>
            </select>
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
            onClick={handleAddUser}
          >
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
                  <Select
                    options={roles} // Data karyawan
                    value={selectedRoleId} // Nilai yang dipilih
                    onChange={handleRoleChange} // Fungsi ketika berubah
                    placeholder="Pilih Role User..."
                    isClearable // Tambahkan tombol untuk menghapus pilihan
                  />
                </div>
                <div className="form-group">
                  <label>Job Title</label>
                  <Select
                    options={category} // Data karyawan
                    value={selectedCategory} // Nilai yang dipilih
                    onChange={handleCategoryChange} // Fungsi ketika berubah
                    placeholder="Pilih Job Title Sesuai dengan Role..."
                    isClearable // Tambahkan tombol untuk menghapus pilihan
                  />
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
                {/* <div className="form-group">
                  <label>Photo User</label>
                  {imagePreview || selectedUser?.photo_url ? (
                    <div style={{ marginBottom: "10px" }}>
                      <img
                        src={
                          imagePreview ||
                          `${VITE_API_IMAGE}${selectedUser.photo_url}`
                        }
                        alt="Preview"
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    </div>
                  ) : (
                    <p>No image selected</p>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleImageChange}
                  />
                </div> */}

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

export default Users;
