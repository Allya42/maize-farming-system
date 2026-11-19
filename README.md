# 🌽 Maize Farming Record Management System

The Maize Farming Record Management System is a full-stack, web-based application designed to digitize and streamline the agricultural record-keeping process for smallholder maize farmers and agricultural extension officers in Uganda.

Traditionally, farming records (like planting dates, disease outbreaks, and harvest yields) are kept on paper, which often gets lost, damaged, or is hard to analyze. This system solves that problem by providing a centralized MongoDB cloud database. The application uses Role-Based Access Control (RBAC) to provide two distinct, secure portals: one for the Farmer (the data producer) and one for the Admin/Extension Officer (the data verifier and manager)..

## 📋 Project Overview
This system solves the problem of fragmented and lost agricultural records by providing a centralized MongoDB database. It features **Role-Based Access Control (RBAC)** with two distinct dashboards:
1. **The Admin (Extension Officer) Dashboard:**Admin credentials are admin and the password 123
 System-Wide Analytics: The Admin Dashboard features high-level summary cards (Total Farmers, Total Farms, Total Revenue) and Chart.js visualizations showing district-wide harvest production per season and disease severity distributions.

Farmer & Farm Management: The Admin is the primary onboarding agent. When a new farmer joins the cooperative, the Admin registers them in the farmers collection, generating a unique farmerId (e.g., F006). They then register the farmer's physical land under the farms collection, linking it via the farmerId.

Disease Verification & Resolution: When a farmer reports a disease, it appears in the Admin's "Disease Reports" table. The Admin monitors these reports. Once the Extension Officer physically visits the farm and helps the farmer treat the crops, they click the "Resolve" button. This updates the database status from "Pending" to "Resolved," which instantly removes the yellow alert from the farmer's dashboard.

Cascading Data Management: If a farmer leaves the cooperative, the Admin can delete their profile. The backend is built with referential integrity; deleting a farmer automatically cascades and deletes all of their associated farms, harvests, and disease reports to prevent orphaned data in the database.

2. **The Farmer Dashboard:**Visual Field Overview: the farmer registers using the exact name he was registered with at the office, his id and can set his own password and after log in. the farmer sees a visual map of their fields. The system automatically cross-references the farms collection with the diseaseReports collection. If a field has an active, unresolved disease report, the visual card turns Yellow (Needs Attention). If it is healthy, it turns Green.

Log Harvests: The farmer clicks "My Harvests" to record their yield. They select their farm from a restricted dropdown, enter the season (e.g., Season A 2024), the quantity in kilograms, and the market price. The system automatically calculates their total revenue (Quantity × Price) in real-time before saving it to the database.

Report Diseases: If the farmer notices pests (like Fall Armyworm) or yellowing leaves, they click "Report Disease." They fill out the symptoms and severity. Because the reportedBy field is automatically tied to their logged-in profile, the farmer cannot impersonate another user.

Track Alerts: Any active (unresolved) disease reports automatically appear as alerts on their dashboard, reminding them to take action.

## 🛠️ Technology Stack
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (with Chart.js for analytics).
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB (via Mongoose).
*   **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing.

## 📁 Project Structure
```text
maize-farming-system/
│
├── backend/
│   ├── config/          # Database connection (db.js)
│   ├── controllers/     # Logic for CRUD operations & Auth
│   ├── models/          # Mongoose Schemas (User, Farmer, Farm, Disease, Harvest)
│   ├── routes/          # Express API endpoints
│   ├── seed/            # Sample data injection script
│   ├── .env             # Environment variables (MongoDB URI, JWT Secret)
│   ├── package.json
│   └── server.js        # Express server entry point
│
├── frontend/
│   ├── css/             # Global stylesheets (styles.css)
│   ├── js/              # Shared frontend logic (app.js)
│   ├── index.html       # Admin Dashboard
│   ├── farmers.html     # Admin: Manage Farmers
│   ├── farms.html       # Admin: Manage Farms
│   ├── diseases.html    # Admin: Manage & Resolve Disease Reports
│   ├── harvests.html    # Admin: Manage all Harvests
│   ├── login.html       # Shared Login / Registration
│   ├── farmer-dashboard.html  # Farmer: Overview & Visual Map
│   ├── my-harvests.html       # Farmer: Log own Harvests
│   └── my-diseases.html       # Farmer: Report Diseases
│
└── README.md
