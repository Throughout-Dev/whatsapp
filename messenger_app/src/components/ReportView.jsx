import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // debugger
    // axios
    //   .get("/api/whatsapp/reports/view")
    //   .then(res => {
    //     setReports(res.data.data || []);
    //     setLoading(false);
    //   })
    //   .catch(err => {
    //     console.error(err);
    //     setLoading(false);
    //   });
    axios.get("http://localhost:3000/api/whatsapp/reports/view")
  .then(res => {
    console.log("API RESPONSE:", res.data);
    setReports(res.data.data || []);
    setLoading(false);
  })
  .catch(err => {
    console.error("API ERROR:", err);
    setLoading(false);
  });
  }, []);

  console.log('reports : ',reports)

  if (loading) return <p>Loading report...</p>;

  // return (<> 
  //   </>
  //   <div>
  //     <h2>Message Report</h2>

  //     <table border="1" cellPadding="8">
  //       <thead>
  //         <tr>
  //           <th>#</th>
  //           <th>Date</th>
  //           <th>From</th>
  //           <th>To</th>
  //           <th>Message</th>
  //           <th>Status</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {reports.map((r, i) => (
  //           <tr key={r._id}>
  //             <td>{i + 1}</td>
  //             <td>{new Date(r.createdAt).toLocaleString()}</td>
  //             <td>{r.fromNumber}</td>
  //             <td>{r.contactNumber}</td>
  //             <td>{r.message}</td>
  //             <td>{r.status}</td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //   </div>
  // );
  return(
    <div className="container mt-4">
  <div className="card shadow-sm">
    <div className="card-header bg-dark text-white">
      <h5 className="mb-0">Message Report</h5>
    </div>

    <div className="card-body">
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No records found
                </td>
              </tr>
            ) : (
              reports.map((r, i) => (
                <tr key={r._id}>
                  <td>{i + 1}</td>

                  <td className="text-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>

                  <td className="text-nowrap">{r.fromNumber}</td>

                  <td className="text-nowrap">{r.contactNumber}</td>

                  <td style={{ maxWidth: "300px" }}>
                    <div className="text-truncate" title={r.message}>
                      {r.message}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        r.status === "success"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
    )
}
