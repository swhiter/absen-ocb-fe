import { useState, useEffect } from "react";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;
// const now = new Date();
// const DateNow = format(now, "yyyy-MM-dd HH:mm:ss");

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fee, setFee] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/summary`, { headers });
        
        // Ambil data dari getTotalDaily
        const fetchedData = response.data.getTotalDaily || [];
        setDashboardData(fetchedData); 
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      }finally {
      setLoading(false);
    }
    };
  
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchFee = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${VITE_API_URL}/summary/total-fee`, { headers });
  
        // console.log("Response Data:", response.data);
  
        // Akses data.total_fee dari array di dalam respons
        const fetchedFee = response.data?.data[0]?.total_fee || 0; 
        // console.log("Fetched Fee:", fetchedFee);
  
        setFee(fetchedFee); // Simpan nilai angka total_fee
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFee();
  }, []);
  
  
  


 


  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h3 className="page-title">
          <span className="page-title-icon bg-gradient-primary text-white me-2">
            <i className="mdi mdi-home"></i>
          </span>{" "}
          Dashboard
        </h3>
        <nav aria-label="breadcrumb">
          <ul className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              <span></span>Overview{" "}
              <i className="mdi mdi-alert-circle-outline icon-sm text-primary align-middle"></i>
            </li>
          </ul>
        </nav>
      </div>
      <div className="row">
      {dashboardData.map((item, index) => (
                  <div className="col-md-3 stretch-card grid-margin" key={index}>
                  <div className="card bg-gradient-danger card-img-holder text-white">
                    <div className="card-body">
                      <img src="/circle.svg" className="card-img-absolute" alt="circle-image" />
                      <h4 className="font-weight-normal mb-3">{item.label}<i className="mdi mdi-chart-line mdi-24px float-end"></i>
                      </h4>
                      <h2 className="mb-5">{item.value}</h2>
                      <h6 className="card-text">Daily Summary</h6>
                    </div>
                  </div>
                </div>
            ))}

                <div className="col-md-3 stretch-card grid-margin" >
                  <div className="card bg-gradient-danger card-img-holder text-white">
                    <div className="card-body">
                      <img src="/circle.svg" className="card-img-absolute" alt="circle-image" />
                      <h4 className="font-weight-normal mb-3">Total fee<i className="mdi mdi-chart-line mdi-24px float-end"></i>
                      </h4>
                      <h2 className="mb-5">{fee || 0}</h2>
                      <h6 className="card-text">Fee Per Month</h6>
                    </div>
                  </div>
                </div>
              
             
            </div>
            <div className="row">
              <div className="col-md-12 grid-margin stretch-card">
                <div className="card">
                  <div className="card-body">
                    <div className="clearfix">
                      <h4 className="card-title float-start">List Need Approval</h4>
                      <div id="visit-sale-chart-legend" className="rounded-legend legend-horizontal legend-top-right float-end"></div>
                    </div>
                    <canvas id="visit-sale-chart" className="mt-4"></canvas>
                  </div>
                </div>
              </div>
            </div>
    </div>
  );
};

export default Dashboard;
