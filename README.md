# Exterminator Dashboard
## About
Pest control / exterminator control panel with client and employee dashboards. Frontend with React and backend with Express and MySQL
Run by running Start Server.bat

# Features
- User registration with passwords hashed into database using argon
- Form validation checks for missing fields and conflicting usernames
- Login system using cookies to remember login state
- Dashboard that shows different interfaces for client and employee accounts
## Client Dashboard
- Place Order panel allows you to place a work order specifying pest type, job size and location
- Orders saved in database
- View Orders panel allows you to view all work orders submitted by your specific account and their current status (Pending, In Progress, Completed)
## Employee Dashboard
- Supplies panel allows you to view how much cash and how much of each type of pesticide you have, as well as allowing you to restock supplies by paying cash (will not allow you to go into debt)
- Vehicles panel allows you to view the vehicles the company owns, what size job they can take, and whether they are in use
- Employees panel allows you to view employee names, what vehicles they know how to drive, what pesticides they know how to use, and whether they are on a job
- Work orders panel shows all submitted work orders from all clients and allows you to assign employees and vehicles to a job to take it.
- Taking a job deducts pesticides based on pest type and job size, and sets the employee and vehicle status so that they cannot take another job before they complete their current one
- Completing a job frees up the vehicle and employee and increases cash based on the fee charged for the specific job size
