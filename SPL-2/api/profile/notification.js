import { db } from "../db.js";
import send_mail from "../control/sent_mail.js";

export const getNotification = async (req, res) => {
  const ID = req.body.ID;
  const querey = `select * from bcsir.notification where ReceiverID = 0 OR (select departmentID from bcsir.researcher where ID='${ID}');`;
  //console.log(querey);
  db.query(querey, (err, data) => {
    if (err) {
      console.log("Error to get notification data");
      return res.status(500).json("Can't get data");
    } else {
      console.log("Complete get notification data", data);
      return res.status(200).send(data);
    }
  });
};

const getDepartmentID = async (dept, departmentID) => {
  if (dept === "All Department") {
    return 10;
  } else {
    const query = `SELECT DepartmentID FROM bcsir.department WHERE DepartmentName = '${dept}';`;
    return new Promise((resolve, reject) => {
      db.query(query, (err, data) => {
        if (err) {
          console.log("Error getting department ID:", err);
          reject(departmentID);
        } else {
          console.log(data);
          console.log("Inside function");
          resolve(data[0]["DepartmentID"]);
        }
      });
    });
  }
};

const sendNotificationByEmail = (Tittle, Body, deptID) => {
  var querey;
  if (deptID === 10) {
    querey = `select Email from bcsir.researcher;`;
  } else {
    querey = `select Email from bcsir.researcher where departmentID = ${deptID};`;
  }
  db.query(querey, (err, data) => {
    if (err) {
      console.log("Err for querey email");
      return "Err for querey email";
    } else {
      data.map((emailData) => {
        send_mail(emailData.Email, Tittle, Body);
        //console.log( emailData.Email);
      });

      return "Email send Successfully";
    }
  });

  console.log("Email send here");
};

export const sendNotification = async (req, res) => {
  const { ID, dept, DepartmentID, Email, Profile, Tittle, Body } = req.body;
  console.log(req.body);
  const deptID = await getDepartmentID(dept, DepartmentID);
  console.log(deptID);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  console.log(formattedDate);

  const querey = `INSERT INTO bcsir.notification (OwnerID,body, DateTime, ReceiverID, Tittle) VALUES ('${ID}', '${Body}', '${formattedDate}', '${deptID}', '${Tittle}');`;
  console.log(querey);
  db.query(querey, (err, data) => {
    if (err) {
      console.log("Error to insert data into notificattion table");
      return res
        .status(400)
        .json("Error to insert data into notificattion table");
    } else {
      console.log("Successfdully complete");
      return res.status(200).json("COmplete");
    }
  });

  if (Email) {
    sendNotificationByEmail(Tittle, Body, deptID);
  }

  if (Profile) {
    //sendNotification
  }
};
