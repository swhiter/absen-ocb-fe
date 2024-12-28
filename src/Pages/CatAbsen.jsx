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
    group_absen: "",
    retail_id: "",
  });
  const [retails, setRetails] = useState([]);
  const [selectedRetail, setSelectedRetail] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchcatabsen = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/absen-management`, {
          headers,
        });
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

  const filteredCatabsen = catabsen.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
  );

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
        if (selectedCatabsen.retail_id) {
          const initialRetail = retailOptions.find(
            (retail) => retail.value === selectedCatabsen.retail_id
          );
          setSelectedRetail(initialRetail || null);
        } // Sesuaikan key sesuai struktur respons API
      } catch (error) {
        console.error("Failed to fetch retail:", error);
      }
    };

    fetchRetail();
  }, [selectedCatabsen.retail_id]);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/users/category-alluser`, { headers });
        const groupOptions = response.data.data.map((group) => ({
          value: group.id_category,
          label: group.category_user,
        }));
        setGroups(groupOptions);
        if (selectedCatabsen.group_absen) {
          const initialGroup = groupOptions.find(
            (group) => group.value === selectedCatabsen.id_category
          );
          setSelectedGroup(initialGroup || null);
        } // Sesuaikan key sesuai struktur respons API
      } catch (error) {
        console.error("Failed to fetch group:", error);
      }
    };

    fetchGroup();
  },[selectedCatabsen.group_absen] );

  const handleAddCatAbsen = async () => {
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
      // Ambil data baru dari respons API
      const addedAbsen = response.data.data;
  
      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setcatabsen((prev) => [
        ...prev,
        {
          ...addedAbsen,
          // name: users.find((u) => u.value === addedAbsen.user_id)?.label || "", // Nama user
          retail_name: retails.find((r) => r.value === addedAbsen.retail_id)?.label || "", // Nama retail
          category_user: groups.find((r) => r.value === addedAbsen.group_absen)?.label || "",
        },
      ]);

      // setcatabsen((prev) => [...prev, response.data.data]);
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
      setnewCatabsen({ name: "", description: "", fee: "", start_time:"", end_time:"", retail_id:"" });
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
    setSelectedCatabsen(row);
    setModalVisible(true);
  };

  // const handleRetailChange = (selectedOption) => {
  //   setSelectedRetail(selectedOption);
  //   setSelectedCatabsen({
  //     ...selectedCatabsen,
  //     retail_id: selectedOption ? selectedOption.value : "",
  //   });
  // };

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
          const responseDelete = await axios.post(
            `${VITE_API_URL}/absen-management/delete/${row.retail_id}`,
            {
              deleted_by: userId,
              deleted_at: DateNow,
            },
            { headers }
          );
          Swal.fire("Deleted!", `${responseDelete.data.message}`, "success");
          setcatabsen((prev) =>
            prev.filter((item) => item.retail_id !== row.retail_id)
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
        `${VITE_API_URL}/absen-management/update/${selectedCatabsen.absen_id}`,
        {
          name: selectedCatabsen.name,
          description: selectedCatabsen.description,
          fee: selectedCatabsen.fee,
          retail_id : selectedCatabsen.retail_id,
          start_time : selectedCatabsen.start_time,
          end_time : selectedCatabsen.end_time,
          group_absen : selectedCatabsen.group_absen,
          updated_by: userId,
          updated_at: DateNow,
        },
        { headers }
      );
      //const updatedAbsen = responseUpdate.data.data;
  
      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setcatabsen((prevAbsen =>
        prevAbsen.map((item) =>
          item.absen_id === selectedCatabsen.absen_id
            ? {
                ...selectedCatabsen,
                // name: users.find((u) => u.value === selectedCatabsen.user_id)?.label || "",
                retail_name: retails.find((r) => r.value === selectedCatabsen.retail_id)?.label || "",
                category_user: groups.find((r) => r.value === selectedCatabsen.id_category)?.label || "",

              }
            : item
        )
      ));
      // setcatabsen(responseUpdate.data.data);
      Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
      // setcatabsen((prev) =>
      //   prev.map((item) =>
      //     item.absen_id === selectedCatabsen.absen_id ? selectedCatabsen : item
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
    { name: "Code Absen", selector: (row) => row.name },
    { name: "Deskripsi", selector: (row) => row.description },
    { name: "Fee", selector: (row) => row.fee },
    { name: "Retail", selector: (row) => row.retail_name },
    { name: "Start Time", selector: (row) => row.start_time },
    { name: "End Time", selector: (row) => row.end_time },
    { name: "Group Absen", selector: (row) => row.category_user },

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
                      <div className="col-sm-8">
                        <button
                          className="btn btn-gradient-primary btn-sm"
                          onClick={() => setAddModalVisible(true)}
                        >
                          Add Tipe Absen
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

                    {filteredCatabsen && filteredCatabsen.length > 0 ? (
                      <DataTable
                        keyField="absen-id"
                        columns={columns}
                        data={filteredCatabsen}
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
            <label>Code Absen</label>
            <input
              type="text"
              className="form-control"
              value={newCatabsen.name}
              onChange={(e) =>
                setnewCatabsen({ ...newCatabsen, name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              className="form-control"
              value={newCatabsen.description}
              onChange={(e) =>
                setnewCatabsen({ ...newCatabsen, description: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>fee</label>
            <input
              type="text"
              className="form-control"
              value={newCatabsen.fee}
              onChange={(e) =>
                setnewCatabsen({ ...newCatabsen, fee: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              className="form-control"
              value={newCatabsen.start_time}
              onChange={(e) =>
                setnewCatabsen({ ...newCatabsen, start_time: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              className="form-control"
              value={newCatabsen.end_time}
              onChange={(e) =>
                setnewCatabsen({ ...newCatabsen, end_time: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Nama Retail</label>
            <Select
              options={retails}
              value={
                newCatabsen.retail_id
                  ? {
                      value: newCatabsen.retail_id,
                      label: retails.find(
                        (r) => r.value === newCatabsen.retail_id
                      )?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedRetail(option);
                setnewCatabsen({
                  ...newCatabsen,
                  retail_id: option ? option.value : "",
                });
              }}
              placeholder="Pilih Retail..."
              isClearable
            />
          </div>
          <div className="form-group">
            <label>Group Absen</label>
            <Select
              options={groups}
              value={
                newCatabsen.group_absen
                  ? {
                      value: newCatabsen.group_absen,
                      label: groups.find(
                        (r) => r.value === newCatabsen.group_absen
                      )?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedGroup(option);
                setnewCatabsen({
                  ...newCatabsen,
                  group_absen: option ? option.value : "",
                });
              }}
              placeholder="Pilih Group Absen..."
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
            onClick={handleAddCatAbsen}
          >
            Add Type Absen
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
                <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              className="form-control"
              value={selectedCatabsen.start_time}
              onChange={(e) =>
                setSelectedCatabsen({ ...selectedCatabsen, start_time: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              className="form-control"
              value={selectedCatabsen.end_time}
              onChange={(e) =>
                setSelectedCatabsen({ ...selectedCatabsen, end_time: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Nama Retail</label>
            <Select
              options={retails}
              value={
                selectedCatabsen.retail_id
                  ? {
                      value: selectedCatabsen.retail_id,
                      label: retails.find(
                        (r) => r.value === selectedCatabsen.retail_id
                      )?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedRetail(option);
                setSelectedCatabsen({
                  ...selectedCatabsen,
                  retail_id: option ? option.value : "",
                });
              }}
              placeholder="Pilih Retail..."
              isClearable
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

export default CatAbsen;
