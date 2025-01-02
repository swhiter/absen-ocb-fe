import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
const VITE_API_URL = import.meta.env.VITE_API_URL;
import Swal from "sweetalert2";
import { format } from "date-fns";
const now = new Date();
const DateNow = format(now, "yyyy-MM-dd HH:mm:ss");

const Absensi = () => {
  const [Absensies, setAbsensies] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAbsensies = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/absensi/history/`, {
          headers,
        });
        const fetchedData = response.data.data || [];
        const validData = fetchedData.filter(
          (item) => item && item.nama_karyawan
        );
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

  const filteredAbsensi = Absensies.filter(
    (item) =>
      item.nama_karyawan?.toLowerCase().includes(search.toLowerCase()) ||
      item.retail_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category_absen?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleValidasi = async (row) => {
    let is_valid = "";
    let text ="";
    if (row.is_valid ===1 ){
      is_valid = 0;
      text = "Invalidkan Absensi Ini ?"
    }else {
      is_valid = 1;
      text = "validasi Absensi Ini ?"
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
          const responseValidasi = await axios.post(`${VITE_API_URL}/absensi/validasi/${row.absensi_id}`,
            {
              is_valid : is_valid,

            }, { headers });
          Swal.fire("Updated!", `${responseValidasi.data.message}`, "success");
          setAbsensies((prev) =>
            prev.map((item) =>
              item.absensi_id === row.absensi_id ? { ...item, is_valid } : item
            )
          );
        } catch (error) {
          Swal.fire("Error!", error.response?.data?.message || error.message, "error");
        }
      }
    });
  };

  const columns = [
    {
      name: "#",
      cell: (row, index) => <span>{index + 1}</span>,
      width: "50px",
    },
    {
      name: "Nama Karyawan",
      selector: (row) => row.nama_karyawan, // Format start_date using date-fns
    },
    {
      name: "Retail/Outlet",
      selector: (row) => row.retail_name,
    },
    { name: "Code Absen", selector: (row) => row.category_absen },
    { name: "Waktu Absen", selector: (row) => format(new Date(row.absen_time), "yyyy-MM-dd HH:mm:ss") },
    { name: "Deskripsi", selector: (row) => row.description },
    { name: "Fee", selector: (row) => row.fee },
    {
      name: "Status",
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
                    <div className="row">
                      <div className="col-sm-8"></div>
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
    </div>
  );
};

export default Absensi;
