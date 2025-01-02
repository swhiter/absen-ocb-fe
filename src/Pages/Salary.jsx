import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { format } from "date-fns";
import * as XLSX from "xlsx";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Salary = () => {
  const [salary, setsalary] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch salary data
        const salaryResponse = await axios.get(`${VITE_API_URL}/management/fee-karyawan`, {
          headers,
        });
        const salaryData = salaryResponse.data.data || [];
        const validsalaryData = salaryData.filter((item) => item && item.name);
        setsalary(validsalaryData);

        // Clear errors
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredsalary = salary.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.username?.toLowerCase().includes(search.toLowerCase()) ||
      item.period?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      name: "#",
      cell: (row, index) => <span>{index + 1}</span>,
      width: "50px",
    },
    { name: "Nama Karyawan", selector: (row) => row.name },
    { name: "Username", selector: (row) => row.username },
    { name: "Period Salary", selector: (row) => row.period },
    { name: "Total Gaji Awal", selector: (row) => formatRupiah(row.total_gaji_awal) },
    { name: "Potongan Terlambat", selector: (row) => formatRupiah(row.potongan_terlambat) },
    { name: "Potongan Kehadiran", selector: (row) => formatRupiah(row.potongan_kehadiran) },
    { name: "Bonus", selector: (row) => formatRupiah(row.bonus) },
    { name: "Total Potongan", selector: (row) => formatRupiah(row.total_deduction) },
    { name: "Total Gaji", selector: (row) => formatRupiah(row.total_gaji_akhir) },
  ];

  const exportToExcel = () => {
    const data = filteredsalary.map((row, index) => ({
      "#": index + 1,
      "Nama Karyawan": row.name,
      "Username": row.username,
      "Period Salary": row.period,
      "Total Gaji Awal": row.total_gaji_awal,
      "Potongan Terlambat": row.potongan_terlambat,
      "Potongan Kehadiran": row.potongan_kehadiran,
      "Bonus": row.bonus,
      "Total Potongan": row.total_deduction,
      "Total Gaji": row.total_gaji_akhir,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Data");

    const dateNow = new Date().toISOString().split("T")[0]; // Current date
    XLSX.writeFile(workbook, `Salary_Data_${dateNow}.xlsx`);
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h3 className="page-title">Management Salary Karyawan</h3>
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Table Salary</h4>
              <div className="table-responsive">
                {loading ? (
                  <p>Loading data...</p>
                ) : error ? (
                  <p className="text-danger">Error: {error}</p>
                ) : (
                  <>
                    <div className="row mb-3">
                      <div className="col-sm-8">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={exportToExcel}
                        >
                          Export to Excel
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
    </div>
  );
};

export default Salary;
