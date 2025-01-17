import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
const VITE_API_URL = import.meta.env.VITE_API_URL;
const VITE_API_IMAGE = import.meta.env.VITE_API_IMAGE;
import Swal from "sweetalert2";
import { format } from "date-fns";
// const now = new Date();
// const DateNow = format(now, "yyyy-MM-dd HH:mm:ss");

const Absensi = () => {
  const [Absensies, setAbsensies] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImageAbsensi, setSelectedImageAbsensi] = useState(null);
  const [isModalOpenAbsensi, setIsModalOpenAbsensi] = useState(false);
  const [startDate, setStartDate] = useState(""); // Tanggal mulai
  const [endDate, setEndDate] = useState(""); // Tanggal akhir
  const [filterText, setFilterText] = useState({
    nama_karyawan: "",
    retail_name: "",
    category_absen: "",
    description: "",
    absen_time: "",
    fee: ""
  

  });
  

  

  const fetchAbsensies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);


      const response = await axios.get(`${VITE_API_URL}/absensi/history?${params.toString()}`, {
        headers,
      });
      const fetchedData = response.data.data || [];

      setAbsensies(fetchedData);

      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensies();
  }, []);


  const handleFilter = () => {
    fetchAbsensies();
  };


  const filteredAbsensi = Absensies.filter((item) =>
    Object.keys(filterText).every((key) => {
      const itemValue = String(item[key])?.toLowerCase(); // Pastikan item selalu jadi string kecil
      const filterValue = filterText[key].toLowerCase(); // Pastikan filter input menjadi huruf kecil
  
      // Pastikan bahwa itemValue mengandung filterValue
      return itemValue.includes(filterValue);
    })
  );
  

  const handleImageAbsensiClick = (imageUrl) => {
    setSelectedImageAbsensi(imageUrl);
    setIsModalOpenAbsensi(true);
  };

  const closeAbsensiModal = () => {
    setSelectedImageAbsensi(null);
    setIsModalOpenAbsensi(false);
  };

  const handleValidasi = async (row) => {
    let is_valid = "";
    let text = "";
    if (row.is_valid === 1) {
      is_valid = 0;
      text = "Invalidkan Absensi Ini ?";
    } else {
      is_valid = 1;
      text = "validasi Absensi Ini ?";
    }
    Swal.fire({
      title: "Are you sure?",
      text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes!!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const headers = { Authorization: `Bearer ${token}` };
          const responseValidasi = await axios.post(
            `${VITE_API_URL}/absensi/validasi/${row.absensi_id}`,
            {
              is_valid: is_valid,
            },
            { headers }
          );
          Swal.fire("Updated!", `${responseValidasi.data.message}`, "success");
          setAbsensies((prev) =>
            prev.map((item) =>
              item.absensi_id === row.absensi_id ? { ...item, is_valid } : item
            )
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

  const columns = [
    {
      name: (
        <span style={{ marginBottom: "45px" }}>#</span>
      ),
      cell: (row, index) => <span>{index + 1}</span>,
      width: "50px",
    },
      {
     
      selector: (row) => row.nama_karyawan,
      cell: (row) => row.nama_karyawan,
      // Header dengan input filter
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Nama Karyawan</span>
          <input
            type="text"
            value={filterText.nama_karyawan}
            className="form-control mt-1"
            style={{
              fontSize: "12px",
              padding: "4px",
              height: "28px",
              width: "100%", // Sesuaikan agar sesuai dengan lebar kolom
              marginBottom: "10px", // Jarak dengan header
              textAlign: "left", // Pastikan teks rata kiri
            }}
            onChange={(e) =>
              setFilterText({ ...filterText, nama_karyawan: e.target.value })
            }
          />
        </div>
      ),
    },
    {
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Retail/Outlet</span>
          <input
            type="text"
            value={filterText.retail_name}
            className="form-control mt-1"
            style={{
              fontSize: "12px",
              padding: "4px",
              height: "28px",
              width: "100%", // Sesuaikan agar sesuai dengan lebar kolom
              marginBottom: "10px", // Jarak dengan header
              textAlign: "left", // Pastikan teks rata kiri
            }}
            onChange={(e) =>
              setFilterText({ ...filterText, retail_name: e.target.value })
            }
          />
        </div>
      ),
      selector: (row) => row.retail_name,
    },
    { 
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Code Absen</span>
          <input
            type="text"
            value={filterText.category_absen}
            className="form-control mt-1"
            style={{
              fontSize: "12px",
              padding: "4px",
              height: "28px",
              width: "100%", // Sesuaikan agar sesuai dengan lebar kolom
              marginBottom: "10px", // Jarak dengan header
              textAlign: "left", // Pastikan teks rata kiri
            }}
            onChange={(e) =>
              setFilterText({ ...filterText, category_absen: e.target.value })
            }
          />
        </div>
      ),
      selector: (row) => row.category_absen },
    {
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Waktu Absen</span>
          <input
            type="text"
            value={filterText.absen_time}
            className="form-control mt-1"
            style={{
              fontSize: "12px",
              padding: "4px",
              height: "28px",
              width: "100%", // Sesuaikan agar sesuai dengan lebar kolom
              marginBottom: "10px", // Jarak dengan header
              textAlign: "left", // Pastikan teks rata kiri
            }}
            onChange={(e) =>
              setFilterText({ ...filterText, absen_time: e.target.value })
            }
          />
        </div>
      ),
      selector: (row) =>
        format(new Date(row.absen_time), "yyyy-MM-dd HH:mm:ss"),
    },
    { 
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Deskripsi</span>
          <input
            type="text"
            className="form-control mt-1"
            value={filterText.description}
            style={{
              fontSize: "12px",
              padding: "4px",
              height: "28px",
              width: "100%", // Sesuaikan agar sesuai dengan lebar kolom
              marginBottom: "10px", // Jarak dengan header
              textAlign: "left", // Pastikan teks rata kiri
            }}
            onChange={(e) =>
              setFilterText({ ...filterText, description: e.target.value })
            }
          />
        </div>
      ),
      
      
      selector: (row) => row.description },
    { 
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Fee</span>
          <input
            type="text"
            value={filterText.fee}
            className="form-control mt-1"
            style={{
              fontSize: "12px",
              padding: "4px",
              height: "28px",
              width: "100%", // Sesuaikan agar sesuai dengan lebar kolom
              marginBottom: "10px", // Jarak dengan header
              textAlign: "left", // Pastikan teks rata kiri
            }}
            onChange={(e) =>
              setFilterText({ ...filterText, fee: e.target.value })
            }
           
          />
        </div>
      ),
      selector: (row) => row.fee },
    {
      name: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ marginBottom: "6px" }}>Photo/Video</span>
          <input
            type="text"
            className="form-control mt-1"
            style={{
              fontSize: "12px",
              padding: "4px",
              height: "28px",
              width: "100%", // Sesuaikan agar sesuai dengan lebar kolom
              marginBottom: "10px", // Jarak dengan header
              textAlign: "left", // Pastikan teks rata kiri
            }}
            disabled
          />
        </div>
      ),
      cell: (row) => (
        <div>
          {row?.photo_url &&
          (row.photo_url.endsWith(".mp4") ||
            row.photo_url.endsWith(".webm")) ? (
            <video
              src={`${VITE_API_IMAGE}${row.photo_url}`}
              alt="Video Preview"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "10%",
                cursor: "pointer",
                objectFit: "cover",
              }}
              onClick={() =>
                handleImageAbsensiClick(`${VITE_API_IMAGE}${row.photo_url}`)
              }
            >
              Your browser does not support the video tag.
            </video>
          ) : (
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
                objectFit: "cover",
              }}
              onClick={() =>
                handleImageAbsensiClick(
                  row?.photo_url
                    ? `${VITE_API_IMAGE}${row.photo_url}`
                    : "https://via.placeholder.com/50"
                )
              }
            />
          )}
        </div>
      ),
    },
    {
      name: (
        <span style={{ marginBottom: "45px" }}>Status</span>
      ),
      cell: (row) => (
        <button
          className={`btn btn-sm ${
            row.is_valid ? "btn-gradient-success" : "btn-gradient-danger"
          }`}
          onClick={() => {
            handleValidasi(row);
          }}
        >
          {row.is_valid ? "Valid" : "Invalid"}
        </button>
      ),
    },
  ];
 

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h3 className="page-title">Data Absensi</h3>
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
                    {/* <div className="row"> */}
                    <div className="row mb-5">
                      <div className="col-md-3 d-flex align-items-end">
                        <div className="me-2 w-100">
                          <label htmlFor="startDate">Start Date:</label>
                          <input
                            id="startDate"
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-3 d-flex align-items-end">
                        <div className="me-2 w-100">
                          <label htmlFor="endDate">End Date:</label>
                          <input
                            id="endDate"
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                        <button
                          className="btn btn-sm btn-gradient-info mb-1"
                          onClick={handleFilter}
                        >
                          Filter
                        </button>
                      </div>

                      <div className="col-sm-2"></div>
                      <div className="col-sm-4 d-flex align-items-center">
                        {/* <div className="input-group me-2 w-100">
                          <div className="input-group-prepend bg-transparent">
                            <span className="input-group-text border-0 bg-transparent">
                              <i className="mdi mdi-magnify"></i>
                            </span>
                          </div>
                          <input
                            className="form-control bg-transparent border-0"
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div> */}
                      </div>
                    </div>

                    {filteredAbsensi && filteredAbsensi.length > 0 ? (
                      <DataTable
                        keyField="Absensi_id"
                        columns={columns}
                        data={filteredAbsensi}
                        customStyles={{
                          rows: {
                            style: {
                              animation: "fadeIn 0.5s ease-in-out",
                            },
                          },
                        }}
                        pagination
                      />
                    ) : (
                      <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            {columns.map((col, index) => (
                              <th key={index} style={{fontSize:"12px"}}>{col.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAbsensi.length > 0 ? (
                            filteredAbsensi.map((row, index) => (
                              <tr key={index}>
                                {columns.map((col, colIndex) => (
                                  <td key={colIndex} >
                                    {col.cell ? col.cell(row) : col.selector(row)}
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                                <em>No data found</em>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpenAbsensi && (
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
          onClick={closeAbsensiModal}
        >
          {selectedImageAbsensi && selectedImageAbsensi.endsWith(".mp4") ? (
            <video
              controls
              style={{
                maxWidth: "60%",
                maxHeight: "60%",
                borderRadius: "10px",
              }}
              onClick={(e) => e.stopPropagation()} // Prevent close on video click
            >
              <source src={selectedImageAbsensi} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={selectedImageAbsensi}
              alt="Preview"
              style={{
                maxWidth: "60%",
                maxHeight: "60%",
                borderRadius: "10px",
              }}
              onClick={(e) => e.stopPropagation()} // Prevent close on image click
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Absensi;
