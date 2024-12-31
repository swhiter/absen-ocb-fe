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

const OffDay = () => {
  const [offDay, setoffDay] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedoffDay, setSelectedoffDay] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal untuk tambah user baru
  const [newoffDay, setnewoffDay] = useState({
    name: "",
    type_off: "",
    tanggal: "",
    reason: "",
  });
  const [retails, setRetails] = useState([]);
  const [selectedRetail, setSelectedRetail] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchoffDay = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/management/offday`, {
          headers,
        });
        const fetchedData = response.data.data || [];
        const validData = fetchedData.filter((item) => item && item.name);
        setoffDay(validData);

        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchoffDay();
  }, []);

  const filteredoffDay = offDay.filter(
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
        if (selectedoffDay.retail_id) {
          const initialRetail = retailOptions.find(
            (retail) => retail.value === selectedoffDay.retail_id
          );
          setSelectedRetail(initialRetail || null);
        } // Sesuaikan key sesuai struktur respons API
      } catch (error) {
        console.error("Failed to fetch retail:", error);
      }
    };

    fetchRetail();
  }, [selectedoffDay.retail_id]);

  console.log("Selected offDay:", selectedoffDay);
console.log("Groups:", groups);
console.log("Selected Group:", selectedGroup);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/users/category-alluser`, { headers });
        const groupOptions = response.data.data.map((group) => ({
          value: group.group_absen,
          label: group.category_user,
        }));
        setGroups(groupOptions);
        if (selectedoffDay.group_absen) {
          const initialGroup = groupOptions.find(
            (group) => group.value === selectedoffDay.group_absen
          );
          setSelectedGroup(initialGroup || null);
        } // Sesuaikan key sesuai struktur respons API
      } catch (error) {
        console.error("Failed to fetch group:", error);
      }
    };

    fetchGroup();
  },[selectedoffDay.group_absen] );

  const handleAddoffDay = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const userId = userData?.id;

      const response = await axios.post(
        `${VITE_API_URL}/absen-management/create`,
        {
          ...newoffDay,
          created_by: userId,
          created_at: DateNow,
        },
        { headers }
      );
      // Ambil data baru dari respons API
      const addedAbsen = response.data.data;
  
      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setoffDay((prev) => [
        ...prev,
        {
          ...addedAbsen,
          // name: users.find((u) => u.value === addedAbsen.user_id)?.label || "", // Nama user
          retail_name: retails.find((r) => r.value === addedAbsen.retail_id)?.label || "", // Nama retail
          category_user: groups.find((r) => r.value === addedAbsen.group_absen)?.label || "",
        },
      ]);

      // setoffDay((prev) => [...prev, response.data.data]);
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
      setnewoffDay({ name: "", description: "", fee: "", start_time:"", end_time:"", retail_id:"", group_absen:"" });
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
    setSelectedoffDay(row);
    setModalVisible(true);
  };

  // const handleRetailChange = (selectedOption) => {
  //   setSelectedRetail(selectedOption);
  //   setSelectedoffDay({
  //     ...selectedoffDay,
  //     retail_id: selectedOption ? selectedOption.value : "",
  //   });
  // };

  const handleGroupChange = (selectedOption) => {
    setSelectedGroup(selectedOption);
    setSelectedoffDay({
      ...selectedoffDay,
      group_absen: selectedOption ? selectedOption.value : "",
    });
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
          const responseDelete = await axios.post(
            `${VITE_API_URL}/absen-management/delete/${row.retail_id}`,
            {
              deleted_by: userId,
              deleted_at: DateNow,
            },
            { headers }
          );
          Swal.fire("Deleted!", `${responseDelete.data.message}`, "success");
          setoffDay((prev) =>
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
        `${VITE_API_URL}/absen-management/update/${selectedoffDay.absen_id}`,
        {
          name: selectedoffDay.name,
          description: selectedoffDay.description,
          fee: selectedoffDay.fee,
          retail_id : selectedoffDay.retail_id,
          start_time : selectedoffDay.start_time,
          end_time : selectedoffDay.end_time,
          group_absen : selectedoffDay.group_absen,
          updated_by: userId,
          updated_at: DateNow,
        },
        { headers }
      );
      //const updatedAbsen = responseUpdate.data.data;
  
      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setoffDay((prevAbsen =>
        prevAbsen.map((item) =>
          item.absen_id === selectedoffDay.absen_id
            ? {
                ...selectedoffDay,
                // name: users.find((u) => u.value === selectedoffDay.user_id)?.label || "",
                retail_name: retails.find((r) => r.value === selectedoffDay.retail_id)?.label || "",
                category_user: groups.find((r) => r.value === selectedoffDay.group_absen)?.label || "",

              }
            : item
        )
      ));
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
      name: "#",
      cell: (row, index) => <span>{index + 1}</span>,
      width: "50px",
    },
    { name: "Nama Karyawan", selector: (row) => row.name },
    { name: "Tanggal", selector: (row) => row.tanggal },
    { name: "Tipe Off", selector: (row) => row.type_off },
    { name: "Keterangan", selector: (row) => row.reason },


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
        <h3 className="page-title">Managament Fee</h3>
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Table Fee Managament</h4>
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
                          Tambah Hari Libur
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

                    {filteredoffDay && filteredoffDay.length > 0 ? (
                      <DataTable
                        keyField="offday-id"
                        columns={columns}
                        data={filteredoffDay}
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
          <Modal.Title>Tambah Hari Libur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Nama Karyawan</label>
            <input
              type="text"
              className="form-control"
              value={newoffDay.name}
              onChange={(e) =>
                setnewoffDay({ ...newoffDay, name: e.target.value })
              }
            />
          </div>
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
            <label>Kategori Libur</label>
            <Select
              options={retails}
              value={
                newoffDay.retail_id
                  ? {
                      value: newoffDay.retail_id,
                      label: retails.find(
                        (r) => r.value === newoffDay.retail_id
                      )?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedRetail(option);
                setnewoffDay({
                  ...newoffDay,
                  retail_id: option ? option.value : "",
                });
              }}
              placeholder="Pilih Retail..."
              isClearable
            />
          </div>
          <div className="form-group">
            <label>Tanggal</label>
            <textarea
              type="text"
              className="form-control"
              value={newoffDay.tanggal}
              onChange={(e) =>
                setnewoffDay({ ...newoffDay, tanggal: e.target.value })
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
                    value={selectedoffDay.name || ""}
                    onChange={(e) =>
                      setSelectedoffDay({
                        ...selectedoffDay,
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
                    value={selectedoffDay.description || ""}
                    onChange={(e) =>
                      setSelectedoffDay({
                        ...selectedoffDay,
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
                    value={selectedoffDay.fee || ""}
                    onChange={(e) =>
                      setSelectedoffDay({
                        ...selectedoffDay,
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
              value={selectedoffDay.start_time}
              onChange={(e) =>
                setSelectedoffDay({ ...selectedoffDay, start_time: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              className="form-control"
              value={selectedoffDay.end_time}
              onChange={(e) =>
                setSelectedoffDay({ ...selectedoffDay, end_time: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Nama Retail</label>
            <Select
              options={retails}
              value={
                selectedoffDay.retail_id
                  ? {
                      value: selectedoffDay.retail_id,
                      label: retails.find(
                        (r) => r.value === selectedoffDay.retail_id
                      )?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedRetail(option);
                setSelectedoffDay({
                  ...selectedoffDay,
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
                 {/* <div className="form-group">
            <label>Group Absen</label>
            <Select
              options={groups}
              value={
                selectedoffDay.group_absen
                  ? {
                      value: selectedoffDay.group_absen,
                      label: groups.find(
                        (r) => r.value === selectedoffDay.group_absen
                      )?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedGroup(option);
                setSelectedoffDay({
                  ...selectedoffDay,
                  group_absen: option ? option.value : "",
                });
              }}
              placeholder="Pilih Group Absen..."
              isClearable
            />
            
          </div> */}
          <div className="form-group">
                  <label> Group User/ Category</label>
                  <Select
                    options={groups} // Data karyawan
                    value={selectedGroup} // Nilai yang dipilih
                    onChange={handleGroupChange} // Fungsi ketika berubah
                    placeholder="Pilih group Category..."
                    isClearable // Tambahkan tombol untuk menghapus pilihan
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
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OffDay;