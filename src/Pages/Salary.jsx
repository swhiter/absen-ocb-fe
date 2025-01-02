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

const Salary = () => {
  const [salary, setsalary] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedsalary, setSelectedsalary] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal untuk tambah user baru
  const [newsalary, setnewsalary] = useState({
    user_id: "",
    salary: "",
    month: "",
  });
  const [users, setusers] = useState([]);
  const [selecteduser, setSelecteduser] = useState(null);

  useEffect(() => {
    const fetchsalary = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/management/salary`, {
          headers,
        });
        const fetchedData = response.data.data || [];
        const validData = fetchedData.filter((item) => item && item.name);
        setsalary(validData);

        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchsalary();
  }, []);

  const filteredsalary = salary.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
  );

 

  console.log("Selected salary:", selectedsalary);


  useEffect(() => {
    const fetchuser = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/users`, { headers });
        const userOptions = response.data.data.map((user) => ({
          value: user.user_id,
          label: user.name,
        }));
        setusers(userOptions);
        if (selectedsalary.user_id) {
          const initialuser = userOptions.find(
            (user) => user.value === selectedsalary.user_id
          );
          setSelecteduser(initialuser || null);
        } // Sesuaikan key sesuai struktur respons API
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchuser();
  }, [selectedsalary.user_id]);

  const handleAddsalary = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userProfile = sessionStorage.getItem("userProfile");
      const userData = JSON.parse(userProfile); // Parse JSON
      const userId = userData[0]?.user_id;

      //   const userData = JSON.parse(sessionStorage.getItem("userData"));
      //   const userId = userData?.id;

      const response = await axios.post(
        `${VITE_API_URL}/management/addsalary`,
        {
          ...newsalary,
          created_by: userId,
          created_at: DateNow,
        },
        { headers }
      );
      // Ambil data baru dari respons API
      const addedsalary = response.data.data;

      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setsalary((prev) => [
        ...prev,
        {
          ...addedsalary,
          // name: users.find((u) => u.value === addedAbsen.user_id)?.label || "", // Nama user

          name: users.find((r) => r.value === addedsalary.user_id)?.label || "",
        },
      ]);

      // setsalary((prev) => [...prev, response.data.data]);
      Swal.fire("Success!", `${response.data.message}`, "success");
      setAddModalVisible(false);
      setnewsalary({ user_id: "", salary: "", month: ""});
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
    setSelectedsalary(row);
    setModalVisible(true);
  };

  // const handleRetailChange = (selectedOption) => {
  //   setSelectedRetail(selectedOption);
  //   setSelectedsalary({
  //     ...selectedsalary,
  //     retail_id: selectedOption ? selectedOption.value : "",
  //   });
  // };

  const handleuserChange = (selectedOption) => {
    setSelecteduser(selectedOption);
    setSelectedsalary({
      ...selectedsalary,
      user_id: selectedOption ? selectedOption.value : "",
    });
  };

  const handleDelete = async (row) => {
    Swal.fire({
      title: "Kamu Yakin ?",
      text: `Delete salary untuk User : ${row.name} ?`,
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
            `${VITE_API_URL}/management/deletesalary/${row.id_salary}`,
            {
              deleted_by: userId,
              deleted_at: DateNow,
            },
            { headers }
          );
          Swal.fire("Deleted!", `${responseDelete.data.message}`, "success");
          setsalary((prev) =>
            prev.filter((item) => item.id_salary !== row.id_salary)
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
        `${VITE_API_URL}/management/updatesalary/${selectedsalary.id_salary}`,
        {
          user_id: selectedsalary.user_id,
          month: selectedsalary.month,
          salary: selectedsalary.salary,
          updated_by: userId,
          updated_at: DateNow,
        },
        { headers }
      );
      //const updatedAbsen = responseUpdate.data.data;

      // Tambahkan data baru ke state dengan format yang sesuai tabel
      setsalary((prevsalary) =>
        prevsalary.map((item) =>
          item.id_salary === selectedsalary.id_salary
            ? {
                ...selectedsalary,
                name:
                  users.find((r) => r.value === selectedsalary.user_id)
                    ?.label || "",
              }
            : item
        )
      );
      // setsalary(responseUpdate.data.data);
      Swal.fire("Updated!", `${responseUpdate.data.message}`, "success");
      // setsalary((prev) =>
      //   prev.map((item) =>
      //     item.absen_id === selectedsalary.absen_id ? selectedsalary : item
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
    {
      name: "Tanggal",
      selector: (row) => format(new Date(row.month), "yyyy-MM-dd"),
    },
    { name: "salary", selector: (row) => row.salary },

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
        <h3 className="page-title">Management salary Karyawan</h3>
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Table salary</h4>
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
                          Tambah salary Karyawan
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

                    {filteredsalary && filteredsalary.length > 0 ? (
                      <DataTable
                        keyField="salary-id"
                        columns={columns}
                        data={filteredsalary}
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
          <Modal.Title>Tambah salary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Karyawan</label>
            <Select
              options={users}
              value={
                newsalary.user_id
                  ? {
                      value: newsalary.user_id,
                      label: users.find((r) => r.value === newsalary.user_id)
                        ?.label,
                    }
                  : null
              }
              onChange={(option) => {
                setSelecteduser(option);
                setnewsalary({
                  ...newsalary,
                  user_id: option ? option.value : "",
                });
              }}
              placeholder="Pilih Karyawan..."
              isClearable
            />
          </div>
          <div className="form-group">
            <label>salary </label>
            <input
              type="number"
              className="form-control"
              value={newsalary.salary}
              onChange={(e) =>
                setnewsalary({ ...newsalary, salary: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Tanggal</label>
            <input
              type="date"
              className="form-control"
              value={newsalary.month}
              onChange={(e) =>
                setnewsalary({ ...newsalary, month: e.target.value })
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
            onClick={handleAddsalary}
          >
            Tambah salary
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update salary</Modal.Title>
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
                <label>salary</label>
                <textarea
                  type="number"
                  className="form-control"
                  value={selectedsalary.salary}
                  onChange={(e) =>
                    setSelectedsalary({
                      ...selectedsalary,
                      salary: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Tanggal</label>
                <input
                  className="form-control"
                  type="date"
                  value={
                    selectedsalary.month
                      ? new Date(selectedsalary.month)
                          .toISOString()
                          .split("T")[0] // Format ke yyyy-MM-dd
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedsalary({
                      ...selectedsalary,
                      month: e.target.value, // Nilai langsung dari input date
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

export default Salary;
